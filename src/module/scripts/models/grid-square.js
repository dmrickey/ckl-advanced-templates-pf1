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

    get center() {
        const gridSize = canvas.grid.sizeY;
        const x = this.#x + this.#widthSquares * gridSize / 2;
        const y = this.#y + this.#heightSquares * gridSize / 2;
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

        const gridSize = canvas.grid.sizeY;

        const rightSpots = [...new Array(widthSpots)].map((_, i) => ({
            direction: 0,
            x: right,
            y: top + gridSize * i,
        }));
        const bottomRight = {
            direction: 45,
            x: right,
            y: bottom,
        };
        const bottomSpots = [...new Array(heightSpots)].map((_, i) => ({
            direction: 90,
            x: right - gridSize * i,
            y: bottom,
        }));
        const bottomLeft = {
            direction: 135,
            x: left - gridSize,
            y: bottom,
        };
        const leftSpots = [...new Array(widthSpots)].map((_, i) => ({
            direction: 180,
            x: left - gridSize,
            y: bottom - gridSize * i,
        }));
        const topLeft = {
            direction: 225,
            x: left - gridSize,
            y: top - gridSize,
        };
        const topSpots = [...new Array(heightSpots)].map((_, i) => ({
            direction: 270,
            x: left + gridSize * i,
            y: top - gridSize,
        }));
        const topRight = {
            direction: 315,
            x: right,
            y: top - gridSize,
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
    get containedSquares() { return this.#containedSquares ??= this.#initContainedSquares(); }

    #initContainedSquares() {
        const left = this.#x;
        const top = this.#y;
        const heightSpots = this.#heightSquares;
        const widthSpots = this.#widthSquares;

        const gridSize = canvas.grid.sizeY;

        const squares = [];
        for (let x = 0; x < widthSpots; x++) {
            for (let y = 0; y < heightSpots; y++) {
                squares.push({
                    x: left + x * gridSize,
                    y: top + y * gridSize,
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

        const gridSize = canvas.grid.sizeY;

        const rightPoints = [...new Array(widthSpots)].map((_, i) => ({
            direction: 0,
            x: right,
            y: top + gridSize * (i + 1),
        }));
        const bottomRight = {
            direction: 45,
            x: right,
            y: bottom,
        };
        const bottomPoints = [...new Array(heightSpots)].map((_, i) => ({
            direction: 90,
            x: right - gridSize * (i + 1),
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
            y: bottom - gridSize * (i + 1),
        }));
        const topLeft = {
            direction: 225,
            x: left,
            y: top,
        };
        const topPoints = [...new Array(heightSpots)].map((_, i) => ({
            direction: 270,
            x: left + gridSize * (i + 1),
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

    constructor(x, y, heightSquares = 1, widthSquares = 1) {
        this.#x = x;
        this.#y = y;
        this.#heightSquares = heightSquares;
        this.#widthSquares = widthSquares;

        const gridSize = canvas.grid.sizeY;
        this.#h = gridSize * heightSquares;
        this.#w = gridSize * widthSquares;
    }

    static fromToken(token) {
        const width = Math.max(Math.round(token.document.width), 1);
        const height = Math.max(Math.round(token.document.height), 1);
        return new GridSquare(token.x, token.y, width, height);
    }

    static fromCenter({ x, y }, heightSquares = 1, widthSquares = 1) {
        const gridSize = canvas.grid.sizeY;
        const x1 = x - gridSize * heightSquares / 2;
        const y1 = y - gridSize * widthSquares / 2;
        return new GridSquare(x1, y1, heightSquares, widthSquares);
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
