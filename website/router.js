const express = require('express');
const router = express.Router();//instance to express app
const { v4: uuidv4 } = require('uuid'); //used to get unique room ids

//////////////////// Home ///////////////////////////

//join home
router.get('/', (req, res) =>{
    return res.render('home');
});

/////////////////////////// Features ///////////////////////////

//join features
router.get('/features', (req, res) =>{
    return res.render('features');
});

/////////////////////// Culture Bot //////////////////

//join chatbot
router.get('/culture-bot', (req, res) =>{
    return res.render('culture-bot');
});

/////////////////////// Account //////////////////

//join account
router.get('/account', (req, res) =>{
    return res.render('account');
});

/////////////////////// Login //////////////////

//join login page
router.get('/login', (req, res) =>{
    return res.render('login');
});


/////////////////////// Room ///////////////////

//create new room
router.get('/room', (req, res) =>{
    return res.redirect(`/room/${uuidv4()}`);
});

//join room
router.get('/room/:room', (req, res) =>{
    return res.render('room', { roomId: req.params.room });
});

/////////////////////////////////////////////////////////////////////
module.exports = router;