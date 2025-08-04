import { ANGLE_POINTS } from '../../consts';
import { isSet } from '../utils/bits';

export class GridSquare {
    #x;
    #y;
    #h;
    #w;

    #heightSquares;
    #widthSquares;

    get x() { return this.#x; }
    get y() { return this.#y; }

    /**
     * Height in grid px
     * @returns {number}
     */
    get h() { return this.#h; }
    /**
     * Width in grid px
     * @returns {number}
     */
    get w() { return this.#w; }

    /**
     * Height in grid squares
     * @returns {number}
     */
    get heightSquares() { return this.#heightSquares; }
    /**
     * Width in grid squares
     * @returns {number}
     */
    get widthSquares() { return this.#widthSquares; }

    get center() {
        const x = this.#x + this.#widthSquares * canvas.grid.sizeX / 2;
        const y = this.#y + this.#heightSquares * canvas.grid.sizeY / 2;
        return { x, y };
    }

    #adjacent;
    get adjacentSquares() { return this.#adjacent ??= this.#initAdjacent(); }

    #initAdjacent() {
        const bottom = this.#y + this.#h;
        const left = this.#x;
        const top = this.#y;
        const right = this.#x + this.#w;
        const heightSpots = this.#heightSquares;
        const widthSpots = this.#widthSquares;

        const gridSizeX = canvas.grid.sizeX;
        const gridSizeY = canvas.grid.sizeY;

        const rightSpots = [...new Array(widthSpots)].map((_, i) => ({
            direction: 0,
            x: right,
            y: top + gridSizeY * i,
        }));
        const bottomRight = {
            direction: 45,
            x: right,
            y: bottom,
        };
        const bottomSpots = [...new Array(heightSpots)].map((_, i) => ({
            direction: 90,
            x: right - gridSizeX * i,
            y: bottom,
        }));
        const bottomLeft = {
            direction: 135,
            x: left - gridSizeX,
            y: bottom,
        };
        const leftSpots = [...new Array(widthSpots)].map((_, i) => ({
            direction: 180,
            x: left - gridSizeX,
            y: bottom - gridSizeY * i,
        }));
        const topLeft = {
            direction: 225,
            x: left - gridSizeX,
            y: top - gridSizeY,
        };
        const topSpots = [...new Array(heightSpots)].map((_, i) => ({
            direction: 270,
            x: left + gridSizeX * i,
            y: top - gridSizeY,
        }));
        const topRight = {
            direction: 315,
            x: right,
            y: top - gridSizeY,
        };
        const allSpots = [
            ...rightSpots.slice(Math.floor(rightSpots.length / 2)),
            bottomRight,
            ...bottomSpots,
            bottomLeft,
            ...leftSpots,
            topLeft,
            ...topSpots,
            topRight,
            ...rightSpots.slice(0, Math.floor(rightSpots.length / 2)),
        ].map((spot) => ({
            ...spot,
            center: {
                x: spot.x + canvas.scene.grid.size / 2,
                y: spot.y + canvas.scene.grid.size / 2,
            }
        }));
        return allSpots;
    }

    #containedSquares;
    /** @returns {{ x: number, y: number, center: { x: number, y: number}}[]} */
    get containedSquares() { return this.#containedSquares ??= this.#initContainedSquares(); }

    #initContainedSquares() {
        const left = this.#x;
        const top = this.#y;
        const heightSpots = this.#heightSquares;
        const widthSpots = this.#widthSquares;

        const gridSizeX = canvas.grid.sizeX;
        const gridSizeY = canvas.grid.sizeY;

        const squares = [];
        for (let x = 0; x < widthSpots; x++) {
            for (let y = 0; y < heightSpots; y++) {
                squares.push({
                    x: left + x * gridSizeX,
                    y: top + y * gridSizeY,
                });
            }
        }
        const allSquares = squares.map((spot) => ({
            ...spot,
            center: {
                x: spot.x + canvas.scene.grid.size / 2,
                y: spot.y + canvas.scene.grid.size / 2,
            }
        }));
        return allSquares;
    }

    #gridPoints;
    /**
     * returns grid intersections on perimeter of the square
     * @returns {{x: number, y: number, direction: number}[]}
     */
    get gridPoints() { return this.#gridPoints ??= this.#initGridPoints(); }

    #initGridPoints() {
        const bottom = this.#y + this.#h;
        const left = this.#x;
        const top = this.#y;
        const right = this.#x + this.#w;

        if (this.#heightSquares == 0 && this.#widthSquares == 0) {
            return [{
                direction: 0,
                x: left,
                y: top,
            }];
        }

        const heightSpots = Math.max(0, this.#heightSquares - 1);
        const widthSpots = Math.max(0, this.#widthSquares - 1);

        const gridSizeX = canvas.grid.sizeX;
        const gridSizeY = canvas.grid.sizeY;

        const rightPoints = [...new Array(widthSpots)].map((_, i) => ({
            direction: 0,
            x: right,
            y: top + gridSizeY * (i + 1),
        }));
        const bottomRight = {
            direction: 45,
            x: right,
            y: bottom,
        };
        const bottomPoints = [...new Array(heightSpots)].map((_, i) => ({
            direction: 90,
            x: right - gridSizeX * (i + 1),
            y: bottom,
        }));
        const bottomLeft = {
            direction: 135,
            x: left,
            y: bottom,
        };
        const leftPoints = [...new Array(widthSpots)].map((_, i) => ({
            direction: 180,
            x: left,
            y: bottom - gridSizeY * (i + 1),
        }));
        const topLeft = {
            direction: 225,
            x: left,
            y: top,
        };
        const topPoints = [...new Array(heightSpots)].map((_, i) => ({
            direction: 270,
            x: left + gridSizeX * (i + 1),
            y: top,
        }));
        const topRight = {
            direction: 315,
            x: right,
            y: top,
        };
        const allPoints = [
            ...rightPoints.slice(Math.floor(rightPoints.length / 2)),
            bottomRight,
            ...bottomPoints,
            bottomLeft,
            ...leftPoints,
            topLeft,
            ...topPoints,
            topRight,
            ...rightPoints.slice(0, Math.floor(rightPoints.length / 2)),
        ];
        return allPoints;
    }
    /**
     * @param {ANGLE_POINTS[keyof ANGLE_POINTS]} anglePoints
     * @returns {{x: number, y: number, direction: number}[]}
     */
    #getAngleStartPoints(anglePoints) {
        const bottom = this.#y + this.#h;
        const left = this.#x;
        const top = this.#y;
        const right = this.#x + this.#w;

        if (this.#heightSquares == 0 && this.#widthSquares == 0) {
            return [{
                direction: 0,
                x: left,
                y: top,
            }];
        }

        const isMid = isSet(anglePoints, ANGLE_POINTS.EDGE_MIDPOINT);
        const isVertex = isSet(anglePoints, ANGLE_POINTS.EDGE_VERTEX);
        const isOuterVertex = isSet(anglePoints, ANGLE_POINTS.OUTER_VERTEX);

        let gridSizeX = canvas.grid.sizeX;
        let gridSizeY = canvas.grid.sizeY;

        let gridOffsetX = 0;
        let gridOffsetY = 0;

        if (isMid && !isVertex) {
            gridOffsetX = Math.floor(gridSizeX / 2);
            gridOffsetY = Math.floor(gridSizeY / 2);
        }

        if (isMid && isVertex) {
            gridSizeX /= 2;
            gridSizeY /= 2;
        }

        const heightSpots = isMid && isVertex
            ? this.#heightSquares * 2 + 1
            : isMid
                ? this.#heightSquares
                : this.#heightSquares + 1;
        const widthSpots = isMid && isVertex
            ? this.#widthSquares * 2 + 1
            : isMid
                ? this.#widthSquares
                : this.#widthSquares + 1;

        // right-top to right-bottom
        const rightSpots = [...new Array(widthSpots)].map((_, i) => ({
            direction: 0,
            x: right,
            y: top + gridSizeY * i + gridOffsetY,
        }));

        // bottom-right to bottom-left
        const bottomSpots = [...new Array(heightSpots)].map((_, i) => ({
            direction: 90,
            x: right - gridSizeX * i - gridOffsetX,
            y: bottom,
        }));

        // left-bottom to left-top
        const leftSpots = [...new Array(widthSpots)].map((_, i) => ({
            direction: 180,
            x: left,
            y: bottom - gridSizeY * i - gridOffsetY,
        }));

        // top-left to top-right
        const topSpots = [...new Array(heightSpots)].map((_, i) => ({
            direction: 270,
            x: left + gridSizeX * i + gridOffsetX,
            y: top,
        }));

        const allSpots = [
            ...rightSpots.slice(Math.floor(rightSpots.length / 2)),
            ...(isOuterVertex ? [{ direction: 45, x: right, y: bottom }] : []),
            ...bottomSpots,
            ...(isOuterVertex ? [{ direction: 135, x: left, y: bottom }] : []),
            ...leftSpots,
            ...(isOuterVertex ? [{ direction: 225, x: left, y: top }] : []),
            ...topSpots,
            ...(isOuterVertex ? [{ direction: 315, x: right, y: top }] : []),
            ...rightSpots.slice(0, Math.floor(rightSpots.length / 2)),
        ];
        return allSpots;
    }

    /**
     *
     * @param {ANGLE_POINTS[keyof ANGLE_POINTS]} angleStartPoints
     * @param {object} coords
     * @param {number} coords.x
     * @param {number} coords.y
     * @returns { {direction: number, x: number, y: number} }
     */
    getFollowPositionForCoords(angleStartPoints, { x, y }) {
        const allSpots = this.#getAngleStartPoints(angleStartPoints);
        const totalSpots = allSpots.length;
        const isMid = isSet(angleStartPoints, ANGLE_POINTS.EDGE_MIDPOINT);
        const isVertex = isSet(angleStartPoints, ANGLE_POINTS.EDGE_VERTEX);
        const radToNormalizedAngle = (rad) => {
            let angle = (rad * 180 / Math.PI) % 360;
            // offset the angle for even-sided tokens, because it's centered in the grid it's just wonky without the offset
            const offset = isMid
                ? isVertex
                    ? 0.5
                    : 0
                : 1;
            if (this.heightSquares % 2 === offset && this.widthSquares % 2 === offset) {
                angle -= (360 / totalSpots) / 2;
            }
            const normalizedAngle = Math.round(angle / (360 / totalSpots)) * (360 / totalSpots);
            return normalizedAngle < 0
                ? normalizedAngle + 360
                : normalizedAngle;
        };

        const ray = new Ray(this.center, { x, y });
        const angle = radToNormalizedAngle(ray.angle);
        const spotIndex = Math.ceil(angle / 360 * totalSpots) % totalSpots;

        const spot = allSpots[spotIndex];
        return spot;
    }

    constructor(x, y, heightSquares = 1, widthSquares = 1) {
        this.#x = x;
        this.#y = y;
        this.#heightSquares = heightSquares;
        this.#widthSquares = widthSquares;

        this.#h = canvas.grid.sizeY * heightSquares;
        this.#w = canvas.grid.sizeX * widthSquares;
    }

    static fromToken(token) {
        token ||= { x: 0, y: 0, document: { width: 1, height: 1 } };
        const width = Math.max(Math.round(token.document.width), 1);
        const height = Math.max(Math.round(token.document.height), 1);
        return new GridSquare(token.x, token.y, width, height);
    }

    static fromCenter({ x, y }, heightSquares = 1, widthSquares = 1) {
        const x1 = (x || 0) - canvas.grid.sizeX * heightSquares / 2;
        const y1 = (y || 0) - canvas.grid.sizeY * widthSquares / 2;
        return new GridSquare(x1, y1, heightSquares, widthSquares);
    }

    static fromGridSquare({ x, y }) {
        const x1 = x - (x % canvas.grid.sizeX) + canvas.grid.sizeX / 2;
        const y1 = y - (y % canvas.grid.sizeY) + canvas.grid.sizeY / 2;
        return this.fromCenter(({ x: x1, y: y1 }));
    }

    static fromGridPoint({ x, y }) {
        return new GridSquare(x, y, 0, 0);
    }

    contains(x, y) {
        return new PIXI.Rectangle(this.x, this.y, this.w, this.h).contains(x, y);
    }

    /**
     * Gets the point at the edge of a circle token (assuming width/height is the same (i.e. a circle))
     * @param {Ray} ray
     */
    edgePoint(ray) {
        const { angle } = ray;
        const { x, y } = this.center;
        const radius = this.#heightSquares * canvas.grid.sizeY / 2;

        const x1 = x + radius * Math.cos(angle);
        const y1 = y + radius * Math.sin(angle);
        return { x: x1, y: y1 };
    }
}
