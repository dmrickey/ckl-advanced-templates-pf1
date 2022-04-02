import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';
import ConeSettingsShell from './cone-settings-shell.svelte';

export default class ConeSettings extends SvelteApplication {
    constructor(itemPf, options = {}, dialogData = {}) {
        super({
            title: `${itemPf.name}`,
            zIndex: 200,
            svelte: {
                class: ConeSettingsShell,
                target: document.body,
                props: {
                    itemPf
                },
            },
            close: options.reject(),
            ...options,
        }, dialogData);

        this.hookId = Hooks.on('updateItem', (changedItem) => {
            if (changedItem !== itemPf) {
                return;
            }

            setTimeout(() => {
                this.svelte.applicationShell.initData();
            }, 100);
        });
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            closeOnSubmit: false,
            width: 350,
            height: "auto",
            classes: ["dialog"]
        })
    }

    static getActiveApp(itemPf) {
        return Object.values(ui.windows).find(app => app instanceof this && app?.itemPF === itemPf);
    }

    static async show({ itemPf } = {}, options = {}, dialogData = {}) {
        const app = this.getActiveApp(itemPf)
        if (app) {
            return app.render(false, { focus: true });
        }

        return new Promise((resolve, reject) => {
            options.resolve = resolve;
            options.reject = reject;
            new this(itemPf, options, dialogData).render(true, { focus: true });
        });
    }

    /** @inheritDoc */
    async close(options) {
        Hooks.off('updateItem', this.hookId);
        return super.close(options);
    }
}
