import { ifDebug } from "../../../utils";
import circle from "./circle";

/**
 * Unused - for if you need to drop a circle directly on a target
 * @param {object} options Template creation data
 * @returns {object} The created template
 */
export default async function (options) {
    // todo
    ifDebug(() => console.log('inside _placeCircleOnToken'));
    return await circle(options);
};
