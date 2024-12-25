const express = require('express');
const authenticationRouter = express.Router();
const { User } = require('../../db'); // Import the User model
const { generateToken, verifyToken } = require('./authMiddleware.js'); // Import functions from authMiddleware

// POST /signup route
authenticationRouter.post('/signup', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ where: { username: username } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        // Create the new user
        const newUser = await User.create({
            username: username,
            password: password,
            role: role,
            status: 'active',
        });

        // role =>student student username +>username details =>null profile (jwt)=>username,role==> student

        // Generate JWT
        const token = generateToken(newUser);

        res.status(201).json({
            message: 'User successfully created!',
            user: username,
            token: token,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user.' });
    }
});

// POST /login route
authenticationRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user in the database
        const user = await User.findOne({ where: { username: username } });
        if (!user) {
            return res.status(400).json({ error: 'User not found.' });
        }

        // Check if the password matches
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid password.' });
        }

        // Generate JWT
        const token = generateToken(user);

        res.status(200).json({
            message: 'Login successful!',
            token: token,
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to log in.' });
    }
});

// // Protected route example (uses the verifyToken middleware)
// authenticationRouter.get('/protected', verifyToken, (req, res) => {
//     res.status(200).json({ message: `Hello, ${req.user.username}. This is a protected route.` });
// });

module.exports = authenticationRouter;
