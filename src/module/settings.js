const registerClientSettings = () => {
    game.settings.register('myModule', 'myClientSetting', {
        name: 'Register a Module Setting with Choices',
        hint: 'A description of the registered setting and its behavior.',
        scope: 'client',     // This specifies a client-stored setting
        config: false,        // This specifies that the setting appears in the configuration view
        type: String,
        choices: {           // If choices are defined, the resulting setting will be a select menu
            a: 'Option A',
            b: 'Option B'
        },
        default: 'a',        // The default value for the setting
        onChange: (value) => { // A callback function which triggers when the setting is changed
            console.log(value);
        }
    });
};

const registerWorldSettings = () => {
    game.settings.register('myModule', 'myWorldSetting', {
        name: 'Register a Module Setting with a Range slider',
        hint: 'A description of the registered setting and its behavior.',
        scope: 'world',      // This specifies a world-level setting
        config: false,        // This specifies that the setting appears in the configuration view
        type: Number,
        range: {             // If range is specified, the resulting setting will be a range slider
            min: 0,
            max: 100,
            step: 10
        },
        default: 50,         // The default value for the setting
        onChange: (value) => { // A callback function which triggers when the setting is changed
            console.log(value);
        }
    });
};

/**
 * Setup module-specific settings
 */
export function registerSettings() {
    registerClientSettings();
    registerWorldSettings();
}
