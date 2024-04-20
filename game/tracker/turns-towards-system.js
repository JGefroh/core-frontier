import { default as System } from '@core/system';

export default class TurnsTowardsSystem extends System {
    constructor() {
      super()
      this.mouseXPosition = null;
      this.mouseYPosition = null;
    }
  
    work() {
      this._turnTowardsCursor();
    };

    _turnTowardsCursor() {
      let tag = this.getTag('TurnsTowards');
      this.forTaggedAs('TurnsTowards', (entity) => {
        tag.setEntity(entity);
        let targetXPosition = null;
        let targetYPosition = null;
        if (tag.getTurnTarget() == 'mouse') {
          let cursorCoordinates = this._core.getData('CURSOR_COORDINATES');
          if (!cursorCoordinates) { return 0; }
          targetXPosition = cursorCoordinates.world.xPosition
          targetYPosition = cursorCoordinates.world.yPosition
        }
        else {
          let target = this._core.getEntityWithId(tag.getTurnTarget())
          if (!target) {
            return;
          }

          targetXPosition = target.getComponent('PositionComponent').xPosition;
          targetYPosition = target.getComponent('PositionComponent').yPosition;
        }
        
        let intendedBearingDegrees = this._calculateBearingDegreesTo(tag.getXPosition(), tag.getYPosition(), targetXPosition, targetYPosition)
        let originalBearingDegrees = tag.getOriginalBearingDegrees()
        let currentBearingDegrees = tag.getBearingDegrees();

        let delta = (intendedBearingDegrees - currentBearingDegrees + 360) % 360 ;

        // Calculate the shortest angle between intendedBearingDegrees and currentBearingDegrees
        if (delta > 180) {
          delta -= 360;
        } else if (delta < -180) {
          delta += 360;
        }
        
        tag.setBearingDegrees((currentBearingDegrees + (Math.sign(delta) * tag.getTurnSpeed())));
      });
    }

    _getBearingDegreesOffset(entity) {
      let attachedComponent = entity.getComponent('AttachedComponent')
      if (!attachedComponent) {
        return intendedBearingDegrees;
      }

      return attachedComponent.attachedToEntity.getComponent('PositionComponent').bearingDegrees
    }

    _calculateBearingDegreesTo(xPosition, yPosition, targetXPosition, targetYPosition) {
      let adjacent = targetXPosition - xPosition;
      let opposite = targetYPosition - yPosition;
      
      let bearingDegrees = Math.atan2(opposite, adjacent) * 180 / Math.PI;

      if (bearingDegrees < 0) {
        bearingDegrees += 360;
      } else if (bearingDegrees >= 360) {
          bearingDegrees -= 360;
      }
      return bearingDegrees;
    }

    _clampBearingDegrees(originalBearing, intendedBearingDegrees, allowedDegrees) {
      let sum = (originalBearing + intendedBearingDegrees) % 360;
      if (sum >= allowedDegrees) {
          // If the sum is greater than or equal to allowedDegrees,
          // we need to clamp the intendedBearingDegrees.
          // Calculate the difference between sum and allowedDegrees
          let diff = sum - allowedDegrees;
          // Adjust intendedBearingDegrees accordingly
          return intendedBearingDegrees - diff;
      } else {
          // If the sum is within the allowed range, return intendedBearingDegrees unchanged.
          return intendedBearingDegrees;
      }
    }
  }
  