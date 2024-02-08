<script>
    import SharedSettings from "./shared-settings.svelte";
    import { ifDebug } from "../scripts/utils";
    import { prepareData } from "./prepare-template-data";

    export let action = void 0;
    export let TemplateApplication = void 0;

    const updates = prepareData(action);

    ifDebug(() => console.log("initializing updates", updates));
</script>

<svelte:component this={TemplateApplication} {action} {updates}>
    <SharedSettings {updates} />
</svelte:component>

<style lang="scss">
</style>
