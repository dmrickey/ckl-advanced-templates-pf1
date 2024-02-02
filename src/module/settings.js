import { MODULE_NAME } from "./consts";

const keys = {
    cone15Alternate: 'cone15Alternate',
    coneRotation: 'coneRotation',
    debug: 'debug',
    defaultLineWidth: 'defaultLineWidth',
    disableHints: 'disableHints',
    migrationVersion: 'migrationVersion',
    reExpand: 'reExpand',
    target: 'target',
};

const settings = {
    [keys.target]: {
        config: true,
        default: true,
        type: Boolean,
        scope: 'client',
    },
    [keys.reExpand]: {
        config: true,
        default: false,
        type: Boolean,
        scope: 'client',
    },
    [keys.cone15Alternate]: {
        config: true,
        default: false,
        type: Boolean,
        scope: 'world',
    },
    [keys.coneRotation]: {
        config: true,
        default: 0,
        type: Number,
        scope: 'world',
    },
    [keys.debug]: {
        config: true,
        default: false,
        type: Boolean,
        scope: 'client',
    },
    [keys.defaultLineWidth]: {
        config: true,
        default: 5,
        type: Number,
        scope: 'client',
        range: {
            min: .1,
            max: 5,
            step: .1
        },
    },
    [keys.disableHints]: {
        config: true,
        default: false,
        type: Boolean,
        scope: 'client',
    },
    [keys.migrationVersion]: {
        config: false,
        default: 0,
        type: Number,
        scope: 'world',
    },
};

const initSettings = () =>
    Object.keys(settings)
        .forEach((key) => {
            game.settings.register(MODULE_NAME, key, {
                name: `${MODULE_NAME}.settings.${key}.name`,
                hint: `${MODULE_NAME}.settings.${key}.hint`,
                ...settings[key],
            })
        });

/**
 * Setup module-specific settings
 */
export function registerSettings() {
    initSettings();
}

export class Settings {
    /**
     * GM: allows users to place cones per the rules text in addition to the rules picture
     *
     * @returns {boolean} True if alternate cone placement is allowed
     */
    static get cone15Alternate() {
        return Settings.#getSetting(keys.cone15Alternate);
    }

    /**
     * GM: Gets the degrees the user are allowed to rotate a cone
     *
     * @returns {number} Degrees for cone rotation offset
     */
    static get coneRotation() {
        return Settings.#getSetting(keys.coneRotation);
    }

    /**
     * User: displays extra console logs that I placed during development
     *
     * @returns {boolean} True if debug logging is enabled
     */
    static get debug() {
        return Settings.#getSetting(keys.debug);
    }

    /**
     * User: default width for line templates
     *
     * @returns {number} Width for line templates
     */
    static get defaultLineWidth() {
        return Settings.#getSetting(keys.defaultLineWidth);
    }

    /**
     * User: disables template placement hints
     *
     * @returns {boolean} True if hints are disabled
     */
    static get disableHints() {
        return Settings.#getSetting(keys.disableHints);
    }

    static get migrationVersion() {
        return Settings.#getSetting(keys.migrationVersion);
    }

    static set migrationVersion(version) {
        game.settings.set(MODULE_NAME, keys.migrationVersion, version);
    }

    /**
     * User: automatically re-expand collapsed sheets after placing a template
     *
     * @returns {boolean} True if windows should re-expand after placing a template
     */
    static get reExpand() {
        return Settings.#getSetting(keys.reExpand);
    }

    /**
     * User: automatically target tokens when placing a template
     *
     * @returns {boolean} True if tokens should automatically be targeted when placing a template
     */
    static get target() {
        return Settings.#getSetting(keys.target);
    }

    static #getSetting(key) {
        return game.settings.get(MODULE_NAME, key);
    }
}
