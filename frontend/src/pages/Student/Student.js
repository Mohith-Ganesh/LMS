import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Student.css'; // Add custom styles
import  Chart  from '../Chart/Chart';

const StudentDashboard = () => {
    const [books, setBooks] = useState([]);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(4); // Fixed page size of 4 books per page
    const [totalPages, setTotalPages] = useState(1);
    const [storedUser, setStoredUser] = useState("");
    const [storedRole, setStoredRole] = useState("");
    const [selectedBookId, setSelectedBookId] = useState(null);
    const [reviewDescription, setReviewDescription] = useState("");
    const [bookReviews, setBookReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const navigate = useNavigate();

    // Fetch user info from localStorage
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
                        page: page,    // Send the current page
                        pageSize: pageSize   // Set page size as 4
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

    // Fetch recommended books for the student
    useEffect(() => {
        const fetchRecommendedBooks = async () => {
            if (!storedUser) return;
            try {
                const response = await axios.get('http://localhost:3000/bookRecommend/recommended_books', {
                    params: { username: storedUser }
                });

                setRecommendedBooks(response.data.recommendedBooks || []);
            } catch (error) {
                console.error("Error fetching recommended books:", error);
            }
        };

        fetchRecommendedBooks();
    }, [storedUser]);

    // Handle taking a book
    const handleTakeBook = async (bookId) => {
        try {
            const response = await axios.post('http://localhost:3000/bookIssues/take_book', {
                username: storedUser,
                bookId
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
            const response = await axios.post('http://localhost:3000/bookIssues/return_book', {
                username: storedUser,
                bookId
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
        if (!reviewDescription || !selectedBookId) {
            alert('Please enter review details');
            return;
        }

        try {
            await axios.post('http://localhost:3000/bookReview/create_book_review', {
                username: storedUser,
                bookId: selectedBookId,
                description: reviewDescription
            });

            alert('Review created successfully!');
            resetReviewForm();
        } catch (error) {
            console.error("Error creating review:", error);
            alert(`Error: ${error.response ? error.response.data.error : "An error occurred"}`);
        }
    };

    // Fetch reviews for the selected book
    const fetchReviews = async (bookId) => {
        try {
            const response = await axios.get('http://localhost:3000/bookReview/fetch_review', {
                params: { bookId }
            });

            setBookReviews(response.data.reviews || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setBookReviews([]);
        }
    };

    // Handle selecting a book for review
    const handleSelectBookForReview = (bookId) => {
        setSelectedBookId(bookId);
        fetchReviews(bookId);
        setShowReviewForm(true);
    };

    // Reset the review form
    const resetReviewForm = () => {
        setReviewDescription("");
        setSelectedBookId(null);
        setBookReviews([]);
        setShowReviewForm(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("name");
        localStorage.removeItem("role");
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
            <h2>Student Dashboard</h2>

            {/* Recommended Books Section */}
            <h3>Books Recommended for You</h3>
            <ul className="book-list">
                {recommendedBooks.length > 0 ? (
                    recommendedBooks.map(book => (
                        <li key={book.bookId} className="book-item">
                            <h4>{book.name}</h4>
                            <p>Author: {book.author}</p>
                            <p>Genre: {book.genre}</p>
                            <p>Available copies: {book.count}</p>
                            <img src={book.imagelink} alt="book" className="book-img" />
                            <button
                                disabled={book.count <= 0}
                                onClick={() => handleTakeBook(book.bookId)}
                            >
                                {book.count > 0 ? 'Take Book' : 'Unavailable'}
                            </button>
                        </li>
                    ))
                ) : (
                    <p>No books recommended</p>
                )}
            </ul>

            <h3>All Library Books</h3>

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
                        </li>
                    ))
                ) : (
                    <p>No books available</p>
                )}
            </ul>

            {/* Existing Reviews Section */}
            {showReviewForm && selectedBookId && (
                <>
                    {bookReviews.length > 0 ? (
                        <div className="existing-reviews">
                            <h3>Existing Reviews</h3>
                            <ul>
                                {bookReviews.map(review => (
                                    <li key={review.id}>
                                        <p><strong>{review.username}:</strong> {review.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="existing-reviews">
                            <h3>No existing reviews for this book</h3>
                        </div>
                    )}
                </>
            )}

            {/* Review Form */}
            {showReviewForm && selectedBookId && (
                <div className="review-form">
                    <h3>Create Review</h3>
                    <textarea
                        value={reviewDescription}
                        onChange={(e) => setReviewDescription(e.target.value)}
                        placeholder="Write your review here..."
                    />
                    <button onClick={handleCreateReview}>
                        Create Review
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

export default StudentDashboard;
