$(document).ready(init)

function init() {
  $('#submitQuery').click(submitQuery);
  initSelect();
  initRadio();
  $('#resultTable').tablesorter();
  $('table').each(function () {
        var $table = $(this);

        var $button = $("<button type='button' class='click-btn btn btn-primary'>");
        $button.text("Export to CSV");
        $button.insertAfter($table.parent());

        $button.click(function () {
            var csv = $table.table2CSV({
                delivery: 'value'
            });
            window.location.href = 'data:text/csv;charset=UTF-8,' 
            + encodeURIComponent(csv);
        });
    });
}

function initSelect() {
  $('#states').val('all');
  $('#crimes').val('all');
  $('#ethnicities').val('all');
}

function initRadio() {
  $('.pop > :radio[value="none"]').prop('checked', true);
  $('.police > :radio[value="none"]').prop('checked', true);
  $('.totCrime > :radio[value="none"]').prop('checked', true);
  $('#popAmount').prop('disabled', true);
  $('#policeAmount').prop('disabled', true);
  $('#crimeAmount').prop('disabled', true);
  $('.pop > :radio').change(popInput);
  $('.police > :radio').change(policeInput);
  $('.totCrime > :radio').change(crimeInput);
}

function crimeInput() {
  var val = $(this).val();
  if (val === 'none'){
    $('#crimeAmount').val('');
    $('#crimeAmount').prop('disabled', true);
  } else {
    $('#crimeAmount').prop('disabled', false);
  }
}

function policeInput() {
  var val = $(this).val();
  if (val === 'none'){
    $('#policeAmount').val('');
    $('#policeAmount').prop('disabled', true);
  } else {
    $('#policeAmount').prop('disabled', false);
  }
}

function popInput() {
  var val = $(this).val();
  if (val === 'none'){
    $('#popAmount').val('');
    $('#popAmount').prop('disabled', true);
  } else {
    $('#popAmount').prop('disabled', false);
  }
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
  if (selectedStates.length === 0 || selectedCrimes.length === 0 || selectedEthnicities.length === 0) {
    alert('Please make sure to select at least one value in each criteria!');
    return;
  }
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