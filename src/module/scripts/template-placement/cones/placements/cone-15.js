import { targetTokens } from '../../../utils';

/**
 * For placing a 15' cone originating from the given token
 *
 * @param {object} options Template creation data
 * @param {*} token The originating token
 * @returns {object} The created template
 */
export default async function (options, token) {
    const gridSize = canvas.grid.h;
    const sourceSquare = (center, widthSquares, heightSquares) => {
        const h = gridSize * heightSquares;
        const w = gridSize * widthSquares;

        const bottom = center.y + h / 2;
        const left = center.x - w / 2;
        const top = center.y - h / 2;
        const right = center.x + w / 2;

        const rightSpots = [...new Array(heightSquares)].map((_, i) => ({
            direction: 0,
            x: right,
            y: top + gridSize / 2 + gridSize * i,
        }));
        const bottomSpots = [...new Array(widthSquares)].map((_, i) => ({
            direction: 90,
            x: right - gridSize / 2 - gridSize * i,
            y: bottom,
        }));
        const leftSpots = [...new Array(heightSquares)].map((_, i) => ({
            direction: 180,
            x: left,
            y: bottom - gridSize / 2 - gridSize * i,
        }));
        const topSpots = [...new Array(widthSquares)].map((_, i) => ({
            direction: 270,
            x: left + gridSize / 2 + gridSize * i,
            y: top,
        }));
        const allSpots = [
            ...rightSpots.slice(Math.floor(rightSpots.length / 2)),
            { direction: 45, x: right, y: bottom },
            ...bottomSpots,
            { direction: 135, x: left, y: bottom },
            ...leftSpots,
            { direction: 225, x: left, y: top },
            ...topSpots,
            { direction: 315, x: right, y: top },
            ...rightSpots.slice(0, Math.floor(rightSpots.length / 2)),
        ];

        return {
            x: left,
            y: top,
            center,
            top,
            bottom,
            left,
            right,
            h,
            w,
            heightSquares,
            widthSquares,
            allSpots,
        };
    };

    // get from source token, if no source token, then select a square to originate the cone from.
    let square;
    if (typeof token === 'undefined' || !token) {
        const sourceConfig = {
            drawIcon: true,
            drawOutline: false,
            interval: -1,
            label: 'Cone Start',
        };

        const source = await warpgate.crosshairs.show(sourceConfig);
        if (source.cancelled) {
            return;
        }
        square = sourceSquare({ x: source.x, y: source.y }, 1, 1);
    }
    else {
        const width = Math.max(Math.round(token.data.width), 1);
        const height = Math.max(Math.round(token.data.height), 1)
        square = sourceSquare(token.center, width, height);
    }

    const templateData = {
        ...options,
        ...square.allSpots[0],
        angle: 90,
    }

    let template = (await canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [templateData]))[0];

    game.user.updateTokenTargets();

    const targetConfig = {
        drawIcon: false,
        drawOutline: false,
    }

    let currentSpotIndex = 0;
    const updateTemplateRotation = async (crosshairs) => {
        while (crosshairs.inFlight) {
            await warpgate.wait(100);

            const totalSpots = 4 + 2 * square.heightSquares + 2 * square.widthSquares;
            const radToNormalizedAngle = (rad) => {
                let angle = (rad * 180 / Math.PI) % 360;

                // offset the angle for even-sided tokens, because it's centered in the grid it's just wonky without the offset
                if (square.heightSquares % 2 === 0 && square.widthSquares % 2 === 0) {
                    angle -= (360 / totalSpots) / 2;
                }
                const normalizedAngle = Math.round(angle / (360 / totalSpots)) * (360 / totalSpots);
                return normalizedAngle < 0
                    ? normalizedAngle + 360
                    : normalizedAngle;
            }

            const ray = new Ray(square.center, crosshairs);
            const angle = radToNormalizedAngle(ray.angle);
            const spotIndex = Math.ceil(angle / 360 * totalSpots);

            if (spotIndex === currentSpotIndex) {
                continue;
            }

            currentSpotIndex = spotIndex;
            const spot = square.allSpots[currentSpotIndex];

            template = await template.update({ ...spot });

            targetTokens(template);
        }
    }

    const rotateCrosshairs = await warpgate.crosshairs.show(
        targetConfig,
        {
            show: updateTemplateRotation
        }
    );

    if (rotateCrosshairs.cancelled) {
        await template.delete();
        game.user.updateTokenTargets();
        return;
    }

    return template;
};
