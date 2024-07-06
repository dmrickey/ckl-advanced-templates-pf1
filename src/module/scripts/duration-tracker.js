import { CONSTS, MODULE_NAME } from "../consts";
import { isFirstGM } from "./utils";
import { queueUpdate } from './utils/queue-update.mjs';

class DurationTracker {
    static isExpired = (templatePlaceable) => {
        const now = game.time.worldTime;
        const { combat } = game;

        const { at, initiative } = templatePlaceable.document.flags?.[MODULE_NAME]?.[CONSTS.flags.expirationTime] || {};

        if (!at) {
            return false;
        }

        const currentInitiative = combat?.combatant?.initiative;
        if (currentInitiative || currentInitiative === 0) {
            return at === now
                ? (initiative || 0) >= currentInitiative
                : at < now;
        }

        return at <= now;
    };

    static async removeExpiredTemplates() {
        const templateIds = canvas.templates.placeables
            .filter(DurationTracker.isExpired)
            .map((t) => t.id);

        if (templateIds.length) {
            await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateIds);
        }
    }

    static init() {
        Hooks.on('deleteCombat', async (_combat) => {
            if (!isFirstGM()) {
                return;
            }

            queueUpdate(() => DurationTracker.removeExpiredTemplates());
        });

        Hooks.on('updateCombat', async (combat, changed) => {
            if (!isFirstGM()) {
                return;
            }

            if (changed.round === 1 && changed.turn === 0) {
                return;
            }

            queueUpdate(() => DurationTracker.removeExpiredTemplates());
        });

        Hooks.on('updateWorldTime', async (_worldTime, delta) => {
            if (!isFirstGM()) {
                return;
            }

            if (delta) {
                queueUpdate(() => DurationTracker.removeExpiredTemplates());
            }
        });
    }
}

export { DurationTracker };
