import { deleteTemplatesForToken, moveTemplatesToToken } from './scripts/sync-templates-to-token.js';
import { DurationTracker } from './scripts/duration-tracker.js';
import { initMeasuredTemplate } from './scripts/measured-template-pf-advanced';
import { MODULE_NAME } from './consts';
import { registerSettings } from './settings.js';
import injectTemplateSelector from './scripts/template-selector-injector';
import migrateIfNeeded from './scripts/migration';
import promptMeasureTemplate from './scripts/template-placement/';

// Initialize module
Hooks.once('init', async () => {
    console.log('ckl-advanced-templates-pf1 | Initializing ckl-advanced-templates-pf1');

    registerSettings();
});

// When ready
Hooks.once('ready', async () => {
    Hooks.on('renderItemActionSheet', injectTemplateSelector);

    DurationTracker.init();
});

Hooks.once('pf1.postReady', () => {
    if (!game.pf1.isMigrating) {
        migrateIfNeeded();
    }
    else {
        Hooks.once('pf1.migrationFinished', migrateIfNeeded);
    }
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

Hooks.on('updateToken', async (token, update, _options, _userId) => {
    if (!update?.hasOwnProperty('x') && !update?.hasOwnProperty('y')) {
        return;
    }

    const gm = game.pf1.utils.getFirstActiveGM();
    const isFirstGM = game.user === gm;

    if (isFirstGM || (!gm && game.user.id === _userId)) {
        await moveTemplatesToToken(token);
    }
});

Hooks.on('deleteToken', async (token, _options, _userId) => {
    const gm = game.pf1.utils.getFirstActiveGM();
    const isFirstGM = game.user === gm;

    if (isFirstGM || (!gm && game.user.id === _userId)) {
        await deleteTemplatesForToken(token);
    }
});
