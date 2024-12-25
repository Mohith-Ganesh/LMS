import React, { useState } from "react"
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"
import './Signin.css';

export const Signin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/auth/login',  {
                
                username: username,
                password: password,
                
            });

            if (response.status === 200) {
                const { token, role, username } = response.data;
                setMessage('Login successful!');
                // Save the token to localStorage for future requests
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('name', username);
                setUsername('');
                setPassword('');

                navigate(`/${role}-dashboard`);

            }
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.error);
            } else {
                setMessage('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="signin-container">
            <form className="signin-form" onSubmit={handleLogin}>
                <h2 className="signin-head"> UNT Sign In</h2>
                <label className="user-label">Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    className="signin-input"
                />

                <label className="user-label">Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="signin-input"
                />

                <button type="submit" className="signin-button">Sign In</button>
                {message && <p className="signin-message">{message}</p>}

                
            </form>
            <p>Don't have an account?<Link className="link" to={'/signup'}>Signup</Link></p>
        </div>
    );
}
