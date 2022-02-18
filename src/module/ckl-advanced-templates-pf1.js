/**
 * This is your JavaScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module.
 */

// Import JavaScript modules
import { registerSettings } from './settings.js';
import { preloadTemplates } from './preloadTemplates.js';

import { MODULE_NAME } from './consts';
import ifDebug from './scripts/utils/if-debug';
import promptMeasureTemplate from './scripts/template-placement/';
import injectTemplateSelector from './scripts/template-selector-injector';
import { initMeasuredTemplate } from './scripts/measured-template-pf-advanced';

// Initialize module
Hooks.once('init', async () => {
    console.log('ckl-advanced-templates-pf1 | Initializing ckl-advanced-templates-pf1');

    // Assign custom classes and constants here

    // Register custom module settings
    registerSettings();

    // Preload Handlebars templates
    await preloadTemplates();

    // Register custom sheets (if any)
});

// Setup module
Hooks.once('setup', async () => {
    // Do anything after initialization but before
    // ready
});

// When ready
Hooks.once('ready', async () => {
    // Do anything once the module is ready
});

// Add any additional hooks if necessary
Hooks.on('pf1.postInit', () => {
    initMeasuredTemplate();
    libWrapper.register(MODULE_NAME, 'game.pf1.ItemAttack.promptMeasureTemplate', promptMeasureTemplate, 'MIXED');

    Hooks.on('canvasReady', () => {
        canvas.templates.placeables.forEach((template) => {
            template.highlightGrid();
        });
    });
});

Hooks.on('renderItemSheetPF', injectTemplateSelector);
