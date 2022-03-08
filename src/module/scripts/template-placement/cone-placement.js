import { CONSTS, MODULE_NAME } from '../../consts';
import { ifDebug } from '../utils';

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
            key: CONSTS.placement.cone.selectTargetSquare,
            label: 'Originate from Selection',
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
        const currentPlacementType = this._getPlacementType();
        const deleteAtTurnEnd = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.exireAtTurnEnd);
        const ok = 'Ok';

        const dialogResult = await warpgate.menu({
            inputs: [
                { type: 'info', label: `Select placement type for this ${this.itemPf.type}` },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.cone.self].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.cone.self].key] },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.cone.selectTargetSquare].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.cone.selectTargetSquare].key] },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.useSystem].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.useSystem].key] },
                { type: 'checkbox', label: 'Delete Template at end of turn', options: !!deleteAtTurnEnd },
            ],
            buttons: [
                {
                    label: ok,
                    value: ok,
                },
                {
                    label: 'Cancel'
                },
            ],
        }, {
            title: `${this.itemPf.data.name} Template`,
        });

        ifDebug(() => console.log('cone dialogResult', dialogResult));

        const { buttons: confirmed } = dialogResult;

        if (confirmed) {
            const [_, self, selectTargetSquare, useSystem, deleteAtTurnEndResult] = dialogResult.inputs;
            const chosenPlacement = this._getPlacementForLabel(selectTargetSquare || self || useSystem);
            const flags = {
                [MODULE_NAME]: {
                    [CONSTS.flags.placementType]: chosenPlacement,
                    [CONSTS.flags.exireAtTurnEnd]: !!deleteAtTurnEndResult,
                }
            };
            await this.itemPf.update({ flags });
        }

        return !!confirmed;
    }

    _getSize() {
        const rollData = this.itemPf.actor._rollData;
        return typeof this.itemPf.data.data.measureTemplate.size === 'string'
            ? RollPF.safeTotal(this.itemPf.data.data.measureTemplate.size, rollData)
            : game.pf1.utils.convertDistance(this.itemPf.data.data.measureTemplate.size)[0];
    }

    _getPlacementForLabel = (label) => {
        for (const placementTypeKey in this._placementTypes) {
            const placement = this._placementTypes[placementTypeKey];
            if (placement.label === label) {
                return placement.key;
            }
        }
        return this._placementTypes[CONSTS.placement.cone.self].key;
    };

    _getPlacementType = () => {
        const placementType = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.placementType);
        return placementType || this._placementTypes[CONSTS.placement.cone.self].key;
    };
}
