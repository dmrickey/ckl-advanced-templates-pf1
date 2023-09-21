<svelte:options accessors={true} />

<script>
    import { CONSTS, MODULE_NAME } from "../consts";
    import { ifDebug, localize } from "../scripts/utils";

    export let action = void 0;
    export let updates = void 0;

    const placements = [
        {
            value: CONSTS.placement.rect.centered,
            label: localize("templates.rect.placement.centered.label"),
        },
        {
            value: CONSTS.placement.useSystem,
            label: localize("templates.placement.useSystem.label"),
        },
    ];

    // initialize rect options
    updates.data.flags[MODULE_NAME][CONSTS.flags.placementType] ||=
        action.data.flags?.[MODULE_NAME]?.[CONSTS.flags.placementType] || CONSTS.placement.rect.centered;

    ifDebug(() => console.log("Opening rect settings for:", updates));
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
