(function ($, Backdrop, undefined) {

// Store all l10n_client related data + methods in its own object
  Backdrop.l10nClient = {
    init: function() {
      // Add event listener to storage events in other tabs on the same domain.
      window.addEventListener('storage', function (event) {
        if (event.key === 'Backdrop.l10n_client.expanded') {
          if (event.newValue === '1') {
            Backdrop.l10nClient.toggle(1);
          }
          else {
            Backdrop.l10nClient.toggle(0);
          }
        }
      });
    },

    // Set "selected" string to unselected, i.e. -1
    selected: -1,

    // Keybindings
    keys: {'toggle': 'ctrl+shift+s', 'clear': 'esc'}, // Keybindings

    // Keybinding functions
    key: function (pressed) {
      var $l10nClient = Backdrop.l10nClient.$l10nClient;
      switch (pressed) {
        case 'toggle':
          // Grab user-hilighted text & send it into the search filter
          var userSelection = window.getSelection ? window.getSelection() : document.getSelection ? document.getSelection() : document.selection.createRange().text;
          userSelection = String(userSelection);
          if (userSelection.length > 0) {
            this.filter(userSelection);
            this.toggle(1);
            $l10nClient.find('.string-search').val(userSelection).focus();
          } else {
            if ($l10nClient.is('.l10n-client-minimized')) {
              this.toggle(1);
              $l10nClient.find('.string-search').focus();
            }
            else {
              this.toggle(0);
            }
          }
          break;
        case 'clear':
          this.filter(false);
          break;
      }
    },

    // Toggle the l10nclient
    toggle: function (state) {
      var $l10nClient = Backdrop.l10nClient.$l10nClient;
      var $clientWrapper = $('#l10n-client-string-select, #l10n-client-string-editor, #l10n-client .labels .label');
      if (!!state == true) {
        $clientWrapper.show();
        $l10nClient.removeClass('l10n-client-minimized').addClass('l10n-client-maximized').find('.labels .toggle').text('x');
        $('body').addClass('toggle-expanded');
        localStorage.setItem('Backdrop.l10n_client.expanded', '1');
      } else {
        $clientWrapper.hide();
        $l10nClient.removeClass('l10n-client-maximized').addClass('l10n-client-minimized').find('.labels .toggle').text(Backdrop.t('Translate Text'));
        $('body').removeClass('toggle-expanded');
        localStorage.removeItem('Backdrop.l10n_client.expanded');
      }
    },

    // Get a string from the DOM tree
    getString: function (index, type) {
      return $('#l10n-client-data').find('div:eq(' + index + ') .' + type).text();
    },

    // Set a string in the DOM tree
    setString: function (index, data) {
      $('#l10n-client-data').find('div:eq(' + index + ') .target').text(data);
    },

    // Filter the the string list by a search string
    filter: function (search) {
      var $l10nClient = Backdrop.l10nClient.$l10nClient;
      var $stringSearch = $l10nClient.find('.string-search');
      var $stringSelect = $('#l10n-client-string-select').find('li');
      if (search === false || search === '') {
        $('#l10n-client-search-filter-clear').focus();
        $stringSelect.show();
        $stringSearch.val('').focus();
      } else if (search.length > 0) {
        $stringSelect.show().not(':contains(' + search + ')').hide();
      }
    }
  };

  // Initialize the client event listener for storage events.
  Backdrop.l10nClient.init();

  // Attaches the localization editor behavior to all required fields.
  Backdrop.behaviors.l10nClient = {
    attach: function (context) {
      $('#l10n-client').once('l10n-client', function () {
        $('body').addClass('l10n-client');
        var $l10nClient = $(this);
        var $l10nClientForm = $('#l10n-client-form');
        var $stringEditor = $('#l10n-client-string-editor');
        var $stringEditorSoruceText = $stringEditor.find('.source-text');
        var $stringSelect = $('#l10n-client-string-select');
        Backdrop.l10nClient.$l10nClient = $l10nClient;
        var storageExpanded = 0;
        if (localStorage.getItem('Backdrop.l10n_client.expanded') !== null) {
          storageExpanded = 1;
        }
        Backdrop.l10nClient.toggle(storageExpanded);

        // If the selection changes, copy string values to the source and target fields.
        // Add class to indicate selected string in list widget.
        $stringSelect.find('li').on('click', function () {
          var $this = $(this);
          var $lis = $stringSelect.find('li');
          var index = $lis.index(this);

          $lis.removeClass('active');
          $this.addClass('active');

          $stringEditorSoruceText.text(Backdrop.l10nClient.getString(index, 'source'));
          $l10nClientForm.find('.translation-target').val(Backdrop.l10nClient.getString(index, 'target'));
          $l10nClientForm.find('.source-textgroup').val(Backdrop.l10nClient.getString(index, 'textgroup'));
          $l10nClientForm.find('.source-context').val(Backdrop.l10nClient.getString(index, 'context'));
          $stringEditor.find('.context').text(Backdrop.l10nClient.getString(index, 'context'));

          Backdrop.l10nClient.selected = index;
          $l10nClientForm.find('.form-submit').removeAttr("disabled");
        });

        // When l10n_client window is clicked, toggle based on current state.
        $l10nClient.find('.labels .toggle').on('click', function () {
          Backdrop.l10nClient.toggle($l10nClient.is('.l10n-client-minimized'));
        });

        // Copy source text to translation field on button click.
        $l10nClientForm.find('.edit-copy').on('click', function () {
          $l10nClientForm.find('.translation-target').val($stringEditorSoruceText.text());
          return false;
        });

        // Clear translation field on button click.
        $l10nClientForm.find('.edit-clear').on('click', function () {
          $l10nClientForm.find('.translation-target').val('');
          return false;
        });

        // Register keybindings using jQuery hotkeys
        if ($.hotkeys) {
          $.hotkeys.add(Backdrop.l10nClient.keys.toggle, function () {
            Backdrop.l10nClient.key('toggle');
          });
          $.hotkeys.add(Backdrop.l10nClient.keys.clear, {target: '#l10n-client .string-search', type: 'keyup'}, function () {
            Backdrop.l10nClient.key('clear');
          });
        }

        // Custom listener for l10n_client livesearch
        $l10nClient.find('.string-search').on('keyup', function () {
          Backdrop.l10nClient.filter($l10nClient.find('.string-search').val());
        });

        // Clear search
        $l10nClient.find('#l10n-client-search-filter-clear').on('click', function () {
          Backdrop.l10nClient.filter(false);
          return false;
        });

        // Send AJAX POST data on form submit.
        $l10nClientForm.on('submit', function () {
          var $this = $(this);

          // Prevent submit empty strings.
          $this.find('.form-submit').attr("disabled", true);
          $this.find('.edit-save').after('<div class="ajax-progress ajax-progress-throbber">' +
            '<div class="throbber">&nbsp;</div><div class="message">' +
            Backdrop.t('Please wait...') + '</div></div>');

          $.ajax({
            type: "POST",
            url: $this.attr('action'),
            // Send source and target strings.
            data: {
              source: $stringEditorSoruceText.text(),
              target: $this.find('.translation-target').val(),
              textgroup: $this.find('.source-textgroup').val(),
              context: $stringEditor.find('.context').text(),
              'form_token': $this.find('input[name=form_token]').val()
            },
            success: function (data) {
              var $translationTarget = $l10nClientForm.find('.translation-target');
              var newTranslation = $translationTarget.val();
              // Store string in local js
              Backdrop.l10nClient.setString(Backdrop.l10nClient.selected, newTranslation);

              // Figure out the display of the new translation in the selection list.
              var newTranslationStripped = newTranslation.replace(/<\/?[^<>]+>/gi, '')
                .replace(/&quot;/g, '"')
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&");

              // Only contains HTML tags (edge case). Keep the whole string.
              // HTML tags will show up in the selector, but that is normal in this case.
              var newTranslationDisplay = newTranslation;
              if (newTranslationStripped.length > 81) {
                // Long translation, strip length to display only first part.
                // We strip at 78 chars and add three dots, if the total length is
                // above 81.
                newTranslationDisplay = newTranslationStripped.substr(0, 78) + '...';
              }

              // Mark string as translated.
              $stringSelect.find('li')
                .eq(Backdrop.l10nClient.selected)
                .removeClass('untranslated active')
                .addClass('translated')
                .text(newTranslationDisplay);

              // Empty input fields.
              $stringEditorSoruceText.html(data);
              $translationTarget.val('');
              $this.find('div.ajax-progress-throbber').remove();
            },
            error: function (xmlhttp) {
              alert(Backdrop.t('An HTTP error @status occured.', { '@status': xmlhttp.status }));
            }
          });
          return false;
        });
      });
    }
  };
})(jQuery, Backdrop);
