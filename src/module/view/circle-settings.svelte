<script>
    import { CONSTS, MODULE_NAME } from "../consts";
    import { ifDebug, localize } from "../scripts/utils";

    export let itemPf = void 0;
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
    updates.data.flags[MODULE_NAME][CONSTS.flags.placementType] ||= CONSTS.placement.circle.grid;
    updates.data.flags[MODULE_NAME][CONSTS.flags.circle.areaType] ||=
        itemPf.data.flags[MODULE_NAME][CONSTS.flags.circle.areaType] || CONSTS.areaType.burst;
    // don't need to initialize `ignore range` or `attach to token` because they're booleans

    ifDebug(() => console.log("Opening circle settings for:", updates));
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

    <hr />

    <h3 class="group-header">{localize("templates.circle.placement.type.label")}</h3>
    <div class="form-group row">
        {#each areaTypes as areaType}
            <label class="checkbox">
                <input
                    type="radio"
                    bind:group={updates.data.flags[MODULE_NAME][CONSTS.flags.circle.areaType]}
                    name="areaTypes"
                    value={areaType.value}
                />
                {areaType.label}
            </label>
        {/each}
    </div>

    <div class="form-group stacked">
        <!-- ignore range -->
        <label class="checkbox">
            <input type="checkbox" bind:checked={itemPf.data.flags[MODULE_NAME][CONSTS.flags.ignoreRange]} />
            {localize("templates.ignoreRange")}
        </label>

        <!-- Attach to token -->
        <label class="checkbox">
            <input type="checkbox" bind:checked={itemPf.data.flags[MODULE_NAME][CONSTS.flags.circle.movesWithToken]} />
            {localize("templates.circle.placement.attachToToken")}
        </label>
    </div>
</form>

<style lang="scss">
    .form-group.column {
        display: flex;
        flex-direction: column;
        text-align: center;
    }

    h3.group-header {
        text-align: center;
    }
    .form-group.row {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    form {
        display: flex;
        flex-direction: column;
    }
</style>
