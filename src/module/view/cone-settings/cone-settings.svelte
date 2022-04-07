<svelte:options accessors={true} />

<script>
    import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store";
    import { getContext } from "svelte";
    import { CONSTS, MODULE_NAME } from "../../consts";
    import { localize, tLocalize } from "../../scripts/utils";
    import SharedSettings from "../partial-shared-settings.svelte";

    export let itemPf = void 0;

    const { application } = getContext("external");

    // Wrap the item document / if the item is deleted close the dialog / application.
    const doc = new TJSDocument(itemPf, { delete: application.close.bind(application) });

    let updateOptions;

    const placements = [
        {
            value: CONSTS.placement.cone.self,
            label: localize("templates.cone.placement.self.label"),
        },
        {
            value: CONSTS.placement.cone.selectTargetSquare,
            label: localize("templates.cone.placement.selectTargetSquare.label"),
        },
        {
            value: CONSTS.placement.useSystem,
            label: localize("templates.placement.useSystem.label"),
        },
    ];
    let currentPlacement;

    $: {
        const flags = itemPf.data.flags[MODULE_NAME];
        updateOptions = {
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
                        [CONSTS.flags.placementType]:
                            flags?.[CONSTS.flags.placementType] || CONSTS.placement.cone.selectTargetSquare,
                        [CONSTS.flags.textureAlpha]:
                            !!flags?.[CONSTS.flags.textureAlpha] || flags?.[CONSTS.flags.textureAlpha] === 0
                                ? flags?.[CONSTS.flags.colorAlpha]
                                : 0.5,
                        [CONSTS.flags.textureScale]:
                            !!flags?.[CONSTS.flags.textureScale] || flags?.[CONSTS.flags.textureScale] === 0
                                ? flags?.[CONSTS.flags.colorAlpha]
                                : 1,
                    },
                },
            },
        };
        // // Store the update options to print in the template.
        // updateOptions = JSON.stringify(doc.updateOptions, null, 2);

        // For the reactive statement to take you do need to reference the doc. This is an example.
        // You'll likely do more here for your implementation.
        console.log($doc);
    }

    $: {
        // update options changed?
        console.log(updateOptions);
    }

    function applyTemplate() {
        console.log("Do something here");
        application.close();
    }
</script>

<main>
    {@debug $doc}

    <div>{tLocalize("templates.placement.selection.label", { itemType: $doc.type })}</div>
    {#each placements as placement}
        <label>
            <input
                type="radio"
                bind:group={updateOptions.data.flags[MODULE_NAME][CONSTS.flags.placementType]}
                name="placements"
                value={placement.value}
            />
            {placement.label}
        </label>
    {/each}
    <!-- <SharedSettings {itemPf} /> -->
    <SharedSettings itemPf={updateOptions} />
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
    }

    input:disabled {
        box-shadow: none !important;
    }
</style>
