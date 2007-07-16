// $Id$

/**
 * Attaches the localization editor behaviour to all required fields.
 */
Drupal.behaviors.l10nEditor = function (context) {
  // If the selection changes, copy string values to the source and target fields.
  $('#l10n-client-form #edit-strings').change(function() {
    var index = $(this)[0].selectedIndex;
    $('#l10n-client-form #edit-source').val(Drupal.l10nStrings[index][0]);
    $('#l10n-client-form #edit-target').val(Drupal.l10nStrings[index][1] == true ? '' : Drupal.l10nStrings[index][1]);
  });
  
  // Mark all strings depending on whether they are translated or not.
  for (var i in Drupal.l10nStrings) {
    $($('#l10n-client-form #edit-strings option')[i]).addClass(Drupal.l10nStrings[i][1] == true ? 'untranslated' : 'translated');
  }
  
  // Send AJAX POST data on form submit.
  $('#l10n-client-form').submit(function() {
    $.ajax({
      type: "POST",
      url: $('#l10n-client-form').attr('action'),
      // Send source and target strings.
      data: 'source=' + Drupal.encodeURIComponent($('#l10n-client-form #edit-source').val()) +
            '&target=' + Drupal.encodeURIComponent($('#l10n-client-form #edit-target').val()),
      success: function (data) {
        // Empty input fields.
        $('#l10n-client-form #edit-source').val('');
        $('#l10n-client-form #edit-target').val('');
        // Mark sting as translated.
        $($('#l10n-client-form #edit-strings option')[$('#l10n-client-form #edit-strings')[0].selectedIndex]).removeClass('untranslated').addClass('translated');
      },
      error: function (xmlhttp) {
        alert(Drupal.t('An HTTP error @status occured.', { '@status': xmlhttp.status }));
      }
    });
    return false;
  });
};
