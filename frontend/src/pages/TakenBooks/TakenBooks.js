import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './TakenBooks.css';

const TakenBooks = () => {
    const [takenBooks, setTakenBooks] = useState([]);
    const [role, setRole] = useState("");  // Add role state
    const storedUser = localStorage.getItem("name"); // Get the stored username
    const storedRole = localStorage.getItem("role");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTakenBooks = async () => {
            try {
                const response = await axios.get("http://localhost:3000/bookIssues/taken_books", {
                    params: { username: storedUser }
                });

                console.log(response.data.books);

                if (response.status === 200) {
                    setTakenBooks(response.data.books); 
                    setRole(storedRole);
                } else {
                    setTakenBooks([]);
                }
            } catch (error) {
                console.error("Error fetching taken books:", error);
                setTakenBooks([]);
            }
        };

        fetchTakenBooks();
    }, [storedUser, storedRole]);

    const handleBackToDashboard = () => {
        if (role === 'admin') {
            navigate('/admin-dashboard');
        } else if (role === 'professor') {
            navigate('/professor-dashboard');
        } else if (role === 'student') {
            navigate('/student-dashboard');
        } else {
            navigate('/'); // Default case (could be a homepage or login page)
        }
    }


    return (
        <div className="taken-books-container">
            <h2>Books Taken by {storedUser}</h2>
            {takenBooks.length > 0 ? (
                <ul className="book-list">
                    {takenBooks.map(book => (
                        <li key={book.bookId} className="book-item">
                            <h4>{book.bookName}</h4>
                            <p>Author: {book.author}</p>
                            <p>Genre: {book.genre}</p>
                            <img src={book.imagelink} alt='book' className="book-img"/>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No books taken yet.</p>
            )}
            <button onClick={() => handleBackToDashboard()} className="back-to-dashboard">
                Back to Dashboard
            </button>
        </div>
    );
};

export default TakenBooks;
