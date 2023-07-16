import { deleteTemplatesForToken, moveTemplatesToToken } from './scripts/sync-templates-to-token.js';
import { DurationTracker } from './scripts/duration-tracker.js';
import { handleSingleOwner } from './scripts/utils/active-gm.js';
import { initTemplates } from './scripts/templates';
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

Hooks.once('pf1PostReady', () => {
    if (!pf1.migrations.isMigrating) {
        migrateIfNeeded();
    }
    else {
        Hooks.once('pf1MigrationFinished', migrateIfNeeded);
    }
});

Hooks.on('pf1PostInit', () => {
    initTemplates();

    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.promptMeasureTemplate', promptMeasureTemplate, 'MIXED');

    Hooks.on('canvasReady', () => {
        canvas.templates.placeables.forEach((template) => {
            template.highlightGrid();
        });
    });
});

Hooks.on('updateToken', async (token, update, _options, userId) => {
    if (update?.hasOwnProperty('x') || update?.hasOwnProperty('y')) {
        await handleSingleOwner(userId, async () => moveTemplatesToToken(token));
    }
});

Hooks.on('deleteToken', async (token, _options, userId) =>
    await handleSingleOwner(userId, async () => deleteTemplatesForToken(token)));
