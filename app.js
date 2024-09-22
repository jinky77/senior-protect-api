require("dotenv").config();
const express = require("express");
const motion = require("./routes/motion");
const recordings = require("./routes/recordings");
const users = require("./routes/users");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up route to serve files in specified in process.env.RECORDINGS_PATH
app.use("/", express.static(process.env.RECORDINGS_PATH));

// Endpoint to register new ExpoPushToken & save stat/stop motion event in Firebase
app.use("/api/v1/motion", motion);

// Endpoint to serve/delete videos
app.use("/api/v1/recordings", recordings);

// Endpoint to get users data videos
app.use("/api/v1/users", users);

app.listen(process.env.PORT, () => {
  console.log(`[log] server is listening on port ${process.env.PORT}`);
});
