# TODO

---

## Targeting types
### Circles
  - centered on self circle
    - disable dragging to update location (also editing x/y in details since it should be stuck to token)
    - "attach to token" option (e.g. obscuring mist is centered on you but stays in place, if you cast silence centered on you, then it moves with you) ++
      - register for token's movement and update position ++
      - if token is deleted while attached, then delete template ++
  - ~~centered on target~~
    - ~~don't show template unless cursor is over a token~~
    - until I find a spell that actually targets like this, not gonna do it
  - target grid
    - make sure dragging respects template placement rules
  - Add aura ability to prompt buffs/debuffs

### Cones
- disable dragging and/or make sure dragging respects placement rules
- add GM option to allow rotation
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

---

## Settings
- GM setting to allow alternate 15' cone
  - implement a way for regular and alternate 15' cone to coexist
- GM setting to turn off logging ++
- GM setting for cone rotation
- option to disable outline
- option to disable fill color
- option to target tokens within a template

---

## Lang
- externalize all strings ++

---

## Unknowns that I don't intend to look into
- Gridless
- Hex Grids
- Whether or not it runs on Forge (it probably does, I think it's limitations are only related to file paths, but I have no way of testing this)

++ required for v1
