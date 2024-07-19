const express = require('express');
const User = require('../models/user');
const TrafficData = require('../models/trafficData');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = new User({ username, email, password });
        await user.save();
        
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1d' });
        res.status(201).send({ message: 'User created successfully', token });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).send('Invalid credentials');
        }
        
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1d' });
        res.status(200).send({ token });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/subscribe', authenticate, async (req, res) => {
    const { planType } = req.body;
    const userId = req.user.id;

    const validPlans = ['plan1', 'plan2'];
    if (!validPlans.includes(planType)) {
        return res.status(400).send('Invalid plan type');
    }

    try {
        await User.findByIdAndUpdate(userId, { subscription: planType });
        res.status(200).send({ message: 'Subscription updated successfully' });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get('/user-info', authenticate, async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).select('username');
        const trafficData = await TrafficData.findOne({ userId }).select('keyword website country rank hits');

        if (!user || !trafficData) {
            return res.status(404).send('User or traffic data not found');
        }

        const userInfo = {
            username: user.username,
            keyword: trafficData.keyword,
            website: trafficData.website,
            country: trafficData.country,
            rank: trafficData.rank,
            hits: trafficData.hits
        };

        res.status(200).send(userInfo);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get('/hits-by-date', authenticate, async (req, res) => {
    const userId = req.user.id;

    try {
        const trafficData = await TrafficData.findOne({ userId }).select('hitsByDate');

        if (!trafficData) {
            return res.status(404).send('Traffic data not found');
        }

        res.status(200).send(trafficData.hitsByDate);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
