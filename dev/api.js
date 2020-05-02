const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const  Blockchain = require('./blockchain');
const bitconin = new Blockchain();
const uuid = require('uuid');


const nodeAddress = uuid.v1().split('-').join('');


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

app.get('/',function(req,res){
    res.send("<h1>404 Pages not found </h1>");
})

app.get('/blockchain',function(req,res){
    res.send(bitconin);
});

app.post('/transaction',function(req,res){
    const BlockIndex = bitconin.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient);
    res.send(`Transcation will be added in block ${BlockIndex}`);
})


app.get('/mine',function(req,res){
    const lastblock = bitconin.getLastBlock();
    const previousBlockHash = lastblock['hash'];
    const currentblockData = {
        transaction : bitconin.pendingTransactions,
        index : lastblock['index'] + 1
    }
    const nonce = bitconin.proofOfWork(previousBlockHash,currentblockData);
    const blockhash = bitconin.hashBlock(previousBlockHash,currentblockData,nonce);
    bitconin.createNewTransaction(12.5,"00",nodeAddress);
    const newblock = bitconin.createNewBlock(nonce,previousBlockHash,blockhash);
    res.json({
        note: "New Block mind Successfully",
        block: newblock
    })
})

app.listen(3000,function(){
    console.log('Lising on port 3000')
})