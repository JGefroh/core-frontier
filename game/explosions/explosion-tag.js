import { default as Tag } from '@core/tag'

export default class Explosion extends Tag{
    static tagType = 'Explosion'

    constructor() {
        super()
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('ExplosionComponent')
    };

    getParticleCount() {
      return this.entity.getComponent('ExplosionComponent').particleCount;
    }
    getCurrentRadius() {
      return this.entity.getComponent('ExplosionComponent').currentRadius;
    }
    setCurrentRadius(currentRadius) {
      this.entity.getComponent('ExplosionComponent').currentRadius = currentRadius;
    }
    getMaxRadius() {
      return this.entity.getComponent('ExplosionComponent').maxRadius;
    }
    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    }
    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    }
    getRateOfChange() {
      return this.entity.getComponent('ExplosionComponent').rateOfChange;
    }
  }
  