// lineClient.js
const { Client } = require('@line/bot-sdk');
const { lineConfig } = require('./config');

const lineClient = new Client(lineConfig);

module.exports = lineClient;