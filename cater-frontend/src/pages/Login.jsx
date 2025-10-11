import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/LandingNavbar';
import CryptoJS from 'crypto-js';
import './Login.css';
import Swal from 'sweetalert2';
import background from '../assets/bg.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please enter both email and password.',
            });
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/login`, {
                email,
                password,
            });

            if (response.data.status === 'success') {
                const encrypted = response.data.data;
                const key = CryptoJS.enc.Utf8.parse(CryptoJS.SHA256('CaterXperience@2025').toString().substring(0, 32));
                const iv = CryptoJS.enc.Utf8.parse(CryptoJS.SHA256('fixed_iv_example').toString().substring(0, 16));

                const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7,
                });

                const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
                if (!decryptedText) throw new Error("Decryption failed. Check key/iv consistency.");

                const parsed = JSON.parse(decryptedText);

                localStorage.setItem('token', parsed.access_token);
                localStorage.setItem('user', btoa(JSON.stringify(parsed.user)));

                const user = parsed.user;

                if (user.require_pass_change) {
                    navigate('/password/change');
                    return;
                }

                if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                }
                else if (user.role === 'stylist') {
                    navigate('/stylist/dashboard');
                }
                else if (user.role === 'cook') {
                    navigate('/cook/dashboard');
                } 
                else if (user.role === 'head waiter') {
                    navigate('/waiter/dashboard');
                } else {
                    navigate('/client/dashboard');
                }
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error?.response?.data?.message || error.message,
            });
        }
    };

    return (
        <div className="login-page" style={{ backgroundImage: `url(${background})` }}>
            <div className="overlay" />
            <Navbar />
            <div className="login-box">
                <h3>Login</h3>
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <i className="fas fa-envelope"></i>
                        <input 
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group password-group">
                        <i className="fas fa-lock"></i>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <div className="forgot">
                        <a href="/password/reset">Forgot password?</a>
                    </div>
                    <button type="submit" className="login-submit">Login Now</button>
                </form>
            </div>
        </div>
    );
}


export default Login;
