import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Admin.css';
import  Chart  from '../Chart/Chart';

const AdminDashboard = () => {
    const [storedUser, setStoredUser] = useState("");
    const [storedRole, setStoredRole] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(4); // Fixed page size of 4 books per page
    const [totalPages, setTotalPages] = useState(1);
    const [token, setToken] = useState("");
    const [books, setBooks] = useState([]);
    const [bookForm, setBookForm] = useState({
        name: '',
        author: '',
        genre: '',
        description: '',
        count: 0,
        image: null,
    });
    const [selectedBook, setSelectedBook] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = () => {
            // Normally, you would fetch this from an API or localStorage/sessionStorage
            const storedUser = localStorage.getItem('name');
            const storedRole = localStorage.getItem('role');
            const token = localStorage.getItem('token');

            if (storedUser && storedRole && token) {
                setStoredUser(storedUser);
                setStoredRole(storedRole);
                setToken(token);
            } 
        };

        fetchUserInfo();
    }, []);

    // Fetch the list of books
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

    useEffect(() => {
        fetchBooks();
    }, [page]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookForm({ ...bookForm, [name]: value });
    };

    const handleFileChange = (e) => {
        setBookForm({ ...bookForm, image: e.target.files[0] });
    };

    // Handle book submission (for both create and update)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', bookForm.name);
        formData.append('author', bookForm.author);
        formData.append('genre', bookForm.genre);
        formData.append('description', bookForm.description);
        formData.append('count', bookForm.count);
        if (bookForm.image) {
            formData.append('image', bookForm.image);
        }

        try {
            if (selectedBook) {
                // Update book
                console.log('Updating book with ID:', selectedBook.bookId);
                formData.append('bookId', selectedBook.bookId); // Include book ID for update
                const response = await axios.put('http://localhost:3000/book/updateBook', formData, {
                    headers: { 'Authorization': `Bearer ${token}`,
                               'Content-Type': 'multipart/form-data' 
                    },
                });
                alert('Book updated successfully');
            } else {
                // Create book
                const response = await axios.post('http://localhost:3000/book/createBook', formData, {
                    headers: { 'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' },
                });
                alert('Book created successfully');
            }

            setBookForm({ name: '', author: '', genre: '', description: '', count: 0, image: null });
            setSelectedBook(null); // Reset selection after update
            fetchBooks(); // Refresh the book list

        } catch (error) {
            console.error('Error saving book:', error);
            alert(`Error: ${error.response ? error.response.data.error : "An error occurred"}`);
        }
    };

    const handleEdit = (book) => {
        setSelectedBook(book);
        setBookForm({
            name: book.name,
            author: book.author,
            genre: book.genre,
            description: book.description,
            count: book.count,
            image: null,
        });
    };

    const handleLogout = () => {
        // Clear user data (in localStorage or sessionStorage)
        localStorage.removeItem("name");
        localStorage.removeItem("role");
        localStorage.removeItem("token")
        // Redirect to login or signup page
        navigate('/signin'); // Updated from history.push to navigate
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    return (
        <div className="admin-dashboard-container">
            <div className="profile-section">
            <img src="https://res.cloudinary.com/dttnhad6r/image/upload/v1733328929/download_xci8kn.png" className="unt-logo"/>
                <div>
                <span className="profile-info">
                    <strong>Username:</strong> {storedUser} <br />
                    <strong>Role:</strong> {storedRole}
                </span>
                <button className="logout-button" style={{marginBottom: '20px'}} onClick={handleLogout}>
                    Logout
                </button>
                </div>
            </div>

            <h2>UNT Library Management System</h2>
            <h2>Admin Dashboard</h2>
            <p>Manage users, books, and system settings here.</p>

            <h3>{selectedBook ? "Edit Book" : "Create Book"}</h3>
            <form className="admin-dashboard-form" onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="admin-dashboard-div">
                    <label className="admin-dashboard-label">Book Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={bookForm.name}
                        onChange={handleChange}
                        required
                        className="admin-dashboard-input"
                    />
                </div>
                <div className="admin-dashboard-div">
                    <label className="admin-dashboard-label">Author:</label>
                    <input
                        type="text"
                        name="author"
                        value={bookForm.author}
                        onChange={handleChange}
                        className="admin-dashboard-input"
                    />
                </div>
                <div className="admin-dashboard-div">
                    <label className="admin-dashboard-label">Genre:</label>
                    <input
                        type="text"
                        name="genre"
                        value={bookForm.genre}
                        onChange={handleChange}
                        className="admin-dashboard-input"
                    />
                </div>
                <div className="admin-dashboard-div">
                    <label className="admin-dashboard-label">Description:</label>
                    <textarea
                        name="description"
                        value={bookForm.description}
                        onChange={handleChange}
                        className="admin-dashboard-textarea"
                    />
                </div>
                <div className="admin-dashboard-div">
                    <label className="admin-dashboard-label">Count:</label>
                    <input
                        type="number"
                        name="count"
                        value={bookForm.count}
                        onChange={handleChange}
                        className="admin-dashboard-input"
                    />
                </div>
                <div className="admin-dashboard-div">
                    <label className="admin-dashboard-label">Upload Image:</label>
                    <input
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        className="admin-dashboard-input"
                    />
                </div>
                <button type="submit" className="admin-dashboard-button">{selectedBook ? "Update Book" : "Create Book"}</button>
            </form>

            <h3>Books List</h3>
            <ul className="admin-dashboard-ul">
                {books.map((book) => (
                    <li className="admin-dashboard-li" key={book.bookId}>
                        <strong>{book.name}</strong> by {book.author} {book.genre} <img src={book.imagelink} alt="book"/>
                        <button onClick={() => handleEdit(book)} className="admin-dashboard-li-button">Edit</button>
                    </li>
                ))}
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
            <Chart/>
        </div>
    );
};

export default AdminDashboard;
