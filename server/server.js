const express = require('express');
const bodyParser = require('body-parser');
const sqliteService = require('./SQLiteService');

const app = express();
app.use(bodyParser.json());

app.post('/sync', (req, res) => {
  const clientChanges = req.body;
  const serverChanges = sqliteService.getPendingChanges();

  sqliteService.applyServerChanges(clientChanges);
  sqliteService.markAsSynced(clientChanges);

  res.json(serverChanges);
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
