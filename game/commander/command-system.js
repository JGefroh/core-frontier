import { default as System } from '@core/system';

import { distanceFromTo, angleTo, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';

export default class CommandSystem extends System {
    constructor() {
      super();

      this.addHandler('COMMAND_MOVE_TO', (payload) => {
        this.createCommandMoveTo(payload)
      });

      this.addHandler('COMMAND_WARP_TO', (payload) => {
        this.createCommandWarpTo(payload)
      });


      this.addHandler('COMMAND_ATTACK', (payload) => {
        this.createCommandAttack(payload)
      });
    }
    
    work() {
      this.workForTag('Commandable', (tag, entity) => {
        let activeCommand = tag.getActiveCommand(entity)
        if (!activeCommand) {
          return;
        }
         
        if (activeCommand?.checkComplete(entity)) {
          activeCommand = tag.nextCommandStep();
          if (activeCommand) {
            this.sendCommandStepExecutionRequest(activeCommand.command, activeCommand.payload)
          }
        }
        else {
          this.sendCommandStepExecutionRequest(activeCommand.command, activeCommand.payload)
        }
      })
    };

    sendCommandStepExecutionRequest(command, payload) {
      this.send(command, payload);
    }

    createCommandAttack(payload) {
      this.workForEntityWithTag(payload.commandedEntityId, 'Commandable', (entity, tag) => {
        let position = entity.getComponent('PositionComponent')
        let targetedEntityId = payload.targetedEntityId;
        let totalDistanceTo = distanceFromTo(position.xPosition, position.yPosition, payload.xPosition, payload.yPosition)

        let commandSequence = [
          {
            command: 'PURSUE_AND_ATTACK',
            payload: { entityId: payload.commandedEntityId },
            checkComplete: (entity) => {
              // Choose the player or the missile as a target
              let targetEntity = this._core.getEntityWithId(payload.targetedEntityId);
              if (!targetEntity) {
                return true;
              }
              // let closestMissileDistance = null;

              // this.workForTag('Collidable', (tag, missileEntity) => {
              //   if (tag.getCollisionGroup() !== 'missile') {
              //     return;
              //   }
              //   let missilePosition = missileEntity.getComponent('PositionComponent')
              //   let distanceToMissile = distanceFromTo(position.xPosition, position.yPosition, missilePosition.xPosition, missilePosition.yPosition)
              //   if (distanceToMissile < 5000) {
              //     closestMissileDistance = Math.min(closestMissileDistance, distanceToMissile)
              //     if (!closestMissileDistance || closestMissileDistance == distanceToMissile) {
              //       targetEntity = missileEntity;
              //     }
              //   }
              // });

              let targetPosition = targetEntity.getComponent('PositionComponent')
              let desiredBearing = angleTo(position.xPosition, position.yPosition, targetPosition.xPosition, targetPosition.yPosition)
              let targetAcceleration = targetEntity.getComponent('VectorComponent').accelerationMagnitude;

              this.send("REQUEST_SET_BEARING", { entityId: payload.commandedEntityId, adjustTo: desiredBearing} );
              this.send("REQUEST_SET_ACCELERATION", { entityId: payload.commandedEntityId, adjustTo: targetAcceleration + 30});


              // PDC IN RANGE?
              let totalDistanceTo = distanceFromTo(position.xPosition, position.yPosition, targetPosition.xPosition, targetPosition.yPosition)
              if (totalDistanceTo < 5000) {
                this.send("REQUEST_FIRE_WEAPON", {entityId: entity.id, weaponKey: 'machinegun', fireRequested: true})
              }
              else {
                this.send("REQUEST_FIRE_WEAPON", {entityId: entity.id, weaponKey: 'machinegun', fireRequested: false})
              }

              if (totalDistanceTo > 5000 && totalDistanceTo < 10000) {
                this.send('REQUEST_FIRE_WEAPON', {entityId: entity.id, weaponKey: 'missile', fireRequested: true})
              }
              else {
                this.send('REQUEST_FIRE_WEAPON', {entityId: entity.id, weaponKey: 'missile', fireRequested: false})
              }
            },
          },
        ]

        tag.addCommandSequence(commandSequence)
      });
    }

    createCommandWarpTo(payload) {
      this.workForEntityWithTag(payload.commandedEntityId, 'Commandable', (entity, tag) => {
        let position = entity.getComponent('PositionComponent')
        let desiredBearing = angleTo(position.xPosition, position.yPosition, payload.xPosition, payload.yPosition)
        let totalDistanceTo = distanceFromTo(position.xPosition, position.yPosition, payload.xPosition, payload.yPosition)

        let commandSequence = [
          {
            command: 'REQUEST_SET_BEARING',
            payload: { entityId: payload.commandedEntityId, adjustTowards: {xPosition: payload.xPosition, yPosition: payload.yPosition } },
            checkComplete: (entity) => {
              return this.withinFudge(entity.getComponent('PositionComponent').bearingDegrees, desiredBearing, 0.1)
            },
          },
          {
            command: 'ADD_WARP_EFFECT',
            payload: { entityId: payload.commandedEntityId, adjustTowards: {xPosition: payload.xPosition, yPosition: payload.yPosition } },
            checkComplete: (entity) => {
              if (entity.getComponent('RenderComponent').width >= 1 && entity.getComponent('RenderComponent').height >= 1) {
                entity.getComponent('RenderComponent').width += 1;
                entity.getComponent('RenderComponent').height -= 1;
              }
              else {
                return true;
              }
            },
          },
          {
            command: 'TELEPORT',
            payload: { entityId: payload.commandedEntityId, adjustTowards: {xPosition: payload.xPosition, yPosition: payload.yPosition } },
            checkComplete: (entity) => {
              entity.getComponent('PositionComponent').xPosition = payload.xPosition + 3000
              entity.getComponent('PositionComponent').yPosition = payload.yPosition + 3000
              entity.getComponent('RenderComponent').width = entity.getComponent('PositionComponent').width
              entity.getComponent('RenderComponent').height = entity.getComponent('PositionComponent').height
              return true;
            },
          }
        ]

        tag.addCommandSequence(commandSequence)
      });
    }

    createCommandMoveTo(payload) {
      this.workForEntityWithTag(payload.commandedEntityId, 'Commandable', (entity, tag) => {
        let position = entity.getComponent('PositionComponent')
        let desiredBearing = angleTo(position.xPosition, position.yPosition, payload.xPosition, payload.yPosition)
        let totalDistanceTo = distanceFromTo(position.xPosition, position.yPosition, payload.xPosition, payload.yPosition)

        let commandSequence = [
          {
            command: 'REQUEST_SET_BEARING',
            payload: { entityId: payload.commandedEntityId, adjustTowards: {xPosition: payload.xPosition, yPosition: payload.yPosition } },
            checkComplete: (entity) => {
              return this.withinFudge(entity.getComponent('PositionComponent').bearingDegrees, desiredBearing, 0.03)
            },
          },
          {
            command: 'REQUEST_SET_ACCELERATION',
            payload: { entityId: payload.commandedEntityId, adjustBy: 10000 },
            checkComplete: (entity) => {
              return true // Rune once
            },
          },
          {
            command: 'WAIT_TIL_DISTANCE_TO',
            payload: { entityId: payload.commandedEntityId, adjustBy: 10000 },
            checkComplete: (entity) => {
              let position = entity.getComponent('PositionComponent')
              let distanceTo = distanceFromTo(position.xPosition, position.yPosition, payload.xPosition, payload.yPosition)
              let velocity = entity.getComponent('VectorComponent').calculateTotalVector().magnitude;
              let distanceFromTimeToTurn = velocity * 3
              return distanceTo < (totalDistanceTo / 2) + distanceFromTimeToTurn
            },
          },
          {
            command: 'REQUEST_SET_ACCELERATION',
            payload: { entityId: payload.commandedEntityId, adjustBy: -10000 },
            checkComplete: (entity) => {
              return true // Run once
            },
          },
          {
            command: 'REQUEST_SET_BEARING',
            payload: { entityId: payload.commandedEntityId, adjustBy: 1, adjustTowards: {xPosition: payload.xPosition, yPosition: payload.yPosition } },
            checkComplete: (entity) => {
              let reverseDesiredBearing = desiredBearing - 180;
              if (reverseDesiredBearing < 0) {
                reverseDesiredBearing += 360;
              }
              return this.withinFudge(entity.getComponent('PositionComponent').bearingDegrees, reverseDesiredBearing, 0.01)
            },
          },
          {
            command: 'REQUEST_SET_ACCELERATION',
            payload: { entityId: payload.commandedEntityId, adjustBy: 10000 },
            checkComplete: (entity) => {
              return true // Run once
            },
          },
          {
            command: 'WAIT',
            payload: { entityId: payload.commandedEntityId, adjustBy: 10000 },
            checkComplete: (entity) => {
              let position = entity.getComponent('PositionComponent');
              let velocity = entity.getComponent('VectorComponent').calculateTotalVector().magnitude;
              let acceleration = entity.getComponent('VectorComponent').accelerationMagnitude;
              let distanceTo = distanceFromTo(position.xPosition, position.yPosition, payload.xPosition, payload.yPosition);
              let distanceToStop = (velocity * velocity) / (2 * acceleration);

              if (velocity < acceleration) {
                return true;
              }
            }, 
          },
          {
            command: 'SLOW_TO_STOP',
            payload: { entityId: payload.commandedEntityId, adjustBy: 10000 },
            checkComplete: (entity) => {
              let position = entity.getComponent('PositionComponent');
              let vector = entity.getComponent('VectorComponent').calculateTotalVector()
              let velocity = vector.magnitude;
              let angle = vector.angleDegrees
              let acceleration = entity.getComponent('VectorComponent').accelerationMagnitude;
              let distanceTo = distanceFromTo(position.xPosition, position.yPosition, payload.xPosition, payload.yPosition);

              this.sendCommandStepExecutionRequest('REQUEST_SET_BEARING', { entityId: entity.getId(), adjustTo: angle - 180});
              
              if (velocity < 3) {
                // Start decreasing engine to fine tune.
                this.sendCommandStepExecutionRequest('REQUEST_SET_ACCELERATION', { entityId: entity.getId(), adjustTo: velocity / 10});
                return true;
              }
              else if (velocity < 1) {
                // Cut engines - we are done.
                this.sendCommandStepExecutionRequest('REQUEST_SET_ACCELERATION', { entityId: entity.getId(), adjustTo: 0});
              }
              else if (acceleration >= velocity && distanceTo > acceleration) {
                // We still have a distance to go, but in the last moments.
                this.sendCommandStepExecutionRequest('REQUEST_SET_ACCELERATION', { entityId: entity.getId(), adjustTo: distanceTo });
              }

              return false;
            },
          },
        ]

        tag.addCommandSequence(commandSequence)
      });
    }

    withinFudge(currentValue, desiredValue, fudgePercent = 0.001) {
      const difference = Math.abs(currentValue - desiredValue);
      const fudgedValue = Math.abs(currentValue * fudgePercent);
      return difference <= fudgedValue
    }
  }

  // 'adjustBy'
  // 'adjustTowards'