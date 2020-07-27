const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const  Blockchain = require('./blockchain');
const bitconin = new Blockchain();
const uuid = require('uuid');
const port = process.argv[2];
const rp = require('request-promise');


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
    const newTransaction = req.body;
    const blockIndex = bitconin.addTrasactionToPendingTransactions(newTransaction);
    res.json({note: `Transaction will be added in block ${blockIndex}.`});
});


app.post('/transaction/broadcast',function(req,res){
    const newTransaction = bitconin.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient);
    bitconin.addTrasactionToPendingTransactions(newTransaction);
    const requestPromises = [];
    bitconin.networkNodes.forEach(networkNodeURL =>{
        const requestOptions = {
            uri:networkNodeURL + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
    .then(data =>{
        res.json({note:'Transaction create and broadcast successfully'});
    });
});


app.get('/mine',function(req,res){
    const lastblock = bitconin.getLastBlock();
    const previousBlockHash = lastblock['hash'];
    const currentblockData = {
        transaction : bitconin.pendingTransactions,
        index : lastblock['index'] + 1
    }
    const nonce = bitconin.proofOfWork(previousBlockHash,currentblockData);
    const blockhash = bitconin.hashBlock(previousBlockHash,currentblockData,nonce);

    const newblock = bitconin.createNewBlock(nonce,previousBlockHash,blockhash);
    const requestPromises = [];
    bitconin.networkNodes.forEach(networkNodeURL =>{
        const requestOptions = {
            uri:networkNodeURL + '/recieve-new-block',
            method:'POST',
            body:{newblock:newblock},
            json:true
        };
        requestOptions.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
    .then(data =>{
        const requestOptions = {
            uri:bitconin.currentNodeURL + '/transaction/broadcast',
            method:'POST',
            body:{
                amount:12.5,
                sender:"00",
                recipient:nodeAddress
            },
            json:true
        };
        return rp(requestOptions);
    })
    .then(data =>{
        res.json({
            note: "New Block mind Successfully",
            block: newblock
        });
    });

   
});

app.post('/register-and-broadcast-node',function(req,res){
    const newNodeURL = req.body.newNodeURL;
    if(bitconin.networkNodes.indexOf(newNodeURL) == -1) bitconin.networkNodes.push(newNodeURL);
    const regNodePromises = [];
    bitconin.networkNodes.forEach(networkNodeURL => {
        const requestOptions ={
            uri: networkNodeURL + '/register-node',
            method: 'POST',
            body: { newNodeURL: newNodeURL},
            json: true
        };
        regNodePromises.push(rp(requestOptions));
    });
    Promise.all(regNodePromises).then(data =>{
        const bulkRegisterOptions = {
            uri: newNodeURL + '/register-nodes-bulk',
            method:'POST',
            body: {allNetworkNodes: [...bitconin.networkNodes,bitconin.currentNodeURL]},
            json:true
        };
        return rp(bulkRegisterOptions);
    }).then(data =>{
        res.json({node : 'New node registe sucessfully'})
    });
});

app.post('/register-node',function(req,res){
    const newNodeUrl = req.body.newNodeURL;
    const nodeNotAllreadyPresent = bitconin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = bitconin.currentNodeURL !== newNodeUrl;
    if(nodeNotAllreadyPresent && notCurrentNode) bitconin.networkNodes.push(newNodeUrl);
    res.json({note : 'New Node registerd successfully'});

});

app.post('/register-nodes-bulk',function(req,res){
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeURL =>{
        const nodeNotAlreadyPresent = bitconin.networkNodes.indexOf(networkNodeURL) == -1;
        const NotCureentNode = bitconin.currentNodeURL !== networkNodeURL;
        if(nodeNotAlreadyPresent && NotCureentNode) bitconin.networkNodes.push(networkNodeURL);
    });
    res.json({note:'Bulk registration successful.'});
});



app.listen(port,function(){
    console.log(`Lising on port ${port}`)
})