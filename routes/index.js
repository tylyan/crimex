var express = require('express');
var router = express.Router();
var stateList = require('../data/data').states;
var crimeList = require('../data/data').crimes;
var ethnicityList = require('../data/data').ethnicities;
var db = require('../data/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { states: stateList, crimes: crimeList, ethnicities: ethnicityList });
});

/* POST result page. */
router.post('/result', function(req, res, next) {
  console.log(req.body);
  if (req.body === null) {
    res.render('error', {message: 'Please make sure at least one State, Crime, or Ethnicity is selected'});
  }
  var stateFilter = {'attribute': 'State', 'values': req.body['states[]']};
  var crimeFilter = {'attribute': 'Category', 'values': req.body['crimes[]']};
  db.getStateCrimeData(stateFilter, crimeFilter, function(err, results) {
    if (err) {
      console.log('error in get');
      res.render('error', {message: 'Error in getting db records' });
      return;
    }
    var headers = [];
    console.log('worked');
    if (results.length < 1) {
      console.log("No results");
      res.render('error', {message: 'There were no results returned'});
    } else {
      console.log(results);
      headers = Object.keys(results[0]);
      res.render('result', {header: headers, data: results});
    }
  });
  //res.render('result', { title: req.body.state });
});

router.get('/about', function(req, res, next) {
  res.render('about');
})

router.get('/db', function(req, res, next) {
  db.getAllFromTable('state_crimes', function(err, results) {
    if (err) {
      console.log('error in get');
      res.render('error', {message: 'Error in getting db records' });
      return;
    }
    var headers = [];
    console.log('worked');
    if (results.length < 1) {
      console.log("No results");
      res.render('error', {message: 'There were no results returned'});
    } else {
      headers = Object.keys(results[0]);
      res.render('result', {header: headers, data: results});
    }
  });
});

/* GET db test page. */
router.get('/dbtest', function(req, res, next) {
  db.test(function(status) {
    res.render('status', {title: status.message});
  })
})

module.exports = router;
