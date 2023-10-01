<svelte:options accessors={true} />

<script>
    import { CONSTS, MODULE_NAME } from "../consts";
    import { ifDebug, localize, localizeFull } from "../scripts/utils";

    export let action = void 0;
    export let updates = void 0;

    let widthOverrideEnabled;
    let defaultWidth;

    $: {
        defaultWidth = CONFIG.MeasuredTemplate.defaults.width;
        widthOverrideEnabled = !!updates.data.flags?.[MODULE_NAME]?.[CONSTS.flags.line.widthOverride];
    }

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

    updates.data.flags[MODULE_NAME][CONSTS.flags.line.width] ||=
        action.data.flags?.[MODULE_NAME]?.[CONSTS.flags.line.width] || CONFIG.MeasuredTemplate.defaults.width;
    updates.data.flags[MODULE_NAME][CONSTS.flags.line.widthOverride] ||=
        !!action.data.flags?.[MODULE_NAME]?.[CONSTS.flags.line.widthOverride];

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

    <!-- override color (same as vanilla) -->
    <div class="form-group right-me">
        <label class="checkbox">
            {localize("templates.line.overrideWidth")}
            <input type="checkbox" bind:checked={updates.data.flags[MODULE_NAME][CONSTS.flags.line.widthOverride]} />
        </label>
    </div>

    <!-- override line width -->
    <div class="optional-border">
        <div class="form-group">
            {#if widthOverrideEnabled}
                <label for="widthOverride">{localize("templates.line.widthOverride")}</label>
                <div class="form-fields">
                    <input
                        id="widthOverride"
                        type="text"
                        bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.line.width]}
                    />
                </div>
            {:else}
                <label for="widthOverride">{localize("templates.line.default")}</label>
                <div class="form-fields">
                    <input disabled type="text" value={defaultWidth} />
                </div>
            {/if}
        </div>
    </div>

    <slot />
</form>

<style lang="scss">
    .form-group label {
        max-width: 35%;
    }

    .column {
        display: flex;
        flex-direction: column;
        text-align: center;
    }

    form {
        display: flex;
        flex-direction: column;
    }

    .optional-border {
        border: 2px solid rgb(127, 143, 153);
        border-radius: 6px;
        padding: 0 0.5rem;
    }

    .right-me {
        justify-content: flex-end;
    }
</style>
