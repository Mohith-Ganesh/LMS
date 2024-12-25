const express = require('express');
const { Users, Books, BookIssues } = require('./db.js');
const { Sequelize } = require('sequelize');
const LibrarianRouter = express.Router();

LibrarianRouter.use(express.json());

// Route to fetch books taken by users, along with user and book details
LibrarianRouter.get('/taken-books', async (req, res) => {
    try {
        // Fetch and aggregate bookId values by username, cast bookId (UUID) to text for STRING_AGG to work
        const rows = await BookIssues.findAll({
            attributes: [
                'username', // Fetch username from BookIssues
                [Sequelize.fn('STRING_AGG', Sequelize.cast(Sequelize.col('bookId'), 'TEXT'), ','), 'bookIds'] // Concatenate all bookIds, casting UUID to text
            ],
            group: ['username'], // Group by username
            raw: true // Return raw data instead of Sequelize instances
        });

        // Get user details for each username found in the BookIssues table
        const usernames = rows.map(row => row.username);
        const userDetails = await Users.findAll({
            where: {
                username: usernames
            },
            attributes: ['username', 'email', 'role', 'phone_no'] // Fetch necessary user details
        });

        // Get all unique bookIds and fetch the details from Books table
        const allBookIds = rows.flatMap(row => row.bookIds.split(','));
        const bookDetails = await Books.findAll({
            where: {
                bookId: allBookIds // Find books whose ids are in the allBookIds array
            },
            attributes: ['bookId', 'name', 'author', 'genre', 'imagelink', 'count'] // Fetch necessary book details
        });


        // Map the rows to combine user and book details
        const result = rows.map(row => {
            const user = userDetails.find(u => u.username === row.username); // Find user details for this username
            const books = row.bookIds.split(',').map(bookId => {
                const book = bookDetails.find(b => b.bookId === bookId); // Find book details for each bookId
                return {
                    bookId: book.bookId,
                    bookTitle: book.name,
                    bookAuthor: book.author,
                    bookGenre: book.genre,
                    bookImage: book.imagelink,
                    bookCount: book.count
                };
            });

            return {
                username: user.username,
                email: user.email,
                role: user.role,
                phone_no: user.phone_no,
                booksTaken: books
            };
        });

        // Send the result back as JSON response
        res.json(result);
    } catch (error) {
        console.error('Error fetching book issues:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = LibrarianRouter;
