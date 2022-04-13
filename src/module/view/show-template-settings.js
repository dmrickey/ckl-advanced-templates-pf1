import { TJSDialog } from '@typhonjs-fvtt/runtime/svelte/application'
import CircleSettings from './circle-settings.svelte';
import ConeSettings from './cone-settings.svelte';
import TemplateSettings from './template-settings.svelte';

const _show = (app, itemPf = {}) => {
    const dialog = Object.values(ui.windows).find(w => w.data?.content?.props?.itemPf === itemPf)
        || new TJSDialog({
            content: {
                class: TemplateSettings,
                props: {
                    itemPf,
                    TemplateApplication: app,
                }
            },
            draggable: false,
            modal: true,
            title: itemPf.name,
            // draggable: true,
            // modal: false,
            // title: itemPf.name,
            // zIndex: null,
        });

    dialog.render(true, { focus: true });
}

const showConeSettings = (itemPf = {}) => _show(ConeSettings, itemPf);
const showCircleSettings = (itemPf = {}) => _show(CircleSettings, itemPf);

export {
    showConeSettings,
    showCircleSettings,
};
