// index.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { generateTraffic,findWebsiteByKeyword } = require('./bot');
const userRoutes = require('./routes/userRoutes');
const { authenticate } = require('./middleware/authMiddleware');
const { addTaskToQueue, processQueue } = require('./queue');
const { storeTrafficData } = require('./helpers/dbHelpers');
const User = require('./models/user');
const TrafficData = require('./models/trafficData');

const app = express();
const port = 5000;

const mongoURI = 'mongodb+srv://faizansafdar0322:be56yl1BmbHOYj2R@cluster0.7ogztll.mongodb.net/';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

app.use(cors());
app.use(bodyParser.json());

app.use('/users', userRoutes);

const subscriptions = {
    free: { hitsPerDay: 10, durationDays: Infinity },
    plan1: { hitsPerDay: 3000, durationDays: 7 },
    plan2: { hitsPerDay: 500, durationDays: 30 }
};

const getPlanDetails = (planType) => subscriptions[planType];

// Function to get total seconds in a day
const getTotalSecondsInDay = () => 24 * 60 * 60;

// Function to wait for a specific number of seconds
const wait = (seconds) => {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};

// Function to add tasks to the queue
const addTasksToQueue = async (url, keyword, country, userId, hitsPerDay, durationDays, waitTimeSeconds) => {
    for (let day = 0; day < durationDays; day++) {
        for (let hit = 0; hit < hitsPerDay; hit++) {
            addTaskToQueue(generateTraffic({ url, keyword, stayTime: 3000, numBots: 1, country, userId }));
            await wait(waitTimeSeconds); // Wait before adding next task
        }
    }
};

// Function to handle traffic data storage and task queuing
const handleTrafficGeneration = (url, keyword, country, userId, hitsPerDay, durationDays) => {
    User.findByIdAndUpdate(userId, { website: url, keyword, country, rank: null }).then(() => {
        storeTrafficData({ userId, keyword, website: url, country });

        // Calculate the wait time before adding tasks to the queue
        const waitTimeSeconds = Math.floor(getTotalSecondsInDay() / hitsPerDay);

        // Add tasks to the queue
        addTasksToQueue(url, keyword, country, userId, hitsPerDay, durationDays, waitTimeSeconds).catch(console.error);
    }).catch(console.error);
};



app.post('/generate-traffic-by-subscription', authenticate, async (req, res) => {
    const { keyword, url, country } = req.body;
    const userId = req.user.id;

    if (!keyword || !url || !country) {
        return res.status(400).send('Missing required parameters');
    }

    try {
        const user = await User.findById(userId);
        if (!user || !user.subscription) {
            return res.status(403).send('No active subscription found for user');
        }

        const planDetails = getPlanDetails(user.subscription);
        if (!planDetails) {
            return res.status(400).send('Invalid subscription plan');
        }

        const { hitsPerDay, durationDays } = planDetails;

        // Check if the website is found in the top 100 ranks
        const isWebsiteFound = await findWebsiteByKeyword({ url, keyword, userId });
        if (!isWebsiteFound) {
            return res.status(201).send({ message: 'Your website was not found in the top 100 search results for the given keyword' });
        }

        // Proceed with traffic generation if the website is found
        handleTrafficGeneration(url, keyword, country, userId, hitsPerDay, durationDays);
        res.status(200).send({ message: 'Traffic generation tasks are being added to the queue' });
    } catch (error) {
        res.status(400).send(error.message);
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    processQueue();
});
