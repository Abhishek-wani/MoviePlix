const mongoose = require('mongoose');
const { Schema } = mongoose;

const apiSchema = new Schema({
    
    iterator:{
        type: Number
    },
    count:{
        type: Number
    }

})

const apicall = mongoose.model('apicall',apiSchema);
module.exports = apicall;