const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { generateTraffic } = require('./bot');

const app = express();
const port = 5000;

// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json());

app.post('/generate-traffic', async (req, res) => {
    const { url, keyword, stayTime, numBots } = req.body;
    try {
        await generateTraffic({ url, keyword, stayTime, numBots });
        res.status(200).send({ message: 'Traffic generated successfully' });
    } catch (error) {
        console.error('Error generating traffic:', error);
         res.status(500).send(`Error generating traffic: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
