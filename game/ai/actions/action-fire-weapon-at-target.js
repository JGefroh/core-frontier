import { distanceFromTo,  angleToPredicted, distanceBetween, angleTo, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';
import { ActionBase } from '@game/ai/actions/action-base';

export class ActionFireWeaponAtTarget extends ActionBase {
    constructor(configuration) {
        super(configuration)
        this.score = 0;
        this.key = 'fire_weapon_at_target'
        this.cooldown = 0;
        this.stepOptions = [
            {key: 'set_bearing', configuration: { toTarget: true, alwaysRun: true }},
            {key: 'fire_weapon_at_target', configuration: { alwaysRun: true } },
        ]
    }

    prepareAction(currentState, core) {
        delete currentState.desiredAcceleration
        delete currentState.desiredBearing
        let targetEntity = core.getEntityWithId(currentState.targetedEntityId)
        if (targetEntity) {
            let entity1 = core.getEntityWithId(currentState.entityId)
            let targetPosition = targetEntity.getComponent('PositionComponent')
            let targetVector = targetEntity.getComponent('VectorComponent')
            let targetVelocity = targetVector.calculateTotalVector()

            let distanceToTarget = distanceBetween(entity1, targetEntity)

            currentState.desiredBearing = angleToPredicted(
                currentState.xPosition, // the source x position - the entity firing the projectile
                currentState.yPosition, // the source y position - the entity firing the projectile
                currentState.vectorMagnitude, // the current speed of the souce, in coordinate units
                currentState.vectorBearing, // 0-360 degree angle of the source's current velocity
                targetPosition.xPosition, // current y position of the target
                targetPosition.yPosition, // current x position of the target
                targetPosition.width,
                targetPosition.height,
                targetPosition.bearingDegrees,
                targetVelocity.magnitude, // current speed of the target, in coordinate units
                targetVelocity.angleDegrees, // 0-360 degree angle of the target's current velocity
                toCoordinateUnitsFromMeters(900)
            ) // the speed of the projectile per second, in coordinate units
        }
    }

    calculateScore(currentState, core) {
        if (currentState.targetedEntityId) {
            let entity1 = core.getEntityWithId(currentState.entityId)
            let entity2 = core.getEntityWithId(currentState.targetedEntityId);
            if (!entity1 || !entity2) {
                this.score = 0;
                return;
            }
            this.score = 2000;
        }
        else {
            this.score = 0;
        }
    }
}