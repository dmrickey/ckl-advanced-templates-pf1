import { AbilityTemplateFollowMouseAngleCone } from "./follow-mouse-angle-base";
import { getToken, ifDebug } from '../../utils';

export class AbilityTemplateConeSelf extends AbilityTemplateFollowMouseAngleCone {
    /** @override */
    async initializePlacement(itemPf) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        const token = getToken(itemPf);
        const width = Math.max(Math.round(token.document.width), 1);
        const height = Math.max(Math.round(token.document.height), 1);
        await super.initializeConeData(token.center, width, height);
        return true;
    }
}
