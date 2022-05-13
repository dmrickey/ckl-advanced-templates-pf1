# TODO

---

## Targeting types
### Circles
  - centered on self circle
    - disable dragging to update location (also editing x/y in details since it should be stuck to token)
  - centered on target (e.g. Silence, Meteor Swarm)
    - don't show template unless cursor is over a token
  - target grid
    - make sure dragging respects template placement rules
  - Add aura ability to prompt buffs/debuffs
  - Rangefinding
    - Show error when attempting to cast a spell out of range (i.e. give feedback instead of silently failing)
  - Interval logic needs to be at the root level of the class so when I overwrite the update/drag implementation it has the same snap logic (i.e. grid intersection or not)

### Cones
- disable dragging and/or make sure dragging respects placement rules
- Add some kind of targeting indicator and/or fill highlight when targeting via "select square"
- Add an "offset degrees" label for when the GM has that option turned on so the user knows what offset from 0 they've onto their cone as an extra rotation (hide label if 0)

### Rays
- originate from caster
- originate from selection
- system default option

### All
- Outline
  - Add color option
  - Add alpha option
  - Add thickness option
  - Add option to hide ruler text (`_refreshRulerText()`)
  - Also alter destination points?
- Add option for targeting multiple areas (Meteor Swarm)
- Update already-placed templates when updating a config (add flag on teh template for this item's ID then update those when this is updated)

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
- template
  - allow setting fill / outline / alpha /etc values on placed templates
- world
  - allow players to configure "use system"
  - Build a custom form for updating cone rotation to only allow valid angles
  - global default fill opactiy that will be used when an override isn't set

---

## Required for v.next
- Unwrap PF1's measured templates
  - instead extend foundry's measuredtemplates -- this will let me define templates in individual files instead of having to do them all within a single `initMeasuredTemplate` method in a single file.
  - overwrite just PF1's implementation in pf1.onReady
- Update/Delete token hooks need to use a local copy of "is first GM" instead of referencing PF1's
- Canvas ready hook probably needs to be added at root of file instead of in `pf1.postInit` hook
- Look through the rest of the logic to find any specific PF1 code
  - Make sure the current item dialog hook stuff is only initialized for PF1

---

## Unknowns that I don't intend to look into
- Making it work with anything that isn't PF1
- Gridless
- Hex Grids
- Whether or not it runs on Forge (it probably does, I think its limitations are only related to file paths, but I have no way of testing this)
