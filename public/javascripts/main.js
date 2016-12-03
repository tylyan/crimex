$(document).ready(init)

function init() {
  $('#submitQuery').click(submitQuery);
  $('#states').val('all');
  $('#crimes').val('all');
  $('#ethnicities').val('all');
  $('#resultTable').tablesorter();
}

function post(path, parameters) {
  var form = $('<form></form>');

    form.attr("method", "post");
    form.attr("action", path);

    $.each(parameters, function(key, value) {
      if ( typeof value == 'object' || typeof value == 'array' ){
          $.each(value, function(subkey, subvalue) {
              var field = $('<input />');
              field.attr("type", "hidden");
              field.attr("name", key+'[]');
              field.attr("value", subvalue);
              form.append(field);
          });
      } else {
          var field = $('<input />');
          field.attr("type", "hidden");
          field.attr("name", key);
          field.attr("value", value);
          form.append(field);
      }
  });
  $(document.body).append(form);
  form.submit();
}

var submitQuery = function(){
  var body = {};
  console.log('Submitting query...');
  var selectedStates = getSelectedStates();
  var selectedCrimes = getSelectedCrimes();
  var selectedEthnicities = getSelectedEthnicities();
  body.states = selectedStates;
  body.crimes = selectedCrimes;
  body.ethnicities = selectedEthnicities;
  post('result', body);
}

function getSelectedStates() {
  var states = $('#states').val();
  var selectedStates = [];
  if (states.indexOf('all') !== -1) {
    $('#states > option').each(function(){
      if ($(this).val() !== 'all') {
        selectedStates.push($(this).val());
      }
    });
  } else {
    selectedStates = states;
  }
  return selectedStates;
}

function getSelectedCrimes() {
  var crimes = $('#crimes').val();
  var selectedCrimes = [];
  if (crimes.indexOf('all') !== -1) {
    $('#crimes > option').each(function(){
      if ($(this).val() !== 'all') {
        selectedCrimes.push($(this).val());
      }
    });
  } else {
    selectedCrimes = crimes;
  }
  return selectedCrimes;
}

function getSelectedEthnicities() {
  var ethnicities = $('#ethnicities').val();
  var selectedEthnicities = [];
  if (ethnicities.indexOf('all') !== -1) {
    $('#ethnicities > option').each(function(){
      if ($(this).val() !== 'all') {
        selectedEthnicities.push($(this).val());
      }
    });
  } else {
    selectedEthnicities = ethnicities;
  }
  return selectedEthnicities;
}