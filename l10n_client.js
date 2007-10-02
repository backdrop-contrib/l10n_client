// $Id$

// Set "selected" string to unselected, i.e. -1
jQuery.extend(Drupal, { l10nSelected: -1 });

// Define method for toggling l10n_client window and saving its state
// in a cookie.
jQuery.extend(Drupal, { l10nClientToggle:
  function(state) {
    switch(state) {
      case 1:
        $('#l10n-client-string-select, #l10n-client-string-editor, #l10n-client .labels .label').show();
        $('#l10n-client').height('22em').removeClass('hidden');
        $('#l10n-client .labels .toggle').text('X');
        if(!$.browser.msie) {
          $('body').css('border-bottom', '22em solid #fff');
        }
        $.cookie('Drupal_l10n_client', '1', {expires: 7, path: '/'});
      break;
      case 0:
        $('#l10n-client-string-select, #l10n-client-string-editor, #l10n-client .labels .label').hide();
        $('#l10n-client').height('2em').addClass('hidden');
        $('#l10n-client .labels .toggle').text('Translate Text');
        if(!$.browser.msie) {
          $('body').css('border-bottom', '0px');
        }
        $.cookie('Drupal_l10n_client', '0', {expires: 7, path: '/'});
      break;        
    }
  }
});

/**
 * Attaches the localization editor behaviour to all required fields.
 */
Drupal.behaviors.l10nEditor = function (context) {

  switch($.cookie('Drupal_l10n_client')) {
    case '1':
      Drupal.l10nClientToggle(1);
    break;
    default:
      Drupal.l10nClientToggle(0);
    break;
  }
  
  // If the selection changes, copy string values to the source and target fields.
  // Add class to indicate selected string in list widget.
  $('#l10n-client-string-select li').click(function() {
    $('#l10n-client-string-select li').removeClass('active');
    $(this).addClass('active');
    var index = $('#l10n-client-string-select li').index(this);
    $('#l10n-client-string-editor .source-text').text(Drupal.l10nStrings[index][0]);
    $('#l10n-client-form #edit-target').val(Drupal.l10nStrings[index][1] == true ? '' : Drupal.l10nStrings[index][1]);
    Drupal.l10nSelected = index;
  });

  // When l10n_client window is clicked, toggle based on current state.
  $('#l10n-client .labels .toggle').click(function() {
    if($('#l10n-client').is('.hidden')) {
      Drupal.l10nClientToggle(1);
    } else { 
      Drupal.l10nClientToggle(0);
    }
  });

  // Mark all strings depending on whether they are translated or not.
  for (var i in Drupal.l10nStrings) {
    $($('#l10n-client-string-select li')[i]).addClass(Drupal.l10nStrings[i][1] == true ? 'untranslated' : 'translated');
  }

  // Copy source text to translation field on button click.
  $('#l10n-client-form #edit-copy').click(function() {
    $('#l10n-client-form #edit-target').val($('#l10n-client-string-editor .source-text').text());
  });

  // Clear translation field on button click.
  $('#l10n-client-form #edit-clear').click(function() {
    $('#l10n-client-form #edit-target').val('');
  });
  
  // Send AJAX POST data on form submit.
  $('#l10n-client-form').submit(function() {
    $.ajax({
      type: "POST",
      url: $('#l10n-client-form').attr('action'),
      // Send source and target strings.
      data: 'source=' + Drupal.encodeURIComponent($('#l10n-client-string-editor .source-text').text()) +
            '&target=' + Drupal.encodeURIComponent($('#l10n-client-form #edit-target').val()),
      success: function (data) {
        // Store string in local js
        Drupal.l10nStrings[Drupal.l10nSelected][1] = $('#l10n-client-form #edit-target').val();

        // Empty input fields.
        $('#l10n-client-string-editor .source-text').html('');
        $('#l10n-client-form #edit-target').val('');

        // Mark string as translated.
        $('#l10n-client-string-select li').eq(Drupal.l10nSelected).removeClass('untranslated').removeClass('active').addClass('translated');        
        
      },
      error: function (xmlhttp) {
        alert(Drupal.t('An HTTP error @status occured.', { '@status': xmlhttp.status }));
      }
    });
    return false;
  });

};
