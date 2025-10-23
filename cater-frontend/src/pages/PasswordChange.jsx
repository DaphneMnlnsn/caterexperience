import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosClient from '../axiosClient';
import Navbar from '../components/LandingNavbar';
import './PasswordReset.css';
import background from '../assets/bg.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function PasswordChange() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get('token') || '';
    const emailFromUrl = searchParams.get('email') || '';

    const storedUser = localStorage.getItem('user')
        ? JSON.parse(atob(localStorage.getItem('user')))
        : null;

    const [email, setEmail] = useState(emailFromUrl || storedUser?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const handleNewPassword = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            Swal.fire('Warning', 'Please fill out all fields.', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire('Error', 'Passwords do not match.', 'error');
            return;
        }

        setIsLoading(true);

        try {
            if (token) {
                await axiosClient.post('/password/reset', {
                    email,
                    token,
                    password,
                    password_confirmation: confirmPassword,
                });
            } else {
                await axiosClient.post(
                    '/password/change',
                    {
                        password,
                        password_confirmation: confirmPassword,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
            }

            Swal.fire('Success', 'Your password has been updated.', 'success');

            if (storedUser) {
                storedUser.reset_pass_change = false;
                localStorage.setItem('user', btoa(JSON.stringify(storedUser)));

                if (storedUser.role === 'admin') navigate('/admin/dashboard');
                else if (storedUser.role === 'stylist') navigate('/stylist/dashboard');
                else if (storedUser.role === 'cook') navigate('/cook/dashboard');
                else if (storedUser.role === 'head waiter') navigate('/waiter/dashboard');
                else navigate('/client/dashboard');
            } else {
                navigate('/login');
            }
        } catch (err) {
            Swal.fire(
                'Error',
                err.response?.data?.message || 'Failed to reset password.',
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page" style={{ backgroundImage: `url(${background})` }}>
            <div className="overlay" />
            <Navbar />
            <div className="password-reset-box">
                <h3>Set New Password</h3>
                <form onSubmit={handleNewPassword}>
                    <div className="input-group password-group">
                        <i className="fas fa-lock"></i>
                        <input
                            type={showPassword1 ? 'text': 'password'}
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword1(!showPassword1)}
                        >
                            {showPassword1 ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <div className="input-group password-group">
                        <i className="fas fa-lock"></i>
                        <input
                            type={showPassword2 ? 'text': 'password'}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword2(!showPassword2)}
                        >
                            {showPassword2 ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <button type="submit" className="reset-submit" disabled={isLoading}>
                        {isLoading ? 'Resetting...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PasswordChange;