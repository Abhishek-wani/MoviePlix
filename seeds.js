const mongoose = require('mongoose');
const apicall = require('./models/apicalls');

main().then(() => console.log("Mongo connection open!"));
main().catch(err => console.log(err));

async function main(){
  await mongoose.connect('mongodb://localhost:27017/mml');
}

const l = [{
    iterator: 4,
    count : 0,
},
]

apicall.insertMany(l);