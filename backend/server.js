const express = require('express');
const app = express();
const cors = require('cors');

const AuthenticationRouter = require('../backend/AuthenticationRouter.js')
const BooksRouter = require('../backend/booksRouter.js')
const BookIssuesRouter = require('./BookIssuesRouter.js')
const bookReviewRouter = require('./bookReviewRouter.js')
const ProfessorRecommendationsRouter = require('./ProfessorRecommendationsRouter.js');
const LibrarianRouter = require('./librarianRouter.js');

app.use(cors());
app.use(express.json())
require('dotenv').config();

const { sequelize } = require('./db.js');

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/auth', AuthenticationRouter)

app.use('/book', BooksRouter)

app.use('/bookIssues', BookIssuesRouter);

app.use('/bookReview', bookReviewRouter);

app.use('/bookRecommend', ProfessorRecommendationsRouter);

app.use('/librarian', LibrarianRouter);




sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
}).catch((error) => {
    console.error('Unable to connect to the database:', error);
});

process.on('SIGINT', async () => {
    try {
        await sequelize.close();
        console.log('Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error closing the database connection:', error);
        process.exit(1);
    }
});
