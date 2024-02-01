<svelte:options accessors={true} />

<script>
    import { CONSTS, MODULE_NAME } from "../consts";
    import { clamp, ifDebug, localize, localizeFull } from "../scripts/utils";

    export let updates;

    const colorAlphaMin = 0;
    const colorAlphaMax = 1;
    const textureAlphaMin = 0.1;
    const textureAlphaMax = 1;
    const textureScaleMin = 0.1;
    const textureScaleMax = 10;

    let textureOverrideEnabled;
    let colorOverrideEnabled;

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
            label: localizeFull("PF1.TimeRound"),
        },
        {
            value: CONSTS.deletionIntervals.minutes,
            label: localizeFull("PF1.TimeMinute"),
        },
        {
            value: CONSTS.deletionIntervals.hours,
            label: localizeFull("PF1.TimeHour"),
        },
    ];

    ifDebug(() => console.log("Opening shared settings for:", updates));

    $: {
        colorOverrideEnabled = updates.data.measureTemplate.overrideColor;
        durationInputEnabled =
            updates.data.flags[MODULE_NAME][CONSTS.flags.deletion] === CONSTS.deletionOptions.timespan;
        textureOverrideEnabled = updates.data.measureTemplate.overrideTexture;
    }

    const selectTexture = async () => {
        const current = updates.data.measureTemplate.customTexture;
        const picker = new FilePicker({
            type: "imagevideo",
            current,
            callback: (path) => {
                updates.data.measureTemplate.customTexture = path;
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
</script>

<!-- override texture (same as vanilla plus scale/alpha) -->
<div class="form-group right-me">
    <label class="checkbox">
        {localizeFull("PF1.OverrideTexture")}
        <input type="checkbox" bind:checked={updates.data.measureTemplate.overrideTexture} />
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
                bind:value={updates.data.measureTemplate.customTexture}
            />
            <button
                class="file-picker-button"
                disabled={!textureOverrideEnabled}
                on:click|preventDefault={selectTexture}
            >
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
                disabled={!textureOverrideEnabled}
                max={textureAlphaMax}
                min={textureAlphaMin}
                bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.textureAlpha]}
                on:input={clampTextureAlpha}
            />
            <input
                type="range"
                disabled={!textureOverrideEnabled}
                max={textureAlphaMax}
                min={textureAlphaMin}
                step="0.05"
                bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.textureAlpha]}
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
                disabled={!textureOverrideEnabled}
                max={textureScaleMax}
                min={textureScaleMin}
                bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.textureScale]}
                on:input={clampTextureScale}
            />
            <input
                type="range"
                disabled={!textureOverrideEnabled}
                max={textureScaleMax}
                min={textureScaleMin}
                step="0.1"
                bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.textureScale]}
                on:input={clampTextureScale}
            />
        </div>
    </div>
</div>

<!-- override color (same as vanilla) -->
<div class="form-group right-me">
    <label class="checkbox">
        {localizeFull("PF1.OverrideColor")}
        <input type="checkbox" bind:checked={updates.data.measureTemplate.overrideColor} />
    </label>
</div>

<!-- override color options (same as vanilla) -->
<div class="optional-border">
    <div class="form-group">
        {#if colorOverrideEnabled}
            <label for="colorOverride">{localizeFull("PF1.CustomColor")}</label>
            <div class="form-fields">
                <input id="colorOverride" type="text" bind:value={updates.data.measureTemplate.customColor} />
                <div class="color-input-border">
                    <input
                        style="opacity: {updates.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha]}"
                        type="color"
                        bind:value={updates.data.measureTemplate.customColor}
                    />
                </div>
            </div>
        {:else}
            <label for="colorOverride">{localizeFull("PLAYERS.PlayerColor")}</label>
            <div class="form-fields">
                <input disabled type="text" value={currentUserColor} />
                <div class="color-input-border" disabled>
                    <input
                        style="opacity: {updates.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha]}"
                        disabled
                        type="color"
                        value={currentUserColor}
                    />
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- color alpha override (default .5) (0 to 1) -->
<div class="form-group no-border">
    <label for="colorAlpha">{localize("templates.colorAlpha.label")}</label>
    <div class="form-fields">
        <input
            type="number"
            id="colorAlpha"
            max={colorAlphaMax}
            min={colorAlphaMin}
            bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha]}
            on:input={clampColorAlpha}
        />
        <input
            type="range"
            max={colorAlphaMax}
            min={colorAlphaMin}
            step="0.05"
            bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.colorAlpha]}
        />
    </div>
</div>

<!-- template deletion options -->
<div class="form-group column">
    <label for="colorAlpha">{localize("templates.deletion.label")}</label>
    <div class="form-group row">
        {#each deletionOptions as option}
            <label class="checkbox">
                <input
                    type="radio"
                    bind:group={updates.data.flags[MODULE_NAME][CONSTS.flags.deletion]}
                    name="deletionOptions"
                    value={option.value}
                />
                {option.label}
            </label>
        {/each}
    </div>
    <div class="form-group row">
        <label>{localizeFull("PF1.Duration")}</label>
        <input
            type="text"
            disabled={!durationInputEnabled}
            id="deletionDurationUnits"
            bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.deletionUnit]}
        />
        <select
            disabled={!durationInputEnabled}
            bind:value={updates.data.flags[MODULE_NAME][CONSTS.flags.deletionInterval]}
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
        <input type="checkbox" bind:checked={updates.data.flags[MODULE_NAME][CONSTS.flags.hideOutline]} />
        {localize("templates.hideOutline.label")}
    </label>
</div>

<style lang="scss">
    .form-group.column {
        display: flex;
        flex-direction: column;
        text-align: center;
    }

    .form-group.row {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    .file-picker-button {
        max-width: fit-content;
    }

    .form-group label {
        max-width: 35%;
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
        padding: 0 0.5rem;
    }

    .no-border {
        // this is just so that the spacing for items without a border match those that do
        border: 2px solid transparent;
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
