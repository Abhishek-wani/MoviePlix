const mongoose = require('mongoose');
const apicall = require('./models/apicalls');


main().then(() => console.log("Mongo connection open!"));
main().catch(err => console.log(err));

async function main(){
  await mongoose.connect('mongodb://localhost:27017/mml');
}

module.exports.getApikey = async function (req,res,next)     
  { 
    let arr = ['k_b7qv1d7i','k_ztuwhd3a','k_m6hjwc69','k_s6265qx6','k_8667f0y4','k_stu29m3a','k_2q7qx2zm','k_xgbd2eg6','k_p8ciyhqj','k_0cpnn6k2'];
    // let id = '62c6ec43eca39c9a56fb91d7';
    // let result = await apicall.findById(id);
    // //console.log(result)
    // let i = result.iterator;    
    // let c = result.count;
   
    // if(c == 90){
    //     i++;
    //     c=0
    // }
    // if(i==10){
    //     i=0;
    // }
    // c++;
    
    req.apikey = arr[8];
    // await apicall.findByIdAndUpdate(id,{iterator:i,count:c});
    next();
}

module.exports.apicalls = (req, res, next) => {

}

module.exports.isLoggedIn = (req, res, next) => {
    //console.log('user: ',req.user);
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be signed in!');
        return res.redirect('/login');
    }
    next();
}

