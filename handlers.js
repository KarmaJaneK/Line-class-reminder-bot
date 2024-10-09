const lineClient = require('./lineClient');
const airtableBase = require('./airtableClient');

async function handleEvent(event) {
    if (event.type === 'message' && event.message.type === 'text') {
        const replyToken = event.replyToken;
        const userId = event.source.userId;
        const messageText = event.message.text.toLowerCase();

        // Update the confirmation status based on the parent's response
        const records = await airtableBase('YourTableName').select({
            filterByFormula: `{Line ID} = '${userId}'`,
        }).all();

        for (const record of records) {
            if (messageText.includes('will attend')) {
                await airtableBase('YourTableName').update(record.id, {
                    'Will attend': true,
                    'Will not attend': false,
                });
            } else if (messageText.includes('will not attend')) {
                await airtableBase('YourTableName').update(record.id, {
                    'Will attend': false,
                    'Will not attend': true,
                });
            }
        }

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
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];

        for (const record of records) {
            const classTime = record.get('Booking date/time');
            const userId = record.get('Line ID');
            const reminderSent = record.get('Reminder sent');
            const willAttend = record.get('Will attend');
            const willNotAttend = record.get('Will not attend');

            if (!reminderSent && classTime.startsWith(tomorrowDate) && willAttend === undefined && willNotAttend === undefined) {
                const message = `GReminder: You have a class scheduled at ${classTime}. Please confirm if you will attend or not.`;
                await lineClient.pushMessage(userId, { type: 'text', text: message });
                await airtableBase('YourTableName').update(record.id, {
                    'Reminder sent': true,
                });
            }
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = { handleEvent, sendReminders };