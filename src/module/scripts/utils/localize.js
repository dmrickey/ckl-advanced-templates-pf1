import { MODULE_NAME } from "../../consts";
import * as helper from '@typhonjs-fvtt/runtime/svelte/helper';

const localize = (key) => game.i18n.localize(`${MODULE_NAME}.${key}`);
const localizeF = (key, opts) => game.i18n.format(`${MODULE_NAME}.${key}`, opts);

const tLocalize = (key) => helper.localize(`${MODULE_NAME}.${key}`);
const tLocalizeF = (key, opts) => helper.localize(`${MODULE_NAME}.${key}`, opts);

export {
    localize,
    localizeF,
    tLocalize,
    tLocalizeF
};
