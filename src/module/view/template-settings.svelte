<script>
    import { getContext } from "svelte";
    import SharedSettings from "./shared-settings.svelte";
    import { CONSTS, MODULE_NAME } from "../consts";
    import { ifDebug, localize } from "../scripts/utils";

    export let action = void 0;
    export let TemplateApplication = void 0;

    const { application } = getContext("external");

    const flags = action.data.flags?.[MODULE_NAME];
    const updates = {
        data: {
            measureTemplate: {
                customColor: action.data.measureTemplate.customColor || game.user.color,
                customTexture: action.data.measureTemplate.customTexture,
                overrideColor: action.data.measureTemplate.overrideColor,
                overrideTexture: action.data.measureTemplate.overrideTexture,
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

    ifDebug(() => console.log("Opening settings for:", action));

    const applyTemplate = async () => {
        ifDebug(() => console.log("Applying updates:", updates));
        await action.update(updates.data);
        application.close();
    };
    const onCancel = () => {
        application.close();
    };
</script>

<form class="pf1" novalidate on:submit|preventDefault={applyTemplate}>
    <h3 class="form-header">{localize("templates.placement.selection.label")}</h3>
    <svelte:component this={TemplateApplication} {action} {updates}>
        <SharedSettings {updates} />
    </svelte:component>

    <div class="form-group">
        <button on:click|preventDefault={onCancel}>{localize("cancel")}</button>
        <button type="submit">{localize("ok")}</button>
    </div>
</form>

<style lang="scss">
    h3.form-header {
        text-align: center;
    }
</style>
