import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Professor.css'; // Add custom styles
import  Chart  from '../Chart/Chart';

const ProfessorDashboard = () => {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(4); // You can allow users to change this if needed
    const [totalPages, setTotalPages] = useState(1);
    const [storedUser, setStoredUser] = useState("");
    const [storedRole, setStoredRole] = useState("");
    const [username, setUsername] = useState("");  // Assuming the professor's username
    const [selectedBookId, setSelectedBookId] = useState(null); // For selecting the book for review/recommendation
    const [reviewDescription, setReviewDescription] = useState("");
    const [editingReview, setEditingReview] = useState(false);
    const [bookReviews, setBookReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showRecommendationMessage, setShowRecommendationMessage] = useState(false); // To show recommendation success
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = () => {
            const storedUser = localStorage.getItem('name');
            const storedRole = localStorage.getItem('role');
            if (storedUser && storedRole) {
                setStoredUser(storedUser);
                setStoredRole(storedRole);
            }
        };

        fetchUserInfo();
    }, []);

    // Fetch list of books with pagination
    useEffect(() => {
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

    // Handle taking a book
    const handleTakeBook = async (bookId) => {
        try {
            if (!username) {
                alert('Please enter your username to take a book');
                return;
            }
            await axios.post('http://localhost:3000/bookIssues/take_book', {
                username,
                bookId,
            });
            alert('Book taken successfully!');
            setBooks(prevBooks => prevBooks.map(book => book.bookId === bookId ? { ...book, count: book.count - 1 } : book));
        } catch (error) {
            console.error("Error taking the book:", error);
            alert(`Error: ${error.response ? error.response.data.error : "An error occurred"}`);
        }
    };

    // Handle returning a book
    const handleReturnBook = async (bookId) => {
        try {
            if (!username) {
                alert('Please enter your username to return a book');
                return;
            }
            await axios.post('http://localhost:3000/bookIssues/return_book', {
                username,
                bookId,
            });
            alert('Book returned successfully!');
            setBooks(prevBooks => prevBooks.map(book => book.bookId === bookId ? { ...book, count: book.count + 1 } : book));
        } catch (error) {
            console.error("Error returning the book:", error);
            alert(`Error: ${error.response ? error.response.data.error : "An error occurred"}`);
        }
    };

    // Handle creating a new review
    const handleCreateReview = async () => {
        try {
            if (!reviewDescription || !selectedBookId) {
                alert('Please enter review details');
                return;
            }
            await axios.post('http://localhost:3000/bookReview/create_book_review', {
                username: storedUser,
                bookId: selectedBookId,
                description: reviewDescription,
            });
            alert('Review created successfully!');
            resetReviewForm();
        } catch (error) {
            console.error("Error creating review:", error);
            alert(`Error: ${error.response ? error.response.data.error : "An error occurred"}`);
        }
    };

    // Handle recommending a book to all students
    const handleRecommendBook = async (bookId) => {
        try {
            const response = await axios.post('http://localhost:3000/bookRecommend/create_recommendation', {
                bookId,
            });

            if (response.status === 201) {
                setShowRecommendationMessage(true); // Show success message
                setTimeout(() => setShowRecommendationMessage(false), 5000); // Hide after 3 seconds
                resetRecommendationForm();
            }
            
        } catch (error) {
            console.error("Error recommending the book:", error);
            alert(`Error: ${error.response ? error.response.data.error : "An error occurred"}`);
        }
    };

    const fetchReviews = async (bookId) => {
        try {
            const response = await axios.get('http://localhost:3000/bookReview/fetch_review', {
                params: { bookId }
            });
            if (response.status === 200 && response.data.reviews.length > 0) {
                setBookReviews(response.data.reviews);
            } else {
                setBookReviews([]); // No reviews found
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setBookReviews([]);
        }
    };

    // Handle selecting a book for review or recommendation
    const handleSelectBookForReview = (bookId) => {
        setSelectedBookId(bookId);
        fetchReviews(bookId); // Fetch existing reviews for the selected book
        setShowReviewForm(true);
    };

    const handleSelectBookForRecommendation = (bookId) => {
        setSelectedBookId(bookId);
        setShowReviewForm(false); // Hide review form
    };

    // Reset the review form
    const resetReviewForm = () => {
        setReviewDescription("");
        setSelectedBookId(null);
        setBookReviews([]);
        setEditingReview(false);
        setShowReviewForm(false); 
    };

    // Reset the recommendation form
    const resetRecommendationForm = () => {
        setSelectedBookId(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("name");
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        navigate('/signin');
    };

    // Handle pagination
    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    return (
        <div className="dashboard-container">
            <div className="profile-section">
            <img src="https://res.cloudinary.com/dttnhad6r/image/upload/v1733328929/download_xci8kn.png" className="unt-logo"/>
            <div>
                <span className="profile-info">
                    <strong>Username:</strong> {storedUser} <br />
                    <strong>Role:</strong> {storedRole}
                </span>
                <div>
                <button onClick={() => navigate('/taken-books')} className="view-taken-books-button">
                View Taken Books
                </button>
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
                </div>
                </div>
            </div>


            <h2>UNT Library Management System</h2>
            <h2>Professor Dashboard</h2>
            <h3>Library Books</h3>

            <div className="username-input">
                <label>Enter your username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
            </div>

            <ul className="book-list">
                {books.length > 0 ? (
                    books.map(book => (
                        <li key={book.bookId} className="book-item">
                            <h4>{book.name}</h4>
                            <p>Author: {book.author}</p>
                            <p>Genre: {book.genre}</p>
                            <p>Available copies: {book.count}</p>
                            <img src={book.imagelink} alt='book' className="book-img"/>
                            <button
                                disabled={book.count <= 0}
                                onClick={() => handleTakeBook(book.bookId)}
                            >
                                {book.count > 0 ? 'Take Book' : 'Unavailable'}
                            </button>
                            <button onClick={() => handleReturnBook(book.bookId)}>
                                Return Book
                            </button>
                            <button onClick={() => handleSelectBookForReview(book.bookId)}>
                                Review Book
                            </button>
                            <button onClick={() => handleRecommendBook(book.bookId)}>
                                Recommend Book
                            </button>
                        </li>
                    ))
                ) : (
                    <p>No books available</p>
                )}
            </ul>

            {/* Success message for recommendations */}
            {showRecommendationMessage && (
                <div className="success-message">
                    <p>Book recommended to all students successfully!</p>
                </div>
            )}

            {/* Review Form */}
            {showReviewForm && selectedBookId && (
                <div className="review-form">
                    <h3>{editingReview ? "Update Review" : "Create Review"}</h3>
                    <textarea
                        value={reviewDescription}
                        onChange={(e) => setReviewDescription(e.target.value)}
                        placeholder="Write your review here..."
                    />
                    <button onClick={handleCreateReview}>
                        {editingReview ? "Update Review" : "Create Review"}
                    </button>
                    <button onClick={resetReviewForm}>Cancel</button>
                </div>
            )}

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

            <Chart/>
        </div>
    
    );
};

export default ProfessorDashboard;
