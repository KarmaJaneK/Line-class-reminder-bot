// Import the line client module
const lineClient = require('./lineClient');

// Import the Airtable client module
const airtableBase = require('./airtableClient');

// Function to send reminders to users
async function sendReminders() {
    try {
        // Fetch all records from Airtable
        const records = await airtableBase('Bot Test').select().all();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];

        // Iterate through the fetched records
        for (const record of records) {
            const classTime = record.get('Booking date/time');
            const userId = record.get('Line ID');
            const reminderSent = record.get('Reminder sent');
            const willAttend = record.get('Will attend');
            const willNotAttend = record.get('Will not attend');

            // Check if a reminder needs to be sent
            if (!reminderSent && classTime.startsWith(tomorrowDate) && willAttend === undefined && willNotAttend === undefined) {
                const message = `Reminder: You have a class scheduled at ${classTime}. Please confirm if you will attend or not.`;
                await lineClient.pushMessage(userId, { type: 'text', text: message });
                await airtableBase('Bot Test').update(record.id, {
                    'Reminder sent': true,
                });
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Function to handle incoming events (user messages)
async function handleEvent(event) {
    if (event.type === 'message' && event.message.type === 'text') {
        const replyToken = event.replyToken;
        const userId = event.source.userId;
        const messageText = event.message.text.toLowerCase();

        // Define possible confirmation phrases for attending and not attending
        const WillAttendConfirmations = [
            'will attend',
            'be there',
            'confirm',
            'see you',
            'yes',
        ];
        const WillNotAttendConfirmations = [
            'will not attend',
            'not coming',
            'cancel',
            'reschedule',
            'no',
        ];

        // Fetch records from Airtable based on the user's Line ID
        const records = await airtableBase('Bot Test').select({
            filterByFormula: `{Line ID} = '${userId}'`,
        }).all();

        if (records.length > 0) {
            const record = records[0]; // Assuming one user record per Line ID
            const willAttend = record.get('Will attend');
            const willNotAttend = record.get('Will not attend');

            // If the user hasn't confirmed attendance, process the input
            if (willAttend === undefined && willNotAttend === undefined) {
                // Check if the message text matches any of the "attend" phrases
                if (WillAttendConfirmations.some((phrase) => messageText.includes(phrase))) {
                    await airtableBase('Bot Test').update(record.id, {'Will attend': true});
                    await lineClient.replyMessage(replyToken, {
                        type: 'text',
                        text: 'Thank you for confirming your attendance!'
                    });
                }
                // Check if the message text matches any of the "not attend" phrases
                else if (WillNotAttendConfirmations.some((phrase) => messageText.includes(phrase))) {
                    await airtableBase('Bot Test').update(record.id, {'Will not attend': true});
                    await lineClient.replyMessage(replyToken, {type: 'text', text: 'Thank you for informing us.'});
                }
                // If the message doesn't match any confirmation phrases
                else {
                    return null;
                }
            }
        }
    }
}

// Export the handleEvent and sendReminders functions
module.exports = { handleEvent, sendReminders };