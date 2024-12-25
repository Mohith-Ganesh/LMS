const express = require('express');
const { Users, Books, BookReviews, sequelize } = require('./db.js');
const bookReviewRouter = express.Router();

bookReviewRouter.use(express.json());

bookReviewRouter.post('/create_book_review', async (req, res) => {
    console.log('hii there');
    try {
        const { username, bookId, description, status } = req.body;

        if (!username || !bookId || !description) {
            return res.status(400).json({ error: 'All fields (username, bookId, description, status) are required.' });
        }

        const user = await Users.findByPk(username);
        const book = await Books.findByPk(bookId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const newReview = await BookReviews.create({
            username,
            bookId,
            description,
            status
        });

        return res.status(201).json(newReview);

    } catch (error) {
        console.error('Error creating book review:', error);
        return res.status(500).json({ error: 'Error creating book review', details: error.message });
    }
});

bookReviewRouter.put('/update_book_review', async (req, res) => {
    try {
        const { username, bookId, description, status } = req.body;

        if (!username || !bookId) {
            return res.status(400).json({ error: 'Username and bookId are required for updating a review.' });
        }

        const review = await BookReviews.findOne({ where: { username, bookId } });

        if (!review) {
            return res.status(404).json({ error: 'Book review not found' });
        }

        review.description = description || review.description;
        review.status = status || review.status;

        await review.save();

        return res.status(200).json({ message: 'Book review updated successfully', review });

    } catch (error) {
        console.error('Error updating book review:', error);
        return res.status(500).json({ error: 'Error updating book review', details: error.message });
    }
});

bookReviewRouter.delete('/delete_book_review', async (req, res) => {
    try {
        const { username, bookId } = req.body;

        if (!username || !bookId) {
            return res.status(400).json({ error: 'Username and bookId are required for deleting a review.' });
        }

        const review = await BookReviews.findOne({ where: { username, bookId } });

        if (!review) {
            return res.status(404).json({ error: 'Book review not found' });
        }

        await review.destroy();

        return res.status(200).json({ message: 'Book review deleted successfully' });

    } catch (error) {
        console.error('Error deleting book review:', error);
        return res.status(500).json({ error: 'Error deleting book review', details: error.message });
    }
});


bookReviewRouter.get('/fetch_review', async (req, res) => {
    try {
        // Get bookId from query parameters
        const { bookId } = req.query;
        console.log(bookId);

        if (!bookId || bookId.trim() === '') {
            return res.status(400).json({ error: 'Book ID is required to fetch reviews.' });
        }

        // Fetch the book reviews from the database
        const rows = await BookReviews.findAll({
            where: { bookId }  // Fetch reviews for the given bookId
            // Fetch description from BookReviews table
        });

        // If no reviews found, return empty array
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this book.' });
        }

        return res.status(200).json({reviews: rows});

    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ error: 'Error fetching reviews', details: error.message });
    }   
});





module.exports = bookReviewRouter;