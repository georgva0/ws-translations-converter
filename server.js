// Import the Express module
const express = require("express");
// Import the path module for handling file paths
const path = require("path");

// Create an Express application
const app = express();
// Define the port the server will listen on
const port = 3000; // You can use any available port

// --- Middleware ---
// Serve static files (like CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// --- Routes ---
// Define a route for the homepage ('/')
app.get("/", (req, res) => {
  // Send the index.html file when the homepage is requested
  res.sendFile(path.join(__dirname, "index.html"));
});

// --- Start the Server ---
// Make the app listen on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
