import { MODULE_NAME } from "../../consts";

const self = (me) => typeof me === 'function' ? me() : me;

export default (func) => {
    if (game.settings.get(MODULE_NAME, 'debug')) {
        return self(func);
    }
};
