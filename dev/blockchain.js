const sha256 = require('sha256');

function Blockchain(){
    this.chain = [];
    this.pendingTransactions = [];
    this.createNewBlock(100,'ZnJvZ0NvaW4K','0')
}

//Create New Block
Blockchain.prototype.createNewBlock = function(nonce,previousBlockshah,hash){
    const newBlock = {
        index : this.chain.length + 1,
        timestamp : Date.now(),
        transcations : this.pendingTransactions,
        nonce : nonce,
        hash : hash,
        previousBlockshah : previousBlockshah
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
}

Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length - 1];
}


Blockchain.prototype.createNewTransaction = function(amount,sender,recipient){
    const newTransaction = {
        amount : amount,
        sender : sender,
        recipient : recipient
    };

    this.pendingTransactions.push(newTransaction);
    return this.getLastBlock()['index'] + 1;
}

Blockchain.prototype.hashBlock = function(previousBlockshah,currentBlockData,nonce) {
    const dataAsString = previousBlockshah + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
}

Blockchain.prototype.proofOfWork = function(previousBlockshah,currentBlockData){
    let nonce = 0;
    let hash = this.hashBlock(previousBlockshah,currentBlockData,nonce);
    while(hash.substring(0,4) !== '0000'){
        nonce++;
        hash = this.hashBlock(previousBlockshah,currentBlockData,nonce);
    }
    return nonce;
}


module.exports = Blockchain ;