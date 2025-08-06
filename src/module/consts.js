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
        rect: {
            height: 'height',
        },
        colorAlpha: 'colorAlpha',
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
    /** if more than 1x1 square, then only use the outermost vertexes */
    OUTER_VERTEX: 1,
    /** use all grid vertexes, even if that means grid vertexes in the center of an edge */
    EDGE_VERTEX: 2,
    /** 1 | 2 */
    VERTEX: 3,
    /** All grid midpoints along the square's edge */
    EDGE_MIDPOINT: 4,
    ALL: 7,

    /** traditional 15' cone (exactly like diagram) */
    CONE_15_TRADITIONAL: 5,

    /** rules accurate 15' cone, includes all grid point intersections */
    CONE_15_ALTERNATE: 7,

    /** Essentially the same as a rules accurate 15' cone. This allows larger cones to start from an edge midpoint */
    CONE_FROM_MIDPOINT_AND_VERTEX: 7,
});

export const ANGLE_ORIGIN = /** @type {const} */ ({
    NONE: 0,
    CURRENT: 1,
    TOKEN: 2,
});

export const ROTATION_TYPE = /** @type {const} */ ({
    NONE: 0,
    ADVANCED_TEMPLATES: 1,
    SYSTEM: 2,
});
