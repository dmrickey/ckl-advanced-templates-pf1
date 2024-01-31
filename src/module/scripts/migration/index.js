import { Settings } from '../../settings';
import { isFirstGM } from '../utils';
import * as v1 from './migrate-v1';
import * as v2 from './migrate-v2';

const currentMigrationVersion = 2;

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
    }

    if (current < 2) {
        // TODO do migration
        // await v2.whatever();
    }

    Settings.migrationVersion = currentMigrationVersion;
}
