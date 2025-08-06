<svelte:options accessors={true} />

<script>
    import { CONSTS, MODULE_NAME } from "../consts";
    import { ifDebug, localize } from "../scripts/utils";

    export let action = void 0;
    export let updates = void 0;

    // initialize rect options
    updates.data.flags[MODULE_NAME][CONSTS.flags.placementType] ||=
        action.flags?.[MODULE_NAME]?.[CONSTS.flags.placementType] || CONSTS.placement.rect.centered;

    ifDebug(() => console.log("Opening rect settings for:", updates));
</script>

<div class="form-group">
    <label for="width">{localize("templates.rect.width.name")}</label>
    <div class="form-fields">
        <input
            bind:value={updates.data.measureTemplate.size}
            class="formula"
            id="width"
            name="measureTemplate.size"
            type="text"
            placeholder={localize("templates.rect.width.hint")}
        />
    </div>
</div>
<div class="form-group">
    <label for="height">{localize("templates.rect.height.name")}</label>
    <div class="form-fields">
        <input
            bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.rect.height]}
            class="formula"
            id="height"
            name={`flags.${MODULE_NAME}.${CONSTS.flags.rect.height}`}
            type="text"
            placeholder={localize("templates.rect.height.hint", { value: updates.data.measureTemplate.size })}
        />
    </div>
</div>

<slot />

<style lang="scss">
</style>
