import { TJSDialog } from '#runtime/svelte/application';
import HintDialog from './hint-dialog.svelte';

export default class HintHandler {
    static #dialog = null;

    static show({ title, hint }) {
        if (HintHandler.#dialog === null) {
            this.#dialog = new TJSDialog({
                title,
                content: {
                    class: HintDialog,
                    props: { hint }
                },
            }, {
                headerButtonNoClose: true,
                width: 'min-content',
                top: 100,
                left: 100,
            }).render(true, { focus: true });
        }
        else {
            this.#dialog.svelte.dialogComponent.hint = hint;
        }
    }

    static close() {
        this.#dialog?.close();
        this.#dialog = null;
    }
}
