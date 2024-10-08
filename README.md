# Line-class-reminder-bot

### Line Messaging API
- Go to the LINE Developers website.
- Sign in with your LINE account and create a new provider (e.g., your business or service).
- Create a new Messaging API channel.
- After creating the channel, take note of the Channel ID, Channel secret, and Channel access token.

##### Configure Webhook in Line
- Enable 'use webhook' in messaging API
- Add the webhook URL that will handle the incoming events, such as messages from users (we will create the webhook in a later step).

### Configure Airtable class booking data

##### Create a base that will hold your booking data. Add columns such as:
Client Name
Client Phone/LINE ID
Class Time
Reminder Sent (Yes/No)
Confirmation Received (Yes/No)

 ##### Get Airtable API Key and Base ID
- Go to the Airtable API Documentation and generate your API key.
- Find your Base ID by navigating to your Airtable base and checking its API documentation. The Base ID will be in the URL.

### SetUp Backend (Node.js/Express) to send messages
- install libraries: express, axios, airtable, line-bot-sdk,dotenv

### Create environment Variables:
Create a .env file in your project directory to store sensitive information (e.g., Airtable API key, LINE access token)

### Set up Express server (server.js)
### Deploy Serve
- Heroku,vercel or render
  Deploy to Heroku (example):

Install the Heroku CLI.
Run the following commands:
bash
Copy code
heroku login
heroku create your-app-name
git init
git add .
git commit -m "Initial commit"
git push heroku master
Set the environment variables on Heroku:
bash
Copy code
heroku config:set AIRTABLE_API_KEY=your_airtable_api_key
heroku config:set AIRTABLE_BASE_ID=your_airtable_base_id
heroku config:set LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
heroku config:set LINE_CHANNEL_SECRET=your_line_channel_secret
Once deployed, use the URL of your server as the webhook URL in the LINE Developer Console

### Automate the Message Sending
To send reminders automatically every day:
-Use setInterval as shown in the code.
- Alternatively, set up a cron job using a service like cron-job.org or using platform-specific schedulers (e.g., Heroku Scheduler).

### Test the System
-  Add test data to your Airtable base (include class times and LINE IDs).
- Ensure the reminders are sent, and client confirmations update correctly.










