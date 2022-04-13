# TODO

---

## Targeting types
### Circles
  - centered on self circle
    - disable dragging to update location (also editing x/y in details since it should be stuck to token)
  - centered on target (e.g. Silence)
    - don't show template unless cursor is over a token
  - target grid
    - make sure dragging respects template placement rules
  - Add aura ability to prompt buffs/debuffs

### Cones
- disable dragging and/or make sure dragging respects placement rules
- Add some kind of targeting indicator and/or fill highlight when targeting via "select square"

### Rays
- originate from caster
- originate from selection
- system default option

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
  - allow players to configure "use system"
  - Build a custom form for updating cone rotation to only allow valid angles

---

## Unknowns that I don't intend to look into
- Making it work with anything that isn't PF1
- Gridless
- Hex Grids
- Whether or not it runs on Forge (it probably does, I think its limitations are only related to file paths, but I have no way of testing this)
