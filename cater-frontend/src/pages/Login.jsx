import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/LandingNavbar';
import './Login.css';
import Swal from 'sweetalert2';
import background from '../assets/bg.jpg';
import { redirect } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'Please enter both email and password.',
            });
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login', {
            email,
            password,
            });

            if (response.data.status === 'success') {
                const user = response.data.user;
                if (user.role === 'admin') {
                    navigate('/admin/dashboard')
                } else {
                    // Redirect to user/client page
                }
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.user.role);

            }
        } catch (error) {
            Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: error,
            });
        }
    };

    return (
        <div
        className="login-page"
        style={{ backgroundImage: `url(${background})` }}
        >
        <div className="overlay" />
        <Navbar />
        <div className="login-box">
            <h3>Login</h3>
            <div className="input-group">
            <i className="fas fa-envelope"></i>
            <input 
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            </div>
            <div className="input-group">
            <i className="fas fa-lock"></i>
            <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="forgot">
            <a href="#">Forgot password?</a>
            </div>
            <button className="login-submit" onClick={handleLogin}>Login Now</button>
        </div>
        </div>
    );
}

export default Login;
