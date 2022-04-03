import { MODULE_NAME } from "../../consts";
import * as helper from '@typhonjs-fvtt/runtime/svelte/helper';

const isEmptyObject = (obj) => !Object.keys(obj).length;

const localize = (key, opts = {}) =>
    isEmptyObject(opts)
        ? game.i18n.localize(`${MODULE_NAME}.${key}`)
        : game.i18n.format(`${MODULE_NAME}.${key}`, opts);

const tLocalize = (key, opts) => helper.localize(`${MODULE_NAME}.${key}`, opts);

export {
    localize,
    tLocalize
};
