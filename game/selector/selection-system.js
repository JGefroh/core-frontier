import { default as System } from '@core/system';
import { distanceFromTo, toMetersFromCoordinateUnits } from '@game/utilities/distance-util';

export default class SelectionSystem extends System {
    constructor() {
      super();

      this.selectedEntity = null;

      this.addHandler('INPUT_RECEIVED', (payload) => {
        if (payload.type == 'click') {
          this._selectEntity(payload)
        }
      });
    }
    
    work() {
    };

    _selectEntity(payload) {
      let selectable = this.getTag('Selectable');
      let viewport = this._core.getData('VIEWPORT') || {xPosition: 0, yPosition: 0, width: 1024, height: 768};

      this.forTaggedAs('Selectable', (entity) => {
        selectable.setEntity(entity);
        if (selectable.wasSelected(payload.world.xPosition, payload.world.yPosition, viewport)) {
          this.selectedEntity = entity;
          this.send('TRACK_ENTITY_REQUESTED', {entityId: this.selectedEntity.getId()});
        }
      });
    }
  }