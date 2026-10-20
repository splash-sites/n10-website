import * as migration_20261020_134725_initial from './20261020_134725_initial';

export const migrations = [
  {
    up: migration_20261020_134725_initial.up,
    down: migration_20261020_134725_initial.down,
    name: '20261020_134725_initial'
  },
];
