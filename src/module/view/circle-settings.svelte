<script>
    import { CONSTS, MODULE_NAME } from "../consts";
    import { ifDebug, localize } from "../scripts/utils";

    export let action = void 0;
    export let updates = void 0;

    const placements = [
        {
            value: CONSTS.placement.circle.grid,
            label: localize("templates.circle.placement.grid.label"),
        },
        {
            value: CONSTS.placement.circle.self,
            label: localize("templates.circle.placement.self.label"),
        },
        {
            value: CONSTS.placement.circle.splash,
            label: localize("templates.circle.placement.splash.label"),
        },
        {
            value: CONSTS.placement.useSystem,
            label: localize("templates.placement.useSystem.label"),
        },
    ];
    const areaTypes = [
        {
            value: CONSTS.areaType.burst,
            label: localize("templates.circle.placement.type.burst"),
        },
        {
            value: CONSTS.areaType.emanation,
            label: localize("templates.circle.placement.type.emanation"),
        },
        {
            value: CONSTS.areaType.spread,
            label: localize("templates.circle.placement.type.spread"),
        },
    ];

    // initialize circle options
    updates.data.flags[MODULE_NAME][CONSTS.flags.placementType] ||=
        action.flags?.[MODULE_NAME]?.[CONSTS.flags.placementType] || CONSTS.placement.circle.grid;
    updates.data.flags[MODULE_NAME][CONSTS.flags.circle.areaType] ||=
        action.flags?.[MODULE_NAME]?.[CONSTS.flags.circle.areaType] || CONSTS.areaType.burst;
    updates.data.flags[MODULE_NAME][CONSTS.flags.ignoreRange] ||=
        action.flags?.[MODULE_NAME]?.[CONSTS.flags.ignoreRange] || false;
    updates.data.flags[MODULE_NAME][CONSTS.flags.circle.movesWithToken] ||=
        action.flags?.[MODULE_NAME]?.[CONSTS.flags.circle.movesWithToken] || false;

    ifDebug(() => console.log("Opening circle settings for:", updates));
</script>

<div class="form-group radio-col-2">
    <label for class="top-label">{localize("templates.placement.selection.label")}</label>
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

<div class="form-group radio-col-3">
    <label for>{localize("templates.circle.placement.type.label")}</label>
    <div class="form-fields">
        {#each areaTypes as areaType}
            <label class="checkbox">
                <input
                    type="radio"
                    bind:group={updates.data.flags[MODULE_NAME][CONSTS.flags.circle.areaType]}
                    name={`flags.${MODULE_NAME}.${CONSTS.flags.circle.areaType}`}
                    value={areaType.value}
                />
                {areaType.label}
            </label>
        {/each}
    </div>
</div>

<slot />

<div class="form-group stacked no-border">
    <!-- ignore range -->
    <label class="checkbox">
        <input
            type="checkbox"
            bind:checked={updates.data.flags[MODULE_NAME][CONSTS.flags.ignoreRange]}
            name={`flags.${MODULE_NAME}.${CONSTS.flags.ignoreRange}`}
        />
        {localize("templates.ignoreRange")}
    </label>

    <!-- Attach to token -->
    <label class="checkbox">
        <input
            type="checkbox"
            disabled={updates.data.flags[MODULE_NAME][CONSTS.flags.placementType] !== CONSTS.placement.circle.self}
            bind:checked={updates.data.flags[MODULE_NAME][CONSTS.flags.circle.movesWithToken]}
            name={`flags.${MODULE_NAME}.${CONSTS.flags.circle.movesWithToken}`}
        />
        {localize("templates.circle.placement.attachToToken")}
    </label>
</div>

<style lang="scss">
    .form-group label.top-label {
        margin-bottom: auto;
    }

    .form-group.radio-col-2 {
        .form-fields {
            display: grid;
            grid-template-columns: 1fr 1fr;
        }
    }

    .form-group.radio-col-3 {
        .form-fields {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
        }
    }

    .no-border {
        // this is just so that the spacing for items without a border match those that do
        border: 2px solid transparent;
        padding: 0 0.5rem;
    }
</style>
