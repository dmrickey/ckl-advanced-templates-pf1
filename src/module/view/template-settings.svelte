<script>
    import { getContext } from "svelte";
    import SharedSettings from "./shared-settings.svelte";
    import { ifDebug, localize } from "../scripts/utils";
    import { prepareData } from "./prepare-template-data";

    export let action = void 0;
    export let TemplateApplication = void 0;

    const { application } = getContext("external");

    const updates = prepareData(action);

    ifDebug(() => {
        console.log("Opening settings for:", action);
        console.log("  with current values:", updates);
    });

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
