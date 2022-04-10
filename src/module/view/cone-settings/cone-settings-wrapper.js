import { TJSDialog } from '@typhonjs-fvtt/runtime/svelte/application'
import ConeSettings from './cone-settings.svelte';

const show = ({ itemPf = {} }) => {
    const dialog = Object.values(ui.windows).find(w => w.data?.content?.props?.itemPf === itemPf)
        || new TJSDialog({
            content: {
                class: ConeSettings,
                props: { itemPf }
            },
            // draggable: false,
            // modal: true,
            // title: itemPf.name,

            draggable: true,
            modal: false,
            title: itemPf.name,
            zIndex: null,
        });

    dialog.render(true, { focus: true });
}

export default {
    show,
};
