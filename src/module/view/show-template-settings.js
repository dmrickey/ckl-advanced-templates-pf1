import { TJSDialog } from '@typhonjs-fvtt/runtime/svelte/application'
import CircleSettings from './circle-settings.svelte';
import ConeSettings from './cone-settings.svelte';
import LineSettings from './line-settings.svelte';
import RectSettings from './rect-settings.svelte';
import TemplateSettings from './template-settings.svelte';

const _show = (app, action = {}) => {
    const title = action.name === game.i18n.localize('PF1.Use') || action.name === action.parent.name
        ? action.parent.name
        : `${action.parent.name} - ${action.name}`;
    const dialog = Object.values(ui.windows).find(w => w.data?.content?.props?.action === action)
        || new TJSDialog({
            content: {
                class: TemplateSettings,
                props: {
                    action,
                    TemplateApplication: app,
                }
            },
            draggable: false,
            modal: true,
            title,
            // draggable: true,
            // modal: false,
            // title: itemPf.name,
            // zIndex: null,
        });

    dialog.render(true, { focus: true });
}

const showCircleSettings = (action = {}) => _show(CircleSettings, action);
const showConeSettings = (action = {}) => _show(ConeSettings, action);
const showLineSettings = (action = {}) => _show(LineSettings, action);
const showRectSettings = (action = {}) => _show(RectSettings, action);

export {
    showCircleSettings,
    showConeSettings,
    showLineSettings,
    showRectSettings,
};
