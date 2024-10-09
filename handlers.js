// handlers.js
const lineClient = require('./lineClient');
const airtableBase = require('./airtableClient');

async function handleEvent(event) {
    if (event.type === 'message' && event.message.type === 'text') {
        const replyToken = event.replyToken;
        const userId = event.source.userId;

        return lineClient.replyMessage(replyToken, {
            type: 'text',
            text: `Received your message: ${event.message.text}`,
        });
    }
    return null;
}

async function sendReminders() {
    try {
        const records = await airtableBase('YourTableName').select().all();
        const today = new Date().toISOString().split('T')[0];

        for (const record of records) {
            const classTime = record.get('Booking date/time');
            const userId = record.get('Line ID');
            const reminderSent = record.get('Confirmation sent');

            if (!reminderSent && classTime.startsWith(today)) {
                const message = `Reminder: You have a class scheduled at ${classTime}.`;
                await lineClient.pushMessage(userId, { type: 'text', text: message });
                await airtableBase('YourTableName').update(record.id, {
                    'Confirmation sent': true,
                });
            }
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = { handleEvent, sendReminders };