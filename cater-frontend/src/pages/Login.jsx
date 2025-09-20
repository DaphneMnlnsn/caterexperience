import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/LandingNavbar';
import './Login.css';
import Swal from 'sweetalert2';
import background from '../assets/bg.jpg';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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
            const response = await axios.post('http://localhost:8000/api/login', {
                email,
                password,
            });

            if (response.data.status === 'success') {
                const user = response.data.user;

                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user', btoa(JSON.stringify(user)));
                localStorage.setItem('role', user.role);

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
                        <a href="/password/reset">Forgot password?</a>
                    </div>
                    <button type="submit" className="login-submit">Login Now</button>
                </form>
            </div>
        </div>
    );
}


export default Login;
