const express = require('express');
const mongoConnection = require('./mongoConn');

const app = express();
const PORT = 5000;
const path = require('path');
app.use(express.json());







app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'))
});

mongoConnection.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(console.error);
