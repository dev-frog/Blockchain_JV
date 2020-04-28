const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();
const previousBlockhash = '9cce82d419a5f8fd58b84f11bef7dee6b7229f89';
const currentBlockData = [
    {
        amount: 100,
        sender: 'froghunter',
        recipent:'ewogICJuYW1lIjogImJsb2NrY2hhaW4i'
    },
    {
        amount: 30,
        sender: 'nisga',
        recipent:'ewYW1lIjogImJsb2NrY2hhaW4i'
    }
];



// console.log(bitcoin.proofOfWork(previousBlockhash,currentBlockData));

// console.log(bitcoin.hashBlock(previousBlockhash,currentBlockData,41282));

console.log(bitcoin);