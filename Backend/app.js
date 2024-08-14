const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
require('./bot/telegramBot');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
const appointments = require('./routes/appointments');
app.use('/api/appointments', appointments);

const PORT = process.env.PORT || 5000;

// Export the app for Vercel to use
module.exports = app;

// If not in a serverless environment, start the server
if (!process.env.NOW_REGION) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
