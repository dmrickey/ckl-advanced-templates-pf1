<svelte:options accessors={true} />

<script>
    import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store";
    import { getContext } from "svelte";
    import { CONSTS, MODULE_NAME } from "../consts";
    import { localize, tLocalize } from "../scripts/utils";
    import * as helper from "@typhonjs-fvtt/runtime/svelte/helper";

    export let itemPf;

    const colorAlphaMin = 0;
    const colorAlphaMax = 1;
    const textureAlphaMin = 0.1;
    const textureAlphaMax = 1;
    const textureScaleMin = 0.1;
    const textureScaleMax = 10;

    let textureOverrideEnabled;
    let colorOverrideEnabled;

    $: {
        colorOverrideEnabled = itemPf.data.data.measureTemplate.overrideColor;
        textureOverrideEnabled = itemPf.data.data.measureTemplate.overrideTexture;
    }

    function setDefault() {}
</script>

<form class="pf1">
    <!-- override texture (same as vanilla plus scale/alpha) -->
    <div class="form-group right-me">
        <label class="checkbox">
            {helper.localize("PF1.OverrideTexture")}
            <input type="checkbox" bind:checked={itemPf.data.data.measureTemplate.overrideTexture} />
        </label>
    </div>

    <!-- override texture options -->
    <div class="bordered">
        <div class="form-group">
            <label for="customTexture">
                {helper.localize("PF1.CustomTexture")}
            </label>
            <div class="form-fields">
                <input
                    type="text"
                    disabled={!textureOverrideEnabled}
                    id="customTexture"
                    value={itemPf.data.data.measureTemplate.customTexture}
                />
                <button disabled={!textureOverrideEnabled}>
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
            {helper.localize("PF1.OverrideColor")}
            <input type="checkbox" bind:checked={itemPf.data.data.measureTemplate.overrideColor} />
        </label>
    </div>

    <!-- override color options (same as vanilla) -->
    <div class="bordered">
        <div class="form-group">
            <label for="colorOverride">{helper.localize("PF1.CustomColor")}</label>
            <div class="form-fields">
                <input
                    id="colorOverride"
                    disabled={!colorOverrideEnabled}
                    type="text"
                    bind:value={itemPf.data.data.measureTemplate.customColor}
                />
                <input
                    disabled={!colorOverrideEnabled}
                    type="color"
                    bind:value={itemPf.data.data.measureTemplate.customColor}
                />
            </div>
        </div>
    </div>

    <!-- texture alpha override (default .5) (0 to 1)-->
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
            {tLocalize("templates.deleteAtTurnEnd")}
        </label>
    </div>
</form>

<style>
    .bordered {
        border: 5px solid #1c6ea4;
        border-radius: 14px;
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
