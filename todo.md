# TODO
## v.9
- Disable canvas left click so it doesn't try to create a template

---

## Targeting types
### Circles
- centered on self circle
  - disable dragging to update location (also editing x/y in details since it should be stuck to token)
  - add a preview with a modal to commit or cancel - keep the preview attached to the token so the caster can move until deciding to commit it
- centered on target (e.g. Silence, Meteor Swarm)
  - don't show template unless cursor is over a token
- target grid
  - make sure dragging respects template placement rules
- Interval logic needs to be at the root level of the class so when I overwrite the update/drag implementation it has the same snap logic (i.e. grid intersection or not)
- Range Increments
  - Automatically reduce attack bonus based on range increment penalties
    - include option for Far Shot (reduce penalty by half)
    - include static decreases (multiple shots reduce by two)
      - Arc Slinger
      - Distance Thrower
- Splash
  - Add "miss" button that will automatically move the template and update the chat targets

### Configurable Token Auras
- Add aura ability to prompt buffs/debuffs
- it's basically just a circle.
- Create a config in a feature for "is aura"
  - I've already got attachable circles so this is essentially just checking if an active item is an aura and creating the template for it. Hopefuly re-use the existing svelte templates I've got set up
- Option for "always on" or "buff for tracking control aura on user"
- buff to trigger for allies in the aura
  - lingers?
    - if lingers, a different buff and for how long?
- (de)buff for enemies inside the aura
  - Checkbox for using save configured in action vs. being automatic
  - lingers?
    - if lingers, a different buff and for how long?
- checkbox for "only show in combat"
  - make sure if this is disabled, it shows automatically
- When granting buff to others, need to make sure that any actor roll variables are resolved and swapped out when given to the target

### Cones
- disable dragging and/or make sure dragging respects placement rules
- Add some kind of targeting indicator and/or fill highlight when targeting via "select square"
- Allow Rotation
  - Add a "directions pop-up in the lower right"
  - Add an "offset degrees" label for when the GM has that option turned on so the user knows what offset from 0 they've onto their cone as an extra rotation (hide label if 0)
- "place from target location" - after placing, and selecting the rotation, right click should go back to choosing a location, a second right click should cancel the template
- Restarting "choose start location cone" on gridless map doesn't remove template preview until new start is chosen

### All
- Targeting
  - Update "out of range" to show a large icon instead of updating warpgate's template's control icon
  - Add Attack note for `Cover`
  - Choose who to target
    - Only Allies
    - Only Hostiles
    - Everyone
  - Viable target?
    - Add an option to only place centered on a target (kinda like splash weapons but no alternate option)
- Outline
  - Add color option
  - Add alpha option
  - Add thickness option
  - Add option to hide ruler text (`_refreshRulerText()`)
  - Also alter destination points?
  - Add global default in case someone never wants an outline visible
- Effect Type
  - Try to read the html description to default to whatever area is defined for burst/spread/emanation
- Delete Template at End of Turn
  - Read the action's duration and if it is `"instantaneous"` then enable by default
- Add option for targeting multiple areas (Meteor Swarm)
- Update already-placed templates when updating a config (add flag on the template for this item's ID then update those when this is updated)

### Targets (might need a new template type...)
- rangefinding
- when cursor over a token show the target ui
- when cursor over no token show the cancel icon
- automatically add prompts for buffs/debuffs
- formula for number of targets
  - show available / targeted / remaining
  - needs to account for any extra logic like "has to be within x ft of main target"
  - will need to be able to commit while not using all available targets
- Add targeting options hostile/all/allies
- Limited number of targets within an area
  - User selection
  - hit die
    - lowest or highest

---

## Settings
- template
  - allow setting fill / outline / alpha /etc values on placed templates
- world
  - allow players to configure "use system"
  - Build a custom form for updating cone rotation to only allow valid angles
  - global default fill opactiy that will be used when an override isn't set

---

## Required for generic version of mod (i.e. for support for systems besides PF1)
- Unwrap PF1's measured templates
  - instead extend foundry's measuredtemplates -- this will let me define templates in individual files instead of having to do them all within a single `initMeasuredTemplate` method in a single file.
  - overwrite just PF1's implementation in pf1.onReady
- Update/Delete token hooks need to use a local copy of "is first GM" instead of referencing PF1's
- Canvas ready hook probably needs to be added at root of file instead of in `pf1.postInit` hook
- Look through the rest of the logic to find any specific PF1 code
  - Make sure the current item dialog hook stuff is only initialized for PF1
- Make saving on the Item call a specific system handler

---

## Tech Debt
- Flatten ui data store object and only expand it into the item's structure when saving. This will decouple the UI itself from the Item structure.

---

## Unknowns that I don't intend to look into
- Making it work with anything that isn't PF1
- Hex Grids
- Whether or not it runs on Forge (it probably does, I think its limitations are only related to file paths, but I have no way of testing this)

## pf1 v11 update
- make sure to measure diagonals correctly (search project for `measurePath`)