import { AbilityTemplateFollowMouseAngleCone } from "./follow-mouse-angle-base";
import { getToken, ifDebug } from '../../utils';

export class ConeFromSelf extends AbilityTemplateFollowMouseAngleCone {
    /** @override */
    async initializeVariables() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeVariables.name}`));

        const token = this.token;
        const width = Math.max(Math.round(token.document.width), 1);
        const height = Math.max(Math.round(token.document.height), 1);
        return await super.initializeConeData(token.center, width, height);
    }
}
