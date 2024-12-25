const express = require('express');
const AuthenticationRouter = express.Router();
const { Users, sequelize, Books } = require('../backend/db');
const { generateToken, verifyToken } = require('./services/authentication/authMiddleware');
AuthenticationRouter.use(express.json())


AuthenticationRouter.post('/signup', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const existing_user = await Users.findOne({ where: { username } });

        if (existing_user) {
            return res.status(409).json({ error: "User already exists" });
        }

        const newUser = await Users.create({ username, password, role });

        const token = generateToken(newUser);

        res.status(201).json({ token, role: newUser.role, username: newUser.username });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user', details: error.message });
    }
});

AuthenticationRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await Users.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user);

        res.status(200).json({ token: token, role: user.role, username: username });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in', details: error.message });
    }
});

AuthenticationRouter.put('/UpdateUser', verifyToken, async (req, res) => {
    try {
    
        const { username } = req.user;
         
        const existing_user = await Users.findOne({ where: { username } });

        if (!existing_user) {
            return res.status(400).json({ details: "User does not exist" });
        }

        const updatedData = {};

        if (req.body.email) updatedData.email = req.body.email;
        if (req.body.phoneNumber) updatedData.phone_no = req.body.phoneNumber;
        if (req.body.approval) updatedData.approval = req.body.approval;

        await existing_user.update(updatedData);

        const userWithoutPassword = { ...existing_user.get(), password: undefined };

        return res.status(200).json({ message: "User details updated successfully", user: userWithoutPassword });
    } catch (error) {
        return res.status(500).json({ error: 'Error updating user details', details: error.message });
    }
});

module.exports = AuthenticationRouter;
