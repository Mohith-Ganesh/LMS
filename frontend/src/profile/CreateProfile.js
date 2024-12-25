import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './CreateProfile.css';

export const CreateProfile = () => {
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const [token, setToken] = useState('');
    const [role, setRole] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve token and role from localStorage
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        
        if (storedToken && storedRole) {
            setToken(storedToken);
            setRole(storedRole);
        } else {
            // Handle case where token or role is missing (e.g., redirect or error)
            setMessage('Authentication error. Please sign in again.');
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.put('http://localhost:3000/auth/UpdateUser', {
                email,
                phoneNumber,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}` // Send the token in the Authorization header
                }
            });
            
            if (response.status === 200) {
                setMessage(`${role} profile created successfully!` );
                localStorage.setItem('name', response.data.user.username);
                localStorage.setItem('role', response.data.user.role);

                navigate(`/${role}-dashboard`); // Redirect to admin dashboard
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
        <div className="create-profile-container">
            <form className="create-profile-form" onSubmit={handleSubmit}>
                <h2 className="create-profile-head">Create {role} Profile</h2>

                <label className="create-profile-user">Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                    className="create-profile-input"
                />

                <label className="create-profile-user">Phone Number:</label>
                <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="create-profile-input"
                />


                <button type="submit" className="create-profile-button">Create Profile</button>
                {message && <p className="create-profile-message">{message}</p>}
            </form>
        </div>
    );
};
