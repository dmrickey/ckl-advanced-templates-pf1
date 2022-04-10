<svelte:options accessors={true} />

<script>
    import { createEventDispatcher } from "svelte";
    import { CONSTS, MODULE_NAME } from "../consts";
    import { clamp, localize, localizeFull } from "../scripts/utils";

    export let itemPf;

    const colorAlphaMin = 0;
    const colorAlphaMax = 1;
    const textureAlphaMin = 0.1;
    const textureAlphaMax = 1;
    const textureScaleMin = 0.1;
    const textureScaleMax = 10;

    const dispatch = createEventDispatcher();

    let textureOverrideEnabled;
    let colorOverrideEnabled;

    const currentUserColor = game.user.color;

    $: {
        colorOverrideEnabled = itemPf.data.data.measureTemplate.overrideColor;
        textureOverrideEnabled = itemPf.data.data.measureTemplate.overrideTexture;
    }

    const selectTexture = () => {
        const current = itemPf.data.data.measureTemplate.customTexture;
        const fp = new FilePicker({
            type: "imagevideo",
            current,
            callback: (path) => {
                itemPf.data.data.measureTemplate.customTexture = path;
            },
        });
        fp.browse(current);
    };

    const handleSubmit = () => {
        itemPf.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha] = clamp(
            itemPf.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha],
            colorAlphaMin,
            colorAlphaMax
        );
        itemPf.data.flags[MODULE_NAME][CONSTS.flags.textureAlpha] = clamp(
            itemPf.data.flags[MODULE_NAME][CONSTS.flags.textureAlpha],
            textureAlphaMin,
            textureAlphaMax
        );
        itemPf.data.flags[MODULE_NAME][CONSTS.flags.textureScale] = clamp(
            itemPf.data.flags[MODULE_NAME][CONSTS.flags.textureScale],
            textureScaleMin,
            textureScaleMax
        );

        dispatch("submitTemplate");
    };
</script>

<form class="pf1" on:submit|preventDefault={handleSubmit} novalidate>
    <!-- override texture (same as vanilla plus scale/alpha) -->
    <div class="form-group right-me">
        <label class="checkbox">
            {localizeFull("PF1.OverrideTexture")}
            <input type="checkbox" bind:checked={itemPf.data.data.measureTemplate.overrideTexture} />
        </label>
    </div>

    <!-- override texture options -->
    <div class="optional-border">
        <div class="form-group">
            <label for="customTexture">
                {localizeFull("PF1.CustomTexture")}
            </label>
            <div class="form-fields">
                <input
                    type="text"
                    disabled={!textureOverrideEnabled}
                    id="customTexture"
                    bind:value={itemPf.data.data.measureTemplate.customTexture}
                />
                <button disabled={!textureOverrideEnabled} on:click={selectTexture}>
                    <i class="fas fa-file-import fa-fw" />
                </button>
            </div>
        </div>

        <!-- texture alpha override (default .5) (.1 to 1)-->
        <div class="form-group">
            <label for="textureAlpha">Texture Alpha**</label>
            <div class="form-fields">
                <input
                    id="textureAlpha"
                    type="number"
                    disabled={!textureOverrideEnabled}
                    max={textureAlphaMax}
                    min={textureAlphaMin}
                    bind:value={itemPf.data.flags[MODULE_NAME][CONSTS.flags.textureAlpha]}
                />
                <input
                    type="range"
                    disabled={!textureOverrideEnabled}
                    max={textureAlphaMax}
                    min={textureAlphaMin}
                    step="0.05"
                    bind:value={itemPf.data.flags[MODULE_NAME][CONSTS.flags.textureAlpha]}
                />
            </div>
        </div>

        <!-- texture scale override (default 1) (.1 to 10)-->
        <div class="form-group">
            <label for="textureScale">Texture Scale**</label>
            <div class="form-fields">
                <input
                    type="number"
                    id="textureScale"
                    disabled={!textureOverrideEnabled}
                    max={textureScaleMax}
                    min={textureScaleMin}
                    bind:value={itemPf.data.flags[MODULE_NAME][CONSTS.flags.textureScale]}
                />
                <input
                    type="range"
                    disabled={!textureOverrideEnabled}
                    max={textureScaleMax}
                    min={textureScaleMin}
                    step="0.1"
                    bind:value={itemPf.data.flags[MODULE_NAME][CONSTS.flags.textureScale]}
                />
            </div>
        </div>
    </div>

    <!-- override color (same as vanilla) -->
    <div class="form-group right-me">
        <label class="checkbox">
            {localizeFull("PF1.OverrideColor")}
            <input type="checkbox" bind:checked={itemPf.data.data.measureTemplate.overrideColor} />
        </label>
    </div>

    <!-- override color options (same as vanilla) -->
    <div class="optional-border">
        <div class="form-group">
            <label for="colorOverride">{localizeFull("PF1.CustomColor")}</label>
            {#if colorOverrideEnabled}
                <div class="form-fields">
                    <input id="colorOverride" type="text" bind:value={itemPf.data.data.measureTemplate.customColor} />
                    <div class="input-border">
                        <input
                            style="opacity: {itemPf.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha]}"
                            type="color"
                            bind:value={itemPf.data.data.measureTemplate.customColor}
                        />
                    </div>
                </div>
            {:else}
                <div class="form-fields">
                    <input disabled type="text" value={currentUserColor} />
                    <div class="input-border" disabled>
                        <input
                            style="opacity: {itemPf.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha]}"
                            disabled
                            type="color"
                            value={currentUserColor}
                        />
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <!-- color alpha override (default .5) (0 to 1)-->
    <div class="form-group">
        <label for="colorAlpha">Color Alpha**</label>
        <div class="form-fields">
            <input
                type="number"
                id="colorAlpha"
                max={colorAlphaMax}
                min={colorAlphaMin}
                bind:value={itemPf.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha]}
            />
            <input
                type="range"
                max={colorAlphaMax}
                min={colorAlphaMin}
                step="0.05"
                bind:value={itemPf.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha]}
            />
        </div>
    </div>

    <!-- hide outline -->
    <div class="form-group stacked">
        <label class="checkbox">
            <input type="checkbox" bind:checked={itemPf.data.flags[MODULE_NAME][CONSTS.flags.hideOutline]} />
            <!-- todo localize -->
            Hide Outline**
        </label>

        <!-- delete at turn end -->
        <label class="checkbox">
            <input type="checkbox" bind:checked={itemPf.data.flags[MODULE_NAME][CONSTS.flags.expireAtTurnEnd]} />
            {localize("templates.deleteAtTurnEnd")}
        </label>
    </div>
    <div class="form-group">
        <button on:click={() => dispatch("cancel")}>{localize("cancel")}</button>
        <button>{localize("ok")}</button>
    </div>
</form>

<style lang="scss">
    .input-border {
        box-sizing: border-box;
        border: 1px solid black;
        border-radius: 4px;

        > * {
            border: unset !important;
            width: 100%;
        }

        &[disabled] {
            border: 1px solid #7a7971;
        }
    }

    .optional-border {
        border: 2px solid #1c6ea4;
        border-radius: 8px;
        padding: 0 0.5rem;
    }

    .right-me {
        justify-content: flex-end;
    }

    input:disabled:not([type="range"]),
    input:disabled:hover:not([type="range"]) {
        border: 1px solid #7a7971;
        box-shadow: none !important;
        color: #7a7971;
    }

    input[type="range"]:disabled:hover {
        cursor: default !important;
    }

    button {
        width: fit-content;
    }
</style>
