import { AbilityTemplateFollowMouseAngleCone } from "./follow-mouse-angle-base";
import { getToken, ifDebug } from '../../utils';

export class ConeFromSelf extends AbilityTemplateFollowMouseAngleCone {
    /** @override */
    async initializePlacement(itemPf) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        const token = getToken(itemPf);
        const width = Math.max(Math.round(token.document.width), 1);
        const height = Math.max(Math.round(token.document.height), 1);
        return await super.initializeConeData(token.center, width, height);
    }
}
