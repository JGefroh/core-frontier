import { default as System } from '@core/system';

export default class MovementSystem extends System {
    constructor() {
      super();
    }
    
    work() {
      this.workForTag('Movable', (movable, entity) => {
        movable.setEntity(entity);

        let totalVector = movable.getVectorTotal();

        let oldXPosition = movable.getXPosition()
        let oldYPosition = movable.getYPosition()

        let newXPosition = oldXPosition + (totalVector.xDelta / 60);
        let newYPosition = oldYPosition + (totalVector.yDelta / 60);


        movable.setXPosition(newXPosition);
        movable.setYPosition(newYPosition);

        if (entity.key == 'PLAYER') {
          this._core.publishData('PLAYER_COORDINATES', { xPosition: movable.getXPosition(), yPosition: movable.getYPosition()});
        }

        movable.addVector(movable.getAccelerationMagnitude() / 60, movable.getBearingDegrees());
      });
      this._updateAttached()
    };

    _updateAttached() {
      this.workForTag('Attached', (tag, entity) => {
        if (tag.isStillAttached()) {
          if (tag.shouldSync('xPosition')) {
            tag.syncXPosition();
          }
          if (tag.shouldSync('yPosition')) {
            tag.syncYPosition();
          }
          if (tag.shouldSync('bearingDegrees')) {
            tag.syncBearingDegrees();
          }
        }
        else {
          this.send('ENTITY_DESTROY_REQUESTED', {entityId: entity.id})
        }
      });
    }
  }