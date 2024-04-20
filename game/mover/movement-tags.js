import { default as Tag } from '@core/tag'

export default class Movable extends Tag{
  static tagType = 'Movable'

    constructor() {
        super()
        this.tagType = 'Movable'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('VectorComponent');
    };
  
    setXPosition(xPosition) {
      this.entity.getComponent('PositionComponent').xPosition = xPosition;
    };
  
    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    };
  
    setYPosition(yPosition) {
        this.entity.getComponent('PositionComponent').yPosition = yPosition;
    };
  
    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    };

    setMaxMagnitude(maxMagnitude) {
      this.entity.getComponent('VectorComponent').maxMagnitude = maxMagnitude;
    }
  
    addVector(magnitude, direction, maxMagnitude) {
        this.entity.getComponent('VectorComponent').addVector(magnitude, direction)
    };

    getVectorTotal() {
      return this.entity.getComponent('VectorComponent').calculateTotalVector();
    }

    getBearingDegrees() {
      return this.entity.getComponent('PositionComponent').bearingDegrees;
    }

    adjustBearingDegrees(bearingDegrees, adjustTo) {
      let originalBearingDegrees = this.entity.getComponent('PositionComponent').bearingDegrees;
      
      let newBearingDegrees = (originalBearingDegrees + bearingDegrees) % 360;
      
      if (adjustTo != null) {
        if (Math.abs(adjustTo - originalBearingDegrees) <= this.getTurnSpeed()) {
          newBearingDegrees = adjustTo
        }
      }
      
      if (newBearingDegrees < 0) {
        newBearingDegrees += 360; // Ensure positive value within the [0, 360) range
      }
      

      this.entity.getComponent('PositionComponent').bearingDegrees = newBearingDegrees;
      return newBearingDegrees;
    }

    getAccelerationMagnitude() {
        return this.entity.getComponent('VectorComponent').accelerationMagnitude;
    }

    setAccelerationMagnitude(magnitude, force) {
       if (force) {
        this.entity.getComponent('VectorComponent').accelerationMagnitude = magnitude;
       }
       else if (magnitude <= 0) {
        this.entity.getComponent('VectorComponent').accelerationMagnitude = 0;
       }
       else if (magnitude > 300) {
        this.entity.getComponent('VectorComponent').accelerationMagnitude = 300;
       }
       else {
        this.entity.getComponent('VectorComponent').accelerationMagnitude = magnitude
       }
    }

    stop() {
      this.entity.getComponent('VectorComponent').removeAllVectors();
    }

    getTurnSpeed() {
      return this.entity.getComponent('VectorComponent').turnSpeed;
    }
  }
  