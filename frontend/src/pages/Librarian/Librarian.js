import React, { useEffect, useState } from 'react';
import './Librarian.css'; // Import your custom CSS file for styling
import axios from 'axios'; // Axios for making API requests
import { useNavigate } from 'react-router-dom'; // For navigation

import  Chart  from '../Chart/Chart';

const LibrarianDashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate(); // Hook to navigate programmatically

    // Fetch the username and role from localStorage (assuming they're stored there)
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    // Fetch the data from the backend API on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/librarian/taken-books'); // Fetch from the backend
                setData(response.data); // Set the fetched data into state
                setLoading(false); // Set loading to false when data is fetched
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error fetching data');
                setLoading(false); // Set loading to false on error
            }
        };
        
        fetchData();
    }, []);

    // Function to handle logout
    const handleLogout = () => {
        localStorage.removeItem('username'); // Remove username from localStorage
        localStorage.removeItem('role'); // Remove role from localStorage
        localStorage.removeItem('token');
        navigate('/signin'); // Redirect to the signin page
    };

    // Show loading spinner or message while the data is being fetched
    if (loading) {
        return <div>Loading...</div>;
    }

    // Show error message if there's an error fetching data
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
            <img src="https://res.cloudinary.com/dttnhad6r/image/upload/v1733328929/download_xci8kn.png" className="unt-logo"/>
            <div>
                <div className="user-info">
                    <span>{username}</span> {/* Display the username and role */}
                </div>
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button> {/* Logout button */}
                </div>
            </header>
            
            <h2>UNT Library Management System</h2>
            <h1>Librarian Dashboard</h1>
            <div className="dashboard-section">
                <h2>Users and Books Taken</h2>

                {data.length === 0 ? (
                    <p>No data available</p>
                ) : (
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Phone No</th>
                                <th>Books Taken</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.phone_no}</td>
                                    <td>
                                        <ul>
                                            {user.booksTaken.map((book, idx) => (
                                                <li key={idx} className="book-details">
                                                    <strong>Title:</strong> {book.bookTitle} <br />
                                                    <strong>Author:</strong> {book.bookAuthor} <br />
                                                    <strong>Genre:</strong> {book.bookGenre} <br />
                                                    <img
                                                        src={book.bookImage}
                                                        alt={book.bookTitle}
                                                        className="book-image"
                                                    />
                                                    <br />
                                                    <strong>Count:</strong> {book.bookCount}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Chart/>
        </div>
    );
};

export default LibrarianDashboard;
