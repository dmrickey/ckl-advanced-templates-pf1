import { Settings } from "../../settings";

const self = (me) => typeof me === 'function' ? me() : me;

export default (func) => {
    if (Settings.debug) {
        return self(func);
    }
};
