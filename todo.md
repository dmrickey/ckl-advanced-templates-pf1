# TODO

## Circles
  - cones
    - disable dragging and/or make sure dragging respects placement rules
  - centered on self circle
    - disable dragging and/or make sure dragging respects placement rules
    - register for token's movement and update position
    - if "centered on self" selected, pop up modal saying you'll have to update the placment from the Item's details page with confirm/cancel
  - ~~centered on target~~
    - ~~don't show template unless cursor is over a token~~
    - until I find a spell that actually targets like this, not gonna do it

## Rays
- originate from caster
- originate from selection
- system default option

## General
- duration that ties into time passing like buffs do
- show rangefinding on "close" spells

## Settings
- allow for option to make right click always cancel and only configure manually
- GM setting to disallow alternate 15' cone
- GM setting to turn off logging
- GM setting to allow Mark Seifter's alternate not-a-rule centered on you actually means sentered on a corner near you for medium or smaller creatures
- add a config option to add an option to attach a circle to the target

## Ability Template refactoring
- Move template data creation into AbilityTemplate's `fromData` method and rename it to `fromItem` (also pass itemm into it).
  - return early if correct data isn't in the template

## Unknowns that I don't intend to look into
- Gridless
- Hex Grids
- Whether or not it runs on Forge
