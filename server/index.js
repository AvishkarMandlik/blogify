const express = require('express');
const mongoConnection = require('./mongoConn');

const app = express();
const PORT = 5000;

mongoConnection.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(console.error);
