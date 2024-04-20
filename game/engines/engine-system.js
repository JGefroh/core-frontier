import { default as System } from '@core/system';
import { default as Core}  from '@core/core';
import { default as Entity } from '@core/entity.js'

import { default as RenderComponent } from '@game/renderer/render-component'
import { default as PositionComponent } from '@game/positioner/position-component'
import GuiTextComponent from '@game/gui/gui-text-component.js';
import VectorComponent from '@game/mover/vector-component.js';
import CollisionComponent from '@game/collision/collision-component.js';
import { notYetTime } from '@game/utilities/timing-util.js';
import { angleTo, toFriendlyMeters, toMetersFromCoordinateUnits, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util.js';
import { getAdjustmentsRequired } from '../mover/movement-util';

export default class EngineSystem extends System {
    constructor() {
      super()

      this.shouldSpawn = false;
      this.gUnit = 9.81;
      this.wait = 1000/60
      this.changesRequired = null;

      this.addHandler('INPUT_RECEIVED', (payload) => {
        let message = payload.type
        if (payload.action === 'turn_left') {
            this.applyTurn = 'left'
        }
        if (payload.action === 'turn_right') {
            this.applyTurn = 'right'
        }
        if (payload.action === 'thrust_forward') {
            this.applyThrust = 'forward'
        }
        if (payload.action === 'thrust_backward') {
            this.applyThrust = 'backward'
        }
        if (payload.action === 'thrust_left') {
            this.applyThrust = 'left'
        }
        if (payload.action === 'thrust_right') {
            this.applyThrust = 'right'
        }
        if (payload.action === 'thrust_stop') {
            this.applyThrust = 'stop'
        }
      });

      this.addHandler('REQUEST_SET_BEARING', (payload) => {
        this.setBearing(payload)
      });

      this.addHandler('REQUEST_SET_ACCELERATION', (payload) => {
        this.setAcceleration(payload)
      });
    }

    setBearing(payload) {
      this.workForEntityWithTag(payload.entityId, 'Movable', (entity, tag) => {
        if (payload.adjustBy != null) {
          tag.adjustBearingDegrees(payload.adjustBy)
        }
        else if (payload.adjustTowards != null) {
          tag.adjustBearingDegrees(1);
        }
        else if (payload.adjustTo != null) {
          let adjustmentAmount = this.determineTurnDirection(tag.getBearingDegrees(), payload.adjustTo)
          tag.adjustBearingDegrees(adjustmentAmount * tag.getTurnSpeed(), payload.adjustTo);
        }
      })
    }

    setAcceleration(payload) {
      this.workForEntityWithTag(payload.entityId, 'Movable', (entity, tag) => {
        if (payload.adjustBy != null) {
          tag.setAccelerationMagnitude(tag.getAccelerationMagnitude() + payload.adjustBy, payload.force);
        }
        else if (payload.adjustTo != null) {
          tag.setAccelerationMagnitude(payload.adjustTo, payload.force);
        }
      })
    }
    
    work() {
      let acceleration = toCoordinateUnitsFromMeters(this.gUnit) / 60;

      var movable = this.getTag('Movable');
      this.forTaggedAs('Movable', (entity) => {
        movable.setEntity(entity);
        if (entity.key != 'PLAYER') {
          return
        }            
        this._updateThrusters(false, false, false, false)


        if (this.applyTurn == 'left') {
          movable.adjustBearingDegrees(-1 * movable.getTurnSpeed())
          this._updateAttached();
          this._updateThrusters(false, true, true, false)
        }
        else if (this.applyTurn == 'right') {
          movable.adjustBearingDegrees(movable.getTurnSpeed())
          this._updateAttached();
          this._updateThrusters(true,false, false, true)
        }

        if (this.applyThrust == 'forward') {
            movable.setAccelerationMagnitude(movable.getAccelerationMagnitude() + acceleration);
        }
        else if (this.applyThrust == 'backward') {
            movable.setAccelerationMagnitude(movable.getAccelerationMagnitude() - acceleration);
        }
        else if (this.applyThrust == 'right') {
            movable.addVector(90 / 60, movable.getBearingDegrees() + 90);
            this._updateThrusters(true, true, false, false)
        }
        else if (this.applyThrust == 'left') {
            movable.addVector(90 / 60, movable.getBearingDegrees() - 90);
            this._updateThrusters(false, false, true, true)
        }
        else if (this.applyThrust == 'stop') {
          movable.setAccelerationMagnitude(0)
        }
        this._updateGui(movable)
        this._updateEngine(entity, movable.getAccelerationMagnitude() / 60)
      });


      this.applyThrust = null;
      this.applyTurn = null;
    };

    _updateThrusters(topLeft, bottomLeft, topRight, bottomRight) {
      this._updateThruster('left-top-engine', topLeft)
      this._updateThruster('right-top-engine', topRight)
      this._updateThruster('left-bottom-engine', bottomLeft)
      this._updateThruster('right-bottom-engine', bottomRight)
    }

    _updateThruster(key, shouldRender) {
      this.workForTag('Attached', (tag, entity) => {
        if (tag.getEntity().key == key) {
          tag.getEntity().getComponent('RenderComponent').shouldRender = shouldRender;
        }
      });
    }

    _updateEngine(entity, acceleration) {
      this.workForTag('Attached', (tag, entity) => {
        if (tag.getEntity().key == 'engine') {
          if (acceleration) {
            tag.getEntity().getComponent('RenderComponent').shouldRender = true;
          }
          else {
            tag.getEntity().getComponent('RenderComponent').shouldRender = false;
          }
        }
      });
    }

    _updateGui(movable) {
      this.send('GUI_DATA', {
        key: `ship-panel-acceleration-value`, 
        value: `${(toMetersFromCoordinateUnits(movable.getAccelerationMagnitude()) / this.gUnit).toFixed(2)} g's`
      })
      this.send('GUI_DATA', {
        key: `ship-panel-acceleration-status`, 
        value: `${toMetersFromCoordinateUnits(movable.getAccelerationMagnitude()) > this.gUnit * 4 ? 'DANGER' : 'OK'}`
      })


      this.send('GUI_DATA', {
        key: `ship-panel-speed-value`, 
        value: `${toFriendlyMeters(toMetersFromCoordinateUnits(movable.getVectorTotal().magnitude || 0), 0)}/s`
      })

      this.send('GUI_DATA', {
        key: `ship-panel-bearing-value`, 
        value: `${movable.getBearingDegrees() % 360}°`
      })
    }

    _updateAttached() {
      this.workForTag('Attached', (tag, entity) => {
        if (tag.isStillAttached()) {
          if (tag.shouldSync('xPosition')) {
            tag.syncXPosition();
          }
          if (tag.shouldSync('bearingDegrees')) {
            tag.syncBearingDegrees();
          }
        }
      });
    }

    determineTurnDirection(currentBearing, desiredBearing) {
      // Normalize the angles to ensure they fall within the range of 0 to 360 degrees
      currentBearing = (currentBearing + 360) % 360;
      desiredBearing = (desiredBearing + 360) % 360;
      
      // Calculate the difference between the desired and current bearings
      let angleDifference = desiredBearing - currentBearing;
      
      // Adjust the angle difference to ensure it falls within the range of -180 to 180 degrees
      if (angleDifference <= -180) {
          angleDifference += 360;
      } else if (angleDifference > 180) {
          angleDifference -= 360;
      }
      
      // Determine the turn direction based on the sign of the angle difference
      if (angleDifference < 0) {
          return -1; // Turn left (negative)
      } else if (angleDifference > 0) {
          return 1; // Turn right (positive)
      } else {
          return 0; // No turn needed, already facing the desired direction
      }
    }
  }
  