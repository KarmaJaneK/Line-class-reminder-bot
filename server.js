const express = require('express');
const { port } = require('./config');
const { handleEvent, sendReminders } = require('./handlers');
const cron = require('node-cron');

const app = express();

// Middleware
app.use(express.json());

// Webhook for LINE messages
app.post('/webhook', async (req, res) => {
    const events = req.body.events;
    if (!events || events.length === 0) {
        return res.status(400).send('No events');
    }

    try {
        const result = await Promise.all(events.map(handleEvent));
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
});

// Schedule reminders to send at 18:00 every day
cron.schedule('0 18 * * *', sendReminders);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});