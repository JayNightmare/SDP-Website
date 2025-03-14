// TODO: Add backend server code here

// // //
// * Example
// 1. Create a new express app.
// 2. Set up the app to listen on port 3000.
// 3. Create a new route for GET requests to the root URL ("/").
// 4. Send a response with the message "Hello, World!".
// 5. Log a message to the console to indicate that the server is running.
// // //

const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});