if(process.env.NODE_ENV !== "production"){
  require('dotenv').config()
}
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const dbUrl = process.env.DB_URL;
const axios = require('axios');
const {getApikey} = require('./middleware'); 
const wlist = require('./models/watchlist');
const User = require('./models/user');
const apicall = require('./models/apicalls');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');
const {isLoggedIn} = require('./middleware');
const MongoStore = require('connect-mongo');


// mongoose.connect( dbUrl, {})
//      .then(() => console.log( 'Database Connected' ))
//      .catch(err => console.log( err ));


main().then(() => console.log("Mongo connection open!"));
main().catch(err => console.log(err));

async function main(){
  await mongoose.connect('mongodb://localhost:27017/mml');
}

app.set('views',path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended : true }))
app.use(methodOverride('_method'));

// const store = new MongoStore({
//     url: dbUrl,
//     secret: 'secret',
//     touchAfter: 24 * 60 * 60
// });

// store.on("error",function(e){
//   console.log("session store error",e);
// })

const sessionConfig = {
  name : 'session',
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge : 1000 * 60 * 60 * 24 * 7
  }
}



app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  //console.log(req.session);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.apivar = 0;
  next();
})

app.get('/watchlist', isLoggedIn, getApikey,async function (req, res){
//console.log(req.user);
const username = req.user.username;
  if(!req.user){
        res.redirect('/error');
    }
    else{
        const mylist = await wlist.find().populate('author');  
        // console.log(mylist);
        const list = mylist.filter(x => {
          if(x.author.username === username){
              return x;
          }        
      })  
        let apikey = req.apikey;
        let x = 0;         
        res.render('imdb/watchlist', {list ,apikey,x});
    }       
})


app.get('/error',(req, res, next) => {
  res.send("error");
})

app.get('/sort', isLoggedIn,getApikey,async function (req, res){
  const username = req.user.username;
  let apikey = req.apikey;
  let x = 1;  
  if(!req.user){
        res.redirect('/error');
    }
    else{
        let list2 = await wlist.find().populate('author');  
       
        let list = list2.filter(z => {
          if(z.author.username === username){
              return z;
          }       
        })
      list.sort((a, b) => b.m_rating - a.m_rating);   
      res.render('imdb/watchlist', {list ,apikey,x}); 
      }   
})

app.post('/addtowatchlist', isLoggedIn,async function (req, res){
   let {mname , mid, myear ,murl, mtype , author} = req.body;
   const userId = req.user._id;
   author = userId;
   let username = req.user.username;
  if(mname){
    mname = mname.trim();
  }
  if(mid){
    mid = mid.trim();
  }
  if(myear){
    myear = myear.trim();
  }
  if(murl){
    murl = murl.trim();
  }
  if(mtype){
    mtype = mtype.trim();
  } 
   let list = await wlist.find({m_id:mid,author});
   if(list.length==0){
    await wlist.insertMany([{m_name : mname ,m_id : mid,m_year : myear , m_url : murl, m_type: mtype, author}]);
   }

   req.flash('success','Added to Watchlist');
   res.redirect(`/movies/${mid}`);
  
})

app.get('/delete/:mid', isLoggedIn,async function (req, res){
  const {mid} = req.params;
  let {author} = req.body;
  const userId = req.user._id;
   author = userId;
   let username = req.user.username;
  // console.log(`${mid}`);
  //await wlist.deleteMany();
  let result = await wlist.find({m_id: mid,author});
  let id = result[0]._id.toString()
  //console.log(result[0]._id.toString());
  await wlist.findByIdAndDelete(id);  
  req.flash('success','Removed from Watchlist');
  res.redirect(`/watchlist`);
})

app.post('/edit',isLoggedIn,async function (req, res){
  // console.log(req.body)
  let {rating,status,mid} = req.body;
  let {author} = req.body;
  const userId = req.user._id;
   author = userId;
   let username = req.user.username;
  if(!status){
    status = "Not Completed"
  }
  let result = await wlist.find({m_id: mid,author});
  let id = result[0]._id.toString()
  //console.log(result[0]._id.toString());
  await wlist.findByIdAndUpdate(id,{m_rating : rating,m_status : status});
  res.redirect(`/watchlist`);
})

app.post('/movies',getApikey,async (req, res) => {
    let apikey = req.apikey;
    //console.log(apikey);
    const {search,whichapi} = req.body;
    let result;
    if(!whichapi){
      await axios.get(`https://imdb-api.com/en/API/Search/${apikey}/${search}`)
      .then(function (response) {
        // handle success
        result = response.data.results;
        //console.log(result);
      })
      .catch(function (error) {
        // handle error
        console.log("error");
      })
    }else{
      await axios.get(`https://imdb-api.com/en/API/Search/${apikey}/${search}`)
      .then(function (response) {
        // handle success
        result = response.data.results;
        //console.log(result);
      })
      .catch(function (error) {
        // handle error
        console.log("error");
      })
    }
   
    res.render('imdb/searchResults', { result }); 
    
})

app.get('/movies/:id',getApikey, async (req, res) => {
  let apikey = req.apikey;
  
  const {id} = req.params;
  let result;
  let trailer;
  let cast;
  let username;
  let userId ;
  let author; 
  let list2 ;
  let isAdded ;
  let isAdded2;


  if(req.user){
  username = req.user.username;
  userId = req.user;
  author = userId;
  list2 = await wlist.find({m_id: id}).populate('author');
  isAdded = list2.filter(x => {
    if(x.author.username === username){
        return x;
    }        
  }) 
  }else{
    list2 = await wlist.find({m_id: id}); 
    isAdded2 = await wlist.find({m_id : id});       
    }       
  // console.log(isAdded.length);
  //data
  await axios.get(`https://imdb-api.com/en/API/Title/${apikey}/${id}`)
    .then(function (response){     
      result = response.data;
      // console.log(response.data);
    })
    .catch(function (error) {    
      console.log("error");
    })
   await axios.get(`https://imdb-api.com/en/API/Trailer/${apikey}/${id}`)
   .then(function (response){    
    trailer = response.data;
    // console.log(response.data);
  })
  .catch(function (error) {   
    console.log("error");
  })
 
  await axios.get(`https://imdb-api.com/en/API/FullCast/${apikey}/${id}`)
    .then(function (response){     
      cast = response.data;
      
    })
    .catch(function (error) {      
      console.log("error");
    })

    await axios.get(`https://imdb-api.com/en/API/YouTubeTrailer/${apikey}/${id}`)
    .then(function (response){     
      yt = response.data;
      
    })
    .catch(function (error) {      
      console.log("error");
    })

    // console.log(yt);
  res.render('imdb/movie', { result , trailer, cast , isAdded, yt, author, isAdded2});
})


app.get('/top250',getApikey,async (req, res)=>{
  let apikey = req.apikey;
  let list;
  await axios.get(`https://imdb-api.com/en/API/Top250Movies/${apikey}`)
  .then(function (response){     
    list = response.data.items;    
  })
  .catch(function (error) {      
    console.log("error");
  })
  res.render('imdb/top250',{list});
})

app.get('/cast/:id',getApikey,async (req, res)=>{
  let apikey = req.apikey;
  const {id} = req.params;
  await axios.get(`https://imdb-api.com/en/API/Title/${apikey}/${id}`)
    .then(function (response){     
      result = response.data;
      // console.log(response.data);
    })
    .catch(function (error) {    
      console.log("error");
    })
  res.render('imdb/cast');
})

app.get('/register',async (req, res) => {
  res.render('user/register');
})

app.post('/register',async (req, res) => {
  try{
  const {username, password, email} = req.body;
  const user = new User({username, email});
  const registeredUser = await User.register(user, password);
  req.login(registeredUser, err => {
    if (err) return next(err);
    req.flash('success','Welcome to Movieplix');
    res.redirect('/');
  })
  
}catch(e){
  req.flash('error',e.message);
  // console.log(e.message);
  res.redirect('/register');
}
 
})

app.get('/login',async (req, res) => {
  res.render('user/login');
})

app.post('/login',passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),(req, res) => {
  req.flash('success', 'Welcome back');
  const redirectUrl = req.session.returnTo || '/';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
})

app.get('/logout',(req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success', 'Logged Out!');
    res.redirect('/');
  });
  // req.logout();
  // req.flash('success', 'Logged Out!');
  // res.redirect('/');
})

app.get('/profile',(req, res) => {
    res.render('user/profile');
})

app.get('/admin',getApikey,(req, res) => {
    let apikey = req.apikey;
    apivar = 1;
    console.log(apikey);
    res.render('user/admin');
})

app.get('/',getApikey,async (req, res) => {
  let apikey = req.apikey;
  let result;
 
  await axios.get(`https://imdb-api.com/en/API/BoxOffice/${apikey}`)
  .then(function (response){     
    result = response.data.items;
    // console.log(response.data);
  })
  .catch(function (error) {    
    console.log("error");
  })


  res.render('home',{result});
})

app.get('*',getApikey,async (req, res) =>{
    res.render('error');
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('listening on port 3000');
})