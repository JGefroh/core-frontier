import { default as System } from '@core/system';
import { distanceFromTo, toMetersFromCoordinateUnits } from '@game/utilities/distance-util';

export default class SectorSystem extends System {
    constructor() {
      super();

      this.sectors = {
        id: 12345,
        label: 'Earth',
        sectors: {
          'luna': {
            id: 12345,
            label: 'Luna'
          }
        }
      };
    }
    
    work() {
    };
  }