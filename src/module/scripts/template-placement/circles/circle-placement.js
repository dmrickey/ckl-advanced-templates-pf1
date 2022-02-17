import placeCircle from "./placements/circle";
import placeCircleSelf from "./placements/circle-self";
import placeCircleTarget from "./placements/circle-target";
import { MODULE_NAME } from '../../../consts';
import { ifDebug } from "../../utils";

export class CirclePlacement {
    // burst, emanation, or spread
    // target / creature
    //   OR system default

    // emanation or burst "centered on you" spreads from edge - not center

    static placementKey = 'circlePlacement'; // 'grid', 'self', 'token', 'useDefault'
    static areaTypeKey = 'circleAreaType'; // 'burst', 'emanation', 'spread'
    static movesWithTokenKey = 'circleMovesWithTokenKey'; // true/false

    constructor(itemPf) {
        this.itemPf = itemPf;
    }

    placementTypes = {
        grid: {
            key: 'grid',
            label: `Select Grid Placement`,
            function: async (options) => await placeCircle(options),
        },
        self: {
            key: 'self',
            label: `Centered on You`,
            function: async (options) => await placeCircleSelf(options, this.itemPf),
        },
        token: {
            key: 'token',
            label: `Centered on Target`,
            function: async (options) => await placeCircleTarget(options),
        },
        useDefault: {
            key: 'useDefault',
            label: 'Use System Default',
            function: async (_options, wrapped) => {
                const defaultTemplateResult = await wrapped();
                if (defaultTemplateResult.result) {
                    return defaultTemplateResult;
                }
            }
        },

        // if no flag is set
        [undefined]: {
            function: async (options) => await placeCircle(options),
        },
    };

    _findPlacementByLabel = (label) => {
        for (const placementKey in this.placementTypes) {
            const placement = this.placementTypes[placementKey];
            if (placement.label === label) {
                return placement;
            }
        }
        return undefined;
    }

    async createCurrentTemplate(options, wrapped) {
        const getHandler = (key) => this.placementTypes[key] || this.placementTypes[undefined];
        const handler = getHandler(this.itemPf.getFlag(MODULE_NAME, CirclePlacement.placementKey));
        return await handler.function(options, wrapped);
    }

    async showPlacementMenu() {
        const areaType = this._getAreaType();
        const currentPlacementType = this._getPlacementType();
        const movesWithToken = this.itemPf.getFlag(MODULE_NAME, CirclePlacement.movesWithTokenKey);

        const ok = 'Ok';

        const dialogResult = await warpgate.menu({
            inputs: [
                { type: 'info', label: `Select placement type for this ${this.itemPf.type}` },
                { type: 'radio', label: this.placementTypes.grid.label, options: ['placementType', currentPlacementType === this.placementTypes.grid.key] },
                { type: 'radio', label: this.placementTypes.self.label, options: ['placementType', currentPlacementType === this.placementTypes.self.key] },
                // { type: 'radio', label: this.placementTypes.token.label, options: ['placementType', currentPlacementType === this.placementTypes.token.key] },
                { type: 'radio', label: this.placementTypes.useDefault.label, options: ['placementType', currentPlacementType === this.placementTypes.useDefault.key] },
                { type: 'info', label: '<hr style="width: 100%;" />' },
                { type: 'info', label: 'Select effect type' },
                { type: 'radio', label: 'Burst', options: ['areaType', areaType === 'burst'] },
                { type: 'radio', label: 'Spread', options: ['areaType', areaType === 'spread'] },
                { type: 'radio', label: 'Emanation', options: ['areaType', areaType === 'emanation'] },
                // { type: 'checkbox', label: 'Attach to Token', options: !!movesWithToken }, // todo
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

        ifDebug(() => console.log('circle dialogResult', dialogResult));
        // todo - if "centered on token" selected, pop up modal saying you'll have to update the placment from the Item's details page with confirm/cancel

        const { buttons: confirmed } = dialogResult;

        if (confirmed) {
            const [_, grid, self, useDefault, __, ___, burstResult, spreadResult, emanationResult, movesWithTokenResult] = dialogResult.inputs;
            const chosenPlacement = this._findPlacementByLabel(grid || self || useDefault);
            const flags = {
                [MODULE_NAME]: {
                    [CirclePlacement.placementKey]: chosenPlacement?.key,
                    [CirclePlacement.areaTypeKey]: (burstResult || spreadResult || emanationResult || '').toLowerCase(),
                    [CirclePlacement.movesWithTokenKey]: !!movesWithTokenResult,
                }
            }
            await this.itemPf.update({ flags });
        }

        return !!confirmed;
    }

    _getAreaType = () => {
        let areaType = this.itemPf.getFlag(MODULE_NAME, CirclePlacement.areaTypeKey);
        if (areaType) {
            return areaType;
        }

        const spellArea = this.itemPf.data.data.spellArea?.toLowerCase() ?? '';
        areaType = 'burst';
        if (spellArea.includes('emanat')) {
            areaType = 'emanation';
        }
        else if (spellArea.includes('spread')) {
            areaType = 'spread';
        }

        return areaType;
    }

    _getPlacementType = () => {
        const placementType = this.itemPf.getFlag(MODULE_NAME, CirclePlacement.placementKey);
        return placementType || this.placementTypes.grid.key;
    }
}
