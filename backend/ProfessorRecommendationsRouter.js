const express = require('express');
const { Users, Books, ProfessorRecommendations } = require('./db.js');
const ProfessorRecommendationsRouter = express.Router();

ProfessorRecommendationsRouter.use(express.json());

ProfessorRecommendationsRouter.post('/create_recommendation', async (req, res) => {
    console.log('hi');
    try {
        const { bookId } = req.body;

        // Check if bookId is provided
        if (!bookId) {
            return res.status(400).json({ error: 'Book ID is required.' });
        }

        // Fetch the book from the database
        const book = await Books.findByPk(bookId);

        // If book is not found, return 404
        if (!book) {
            return res.status(404).json({ error: 'Book not found.' });
        }

        // Fetch all students from the Users table (assuming role='student')
        const students = await Users.findAll({
            where: { role: 'student' } // Assuming 'role' column indicates user type
        });

        // If no students are found, return a 404
        if (!students || students.length === 0) {
            return res.status(404).json({ error: 'No students found.' });
        }

        // Create a recommendation for each student
        const recommendations = await Promise.all(students.map(student => {
            return ProfessorRecommendations.create({
                username: student.username,
                bookId
            });
        }));

        // Return the recommendations created
        return res.status(201).json({
            message: `Book recommended to ${students.length} students successfully!`,
            recommendations
        });

    } catch (error) {
        console.error('Error creating recommendation:', error);
        return res.status(500).json({ error: 'Error creating recommendation', details: error.message });
    }
});


ProfessorRecommendationsRouter.delete('/delete_recommendation', async (req, res) => {
    try {
        const { username, bookId } = req.body;

        if (!username || !bookId) {
            return res.status(400).json({ error: 'Username and bookId are required.' });
        }

        const recommendation = await ProfessorRecommendations.findOne({ where: { username, bookId } });

        if (!recommendation) {
            return res.status(404).json({ error: 'Recommendation not found.' });
        }

        await recommendation.destroy();

        return res.status(200).json({ message: 'Recommendation deleted successfully.' });

    } catch (error) {
        console.error('Error deleting recommendation:', error);
        return res.status(500).json({ error: 'Error deleting recommendation', details: error.message });
    }
});

ProfessorRecommendationsRouter.get('/recommended_books', async (req, res) => {
    const { username } = req.query;

    try {
        // Fetch all book recommendations for the user from the ProfessorRecommendations table
        const recommendations = await ProfessorRecommendations.findAll({ 
            where: { username } 
        });

        if (!recommendations || recommendations.length === 0) {
            return res.status(404).json({ error: "No recommended books found for this user" });
        }

        // Get all bookIds from the recommendations
        const bookIds = recommendations.map(rec => rec.bookId);

        // Fetch book details for each bookId from the Books table
        const books = await Books.findAll({
            where: {
                bookId: bookIds
            }
        });

        if (!books || books.length === 0) {
            return res.status(404).json({ error: "No books found for the recommended bookIds" });
        }

        // Return the book details as part of the response
        res.status(200).json({ recommendedBooks: books });
        
    } catch (error) {
        console.error('Error fetching books:', error);
        return res.status(500).json({ error: "An error occurred while fetching books" });
    }
});



module.exports = ProfessorRecommendationsRouter;
