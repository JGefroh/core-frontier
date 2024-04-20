import { default as System } from '@core/system';

export default class DecayerSystem extends System {
    constructor() {
      super();
    }
    
    work() {
      this.workForTag('Decayable', (tag, entity) => {
        if (tag.isTimeToDecay()) {
          if (tag.getOnDecayEffect() == 'destroy_entity') {
            this._core.removeEntity(entity);
          }
          else if (typeof tag.getOnDecayEffect() == 'function') {
            tag.getOnDecayEffect()()
            tag.removeDecay();
          }
        }
      })
    };
  }  