// todo either delete this or use it (and update it, because it uses data.data)
const targetTokens = (template) => {
    const getCenterOfSquares = (t) => {
        const gridSize = canvas.grid.sizeY;
        const x1 = t.x + gridSize / 2;
        const y1 = t.y + gridSize / 2;
        const tokenSquaresWidth = t.data.width;
        const tokenSquaresHeight = t.data.height;
        const centers = [];
        for (let x = 0; x < tokenSquaresWidth; x++) {
            for (let y = 0; y < tokenSquaresHeight; y++) {
                centers.push({ id: t.id, center: { x: x1 + x * gridSize, y: y1 + y * gridSize } });
            }
        }
        return centers;
    };
    const centers = canvas.tokens.placeables
        .map((t) => t.actor.data.data.size <= 4
            ? { id: t.id, center: t.center }
            : getCenterOfSquares(t))
        .flatMap((x) => x);
    const tokenIdsToTarget = centers.filter((o) =>
        canvas
            .grid.getHighlightLayer(template.highlightId)
            .geometry.containsPoint(o.center))
        .map((x) => x.id);

    game.user.updateTokenTargets(tokenIdsToTarget);
};

export { targetTokens };
