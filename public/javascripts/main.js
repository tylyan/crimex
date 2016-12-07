$(document).ready(init)

function init() {
  //initSelect();
  initRadio();
  $('#submitQuery').click(submitQuery);
  $('#visualButton').click(visualizeData);
  $('#resultTable').tablesorter();
  $('#resultTable').each(function () {
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
  createJsonButton();
}

function createJsonButton() {

  var $button = $("<button type='button' class='click-btn btn btn-primary'>");
  $button.text("Export to JSON");
  $button.insertAfter($('#resultTable').parent());

  $button.click(function () {
      var json = $('#resultTable').tableToJSON();
      var out = JSON.stringify(json);
      var dataStr = 'data:text/json;charset=UTF-8,' + encodeURIComponent(out);
      $('#downloadJSON').attr('href', dataStr);
      $('#downloadJSON').attr('download', 'download.json');
      $('#downloadJSON')[0].click();
     /* window.location.href = 'data:text/json;charset=UTF-8,' 
      + encodeURIComponent(out);*/
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
  $('#popAmount').prop('disabled', true).val('');
  $('#policeAmount').prop('disabled', true).val('');
  $('#crimeAmount').prop('disabled', true).val('');
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

var visualizeData = function() {
  var globeData = $('#globeData').val();
  console.log(globeData);
}

var submitQuery = function(){
  if ($('#states').val().length === 0) {
    alert('Please select at least one state.');
    return;
  }
  if ($('#crimes').val().length === 0) {
    alert('Please select at least one crime.');
    return;
  }
  if ($('#ethnicities').val().length === 0) {
    alert('Please select at least one ethnicity.');
    return;
  }
  var body = {};
  // get selects
  body.states = getSelectedStates();
  body.crimes = getSelectedCrimes();
  body.ethnicities = getSelectedEthnicities();

  // get filters
  var popOption = $('input[name="populationOption"]:checked').val()
  var crimeOption = $('input[name="totalCrimeOption"]:checked').val();
  var policeOption = $('input[name="policeEmploymentOption"]:checked').val()
  var value;
  if (popOption !== 'none') {
    body.popFilter = {};
    body.popFilter.option = popOption;
    var popAmount = $('#popAmount').val();
    value = Number(popAmount);
    if (Math.floor(value) !== value || popAmount === ''){
      alert('Please enter an integer into population filter.');
      return;
    }else {
      body.popFilter.amount = popAmount;
    }
  }
  if (crimeOption !== 'none') {
    body.totalCrimeFilter = {};
    body.totalCrimeFilter.option = crimeOption;
    var totalCrimeAmount = $('#crimeAmount').val();
    value = Number(totalCrimeAmount)
    if (Math.floor(value) !== value || totalCrimeAmount === ''){
      alert('Please enter an integer into total crime filter.');
      return;
    }else {
      body.totalCrimeFilter.amount = totalCrimeAmount
    }
  }
  if (policeOption !== 'none') {
    body.policeEmploymentFilter = {};
    body.policeEmploymentFilter.option = policeOption;
    var policeAmount = $('#policeAmount').val();
    value = Number(policeAmount);
    if (Math.floor(value) !== value || policeAmount === ''){
      alert('Please enter an integer into police employment filter.');
      return;
    }else {
      body.policeEmploymentFilter.amount = policeAmount;
    }
  }

  // get result filters
  body.resultFilters = buildResultFilters();
  post('result', body);
}

function buildResultFilters() {
  var resultFilters = [];
  resultFilters[0] = $('#populationCheck').is(':checked') ? 'Population,' : '';
  resultFilters[1] = $('#policeCheck').is(':checked') ? 'Police.T AS "Police Force",' : '';
  resultFilters[2] = $('#totalCrimeCheck').is(':checked') ? 'Total.T AS "Total Crime Committed"' : '';
  resultFilters[3] = $('#percentCrimeCheck').is(':checked') ? 'ROUND(Quantity/Total.T*100, 2) AS "% of Total Crime" ' : '';
  if (resultFilters[3] !== '' && resultFilters[2] !== '') {
    resultFilters[2] += ',';
  }
  return resultFilters;
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