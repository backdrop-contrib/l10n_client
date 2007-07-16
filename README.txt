$Id$

Localization client
--------------------------------------------------------------------------------

The 6.x (HEAD) branch of the localization client is completely different from 
the 5.x branch, as we are trying to find the right combination of local and 
remote functionality.

This branch introduces on-page localization editing which will possibly be
able to syndicate the provided local translations with the central localization
server (see the l10n_server project). Communication in the other direction
(sharing translations from the server to the client) might come back in a later
iteration.

This 6.x functionality depends on features only available in Drupal 6.x, so
it is not possible to backport to Drupal 5.x without modifying Drupal itself
(ie. core patching).
