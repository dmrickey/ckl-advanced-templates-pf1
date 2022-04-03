<svelte:options accessors={true} />

<script>
    import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
    import { tLocalize } from "../../scripts/utils";

    export let elementRoot;
    export let itemPf;

    initData();

    export async function initData() {
        // todo fetch item data
    }
</script>

<ApplicationShell bind:elementRoot>
    <main>
        {@debug itemPf}
        <label>{tLocalize("templates.placement.selection.label", { itemType: itemPf.name })}</label>
    </main>
</ApplicationShell>
