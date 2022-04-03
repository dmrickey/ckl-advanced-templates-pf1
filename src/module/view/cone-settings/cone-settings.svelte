<svelte:options accessors={true} />

<script>
    import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store";
    import { getContext } from "svelte";
    import { tLocalize } from "../../scripts/utils";

    export let itemPf = void 0;

    const { application } = getContext("external");

    // Wrap the item document / if the item is deleted close the dialog / application.
    const doc = new TJSDocument(itemPf, { delete: application.close.bind(application) });

    let updateOptions;

    $: {
        // Store the update options to print in the template.
        updateOptions = JSON.stringify(doc.updateOptions, null, 2);

        // For the reactive statement to take you do need to reference the doc. This is an example.
        // You'll likely do more here for your implementation.
        console.log($doc);
    }

    function applyTemplate() {
        console.log("Do something here");
        application.close();
    }
</script>

<main>
    {@debug itemPf}
    <label>{tLocalize("templates.placement.selection.label", { itemType: $doc.name })}</label>
</main>
