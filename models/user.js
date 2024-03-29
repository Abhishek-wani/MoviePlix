const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        // required: [true,'First name is required']
    },
    lastname: {
        type: String,
        // required: [true,'Last name is required']
    },
    gender : {
        type: String,
        // required: [true,'Gender is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        sparse: true
        // unique: [true, 'Another user with this Email is registered!!']
    },
    // phone: {
    //     type: String,
    //     // unique: [true, 'Another user with this Phone Number is registered!!'],
    //     // min: [10,'Enter a valid 10 digit phone number'],
    //     // max: [10,'Enter a valid 10 digit phone number']
    // },
    // resetPasswordToken : {
    //     type : String,
    // },
    // resetPasswordExpires : {
    //     type : Date
    // } 

})

var options = {
    errorMessages: {
        UserExistsError: 'Username already exists',
        EmailExistsError: 'Email already exists',
        PhoneExistsError: 'Phone already exists'

    }
};

userSchema.plugin(passportLocalMongoose, options);
const User = mongoose.model('User',userSchema);

module.exports = User;