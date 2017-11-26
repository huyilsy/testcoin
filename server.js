const express = require('express');
const uuidv4 = require('uuid/v4');
const Blockchain = require('./blockchain').Blockchain;
const Block = require('./blockchain').Block;
const fs = require('fs');
const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;
const app = express();
const nodeIdentifier = uuidv4();
const testCoin = new Blockchain();
const jsonParser = bodyParser.json();

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
  const latestBlockIndex = testCoin.chain.length;
  const newBlock = new Block(latestBlockIndex, new Date().toString());
  newBlock.transactions = testCoin.currentTransactions;
  // Get a reward for mining the new block
  newBlock.transactions.unshift({
    sender: '0',
    recipient: nodeIdentifier,
    amount: 50
  })
  testCoin.addBlock(newBlock);
  testCoin.currentTransactions = [];
  res.send(`Mined new block ${JSON.stringify(newBlock, undefined, 2)}`);
});

app.post('/transactions/new', jsonParser, (req, res) => {
  const newTransaction = req.body;
  testCoin.addNewTransaction(newTransaction)
  res.send(`The transaction ${JSON.stringify(newTransaction)} is successfully added to the blockchain.`);
});

app.get('/chain', (req, res) => {
  const response = {
    chain: testCoin.chain,
    length: testCoin.chain.length
  }
  res.send(response);
})

app.post('/nodes/register', jsonParser, (req, res) => {
  const nodes = req.body.nodes;
  if (nodes === null) {
    res.status(400).send('Error: Please supply a valid list of nodes.')
  }
  for (let node of nodes) {
    console.log('node', node)
    testCoin.registerNode(node);
  }
  const response = {
    message: 'New nodes have been added',
    totalNodes: Array.from(testCoin.nodes)
  }
  res.send(response)
})

app.get('/nodes/resolve', async (req, res) => {
  const replaced = await testCoin.resolveConflicts();
  console.log('replaced', replaced)
  let response = {
    'message': 'Our chain is authoritative',
    'new_chain': testCoin.chain
  }

  if (replaced) {
    response.message = 'Our chain was replaced';
  }
  res.send(response);
})

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});