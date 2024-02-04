<script>
    import SharedSettings from "./shared-settings.svelte";
    import { ifDebug, localize } from "../scripts/utils";
    import { prepareData } from "./prepare-template-data";
    import { updateAction } from "./update-action";

    export let action = void 0;
    export let TemplateApplication = void 0;

    const updates = prepareData(action);

    $: {
        updateAction(action, updates);
        console.log("applying updates", updates);
    }
</script>

<svelte:component this={TemplateApplication} {action} {updates}>
    <SharedSettings {updates} />
</svelte:component>

<style lang="scss">
    h3.form-header {
        text-align: center;
    }
</style>
