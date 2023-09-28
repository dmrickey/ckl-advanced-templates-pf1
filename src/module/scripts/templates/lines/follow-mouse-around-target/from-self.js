import { getToken, ifDebug } from '../../../utils';
import { LineTargetFromSquareEdgeBase } from './base';

export class LineFromSquareEdgeSelf extends LineTargetFromSquareEdgeBase {
    /** @override */
    async initializeVariables() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeVariables.name}`));

        const token = this.token;
        const width = Math.max(Math.round(token.document.width), 1);
        const height = Math.max(Math.round(token.document.height), 1);
        return await super.initializeLineData(token.center, width, height);
    }
}
