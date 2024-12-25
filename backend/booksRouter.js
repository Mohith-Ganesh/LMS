const express = require('express');
const { Books, sequelize } = require('./db');
const { verifyToken } = require('./services/authentication/authMiddleware');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config();

const BooksRouter = express.Router();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadFileToS3 = async (file) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileType = file.mimetype;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: fileType,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        return fileUrl;
    } catch (err) {
        console.error('Error uploading file to S3:', err);
        throw new Error('Error uploading file to S3');
    }
};

BooksRouter.get('/', async (req, res) => {
    res.send("Hey from books router");
});

// Create Book Endpoint
BooksRouter.post('/createBook', verifyToken, upload.single('image'), async (req, res) => {
    try {
        
        const userRole = req.user.role; // Assuming the role is stored in the JWT and decoded by verifyToken
        if (userRole !== 'administrator') {
            return res.status(403).json({ error: 'Only admins are allowed to create books' });
        }

        const { name, author, genre, description, count } = req.body;

        if (!name) {
            return res.status(400).json({ detail: "Book name is required" });
        }

        let imagelink = null;

        if (req.file) {
            imagelink = await uploadFileToS3(req.file); // Assume this uploads to S3
        }

        const newBook = await Books.create({
            name,
            author,
            genre,
            description,
            count,
            imagelink
        });

        return res.status(201).json(newBook);

    } catch (error) {
        console.error('Error creating book:', error);
        return res.status(500).json({ error: 'Error creating book', details: error.message });
    }
});


// Update Book Endpoint
BooksRouter.put('/updateBook', verifyToken, upload.single('image'), async (req, res) => {
    try {

        const userRole = req.user.role; // Assuming the role is stored in the JWT and decoded by verifyToken
        if (userRole !== 'administrator') {
            return res.status(403).json({ error: 'Only admins are allowed to create books' });
        }

        const { bookId, name, author, genre, description, count } = req.body;

        if (!bookId) {
            return res.status(400).json({ detail: "Book ID is required" });
        }

        const book = await Books.findByPk(bookId);

        if (!book) {
            return res.status(404).json({ detail: "Book not found" });
        }

        let imagelink = book.imagelink; // Retain the existing image link if no new image is uploaded

        if (req.file) {
            imagelink = await uploadFileToS3(req.file);
        }

        // Update book details
        book.name = name || book.name;
        book.author = author || book.author;
        book.genre = genre || book.genre;
        book.description = description || book.description;
        book.count = count || book.count;
        book.imagelink = imagelink;

        await book.save();

        return res.status(200).json(book);

    } catch (error) {
        console.error('Error updating book:', error);
        return res.status(500).json({ error: 'Error updating book', details: error.message });
    }
});

BooksRouter.get('/listBooks', async (req, res) => {
    try {
        const { filters = {}, sortBy = 'createdAt', sortOrder = 'ASC', page = 1, pageSize = 4 } = req.query;


        const { genre, author, bookId } = filters;

        const queryFilters = {};
        if (genre) queryFilters.genre = genre;
        if (author) queryFilters.author = author;
        if (bookId) queryFilters.id = bookId;

        const offset = (parseInt(page) - 1) * parseInt(pageSize);
        const limit = parseInt(pageSize);

        const { count, rows } = await Books.findAndCountAll({
            where: queryFilters,
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit: limit,
            offset: offset,
        });

        const totalPages = Math.ceil(count / pageSize);
        const paginationData = {
            currentPage: parseInt(page),
            pageSize: parseInt(pageSize),
            totalRecords: count,
            totalPages: totalPages,
        };

        return res.status(200).json({
            books: rows,
            pagination: paginationData
        });

    } catch (error) {
        console.error('Error fetching books:', error);
        return res.status(500).json({ error: 'Error fetching books', details: error.message });
    }
});


BooksRouter.get('/chart', async (req, res) => {
    try {
        // Fetch all rows from the Books table
        const rows = await Books.findAll();

        // Separate the details based on name, author, genre, and count
        const names = [];
        const authors = [];
        const genres = [];
        const counts = [];

        // Loop through the rows and push data into respective arrays
        rows.forEach((book) => {
            names.push(book.name);
            authors.push(book.author);
            genres.push(book.genre);
            counts.push(book.count);
        });

        // Send the data to the frontend as a structured JSON response
        return res.status(200).json({
            names: names,
            authors: authors,
            genres: genres,
            counts: counts
        });

    } catch (error) {
        console.error('Error fetching books:', error);
        return res.status(500).json({ error: 'Error fetching books', details: error.message });
    }
});





module.exports = BooksRouter;
