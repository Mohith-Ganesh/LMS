import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import './Signup.css';

export const Signup = () => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [message, setMessage] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if ((role === 'administrator' && secretKey !== "5aICh@r07") || (role === 'librarian' && secretKey !== "$avItr09") || (role === 'professor' && secretKey !== "t@RuN!3")) {
            event.preventDefault();
            alert("Invalid Secretkey");
        } else {
            event.preventDefault();
            try {
                const response = await axios.post('http://localhost:3000/auth/signup', {
                    username: userName,
                    password: password,
                    role: role, 
                });
    
                if (response.status === 201) {
                    const { token, role } = response.data;
                    setMessage('Signup successful!');
                    setUserName('');
                    setPassword('');
                    setRole('student'); 
    
                    localStorage.setItem('token', token);
                    localStorage.setItem('role', role);
                    
                    navigate(`/create-profile`);
                }
            } catch (error) {
                if (error.response) {
                    setMessage(error.response.data.error);
                } else {
                    setMessage('An error occurred. Please try again.');
                }
            }
        }

        
    };

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2 className="signup-head"> UNT Signup</h2>

                <label className="user">Username:</label>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter username"
                    required
                    className="signup-input"
                />

                <label className="user">Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="signup-input"
                />

                <label className="user">Role:</label>
                <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    required
                    className="signup-select"
                >
                    <option value="student">Student</option>
                    <option value="professor">Professor</option>
                    <option value="administrator">Administrator</option>
                    <option value="librarian">Librarian</option>
                </select>

                {(role === "administrator" || role === "librarian" || role === "professor") ? (
                    <div style={{marginTop: '10px'}}>
                    <label className="user">Secret Key:</label>
                    <input
                    type="text"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter secretkey"
                    required
                    className="signup-input"/>
                    </div>
                ) : null}

                <button className="signup-button" type="submit">Sign Up</button>
                {message && <p className="signup-message">{message}</p>}
                
            </form>

            <p>Already have an account? <Link className="link" to={'/signin'}>Signin</Link></p>
        </div>
    );
};
