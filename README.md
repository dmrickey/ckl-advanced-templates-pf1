# ckl-advanced-templates-pf1

Advanced template placement options for PF1. Go into any Item where you've got a Cone/Cicrle template configured for when it's used, hit the new "Choose Options" button to open a dialog and configure the new options. This new button is located underneath the drop down for choosing a template type in the Item's details. By default, with no configuration, circles will default to "grid targeting" and cones will default to "self".

If you need to place the template in such a way that the new options don't account for, you can still configure the template to be placed via "Use System Default" to use PF1's built in template placement without any of my modifications Picking this option will ignore any other options (e.g. if you check "delete template at end of turn" but are using the default placement rules, then the template will not be deleted at the end of the turn).

Spread types include burst, emanation, and spread. These are only configurable for circles. They currently only have any effect when the circle is "centered on you" as this combination actually effects the size of the template. E.g. Bursts/emanationas aren't blocked by cover (i.e. walls) and spread is also not blocked by cover while continuing around corners. These are currently configurable in case this functionality is added in a future version.

## Installation

manifest link: https://github.com/dmrickey/ckl-advanced-templates-pf1/releases/latest/download/module.json
