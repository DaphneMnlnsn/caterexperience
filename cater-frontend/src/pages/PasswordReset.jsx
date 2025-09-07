import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosClient from '../axiosClient';
import background from '../assets/bg.jpg';
import Navbar from '../components/LandingNavbar';
import './PasswordReset.css';

function PasswordReset() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        if (!email) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Email',
                text: 'Please enter your email address.',
            });
            return;
        }

        setIsLoading(true);

        try {
           
            const response = await axiosClient.post('/password/email', {
                email,
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Reset Email Sent',
                text: 'Please check your email for password reset instructions.',
            });
            navigate('/login');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Reset Failed',
                text: error.message || 'Failed to send reset email. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page" style={{ backgroundImage: `url(${background})` }}>
            <div className="overlay" />
            <Navbar />
            <div className="password-reset-box">
                <h3>Reset Password</h3>
                <p className="instruction-text">
                    Please enter the email address associated with your account.
                </p>
                <form onSubmit={handlePasswordReset}>
                    <div className="input-group">
                        <i className="fas fa-envelope"></i>
                        <input 
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="reset-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PasswordReset;