# TODO

---

## Targeting types
### Circles
  - centered on self circle
    - disable dragging to update location (also editing x/y in details since it should be stuck to token)
  - ~~centered on target~~
    - ~~don't show template unless cursor is over a token~~
    - until I find a spell that actually targets like this, not gonna do it
  - target grid
    - make sure dragging respects template placement rules
  - splash weapon
    - work like the "grid" option, but will also change to the expected template if you hover over a token
  - Add aura ability to prompt buffs/debuffs

### Cones
- disable dragging and/or make sure dragging respects placement rules
- add GM option to allow rotation
- Add some kind of targeting indicator and/or fill highlight when targeting via "select square"

### Rays
- originate from caster
- originate from selection
- system default option

### All
  - show outline
  - show highlight (fill)
  - configure fill alpha
  - configure texture alpha
  - configure texture scale

### Targets (might need a new template type...)
- rangefinding
- when cursor over a token show the target ui
- when cursor over no token show the cancel icon
- automatically add prompts for buffs/debuffs
- formula for number of targets
  - show available / targeted / remaining
  - needs to account for any extra logic like "has to be within x ft of main target"
  - will need to be able to commit while not using all available targets

---

## Settings
- world
  - alternate 15' cone
  - cone rotation
  - allow players to configure "use system"

---

## Unknowns that I don't intend to look into
- Making it work with anything that isn't PF1
- Gridless
- Hex Grids
- Whether or not it runs on Forge (it probably does, I think its limitations are only related to file paths, but I have no way of testing this)
