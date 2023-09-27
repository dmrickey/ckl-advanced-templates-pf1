import { getToken, ifDebug } from '../../../utils';
import { LineTargetFromSquareEdgeBase } from './base';

export class LineFromSquareEdgeSelf extends LineTargetFromSquareEdgeBase {
    /** @override */
    async initializePlacement(itemPf) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        const token = getToken(itemPf);
        const width = Math.max(Math.round(token.document.width), 1);
        const height = Math.max(Math.round(token.document.height), 1);
        return await super.initializeLineData(token.center, width, height);
    }
}
