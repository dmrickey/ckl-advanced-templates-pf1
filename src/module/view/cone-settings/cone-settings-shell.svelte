<svelte:options accessors={true} />

<script>
    import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
    import { tLocalize, tLocalizeF } from "../../scripts/utils/localize";

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
        <label>{tLocalizeF("templates.placement.selection.label", { itemType: itemPf.type })}</label>
    </main>
</ApplicationShell>
