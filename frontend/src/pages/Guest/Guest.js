import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Guest.css'; // Add custom styles

const Guest = () => {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(4); // Fixed page size of 4 books per page
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch the list of books for guests
        const fetchBooks = async () => {
            try {
                const response = await axios.get('http://localhost:3000/book/listBooks', {
                    params: {
                        page: page,
                        pageSize: pageSize
                    }
                });
                setBooks(response.data.books);
                setTotalPages(response.data.pagination.totalPages);
            } catch (error) {
                console.error("Error fetching books:", error);
            }
        };

        fetchBooks();
    }, [page]);

    // Redirect to the signup page when a book is clicked
    const handleBookClick = () => {
        navigate('/signup'); // Navigate to the signup page
    };

    // Handle navigation to signin or signup
    const handleNavigateToSignin = () => {
        navigate('/signin');
    };

    const handleNavigateToSignup = () => {
        navigate('/signup');
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    return (
        <div className="guest-container">
            {/* Navigation bar with Signup and Signin buttons */}
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <img src="https://res.cloudinary.com/dttnhad6r/image/upload/v1733328929/download_xci8kn.png" className="unt-logo"/>
            <div className="guest-nav">
                <button className="guest-button" onClick={handleNavigateToSignup}>
                    Signup
                </button>
                <button className="guest-button" onClick={handleNavigateToSignin}>
                    Signin
                </button>
            </div>
            </div>
            

            <h2>UNT Library Management System</h2>
            <h3>Library Books</h3>

            {/* Display the list of books */}
            <ul className="book-list">
                {books.length > 0 ? (
                    books.map(book => (
                        <li key={book.bookId} className="book-item" onClick={handleBookClick}>
                            <h4>{book.name}</h4>
                            <p>Author: {book.author}</p>
                            <p>Genre: {book.genre}</p>
                            <img src={book.imagelink} alt='book' className="book-img"/>
                        </li>
                    ))
                ) : (
                    <p>No books available</p>
                )}
            </ul>

            {/* Pagination controls */}
            <div className="pagination-controls">
                <button onClick={handlePreviousPage} disabled={page === 1}>
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={handleNextPage} disabled={page === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default Guest;
