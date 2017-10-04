const SHA256 = require('crypto-js/sha256');

class Block {
  constructor(index, timestamp) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = [];
    this.previousHash = '';
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions)).toString();    
  }

  addNewTransaction(sender, recipient, amount) {
    this.transactions.push({
      sender,
      recipient,
      amount
    })
  }

  getTransactions() {
    return this.transactions;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    const genesisBlock = new Block(0, "01/10/2017");
    genesisBlock.previousHash = '0';
    genesisBlock.addNewTransaction('Leo', 'Janice', 520);
    return genesisBlock;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++){
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if(currentBlock.hash !== currentBlock.calculateHash()){
        return false;
      }

      if(currentBlock.previousHash !== previousBlock.hash){
        return false;
      }
    }
    return true;
  }
}

const testCoin = new Blockchain();

block1 = new Block('1', '02/10/2017');
block1.addNewTransaction('Alice', 'Bob', 500);
testCoin.addBlock(block1);

block2 = new Block('2', '03/10/2017');
block2.addNewTransaction('Jack', 'David', 1000);
testCoin.addBlock(block2);

// console.log(JSON.stringify(testCoin.chain, undefined, 2));

// console.log(testCoin.isChainValid())

block1.transactions[0].amount = 100;
block1.hash = block1.calculateHash();
console.log(block1.getTransactions())
console.log(testCoin.isChainValid())