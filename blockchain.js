const SHA256 = require('crypto-js/sha256');
const URLparse = require('urlparse');
const axios = require('axios');

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
    this.nodes = new Set();
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

  isChainValid(chain) {
    for (let i = 1; i < chain.length; i++){
      console.log('i', chain[i])
      const currentBlock = chain[i];
      const previousBlock = chain[i-1];
      SHA256(chain[i].index + chain[i].previousHash + chain[i].timestamp + JSON.stringify(chain[i].transactions) + chain[i].nonce).toString()
      if(currentBlock.hash !== SHA256(chain[i].index + chain[i].previousHash + chain[i].timestamp + JSON.stringify(chain[i].transactions) + chain[i].nonce).toString()){
        return false;
      }

      if(currentBlock.previousHash !== previousBlock.hash){
        return false;
      }
    }
    return true;
  }

  registerNode(address) {
    const parsedURL = URLparse(address);
    this.nodes.add(`${parsedURL.host}:${parsedURL.port}`);
  }

  async resolveConflicts() {
    const neighbours = this.nodes;
    let maxLength = this.chain.length;
    for (let node of neighbours) {
      const response = await axios.get(`http://${node}/chain`)

      if (response.status === 200) {
        const chain = response.data.chain;
        const length = response.data.length;
        console.log('chain', chain)
        if ( length > maxLength && this.isChainValid(chain) ) {
          maxLength = length;
          this.chain = chain;
          return true
        }
      }
      return false 
    }
  }
}

module.exports = {
  Block,
  Blockchain
}