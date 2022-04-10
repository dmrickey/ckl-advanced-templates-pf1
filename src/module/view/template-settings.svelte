<script>
    import { getContext } from "svelte";
    import SharedSettings from "./shared-settings.svelte";
    import { CONSTS, MODULE_NAME } from "../consts";
    import { ifDebug, localize } from "../scripts/utils";

    export let itemPf = void 0;
    export let TemplateApplication = void 0;

    const { application } = getContext("external");

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
                    [CONSTS.flags.placementType]: flags?.[CONSTS.flags.placementType],
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

    ifDebug(() => console.log("Opening settings for:", itemPf));

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
    <svelte:component this={TemplateApplication} {itemPf} updates={updateOptions} />
    <SharedSettings updates={updateOptions} on:submitTemplate={applyTemplate} on:cancel={onCancel} />
</form>

<style lang="scss">
    h3.form-header {
        text-align: center;
    }
</style>
