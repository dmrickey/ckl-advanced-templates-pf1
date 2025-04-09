<svelte:options accessors={true} />

<script>
    import { CONSTS, MODULE_NAME } from "../consts";
    import { ifDebug } from "../scripts/utils";

    export let action = void 0;
    export let updates = void 0;

    // initialize rect options
    updates.data.flags[MODULE_NAME][CONSTS.flags.placementType] ||=
        action.flags?.[MODULE_NAME]?.[CONSTS.flags.placementType] || CONSTS.placement.rect.centered;

    ifDebug(() => console.log("Opening rect settings for:", updates));
</script>

<slot />

<style lang="scss">
</style>
