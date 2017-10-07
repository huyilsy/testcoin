const express = require('express');
const uuidv4 = require('uuid/v4');
const Blockchain = require('./blockchain').Blockchain;
const fs = require('fs');

const port = process.env.PORT || 3000;
const app = express();
const nodeIdentifier = uuidv4();
const testCoin = new Blockchain();

app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;
  console.log(log);
  fs.appendFile('server.log', log + '\n', (err) => {
    if (err) console.log(err);
  });
  next();  
})

app.get('/mine', (req, res) => {
  res.send("We'll mine a new block.");
});

app.post('/transactions/new', (req, res) => {
  res.send("We'll add a new transaction.")
});

app.get('/chain', (req, res) => {
  const response = {
    chain: testCoin.chain,
    length: testCoin.chain.length
  }
  res.send(response);
})

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});