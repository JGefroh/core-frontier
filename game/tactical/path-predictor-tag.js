import { default as Tag } from '@core/tag'

export default class PathPredictor extends Tag {
    static tagType = 'PathPredictor'

    constructor() {
        super()
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('VectorComponent') && entity.hasComponent('PathPredictorComponent');;
    };

    getXPosition() {
        return this.entity.getComponent('PositionComponent').xPosition;
    }

    getYPosition() {
        return this.entity.getComponent('PositionComponent').yPosition;
    }

    getBearingDegrees() {
        return this.entity.getComponent('PositionComponent').bearingDegrees;
    }

    getVectorMagnitude() {
        return this.entity.getComponent('VectorComponent').calculateTotalVector().magnitude;
    }

    getVectorAngleDegrees() {
        return this.entity.getComponent('VectorComponent').calculateTotalVector().angleDegrees;
    }

    getAccelerationMagnitude() {
        return this.entity.getComponent('VectorComponent').accelerationMagnitude;  
    }

    showFlightPath(){
        return this.entity.getComponent('TargetConfigurationComponent')?.showFlightPath;
    }
  }
  