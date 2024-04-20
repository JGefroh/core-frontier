import { default as System } from '@core/system';

export default class EntitySystem extends System {
    constructor() {
      super()

      this.entitiesToDespawn = []

      this.addHandler('ENTITY_DESTROY_REQUESTED', (payload) => {
        this.entitiesToDespawn.push(payload.entityId)
      });
    }
  
    work() {
      this.entitiesToDespawn.forEach((entityId) => {
        this._core.removeEntity(entityId);
      });
      this.entitiesToDespawn = [];
    }
  }
  