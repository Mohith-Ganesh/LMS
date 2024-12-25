const express = require('express');
const { Users, Books, BookIssues } = require('./db.js');
const BookIssuesRouter = express.Router();

BookIssuesRouter.use(express.json());

BookIssuesRouter.post('/take_book', async (req, res) => {
    try {
        const { username, bookId } = req.body;

        if (!username || !bookId) {
            return res.status(400).json({ error: 'Username and bookId are required.' });
        }

        const user = await Users.findByPk(username);
        const book = await Books.findByPk(bookId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (!book) {
            return res.status(404).json({ error: 'Book not found.' });
        }

        if (book.count <= 0) {
            return res.status(400).json({ error: 'Book is currently unavailable.' });
        }

        const newIssue = await BookIssues.create({
            username,
            bookId,
            status: 'active'
        });

        book.count -= 1;
        await book.save();

        return res.status(201).json(newIssue);

    } catch (error) {
        console.error('Error creating book issue:', error);
        return res.status(500).json({ error: 'Error creating book issue', details: error.message });
    }
});

BookIssuesRouter.post('/return_book', async (req, res) => {
    try {
        const { username, bookId } = req.body;

        if (!username || !bookId) {
            return res.status(400).json({ error: 'Username and bookId are required.' });
        }

        const issue = await BookIssues.findOne({ where: { username, bookId } });

        if (!issue) {
            return res.status(404).json({ error: 'Book issue not found.' });
        }

        await issue.destroy();

        const book = await Books.findByPk(bookId);
        if (book) {
            book.count += 1;
            await book.save();
        }

        return res.status(200).json({ message: 'Book returned successfully' });

    } catch (error) {
        console.error('Error returning book:', error);
        return res.status(500).json({ error: 'Error returning book', details: error.message });
    }
});

BookIssuesRouter.get('/taken_books', async (req, res) => {
    const { username } = req.query;

    try {
        // Fetch all books taken by the user from the BookIssues table
        const takenBooks = await BookIssues.findAll({
            where: { username }
        });

        if (!takenBooks || takenBooks.length === 0) {
            return res.status(404).json({ error: "No books found for this user" });
        }

        // Map through the takenBooks to get bookIds
        const bookIds = takenBooks.map(bookIssue => bookIssue.bookId);

        // Fetch all corresponding books using their bookIds
        const books = await Books.findAll({
            where: { bookId: bookIds } // Fetch details for all bookIds
        });

        // Create a merged response that combines takenBooks and book details
        const mergedResponse = takenBooks.map(bookIssue => {
            // Find the corresponding book detail by matching bookId
            const bookDetail = books.find(book => book.bookId === bookIssue.bookId);

            return {
                bookId: bookIssue.bookId,
                username: bookIssue.username,
                bookName: bookDetail.name,
                author: bookDetail.author,
                genre: bookDetail.genre,
                imagelink: bookDetail.imagelink
            };
        });

        // Return the merged result
        return res.status(200).json({ books: mergedResponse });

    } catch (error) {
        console.error('Error fetching books:', error);
        return res.status(500).json({ error: "An error occurred while fetching books" });
    }
});



module.exports = BookIssuesRouter;
