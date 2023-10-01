<svelte:options accessors={true} />

<script>
    export let hint = void 0;
</script>

<main>
    {hint}
</main>

<style lang="scss">
    main {
        text-align: center;
        display: flex;
        flex-direction: column;
    }
</style>
