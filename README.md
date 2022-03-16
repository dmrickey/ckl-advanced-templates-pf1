# Advanced Templates PF1

Advanced template placement options for PF1. Go into any Item where you've got a Cone/Cicrle template configured for when it's used, hit the new "Choose Options" button to open a dialog and configure the new options. This new button is located underneath the drop down for choosing a template type in the Item's details. By default, with no configuration, circles will default to "grid targeting" and cones will default to "self".

If you need to place the template in such a way that the new options don't account for, you can still configure the template to be placed via "Use System Default" to use PF1's built in template placement without any of my modifications Picking this option will ignore any other options (e.g. if you check "delete template at end of turn" but are using the default placement rules, then the template will not be deleted at the end of the turn).

Spread types include burst, emanation, and spread. These are only configurable for circles. They currently only have any effect when the circle is "centered on you" as this combination actually effects the size of the template. E.g. Bursts/emanationas aren't blocked by cover (i.e. walls) and spread is also not blocked by cover while continuing around corners. These are currently configurable in case this functionality is added in a future version.

## Configurations

Go into the details tab of any of your spells/abilities/items/etc. If it is configured for a Circle or Cone Measured Template, there will be a new "Choose Options" button available.

![image](https://user-images.githubusercontent.com/3664822/158039749-0fe511cf-73f9-4020-abc1-36805f8feed7.png)

Clicking it will open the configuration menu, this is what the options look like for a Circle

![image](https://user-images.githubusercontent.com/3664822/158039760-7314bf92-a707-4bd4-853d-755407f7e485.png)

- Placement Type
  - Select Grid Placement - This is for your standard area of effect spell, so if you're configuring something like a fireball where you choose where the spell goes, this is the option you want. This is the default option if a Circle isn't configured.
  - Centered on Token - This is for something like a cleric's Channel ability or Obscuring Mist. This is for when you don't need to make a choice on where to place the circle, and the template will be automatically placed at your token
  - Use System Default - This is for if there's a special case not covered by the above options and you need the spell to use PF1's default method where it can be placed anywhere on the grid
- Effect Type
  - Rules-wise, each of these behave different regarding walls or how they effect if they're cast from a "centered on token" spell. Currently, I do not take walls into account at all and selecting this will only change how "Centered on Token" behaves. In the future, I may add the ability for these to follow the rules regarding walls, so if they're configured now, at that point they would automatically work with walls as expected.
- Extra options
  - Delete Template at End of Turn - When game time advanced, or when the current turn is over, the template will automatically be deleted so as to not clutter up the scene with templates that are no longer needed.
  - Attach to Token - This is for use in conjunction with "Centered on Token". This is for things like a paladin's aura or casting Silence on yourself where the template should move with the caster. There is no guard for enabling this with "select grid placement" so you will get weird behavior where the template will jump to you when you move if you enabled both of these together.
- **None of these options have any effect if you select the *Use System Default* placement type.**

This is the configuration menu for a cone

![image](https://user-images.githubusercontent.com/3664822/158039955-5b8b8883-5331-45b6-b443-9fc4e3da9ef2.png)

- Placement Type
  - Originate from Caster - This is the default placement type for cones if no option is configured. This will make the cone "stick" to the casting token and follow the cursor around the screen. It follow the rules for placing cones away from the caster and does not allow for rotating the cones at different angles--I have plans to add the ability for the GM to enable this option for players in the future.
  - Originate from Selection - Allows you to select a grid square on the map, and then choose the cone direction via the same technique just described.
  - Use System Default - see circle
- Extra options
  - Delete Template at End of Turn - see circle **This has no effect if *Use System Default* is selected**

## Game Settings

![image](https://user-images.githubusercontent.com/3664822/158040092-db04fb6d-7039-4c81-b144-d0ae7983b8ca.png)

- Enable Debug Logging - this is a bunch of random log messages that I added in during development. If you have a problem, turning this on and reproducing it could provide me with useful info to know what went wrong.
- Target Tokens in Template - This updates your targets as you move the template preview to show you what tokens your template will effect.
- Re-expand Collapsed Sheets - When you start placing a template, any sheets you have open will be collapsed so you can fully see the scene to choose where to place your template. By default they remain collapsed after the template has been placed. This is mainly because if have extra things that happen (like animations) and want to be able to see those results, if the sheets re-exapnded to cover the scene you wouldn't get to see to those. If you enable this, then the sheets will be re-expanded after the template is placed.

## Other Changes

Here's a few random changes that don't specifically fit into the above categories
- If your circle template has a defined min and/or max range, that will be reflected with the template preview. If you go outside of that range (there is visual feedback when you are not within range), then you will not be able to use the ability. When the range is configured like this, there is added text to show how far the template is from your token. I plan to expand this to Rays when I start implementing targeting options for spells that have individual targets and not templates.
- I have replaced the default icons with the icons that are configured for the Item you're using (Item being a foundry term for basically any spell/item/feature/ability/etc on your character--basically if it's something in your character sheet that has it's own details window, then it's an Item). So when you're looking at the Template layer, each template will now have a specific icon that correlates with that Item instead of a sea of the same icon.

## Installation

manifest link: https://github.com/dmrickey/ckl-advanced-templates-pf1/releases/latest/download/module.json

Last tested versions  
Advanced Templates PF1 1.0.0  
Foundry v9 255  
PF1e 80.13

Here's a quick visual demo of how to configure some of the options and how they work (no audio was recorded)
https://youtu.be/r7oAkXw6-zU
