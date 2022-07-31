import { Settings } from '../../settings';
import * as v1 from './migrate-v1';

const currentMigrationVersion = 1;

export default async () => {

    const gm = game.pf1.utils.getFirstActiveGM();
    const isFirstGM = game.user === gm;
    if (!isFirstGM) {
        return;
    }

    const current = Settings.migrationVersion || 0;

    if (current < 1) {
        await v1.migrateGameItem();
        await v1.migratePacks();
        await v1.migrateWorldActors();
        await v1.migrateSyntheticActors();
        Settings.migrationVersion = currentMigrationVersion;
    }
}
