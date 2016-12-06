var mysql = require('mysql');

/** DON'T TOUCH THESE **/
/*var pool = mysql.createPool({
  host: 'cs336.clmcqand9hbn.us-west-2.rds.amazonaws.com',
  user: 'cmd363',
  password: 'OITStrong',
  port: 3306,
  database: 'crimes',
  connectionLimit: 10
});*/

var pool = mysql.createPool({
  host: 'cs336.cdiold5hpnen.us-east-1.rds.amazonaws.com',
  user: 'root',
  password: 'OITStrong',
  port: 3306,
  database: 'Crimex_DB',
  connectionLimit: 10
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
  var sql = 'SELECT * FROM State_crimes WHERE ' + stateQuery;

  runQuery(sql, callback);
}

exports.getStateCrimeData = function(filters, callback) {
  console.log(filters);
  var stateQuery = buildQueryString(filters.stateFilter, 'OR');
  var crimeQuery = buildQueryString(filters.crimeFilter, 'OR');
  var selectEth = buildEthFilter(filters.ethFilter);
  var resultFilters = filters.resultFilter;
  var extraFilters = buildExtraFilterArray(filters);
  var filterQuery = buildFilterQuery(extraFilters);
  var quantity = 'Quantity';
  if (resultFilters[2] !== '' || resultFilters[3] !== '') {
    quantity += ', ';
  }else {
    quantity += ' ';
  }

  //var selectQuery = 'State,' + selectEth + 'Police.T AS "Police Force", Category, Quantity, Total.T AS "Total Crime Committed", ROUND(Quantity/Total.T*100, 2) AS "% of Total Crime" ';
  var selectQuery = 'State, ' + selectEth + resultFilters[1] + ' Category, ' + quantity + resultFilters[2] + resultFilters[3];
  var totalCrimeQuery = '(SELECT State AS TotState, SUM(Quantity) AS "T" FROM State_crimes GROUP BY State) Total';
  var policeForceQuery = '(SELECT State AS PolState, SUM(Count) AS "T" FROM Employs GROUP BY State) Police';
  var ethnicityQuery = '(SELECT State AS EthState, White, Black, Indian, Asian, Islander FROM State_ethnicities) Ethnicity';
  var sql = 'SELECT ' + selectQuery +
  'FROM State_crimes,' + totalCrimeQuery + ', ' + policeForceQuery + ', ' + ethnicityQuery + ' WHERE TotState=State AND PolState=State AND EthState=State AND' + stateQuery + ' AND ' + crimeQuery;
  // var sql = 'SELECT State, White, Black, Indian, Asian, Islander, Police.T AS "Police Force", Category, Quantity, Total.T AS "Total Crime Committed", ROUND(Quantity/Total.T*100, 2) AS "% of Total Crime" ' +
  // 'FROM State_crimes,' + totalCrimeQuery + ', ' + policeForceQuery + ', ' + ethnicityQuery + ' WHERE TotState=State AND PolState=State AND EthState=State AND' + stateQuery + ' AND ' + crimeQuery;
  if (filterQuery !== '') {
    sql += ' AND ' + filterQuery;
  };

  runQuery(sql, callback);
}

exports.getAllFromTable = function(table, callback) {
  var sql = 'SELECT * FROM ' + table;

  runQuery(sql, callback);
}

/** HELPER FUNCTIONS HERE **/
function buildEthFilter(ethArray) {
  var out = '';
  if (typeof ethArray === 'string') {
    out += ethArray + ', ';
  }else {
    ethArray.forEach(function(ethnicity, index) {
      out += ethnicity + ', ';
    });
  }
  console.log(out);
  return out;
}

function buildFilterQuery(filterArray) {
  var firstFilter = true;
  var filterQuery = '';
  filterArray.forEach(function(filter) {
    if (filter) {
      if (firstFilter) {
        firstFilter = false;
      } else {
        filterQuery += ' AND ';
      }
      filterQuery += '(';
      var operation = filter.option === 'greaterThan' ? '>' : '<';
      filterQuery += buildQuery(filter.attribute, filter.amount, operation, false);
      filterQuery += ')';
      console.log(filter);
    }
  })
  console.log(filterQuery);
  return filterQuery;
}
/**
* Runs the given sql query against the database.
*/
function runQuery(sql, callback) {
  console.log(sql);
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

function buildExtraFilterArray(filters) {
  var extraFilters = [null, null, null];
  if (filters.popFilter) {
    extraFilters[0] = {
      'attribute': 'Population',
      'option': filters.popFilter[0],
      'amount': filters.popFilter[1]
    }
  }
  if (filters.totalCrimeFilter) {
    extraFilters[1] = {
      'attribute': 'Total.T',
      'option': filters.totalCrimeFilter[0],
      'amount': filters.totalCrimeFilter[1]
    }
  }
  if (filters.policeEmploymentFilter) {
    extraFilters[2] = {
      'attribute': 'Police.T',
      'option': filters.policeEmploymentFilter[0],
      'amount': filters.policeEmploymentFilter[1]
    }
  }
  return extraFilters;
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
    query += buildQuery(filter.attribute, filter.values, '=', true);
  } else {
    filter.values.forEach(function(value, index) {
      query += buildQuery(filter.attribute, value, '=', true);
      if (index < filter.values.length - 1) {
        query += ' ' + operation + ' ';
      }
    });
  }
  query += ')';
  //console.log(query);
  return query;
}

/**
* A helper function to build query strings.
*/
function buildQuery(attribute, value, operator, isString) {
  if (isString) {
    value = '"' + value + '"';
  }
  return attribute + ' ' + operator + ' ' + value;
}