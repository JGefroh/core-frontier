import { default as Tag } from '@core/tag'

export default class Decayable extends Tag{
    static tagType = 'Decayable'

    constructor() {
        super()
        this.tagType = 'Decayable'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('DecayerComponent')
    };

    isTimeToDecay() {
      return (Date.now() - this.entity.getComponent('DecayerComponent').decayStartedAt >= this.entity.getComponent('DecayerComponent').decayIn)
    }

    getOnDecayEffect() {
      return this.entity.getComponent('DecayerComponent').onDecayEffect
    }

    removeDecay() {
      this.entity.getComponent('DecayerComponent').onDecayEffect = null;
    }
  }
  