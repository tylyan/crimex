var express = require('express');
var router = express.Router();
var stateList = require('./data').states;
var crimeList = require('./data').crimes;
var ethnicityList = require('./data').ethnicities;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { states: stateList, crimes: crimeList, ethnicities: ethnicityList });
});

router.post('/result', function(req, res, next) { 
  console.log(req.body); 
  res.render('result', { title: req.body.state });
});

module.exports = router;
