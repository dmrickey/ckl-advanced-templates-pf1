import { MODULE_NAME } from "./consts";

const keys = {
    cone15Alternate: 'cone15Alternate',
    coneRotation: 'coneRotation',
    debug: 'debug',
    migrationVersion: 'migrationVersion',
    reExpand: 'reExpand',
    target: 'target',
    useSystem: 'useSystem',
};

const settings = {
    [keys.debug]: {
        config: true,
        default: false,
        type: Boolean,
        scope: 'client',
    },
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
    [keys.useSystem]: {
        config: false,
        default: false,
        type: Boolean,
        scope: 'world',
    },
    [keys.migrationVersion]: {
        config: false,
        default: 1,
        type: Number,
        scope: 'world',
    }
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
     */
    static get cone15Alternate() {
        return Settings.#getSetting(keys.cone15Alternate);
    }

    /**
     * GM: Gets the degrees the user are allowed to rotate a cone
     */
    static get coneRotation() {
        return Settings.#getSetting(keys.coneRotation);
    }

    /**
     * User: displays extra console logs that I placed during development
     */
    static get debug() {
        return Settings.#getSetting(keys.debug);
    }

    static get migrationVersion() {
        return Settings.#getSetting(keys.migrationVersion);
    }

    static set migrationVersion(version) {
        game.settings.set(MODULE_NAME, keys.migrationVersion, version);
    }

    /**
     * User: automatically re-expand collapsed sheets after placing a template
     */
    static get reExpand() {
        return Settings.#getSetting(keys.reExpand);
    }

    /**
     * User: automatically target tokens when placing a template
     */
    static get target() {
        return Settings.#getSetting(keys.target);
    }

    /**
     * GM: allows user to use the "use system" option (currently unused)
     */
    static get useSystem() {
        return Settings.#getSetting(keys.useSystem);
    }

    static #getSetting(key) {
        return game.settings.get(MODULE_NAME, key);
    }
}
