## Advanced Templates PF1 Changelog

### Version 1.2.1

#### Bugfixes

- The new UI didn't like configuring Items that hadn't been configured before. That's now fixed.

### Version 1.2.0

#### Features

- Complete rewrite of configuration windows
- Added Alpha for template fill color (can also be set to 0 to completely hide the fill color)
- Added Alpha for template texture
- Added Scale setting for template texture
- Added option to hide the template outline
- Added logic to correctly fill cone and circle templates with the texture instead of the weird tiling thing PF1 does by default (including the correct angle for cones)
- Added a GM setting to allow for alternate 15' cones that originate from a grid intersection (see readme for more details)
- Added a GM setting to allow for rotating cones instead of just firing "away from caster" per rules-as-written

### Version 1.1.0

#### Features
- Added "Splash Weapon" circle template type
- Added "Ignore Range Restriction" circle option

#### Bug fixes
- Fixed round ending and turn ending (i.e. the last player in the round) both trying to delete the same template and showing a UI error
- Fixed a hard coded string and put it in the language file

#### Misc
- Added svelte library for future UI improvements - no current functional changes

### Version 1.0.0
Initial release
