import { MODULE_NAME } from "./consts";

const settings = {
    client: {
        debug: {
            key: 'debug',
            name: 'Enable Debug Logging',
            hint: 'If enabled, then various log messages are logged to the console to help with debugging. Only useful when something is not working as expected.',
            type: Boolean,
            config: false,
            default: false,
        },
        outline: {
            key: 'outline',
            name: 'Show Template Outline',
            hint: 'If disabled, then the template outline will not be shown.',
            type: Boolean,
            config: false,
            default: true,
        },
        highlight: {
            key: 'highlight',
            name: 'Show Template Highlight',
            hint: 'If disabled, then the grid highlight will not be shown for templates.',
            type: Boolean,
            config: false,
            default: true,
        },
        target: {
            key: 'target',
            name: 'Target Tokens in Template',
            hint: 'If enabled, then your targeted tokens will update as you place the template.',
            type: Boolean,
            config: false,
            default: true,
        }
    },
    world: {
        cone15Alternate: {
            key: 'cone15Alternate',
            name: `Allow 15' Alternate Cone`,
            hint: `If enabled, your players can use 15' coens that originate from a grid intersection when orienting the cone left/right/up/down instead of only the standard 15' cone grid outlines (as described by normal cone placement rules but not shown as any options in the 15' template diagrams).`,
            type: Boolean,
            config: false,
            default: false,
        },
        coneRotation: {
            key: 'coneRotation',
            name: `Allow Non-Standard Cone Rotations`,
            hint: `If enabled, your players can rotate their cone spells in any direction instead of just "away from their token".`,
            type: Boolean,
            config: false,
            default: false,
        },
        useSystem: {
            key: 'useSystem',
            name: 'Allow System Template Placement',
            hint: 'If disabled, only a GM will be allowed to configure a template to use "system default". So players will only be able to configure their own spells to use the new templte placement options. If a player reconfigures a template that a GM has set to use "use system" then that setting will be lost until the GM re-updates it.',
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
    static get debug() {
        return game.settings.get(MODULE_NAME, 'debug');
    }

    static get outline() {
        return game.settings.get(MODULE_NAME, 'outline');
    }

    static get highlight() {
        return game.settings.get(MODULE_NAME, 'highlight');
    }

    static get target() {
        return game.settings.get(MODULE_NAME, 'target');
    }

    static get cone15Alternate() {
        return game.settings.get(MODULE_NAME, 'cone15Alternate');
    }

    static get coneRotation() {
        return game.settings.get(MODULE_NAME, 'coneRotation');
    }

    static get useSystem() {
        return game.settings.get(MODULE_NAME, 'useSystem');
    }
}
