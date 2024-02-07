<svelte:options accessors={true} />

<script>
    import { CONSTS, MODULE_NAME } from "../consts";
    import { ifDebug, localize } from "../scripts/utils";
    import { Settings } from "../settings";

    export let action = void 0;
    export let updates = void 0;

    let widthOverrideEnabled;
    const defaultWidth = Settings.defaultLineWidth;

    $: {
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
        action.data.flags?.[MODULE_NAME]?.[CONSTS.flags.line.width] || Settings.defaultLineWidth;
    updates.data.flags[MODULE_NAME][CONSTS.flags.line.widthOverride] ||=
        !!action.data.flags?.[MODULE_NAME]?.[CONSTS.flags.line.widthOverride];

    ifDebug(() => console.log("Opening line settings for:", updates));
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

<!-- override line width -->
<div class="form-group">
    <label for>{localize("templates.line.widthLabel")}</label>
</div>
<div class="optional-border">
    <label class="checkbox">
        {localize("templates.line.overrideWidth")}
        <input
            type="checkbox"
            bind:checked={updates.data.flags[MODULE_NAME][CONSTS.flags.line.widthOverride]}
            name={`flags.${MODULE_NAME}.${CONSTS.flags.line.widthOverride}`}
        />
    </label>

    <div class="form-group">
        {#if widthOverrideEnabled}
            <label for="widthOverride">{localize("templates.line.widthOverride")}</label>
            <div class="form-fields">
                <input
                    id="widthOverride"
                    type="text"
                    bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.line.width]}
                    name={`flags.${MODULE_NAME}.${CONSTS.flags.line.width}`}
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

<style lang="scss">
    .form-group.radio-col-3 {
        .form-fields {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
        }
    }

    .optional-border {
        border: 2px solid rgb(127, 143, 153);
        border-radius: 6px;
        padding: 0 0.5rem;
    }
</style>
