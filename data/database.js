var mysql = require('mysql');

/** DON'T TOUCH THESE **/

var connection = mysql.createConnection({
  host: process.env.DB_HOSTNAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: 'crimes'
});

var pool = mysql.createPool({
  host: process.env.DB_HOSTNAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  connectionLimit: 10,
  database: 'crimes'
});

/** TEST FUNCTION TO MAKE SURE DATABASE IS WORKING **/

exports.test = function(callback) {
  var status = {};
  pool.getConnection(function(err, connection) {
    if (err) {
      console.log("test fail");
      console.error('error connecting: ' + err.stack);
      status.message = "db connection failed :(";
      callback(status);
      return;
    }
    status.message = "db connection successful";
    callback(status);
  });
}

/** INDIVIDUAL QUERY FUNCTIONS START HERE **/
/** STATE_CRIMES TABLE **/
exports.getStateData = function(states, callback) {
  var stateQuery = buildQueryString(states, 'OR');
  console.log(stateQuery);
  var sql = 'SELECT * FROM state_crimes WHERE ' + stateQuery;

  runQuery(sql, callback);
}

exports.getStateCrimeData = function(states, crimes, callback) {
  var stateQuery = buildQueryString(states, 'OR');
  var crimeQuery = buildQueryString(crimes, 'OR');
  
  var sql = 'SELECT * FROM state_crimes WHERE ' + stateQuery + ' AND ' + crimeQuery;
  console.log(sql);
  runQuery(sql, callback);
}

exports.getAllFromTable = function(table, callback) {
  var sql = 'SELECT * FROM ' + table;

  runQuery(sql, callback);
}

/** HELPER FUNCTIONS HERE **/

/**
* Runs the given sql query against the database.
*/
function runQuery(sql, callback) {
  pool.getConnection(function(err, connection) {
    if (err) {
      console.log(err);
      callback(true);
      return;
    }
    connection.query(sql, function(err, results) {
      connection.release();
      if (err) {
        console.log(err);
        callback(true);
        return;
      }
      callback(false, results);
    })
  });  
}

/**
* Builds a full query string given a filter and operation.
* A 'filter' is defined as an object:
*   {
*     'attribute': Name of attribute to query,
*     'values': Either single value or array of target values to query
*   }
*
* For example, to build a query string filtering states, the filter would be:
*   {
*     'attribute': 'States',
*     'values': ['New Jersey', 'New York']
*   }
*
* Operation is specified as 'OR' or 'AND'.  For example, 'OR' with the above filter would result in the query:
*   (State = "New Jersey" OR State = "New York")
*/
function buildQueryString(filter, operation){
  var query = '(';
  if (typeof filter.values === 'string') {
    query += buildQuery(filter.attribute, filter.values);
  } else {
    filter.values.forEach(function(value, index) {
      query += buildQuery(filter.attribute, value);
      if (index < filter.values.length - 1) {
        query += ' ' + operation + ' ';
      }
    });
  }
  query += ')';
  console.log(query);
  return query;
}

/**
* A helper function to build query strings.
*/
function buildQuery(attribute, value) {
  return attribute + ' = "' + value + '"';
}