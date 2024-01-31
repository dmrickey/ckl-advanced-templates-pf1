import { CONSTS, MODULE_NAME } from '../../consts';

export const calculateExpiration = (flags) => {
    const now = game.time.worldTime;

    const duration = flags[MODULE_NAME]?.[CONSTS.flags.deleteDuration.interval] || CONSTS.deletionOptions.doNotDelete;

    switch (duration) {
        case CONSTS.deletionOptions.doNotDelete:
            return undefined;
        case CONSTS.deletionOptions.endOfTurn:
            return {
                time: now,
                initiative: game?.combat?.combatant?.initiative || 99
            };
        case CONSTS.deletionOptions.timespan:
            const units = flags[MODULE_NAME]?.[CONSTS.flags.deleteDuration.unit] || 0;
            const interval = flags[MODULE_NAME]?.[CONSTS.flags.deleteDuration.interval] || CONSTS.deletionIntervals.rounds;

            const duration = (() => {
                switch (interval) {
                    case CONSTS.deletionIntervals.rounds:
                        return units * CONFIG.time.roundTime;
                    case CONSTS.deletionIntervals.minutes:
                        return units * 60;
                    case CONSTS.deletionIntervals.hours:
                        return units * 60 & 60;
                }
            })();

            return {
                at: now + duration,
                initiative: game?.combat?.combatant?.initiative || 0
            };
    }
};
