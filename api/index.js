const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User  = require('./Models/User.js');  
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();


const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'bsbvdsvnonsvnslvbsdlvsn';

app.use(express.json()); 
app.use(cookieParser());
app.use(cors({
    credentials : true,
    origin : 'http://localhost:5173',
}));
 
 mongoose.connect(process.env.MONGO_URL);

app.get('/test' , (req,res) => {
    res.json('test ok');
});

app.post('/register' ,async (req, res) => {  
    const {name, email, password}  = req.body;
    try { 
        const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password,bcryptSalt ),
        });
        res.json(userDoc)
    }catch(e){
        res.status(422).json(e);
    }    
});
app.post('/login' , async (req,res) =>{
    const {email,password} = req.body;
    const userDoc = await User.findOne({email});
    if(userDoc){
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if(passOk){
            jwt.sign({email:userDoc.email , 
                id:userDoc._id } , 
                jwtSecret , {} , (err,token)=>{
                if(err) throw err;
                res.cookie('token',token , {
                    httpOnly: true,          // Ensures the cookie is not accessible via JavaScript
                    secure: false,           // Set to true if you're using HTTPS
                    sameSite: 'Lax',         // Use 'Lax' for same-site or top-level navigation requests
                    maxAge: 24 * 60 * 60 * 1000, // 1 day

                }).json(userDoc);
            } );
            
        }else{
            res.status(422).json('pass not ok');
        }
    }else{
        res.json('not found');
    }
});

app.get('/profile' ,(req,res) =>{
    const {token} = req.cookies;
    if(token){
        jwt.verify(token, jwtSecret , {} ,async (err,userData)=>{
            if(err) throw err;
            const {name , email,_id} = awaitUser.findById(userData.id);
            res.json( {name , email,_id});
        });
    }else{
        res.json(null);
    }
    res.json('user Info');
})

app.post('/logout' ,(req,res) =>{
    res.cookie('token', '').json(true);
});
app.listen(4000);    
////CAxW9TQBB9vuUR8P - password for mongodb