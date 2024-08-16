const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("server running successfully");
});

app.listen(port, () => {
  console.log(`server running successfully on ${port}`);
});
