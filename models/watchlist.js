const mongoose = require('mongoose');
const { Schema } = mongoose;

const wlSchema = new Schema({
    m_id: {
        type: String,
        required : true,
    },
    m_name: {
        type: String,
        required: [true, "Please Specify Movie Name"]
    },
    m_year: {
        type: String
    },
    m_rating: {
        type: Number,
        min:0,
        max:10
    },
    m_url :{
        type: String
    },
    m_status: {
        type : String,
        enum: ['Completed','Not Completed'],
    },
    m_type:{
        type: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const wlist = mongoose.model('wlist',wlSchema);

module.exports = wlist;