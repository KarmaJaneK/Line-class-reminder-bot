// airtableClient.js
const Airtable = require('airtable');
const { airtableConfig } = require('./config');

const airtableBase = new Airtable({ apiKey: airtableConfig.apiKey }).base(airtableConfig.baseId);

module.exports = airtableBase;