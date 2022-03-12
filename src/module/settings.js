import { MODULE_NAME } from "./consts";

const settings = {
    client: {
        debug: {
            key: 'debug',
            name: `${MODULE_NAME}.settings.debug.name`,
            hint: `${MODULE_NAME}.settings.debug.hint`,
            type: Boolean,
            config: true,
            default: false,
        },
        target: {
            key: 'target',
            name: `${MODULE_NAME}.settings.target.name`,
            hint: `${MODULE_NAME}.settings.target.hint`,
            type: Boolean,
            config: true,
            default: true,
        },
        reExpand: {
            key: 'reExpand',
            name: `${MODULE_NAME}.settings.reExpand.name`,
            hint: `${MODULE_NAME}.settings.reExpand.hint`,
            type: Boolean,
            config: true,
            default: false,
        },
    },
    world: {
        cone15Alternate: {
            key: 'cone15Alternate',
            name: `${MODULE_NAME}.settings.cone15Alternate.name`,
            hint: `${MODULE_NAME}.settings.cone15Alternate.hint`,
            type: Boolean,
            config: false,
            default: false,
        },
        coneRotation: {
            key: 'coneRotation',
            name: `${MODULE_NAME}.settings.coneRotation.name`,
            hint: `${MODULE_NAME}.settings.coneRotation.hint`,
            type: Boolean,
            config: false,
            default: false,
        },
        useSystem: {
            key: 'useSystem',
            name: `${MODULE_NAME}.settings.useSystem.name`,
            hint: `${MODULE_NAME}.settings.useSystem.hint`,
            type: Boolean,
            config: false,
            default: false,
        },
    },
};

const initSetting = (scope) =>
    Object.keys(settings[scope])
        .map((key) => settings[scope][key])
        .forEach((setting) =>
            game.settings.register(MODULE_NAME, setting.key, {
                ...setting,
                scope,
            })
        );

/**
 * Setup module-specific settings
 */
export function registerSettings() {
    initSetting('client');
    initSetting('world');
}

export class Settings {
    static get cone15Alternate() {
        return Settings.#getSetting('cone15Alternate');
    }

    static get coneRotation() {
        return Settings.#getSetting('coneRotation');
    }

    static get debug() {
        return Settings.#getSetting('debug');
    }

    static get reExpand() {
        return Settings.#getSetting('reExpand');
    }

    static get target() {
        return Settings.#getSetting('target');
    }

    static get useSystem() {
        return Settings.#getSetting('useSystem');
    }

    static #getSetting(key) {
        return game.settings.get(MODULE_NAME, key);
    }
}
