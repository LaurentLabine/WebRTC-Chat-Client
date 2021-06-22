// server.js
const express = require('express');
const app = express();
const port = 4000;

app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
});