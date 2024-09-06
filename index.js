const express = require('express');
const app = express();
const cors = require('cors');
const route = require('./Route/route'); 
const { dbConnection } = require('./Config/dbConfig'); 
let port = 3001;

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request body
app.use(route); // Use your route

// Function to start the server
const serverStart = async () => {
  try {
    await dbConnection(); // Ensure the DB connection is established first
    app.listen(port, () => {
      console.log('Express app running on port', port);
    });
  } catch (error) {
    console.log('Error starting server:', error.message); // Log any errors during startup
  }
};

serverStart();
