// config.js
require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    lineConfig: {
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
        channelSecret: process.env.LINE_CHANNEL_SECRET,
    },
    airtableConfig: {
        apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
        baseId: process.env.AIRTABLE_BASE_ID,
    },
};