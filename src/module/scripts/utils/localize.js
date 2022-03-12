import { MODULE_NAME } from "../../consts";

const localize = (key) => game.i18n.localize(`${MODULE_NAME}.${key}`);
const localizeF = (key, opts) => game.i18n.format(`${MODULE_NAME}.${key}`, opts);

export {
    localize,
    localizeF,
};
