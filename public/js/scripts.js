$(document).ready(function () {
    let selectedSymptoms = [];
  
    // Handle symptom input field
    $('#symptoms').on('input', function () {
      const query = $(this).val();
      if (query.length >= 2) {
        $.get(`/get-symptoms?q=${query}`, function (suggestions) {
          $('#suggestions').empty();
          suggestions.forEach(function (suggestion) {
            $('#suggestions').append(`<li>${suggestion}</li>`);
          });
        });
      } else {
        $('#suggestions').empty();
      }
    });
  
    // Add symptom to selected list
    $('#suggestions').on('click', 'li', function () {
      const symptom = $(this).text();
      if (!selectedSymptoms.includes(symptom)) {
        selectedSymptoms.push(symptom);
        $('#selectedSymptoms').append(`
          <div class="selected-symptom">
            <span>${symptom}</span>
            <button class="remove-btn" data-symptom="${symptom}">X</button>
          </div>
        `);
      }
      $('#suggestions').empty();
      $('#symptoms').val('');
    });
  
    // Remove selected symptom
    $('#selectedSymptoms').on('click', '.remove-btn', function () {
      const symptomToRemove = $(this).data('symptom');
      selectedSymptoms = selectedSymptoms.filter(symptom => symptom !== symptomToRemove);
      $(this).parent().remove();
    });
  
    // Handle form submission
    $('#symptomForm').submit(function (e) {
      e.preventDefault();
      const symptoms = selectedSymptoms;
      $.post('/submit-symptoms', { symptoms }, function (data) {
        window.location.href = '/result';
      });
    });
  });
  