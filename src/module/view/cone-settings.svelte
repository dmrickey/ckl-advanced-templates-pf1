<svelte:options accessors={true} />

<script>
    import { CONSTS, MODULE_NAME } from "../consts";
    import { ifDebug, localize } from "../scripts/utils";

    export let action = void 0;
    export let updates = void 0;

    const placements = [
        {
            value: CONSTS.placement.cone.self,
            label: localize("templates.cone.placement.self.label"),
        },
        {
            value: CONSTS.placement.cone.selectTargetSquare,
            label: localize("templates.cone.placement.selectTargetSquare.label"),
        },
        {
            value: CONSTS.placement.useSystem,
            label: localize("templates.placement.useSystem.label"),
        },
    ];

    // initialize cone options
    updates.data.flags[MODULE_NAME][CONSTS.flags.placementType] ||=
        action.data.flags?.[MODULE_NAME]?.[CONSTS.flags.placementType] || CONSTS.placement.cone.selectTargetSquare;

    ifDebug(() => console.log("Opening cone settings for:", updates));
</script>

<div class="form-group radio-col-3">
    <label for>{localize("templates.placement.selection.label")}</label>
    <div class="form-fields">
        {#each placements as placement}
            <label class="checkbox">
                <input
                    type="radio"
                    bind:group={updates.data.flags[MODULE_NAME][CONSTS.flags.placementType]}
                    name={`flags.${MODULE_NAME}.${CONSTS.flags.placementType}`}
                    value={placement.value}
                />
                {placement.label}
            </label>
        {/each}
    </div>
</div>

<slot />

<style lang="scss">
</style>
