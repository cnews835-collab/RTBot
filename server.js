const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("RTBot is running"));
app.listen(3000);
