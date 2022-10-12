import { Settings } from '../../settings';
import { isFirstGM } from '../utils';
import * as v1 from './migrate-v1';

const currentMigrationVersion = 1;

export default async () => {
    if (!isFirstGM()) {
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
