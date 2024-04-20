import { default as Tag } from '@core/tag'

export default class TurnsTowards extends Tag {
    static tagType = 'TurnsTowards'
    constructor() {
      super();
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('TurnsTowardsComponent') && entity.hasComponent('PositionComponent');
    };

    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    }

    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    }

    setBearingDegrees(bearingDegrees) {
      return this.entity.getComponent('PositionComponent').bearingDegrees = bearingDegrees;
    }

    getBearingDegrees() {
      return this.entity.getComponent('PositionComponent').bearingDegrees || 0;
    }

    getOriginalBearingDegrees() {
      return this.entity.getComponent('PositionComponent').originalBearingDegrees || 0;
    }

    getTurnSpeed() {
      return this.entity.getComponent('TurnsTowardsComponent').turnSpeed;
    }

    getTurnTarget() {
      return this.entity.getComponent('TurnsTowardsComponent').turnTarget;
    }
  }
  