class DurationTracker {
    static endOfTurn = 'endOfTurn';

    static endOfTurnExpirations = [];

    static endOfTurnCallback(callback) {
        DurationTracker.endOfTurnExpirations.push(callback);
    }

    static async expireAll() {
        for (const e of DurationTracker.endOfTurnExpirations) {
            try {
                await e();
            }
            catch {
                // don't really care
            }
        }
        DurationTracker.endOfTurnExpirations = [];
    }

    static init() {
        Hooks.on('deleteCombat', async (_combat) => {
            await DurationTracker.expireAll();
        });

        Hooks.on('updateCombat', async (combat, changed) => {
            if (!('turn' in changed) && changed.round !== 1
                || game.combats.get(combat.id).data.combatants.length === 0
            ) {
                return;
            }

            await DurationTracker.expireAll();
        });
    }
}

export { DurationTracker };
