import { default as Entity } from '@core/entity.js';
import { default as System } from '@core/system';

import PositionComponent from '@game/positioner/position-component';
import RenderComponent from '@game/renderer/render-component';

export default class TargetConfigurationSystem extends System {
    constructor() {
      super()
      this.wait = 100

      this.addHandler('CONFIGURE_TARGET', (payload) => {
        let entity = this._core.getEntityWithId(payload.entityId);
        if (!entity) {
            return;
        }
        let tcc = entity.getComponent('TargetConfigurationComponent');
        if (!tcc) {
            return;
        }

        if (payload.key == 'config-toggle-flight-path') {
            tcc.showFlightPath = !tcc.showFlightPath;
        }
      });
    }
  
    work() {
      this.workForTag('PathPredictor', (tag, entity) => {
      });
    };
}
  