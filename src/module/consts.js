export const MODULE_NAME = 'ckl-advanced-templates-pf1';

export const CONSTS = /** @type {const} */ ({
    placement: {
        circle: {
            grid: 'grid',
            self: 'self',
            splash: 'splash',
        },
        cone: {
            selectTargetSquare: 'selectTargetSquare',
            self: 'self',
        },
        line: {
            selectTargetSquare: 'selectTargetSquare',
            self: 'self',
        },
        rect: {
            centered: 'centered',
        },
        useSystem: 'useSystem',
    },
    flags: {
        placementType: 'placementType',
        circle: {
            areaType: 'areaType',
            movesWithToken: 'movesWithToken',
        },
        cone: {
        },
        line: {
            width: 'width',
            widthOverride: 'widthOverride',
        },
        allowConeRotation: 'allowConeRotation',
        colorAlpha: 'colorAlpha',
        coneRotationAngle: 'coneRotationAngle',
        controlIconText: 'controlIconText',
        deletion: 'deletion',
        deletionInterval: 'deletionInterval',
        deletionUnit: 'deletionUnit',
        expirationTime: 'expirationTime',
        hideHighlight: 'hideHighlight',
        hideOutline: 'hideOutline',
        hidePreview: 'hidePreview',
        ignoreRange: 'ignoreRange',
        textureAlpha: 'textureAlpha',
        textureScale: 'textureScale',
    },
    areaType: {
        burst: 'burst',
        emanation: 'emanation',
        spread: 'spread',
    },
    deletionIntervals: {
        hours: 'hours',
        minutes: 'minutes',
        rounds: 'rounds',
    },
    deletionOptions: {
        doNotDelete: 'doNotDelete',
        endOfTurn: 'endOfTurn',
        timespan: 'timespan',
    },
});

export const PLACEMENT_TYPE = /** @type {const} */ ({
    SET_XY: 1,
    SET_ANGLE: 2,
});

export const ANGLE_POINTS = /** @type {const} */ ({
    OUTER_VERTEX: 1,
    EDGE_VERTEX: 2,
    VERTEX: 3,
    EDGE_MIDPOINT: 4,
    ALL: 7,

    // traditional 15' cone (exactly like diagram)
    CONE_15_TRADITIONAL: 6,

    // rules accurate, includes all point intersections
    CONE_15_ALTERNATE: 7,
});

export const FOLLOW_FROM = /** @type {const} */ ({
    CURRENT: 1,
    TOKEN: 2,
});