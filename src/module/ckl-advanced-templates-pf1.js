import { registerSettings } from './settings.js';

import { MODULE_NAME } from './consts';
import promptMeasureTemplate from './scripts/template-placement/';
import injectTemplateSelector from './scripts/template-selector-injector';
import { initMeasuredTemplate } from './scripts/measured-template-pf-advanced';
import { DurationTracker } from './scripts/duration-tracker.js';
import { deleteTemplatesForToken, moveTemplatesToToken } from './scripts/sync-templates-to-token.js';

// Initialize module
Hooks.once('init', async () => {
    console.log('ckl-advanced-templates-pf1 | Initializing ckl-advanced-templates-pf1');

    registerSettings();
});

// When ready
Hooks.once('ready', async () => {
    Hooks.on('renderItemSheetPF', injectTemplateSelector);

    DurationTracker.init();
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
    // eslint-disable-next-line
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
