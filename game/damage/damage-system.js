import { default as System } from '@core/system';

import { distanceFromTo, angleTo, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';

export default class DamageSystem extends System {
    constructor() {
      super();

      this.addHandler('DAMAGE', (payload) => {
        let entity = this._core.getEntityWithId(payload.entityId);
        let healthComponent = entity.getComponent('HealthComponent')
        if (!healthComponent) {
          return;
        }
        healthComponent.health -= payload.damage
        if (healthComponent.health <= 0) {
          this.send('ENTITY_DESTROY_REQUESTED', {entityId: payload.entityId})

          let position = entity.getComponent('PositionComponent');

          this.send("EXPLOSION_EFFECT_REQUESTED", {entityId: payload.entityId, xPosition: position.xPosition, yPosition: position.yPosition});
          this.send("DESTRUCTION_EFFECT_REQUESTED", {entityId: payload.entityId, xPosition: position.xPosition, yPosition: position.yPosition });
        }

        if (entity.key == 'PLAYER') {
          this.send('GUI_UPDATE_TEXT', {key: 'ship-panel-health-value', value: healthComponent.health})
          this.send('GUI_UPDATE_TEXT', {key: 'ship-panel-health-status', value: healthComponent.health < 500 ? 'DANGER' : 'OK'})
        }
      });
    }
    
    work() {
    };
}