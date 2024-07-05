<svelte:options accessors={true} />

<script>
    import { clamp, ifDebug, localize, localizeFull } from "../scripts/utils";
    import { CONSTS, MODULE_NAME } from "../consts";

    export let updates;

    const colorAlphaMin = 0;
    const colorAlphaMax = 1;
    const textureAlphaMin = 0.1;
    const textureAlphaMax = 1;
    const textureScaleMin = 0.1;
    const textureScaleMax = 10;

    let durationInputEnabled;
    let currentShownColor;

    const currentUserColor = game.user.color;
    const deletionOptions = [
        {
            value: CONSTS.deletionOptions.doNotDelete,
            label: localize("templates.deletion.doNotDelete"),
        },
        {
            value: CONSTS.deletionOptions.endOfTurn,
            label: localize("templates.deletion.endOfTurn"),
        },
        {
            value: CONSTS.deletionOptions.timespan,
            label: localize("templates.deletion.timespan"),
        },
    ];
    const deletionIntervalOptions = [
        {
            value: CONSTS.deletionIntervals.rounds,
            label: localizeFull("PF1.Time.Period.round.Label"),
        },
        {
            value: CONSTS.deletionIntervals.minutes,
            label: localizeFull("PF1.Time.Period.minute.Label"),
        },
        {
            value: CONSTS.deletionIntervals.hours,
            label: localizeFull("PF1.Time.Period.hour.Label"),
        },
    ];

    ifDebug(() => console.log("Opening shared settings for:", updates));

    $: {
        durationInputEnabled =
            updates.data.flags[MODULE_NAME][CONSTS.flags.deletion] === CONSTS.deletionOptions.timespan;
        currentShownColor = updates.data.measureTemplate.color || currentUserColor;
    }

    const selectTexture = async () => {
        const current = updates.data.measureTemplate.texture;
        const picker = new FilePicker({
            type: "imagevideo",
            current,
            callback: (path) => {
                updates.data.measureTemplate.texture = path;
            },
        });

        setTimeout(() => {
            try {
                picker.element[0].style.zIndex = `${Number.MAX_SAFE_INTEGER}`;
            } catch {
                // super specific catch for issue with how moulinette is overriding the default file picker
                if (picker.picker) {
                    picker.picker._element[0].style.zIndex = `${Number.MAX_SAFE_INTEGER}`;
                }
            }
        }, 100);

        await picker.browse(current);
    };

    const clampColorAlpha = () => {
        updates.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha] = clamp(
            updates.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha],
            colorAlphaMin,
            colorAlphaMax,
        );
    };
    const clampTextureAlpha = () => {
        updates.data.flags[MODULE_NAME][CONSTS.flags.textureAlpha] = clamp(
            updates.data.flags[MODULE_NAME][CONSTS.flags.textureAlpha],
            textureAlphaMin,
            textureAlphaMax,
        );
    };
    const clampTextureScale = () => {
        updates.data.flags[MODULE_NAME][CONSTS.flags.textureScale] = clamp(
            updates.data.flags[MODULE_NAME][CONSTS.flags.textureScale],
            textureScaleMin,
            textureScaleMax,
        );
    };

    const colorChanged = (e) => {
        const color = e.target.value;
        if (color === currentUserColor) {
            return;
        }

        updates.data.measureTemplate.color = color;
    };
</script>

<!-- override texture (same as vanilla plus scale/alpha) -->
<div class="form-group">
    <label for>{localize("templates.textureGroupLabel")}</label>
</div>

<!-- override texture options -->
<div class="optional-border">
    <div class="form-group">
        <label for="texture">{localizeFull("PF1.CustomTexture")}</label>
        <div class="form-fields">
            <input
                type="text"
                id="texture"
                name="measureTemplate.texture"
                bind:value={updates.data.measureTemplate.texture}
            />
            <button class="file-picker-button" type="button" on:click|preventDefault={selectTexture}>
                <i class="fas fa-file-import fa-fw" />
            </button>
        </div>
    </div>

    <!-- texture alpha override (default .5) (.1 to 1)-->
    <div class="form-group">
        <label for="textureAlpha">{localize("templates.textureAlpha.label")}</label>
        <div class="form-fields">
            <input
                id="textureAlpha"
                type="number"
                max={textureAlphaMax}
                min={textureAlphaMin}
                bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.textureAlpha]}
                name={`flags.${MODULE_NAME}.${CONSTS.flags.textureAlpha}`}
                on:input={clampTextureAlpha}
            />
            <input
                type="range"
                max={textureAlphaMax}
                min={textureAlphaMin}
                step="0.05"
                bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.textureAlpha]}
                data-edit={`flags.${MODULE_NAME}.${CONSTS.flags.textureAlpha}`}
                on:input={clampTextureAlpha}
            />
        </div>
    </div>

    <!-- texture scale override (default 1) (.1 to 10)-->
    <div class="form-group">
        <label for="textureScale">{localize("templates.textureScale.label")}</label>
        <div class="form-fields">
            <input
                type="number"
                id="textureScale"
                max={textureScaleMax}
                min={textureScaleMin}
                bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.textureScale]}
                name={`flags.${MODULE_NAME}.${CONSTS.flags.textureScale}`}
                on:input={clampTextureScale}
            />
            <input
                type="range"
                max={textureScaleMax}
                min={textureScaleMin}
                step="0.1"
                bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.textureScale]}
                data-edit={`flags.${MODULE_NAME}.${CONSTS.flags.textureScale}`}
                on:input={clampTextureScale}
            />
        </div>
    </div>
</div>

<!-- override color (same as vanilla) -->
<div class="form-group">
    <label for>{localize("templates.colorGroupLabel")}</label>
</div>

<!-- override color options (same as vanilla) -->
<div class="optional-border">
    <div class="form-group">
        <label for="colorOverride">
            {localizeFull(updates.data.measureTemplate.color ? "PF1.CustomColor" : "PLAYERS.PlayerColor")}
        </label>
        <div class="form-fields">
            <input
                bind:value={updates.data.measureTemplate.color}
                id="colorOverride"
                name="measureTemplate.color"
                placeholder={currentUserColor}
                type="text"
            />
            <div class="color-input-border">
                <input
                    on:change={colorChanged}
                    data-edit="measureTemplate.color"
                    style="opacity: {updates.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha]}"
                    type="color"
                    value={currentShownColor}
                />
            </div>
        </div>
    </div>

    <!-- color alpha override (default .5) (0 to 1) -->
    <div class="form-group">
        <label for="colorAlpha">{localize("templates.colorAlpha.label")}</label>
        <div class="form-fields">
            <input
                type="number"
                id="colorAlpha"
                max={colorAlphaMax}
                min={colorAlphaMin}
                bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha]}
                name={`flags.${MODULE_NAME}.${CONSTS.flags.colorAlpha}`}
                on:input={clampColorAlpha}
            />
            <input
                type="range"
                max={colorAlphaMax}
                min={colorAlphaMin}
                step="0.05"
                bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha]}
                data-edit={`flags.${MODULE_NAME}.${CONSTS.flags.colorAlpha}`}
            />
        </div>
    </div>
</div>

<!-- template deletion options -->
<div class="form-group radio-col-3">
    <label for="deleteOptions">{localize("templates.deletion.label")}</label>
    <div id="deleteOptions" class="form-fields">
        {#each deletionOptions as option}
            <label class="checkbox">
                <input
                    type="radio"
                    bind:group={updates.data.flags[MODULE_NAME][CONSTS.flags.deletion]}
                    name={`flags.${MODULE_NAME}.${CONSTS.flags.deletion}`}
                    value={option.value}
                />
                {option.label}
            </label>
        {/each}
    </div>
</div>
<div class="form-group input-select">
    <label for="durationInput"></label>
    <div id="deletionInput" class="form-fields">
        <input
            type="text"
            disabled={!durationInputEnabled}
            id="deletionDurationUnits"
            bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.deletionUnit]}
            name={`flags.${MODULE_NAME}.${CONSTS.flags.deletionUnit}`}
        />
        <select
            disabled={!durationInputEnabled}
            bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.deletionInterval]}
            name={`flags.${MODULE_NAME}.${CONSTS.flags.deletionInterval}`}
        >
            {#each deletionIntervalOptions as interval}
                <option value={interval.value}>
                    {interval.label}
                </option>
            {/each}
        </select>
    </div>
</div>

<div class="form-group stacked no-border">
    <!-- hide outline -->
    <label class="checkbox">
        <input
            type="checkbox"
            bind:checked={updates.data.flags[MODULE_NAME][CONSTS.flags.hideOutline]}
            name={`flags.${MODULE_NAME}.${CONSTS.flags.hideOutline}`}
        />
        {localize("templates.hideOutline.label")}
    </label>
</div>

<style lang="scss">
    input[type="color"][data-edit] {
        margin: unset;
    }

    .form-group.radio-col-3 {
        .form-fields {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
        }
    }

    .file-picker-button {
        max-width: fit-content;
    }

    .color-input-border {
        box-sizing: border-box;
        border: 1px solid #7a7971;

        > * {
            background-color: transparent;
            border: unset !important;
            width: 100%;
        }
    }

    .optional-border {
        border: 2px solid rgb(127, 143, 153);
        border-radius: 6px;
        flex: 0;
        padding: 0 0.5rem;
    }

    .no-border {
        // this is just so that the spacing for items without a border match those that do
        border: 2px solid transparent;
        padding: 0 0.5rem;
    }

    .right-me {
        align-self: flex-end !important;
        text-align: end !important;
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
