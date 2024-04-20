import { default as System } from '@core/system';
import { distanceFromTo, toMetersFromCoordinateUnits } from '@game/utilities/distance-util';
import TargetComponent from './target-component';

export default class SelectionSystem extends System {
    constructor() {
      super();

      this.addHandler('TARGET_REQUESTED', (payload) => {
        this.toggleTargeted(payload);
      });
    }
    
    work() {
    };

    toggleTargeted(payload) {
      let target = this._core.getEntityWithId(payload.targetEntityId);
      let source = this._core.getEntityWithId(payload.sourceEntityId);

      if (source) {
        if (!source.getComponent('TargetComponent')) {
          source.addComponent(new TargetComponent());
        }
        // source.getComponent('TargetComponent').addTargetEntityId(payload.targetEntityId);
        source.getComponent('TargetComponent').setTargetEntityId(payload.targetEntityId);
      }
    }
}