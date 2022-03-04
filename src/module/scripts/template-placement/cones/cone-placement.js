import { CONSTS, MODULE_NAME } from '../../../consts';

export class ConePlacement {
    constructor(itemPf) {
        this.itemPf = itemPf;
    }

    _placementTypes = {
        [CONSTS.placement.cone.self]: {
            key: CONSTS.placement.cone.self,
            label: 'Originate from Caster',
        },
        [CONSTS.placement.cone.selectTargetSquare]: {
            key: CONSTS.placement.cone.self,
            label: 'Originate from Selection',
        },
        [CONSTS.placement.cone.alt15]: {
            key: CONSTS.placement.cone.self,
            label: `Alternate 15' Cone`,
        },
        [CONSTS.placement.useSystem]: {
            key: CONSTS.placement.useSystem,
            label: 'Use System Default',
        },
    };

    /**
     * Shows the menu, saves the result, then returns the result
     *
     * @returns {bool} True if a placement type was selected, false if it was canceled.
     */
    async showPlacementMenu() {
        const is15Feet = this._getSize() === 15;
        const showAlternateOption = is15Feet && false; // && read from settings to get if alternative is allowed

        const makeButton = ({ key: value, label }) => ({ label, value });

        const buttons = [];
        buttons.push(makeButton(this._placementTypes[CONSTS.placement.cone.self]));
        if (showAlternateOption) {
            buttons.push(makeButton(this._placementTypes[CONSTS.placement.cone.alt15]));
        }
        buttons.push(makeButton(this._placementTypes[CONSTS.placement.cone.selectTargetSquare]));
        buttons.push(makeButton(this._placementTypes[CONSTS.placement.useSystem]));
        buttons.push({
            label: 'Cancel'
        });

        const dialogResult = await warpgate.menu({
            inputs: [{ type: 'info', label: `Select placement type for this ${this.itemPf.type}` }],
            buttons,
        }, {
            title: `${this.itemPf.data.name} Template`,
        });

        const { buttons: placementType } = dialogResult;

        if (placementType) {
            await this.itemPf.setFlag(MODULE_NAME, CONSTS.flags.placementType, placementType);
        }

        return !!placementType;
    }

    _getSize() {
        const rollData = this.itemPf.actor._rollData;
        return typeof this.itemPf.data.data.measureTemplate.size === 'string'
            ? RollPF.safeTotal(this.itemPf.data.data.measureTemplate.size, rollData)
            : game.pf1.utils.convertDistance(this.itemPf.data.data.measureTemplate.size)[0];
    }
}
