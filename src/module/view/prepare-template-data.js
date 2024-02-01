import { CONSTS, MODULE_NAME } from "../consts";

export const prepareData = (action) => {
    const flags = action.data.flags?.[MODULE_NAME];
    return {
        data: {
            measureTemplate: {
                customColor: action.data.measureTemplate.customColor || game.user.color,
                customTexture: action.data.measureTemplate.customTexture,
                overrideColor: action.data.measureTemplate.overrideColor,
                overrideTexture: action.data.measureTemplate.overrideTexture,
            },
            flags: {
                [MODULE_NAME]: {
                    [CONSTS.flags.colorAlpha]:
                        !!flags?.[CONSTS.flags.colorAlpha] || flags?.[CONSTS.flags.colorAlpha] === 0
                            ? flags?.[CONSTS.flags.colorAlpha]
                            : 0.5,
                    [CONSTS.flags.hideOutline]: !!flags?.[CONSTS.flags.hideOutline],
                    [CONSTS.flags.placementType]: flags?.[CONSTS.flags.placementType],
                    [CONSTS.flags.textureAlpha]:
                        !!flags?.[CONSTS.flags.textureAlpha] || flags?.[CONSTS.flags.textureAlpha] === 0
                            ? flags?.[CONSTS.flags.textureAlpha]
                            : 0.5,
                    [CONSTS.flags.textureScale]:
                        !!flags?.[CONSTS.flags.textureScale] || flags?.[CONSTS.flags.textureScale] === 0
                            ? flags?.[CONSTS.flags.textureScale]
                            : 1,
                    [CONSTS.flags.deletion]: flags?.[CONSTS.flags.deletion] || CONSTS.deletionOptions.doNotDelete,
                    [CONSTS.flags.deletionInterval]: flags?.[CONSTS.flags.deletionInterval] || CONSTS.deletionIntervals.rounds,
                    [CONSTS.flags.deletionUnit]: flags?.[CONSTS.flags.deletionUnit] || 0,
                },
            },
        },
    }
};
