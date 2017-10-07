const SHA256 = require('crypto-js/sha256');

class Block {
  constructor(index, timestamp) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = [];
    this.previousHash = '';
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();    
  }

  mineBlock(difficulty) {
    console.log(`Mining block ${this.index}`);
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
        this.nonce++;
        this.hash = this.calculateHash();
    }
    console.log("BLOCK MINED: " + this.hash);
  }

  getTransactions() {
    return this.transactions;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3;
    this.currentTransactions = [];
  }

  addNewTransaction(sender, recipient, amount) {
    this.currentTransactions.push({
      sender,
      recipient,
      amount
    })
  }

  createGenesisBlock() {
    const genesisBlock = new Block(0, "01/10/2017");
    genesisBlock.previousHash = '0';
    genesisBlock.transactions.push({
      sender: 'Leo',
      recipient: 'Janice',
      amount: 520
    })
    return genesisBlock;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
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

module.exports = {
  Block,
  Blockchain
}