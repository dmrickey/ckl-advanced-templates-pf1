# Advanced Templates PF1

Advanced Templates helps you make sure your area effects are placed per the rules for Pathfinder (first edition). By default there are various ways that area effects can be used within Foundry that simply don't follow the rules. There are also various quality of life improvements such as changing the fill color transparency, making it so that textures correctly fit templates, being able to hide the border, and more.

Go into any Action, go the misc tab, and underneath where you pick the template type and size, you will find a variety of new options (depending on the template shape/type).

If you need to place the template in such a way that the new options don't account for, you can still configure the template to be placed via "Use System Default" which mirrors placing a template without this mod.

Spread types include burst, emanation, and spread. These are only configurable for circles. They currently only have any effect when the circle is "centered on you" as this combination actually effects the size of the template. E.g. Bursts/emanationas aren't blocked by cover (i.e. walls) and spread is also not blocked by cover while continuing around corners. These are currently configurable in case this functionality is added in a future version.

## Configurations

Go into an Action's Miscellaneous tab.

![image](https://github.com/dmrickey/ckl-advanced-templates-pf1/assets/3664822/431425c5-bce2-4375-b5e1-cd1eb030318d)

### Circle

![image](https://github.com/dmrickey/ckl-advanced-templates-pf1/assets/3664822/82978e02-27d1-479a-855f-656e1d8045da)

- Targeting Method
  - Grid Intersection - This is for your standard area of effect spell, so if you're configuring something like a fireball where you choose where the spell goes, this is the option you want. This is the default option if a Circle isn't configured.
  - Centered on Token - This is for something like a cleric's Channel ability or Obscuring Mist. This is for when you don't need to make a choice on where to place the circle, and the template will be automatically placed at your token
  - Splash Weapon - This will target a grid intersection unless you hover over a token, then it will target the token and the adjacent squares to allow for splash damage. This is used for splash weapons like Alchemist Bomobs or a flask of Acid.
  - Use System Default - This is set up to mimic Foundry's default circle placement where it can be placed anywhere on the grid.
- Effect Type
  - Rules-wise, each of these behave different regarding walls or how they effect if they're cast from a "centered on token" spell. Currently, I do not take walls into account at all and selecting this will only change how "Centered on Token" behaves. In the future, I may add the ability for these to follow the rules regarding walls, so if they're configured now, at that point they would automatically work with walls as expected.
- Override Texture
  - Texture - Whether or not you want to use a specific piece of art to fill the template.
  - Texture Alpha - Allows you to alter the transparency of the texture. `1` is completely opaque while values closer to `0` are more transparent
  - Texture Scale - Allows you to alter how large the texture is. `1` is the texture's normal scale. Values closer to `0` will be smaller. `2` is twice as big, `3` is three times as big, etc. The maximum value is `10`. As is the case with pf1, the texture will not extend beyond the outline of the template.
- Override Color
  - Color - If you empty this value, then it will show the color configured for that player (i.e. the same color as the icon next to your player name which is visible in the lower left corner of the Foundry screen (its default location)).
  - Color Alpha - Allows you to alter the transparency of the template's fill color. `1` is completely opaque while `0` is completely transparent. If you want to turn the fill color off, then set this to `0`. As you change this value, the color shown just above will adjust to show you the effect of this value.
- When to Delete
  - Do not Delete - The template stays forever until it is manually deleted
  - End of Turn - Will be removed after the current actor's turn ends (this is helpful for things like fireball where it's useful to have the template in the scene to see who is affected, but doesn't need to remain indefinitely). If outside of combat, then the template will be removed as soon as any amount of time passes (which is possible via a macro or a separate mod, without those time only advances within combat).
  - Duration - Allows you to configure a number of rounds/minutes/hours for when the template will automatically be removed.
- Extra options
  - Hide Outline - Enable this if you don't want to see the template's outline border. If the fill color is good enough or if you're using a texture that completely fills the template, then it could look better to just leave the outline turned off.
  - Ignore Range Restriction - This is most useful for ranged weapons that can be thrown beyond the range with an attack penalty. You would (normally) leave this disabled for spells as spells (usually) don't have options that will let you ignore the defined range.
  - Attach to Token - This is for use in conjunction with "Centered on Token". This is for things like a paladin's aura or casting Silence on yourself where the template should move with the caster.

### Cone / Line

![image](https://github.com/dmrickey/ckl-advanced-templates-pf1/assets/3664822/3fe74b75-fbb5-4cee-bdd7-5fd1a09c22cc)

- Targeting Method
  - Originate from Caster - This is the default placement type for lines/cones if no option is configured. This will make the template "stick" to the casting token and follow the cursor around the screen.
  - Originate from Selection - Allows you to select a grid square on the map, and then choose the cone direction via the same technique just described.
- Width Settings (line only)
  - Default Width - by default, PF1 changes line template widths to `1`. This makes for a nice line, but there are some cases where someone may want a different width, this allows for that.

### Rectangle

Rectangles have no unique options.

## Other Changes

- If your circle or rectangle template has a defined min and/or max range, that will be reflected with the template preview. If you go outside of that range (there is visual feedback when you are not within range), then you will not be able to use the ability. When the range is configured like this, there is added text to show how far the template is from your token.
- If the action has no icon, then the action's parent Item's icon will be used. So when you're looking at the Template layer, each template will now have a specific icon that correlates with the ability instead of a sea of the same generic icon.
- When a texture is provided for a template, they now fit correctly within their template.

## Game Settings

![image](https://github.com/dmrickey/ckl-advanced-templates-pf1/assets/3664822/e2635569-3823-4b7f-be9e-5898cc27338d)

### Player Settings

- Enable Debug Logging - this is a bunch of random log messages that I added in during development. If you have a problem, turning this on and reproducing it could provide me with useful info to know what went wrong.
- Target Tokens in Template - This updates your targets as you move the template preview to show you what tokens your template will effect.
- Re-expand Collapsed Sheets - When you start placing a template, any sheets you have open will be collapsed so you can fully see the scene to choose where to place your template. By default they remain collapsed after the template has been placed. This is mainly because if have extra things that happen (like animations) and want to be able to see those results, if the sheets re-exapnded to cover the scene you wouldn't get to see to those. If you enable this, then the sheets will be re-expanded after the template is placed.
- Default Line Width - The thickness of your line templates. This is the global default but can be overriden on an individual basis. I suggest leaving this at 5 if you're also using Otigon's Automated Animations as the animations will otherwise be squished to fit within the narrow template.
- Disable Template Placement Hints - There's a small dialog that pops up when placing templates with extra options. This option disables that dialog.

### GM Settings

- Allow 15' Alternate Cone - The rules text says spells originate from a grid intersection. The graphic for showing valid cone placement and the Paizo FAQ indicates that the 15' cone is an exception to this and that the graphic is correct. If you want to allow your players (and yourself) to also use an alternate (and wider) 15' cone (though it's not really a cone any more..) then enable this option
- Allow Non-Standard Cone Rotations - The rules say that cones are cast away from the caster, leaving this disabled is rules as written. However, if you want your players (or yourself) to be able to cast a cone from the corner of your square but the rotate it so it cuts across in front of you, then enable this option. For best results, set it to `22.5`, `15`, or `5`. `45` is also a completely valid value if you want the cone to be able to be rotated and don't want "weird" shapes mixed in at different angles--setting it to `45` will basically rotate through legal cones at illegal angles. Leaving this at `0` essentially disables the option.

## Installation

manifest link: https://github.com/dmrickey/ckl-advanced-templates-pf1/releases/latest/download/module.json

Last tested versions
Advanced Templates PF1 2.1.3
Foundry v11 315
PF1e 9.6

Here's a quick visual demo of how to configure some of the options and how they work (no audio was recorded)
https://youtu.be/r7oAkXw6-zU

<details>
  <summary>Here's an example of placing a bomb</summary>

https://user-images.githubusercontent.com/3664822/159150950-cec5c5cb-4be2-486b-80c9-f5cbb305a9fa.mp4

</details>
