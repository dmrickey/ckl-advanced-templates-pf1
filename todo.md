# TODO

## Circles
  - cones
    - disable dragging and/or make sure dragging respects placement rules
  - centered on self circle
    - disable dragging and/or make sure dragging respects placement rules
    - register for token's movement and update position
  - ~~centered on target~~
    - ~~don't show template unless cursor is over a token~~
    - until I find a spell that actually targets like this, not gonna do it

## Rays
- originate from caster
- originate from selection
- system default option

## Targets (might need a new template type...)
- rangefinding
- when cursor over a token show the target ui
- when cursor over no token show the cancel icon

## General
- duration that ties into time passing like buffs do
- duration tracker currently on lasts until end of turnround and doesn't persist between sessions (meaning if something is supposed to be deleted at the end of this turn but the game is reloaded before the turn ends then it won't be deleted)
  - add a checkbox to delete templates after spell is cast

## Settings
- GM setting to allow alternate 15' cone
  - implement a way for regular and alternate 15' cone to coexist
- GM setting to turn off logging

## Lang
- externalize all strings

## Unknowns that I don't intend to look into
- Gridless
- Hex Grids
- Whether or not it runs on Forge
