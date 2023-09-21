<svelte:options accessors={true} />

<script>
    import { CONSTS, MODULE_NAME } from "../consts";
    import { ifDebug, localize } from "../scripts/utils";

    export let action = void 0;
    export let updates = void 0;

    // uses same strings as cone
    const placements = [
        {
            value: CONSTS.placement.line.self,
            label: localize("templates.cone.placement.self.label"),
        },
        {
            value: CONSTS.placement.line.selectTargetSquare,
            label: localize("templates.cone.placement.selectTargetSquare.label"),
        },
        {
            value: CONSTS.placement.useSystem,
            label: localize("templates.placement.useSystem.label"),
        },
    ];

    // initialize line options
    updates.data.flags[MODULE_NAME][CONSTS.flags.placementType] ||=
        action.data.flags?.[MODULE_NAME]?.[CONSTS.flags.placementType] || CONSTS.placement.line.selectTargetSquare;

    ifDebug(() => console.log("Opening line settings for:", updates));
</script>

<form class="pf1" novalidate>
    <div class="form-group column">
        {#each placements as placement}
            <label class="checkbox">
                <input
                    type="radio"
                    bind:group={updates.data.flags[MODULE_NAME][CONSTS.flags.placementType]}
                    name="placements"
                    value={placement.value}
                />
                {placement.label}
            </label>
        {/each}
    </div>

    <slot />
</form>

<style lang="scss">
    .column {
        display: flex;
        flex-direction: column;
        text-align: center;
    }

    form {
        display: flex;
        flex-direction: column;
    }
</style>
