<svelte:options accessors={true} />

<script>
    import { getContext } from "svelte";
    import { CONSTS, MODULE_NAME } from "../../consts";
    import { ifDebug, localize } from "../../scripts/utils";
    import SharedSettings from "../partial-shared-settings.svelte";

    export let itemPf = void 0;

    const { application } = getContext("external");

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

    const flags = itemPf.data.flags[MODULE_NAME];
    const updateOptions = {
        data: {
            data: {
                measureTemplate: {
                    customColor: itemPf.data.data.measureTemplate.customColor || game.user.color,
                    customTexture: itemPf.data.data.measureTemplate.customTexture,
                    overrideColor: itemPf.data.data.measureTemplate.overrideColor,
                    overrideTexture: itemPf.data.data.measureTemplate.overrideTexture,
                },
            },
            flags: {
                [MODULE_NAME]: {
                    [CONSTS.flags.colorAlpha]:
                        !!flags?.[CONSTS.flags.colorAlpha] || flags?.[CONSTS.flags.colorAlpha] === 0
                            ? flags?.[CONSTS.flags.colorAlpha]
                            : 0.5,
                    [CONSTS.flags.expireAtTurnEnd]: !!flags?.[CONSTS.flags.expireAtTurnEnd],
                    [CONSTS.flags.hideOutline]: !!flags?.[CONSTS.flags.hideOutline],
                    [CONSTS.flags.placementType]:
                        flags?.[CONSTS.flags.placementType] || CONSTS.placement.cone.selectTargetSquare,
                    [CONSTS.flags.textureAlpha]:
                        !!flags?.[CONSTS.flags.textureAlpha] || flags?.[CONSTS.flags.textureAlpha] === 0
                            ? flags?.[CONSTS.flags.textureAlpha]
                            : 0.5,
                    [CONSTS.flags.textureScale]:
                        !!flags?.[CONSTS.flags.textureScale] || flags?.[CONSTS.flags.textureScale] === 0
                            ? flags?.[CONSTS.flags.textureScale]
                            : 1,
                },
            },
        },
    };

    ifDebug(() => console.log("Opening cone settings for:", itemPf));

    const applyTemplate = async () => {
        ifDebug(() => console.log("Applying options:", updateOptions));
        await itemPf.update(updateOptions.data);
        application.close();
    };
    const onCancel = () => {
        application.close();
    };
</script>

<form class="pf1" novalidate>
    <h3 class="form-header">{localize("templates.placement.selection.label", { itemType: itemPf.type })}</h3>
    <div class="form-group column">
        {#each placements as placement}
            <label class="checkbox">
                <input
                    type="radio"
                    bind:group={updateOptions.data.flags[MODULE_NAME][CONSTS.flags.placementType]}
                    name="placements"
                    value={placement.value}
                />
                {placement.label}
            </label>
        {/each}
    </div>
</form>
<SharedSettings itemPf={updateOptions} on:submitTemplate={applyTemplate} on:cancel={onCancel} />

<style lang="scss">
    .column {
        display: flex;
        flex-direction: column;
        text-align: center;
    }

    h3.form-header {
        text-align: center;
    }

    form {
        display: flex;
        flex-direction: column;
    }

    input:disabled {
        box-shadow: none !important;
    }
</style>
