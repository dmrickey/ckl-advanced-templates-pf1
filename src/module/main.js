import { MODULE_NAME } from './consts.js';
import { patchPixiRoundedRect } from './patch/pixi-rounded-rect.js';
import './patch/v13-window-size-patch.js';
import { DurationTracker } from './scripts/duration-tracker.js';
import migrateIfNeeded from './scripts/migration/index.js';
import { deleteTemplatesForToken, getTemplatesAttachedToToken, moveTemplatesToToken } from './scripts/sync-templates-to-token.js';
import { addSkipRangeToDialog, promptMeasureTemplate } from './scripts/template-placement/index.js';
import { destroyTemplateSelector, injectTemplateSelector } from './scripts/template-selector-injector/index.js';
import { initTemplates } from './scripts/templates/index.js';
import { handleSingleOwner } from './scripts/utils/active-gm.js';
import { patchWalledTemplates } from './scripts/walled-templates/patch.js';
import { registerSettings } from './settings.js';

// Initialize module
Hooks.once('init', async () => {
    console.log('ckl-advanced-templates-pf1 | Initializing ckl-advanced-templates-pf1');

    registerSettings();
});

// When ready
Hooks.once('ready', async () => {
    Hooks.on('renderItemActionSheet', injectTemplateSelector);
    Hooks.on('closeItemActionSheet', destroyTemplateSelector);

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

    Hooks.on('renderApplication', addSkipRangeToDialog);
    libWrapper.register(MODULE_NAME, 'pf1.actionUse.ActionUse.prototype.promptMeasureTemplate', promptMeasureTemplate, 'OVERRIDE');

    Hooks.on('canvasReady', () => {
        canvas.templates.placeables.forEach((template) => {
            template.highlightGrid();
        });
    });
});

Hooks.on('init', () => {
    libWrapper.register(MODULE_NAME, 'pf1.components.ItemAction.defineSchema', (wrapped) => {
        const schema = wrapped();
        if (!schema.flags) {
            schema.flags = new foundry.data.fields.ObjectField({ required: false, initial: {} });
        }
        return schema;
    }, 'WRAPPER');

    patchPixiRoundedRect();
});

Hooks.on('updateToken', async (token, update, _options, userId) => {
    const hasX = update?.hasOwnProperty('x');
    const hasY = update?.hasOwnProperty('y');
    if (!hasX && !hasY) return;

    const templates = getTemplatesAttachedToToken(update._id);
    if (!templates.length) return;

    update.x ||= token.x;
    update.y ||= token.y;
    const position = token.object.getCenterPoint(update);
    position.id = update._id;

    const moveTemplate = setInterval(() => {
        templates.forEach((template) => {
            const temp = token.object.getCenterPoint();
            template.x = temp.x;
            template.y = temp.y;
        });
    }, 10);
    token.object?.movementAnimationPromise?.then(async () => {
        clearInterval(moveTemplate);
        await handleSingleOwner(userId, async () => moveTemplatesToToken(position));
    });
});

Hooks.on('deleteToken', async (token, _options, userId) =>
    await handleSingleOwner(userId, async () => deleteTemplatesForToken(token.id)));

// patchWalledTemplates();
