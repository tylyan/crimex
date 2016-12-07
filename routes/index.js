var express = require('express');
var router = express.Router();
var stateList = require('../data/data').states;
var crimeList = require('../data/data').crimes;
var ethnicityList = require('../data/data').ethnicities;
var coord = require('../data/coord').coord;
var db = require('../data/database');
//var globeData;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { states: stateList, crimes: crimeList, ethnicities: ethnicityList });
});

/* POST result page. */
router.post('/result', function(req, res, next) {
  //console.log(req.body);
  var filters = {};
  var stateFilter = {'attribute': 'State', 'values': req.body['states[]']};
  var crimeFilter = {'attribute': 'Category', 'values': req.body['crimes[]']};
  var ethFilter = req.body['ethnicities[]'];
  console.log(req.body['crimes[]']);
  console.log(req.body['states[]']);
  filters.stateFilter = stateFilter;
  filters.crimeFilter = crimeFilter;
  filters.ethFilter = ethFilter;
  filters.popFilter = req.body['popFilter[]'];
  filters.totalCrimeFilter = req.body['totalCrimeFilter[]'];
  filters.policeEmploymentFilter = req.body['policeEmploymentFilter[]'];
  filters.resultFilter = req.body['resultFilters[]'];
  db.getStateCrimeData(filters, function(err, results) {
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
      //console.log(results);
      //globeData = createGlobeData(req.body, results);
      headers = Object.keys(results[0]);
      res.render('result', {header: headers, data: results});
    }
  });
  //res.render('result', { title: req.body.state });
});

router.get('/visual', function(req, res, next) {
  console.log(globeData);
  res.render('visual', globeData);
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


// function createGlobeData(body, results) {
//   var data = [];
//   var crimes = body['crimes[]'];
//   var states = body['states[]'];
//   console.log(coord);
//   for (var i = 0; i < crimes.length; i++ ) {
//     data[i] = [crimes[i]];
//     data[i][1] = [];
//     states.forEach(function(state) {
//       coord.forEach(function(obj) {
//         if (obj.state === state) {
//           data[i][1].push(obj.latitude);
//           data[i][1].push(obj.longitude);
//         }
//       });
//       results.forEach(function(tuple) {
//         if (tuple.State === state && tuple.Category === crimes[i]) {
//           data[i][1].push(tuple.Quantity);
//         }
//       })
//     });
//   }
//   console.log(data);
//   return data;
// }

module.exports = router;
