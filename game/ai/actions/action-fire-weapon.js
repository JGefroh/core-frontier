import { distanceFromTo, distanceBetween, angleTo, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';
import { ActionBase } from '@game/ai/actions/action-base';

export class ActionFireWeapon extends ActionBase {
    constructor(configuration) {
        super(configuration)
        this.score = 0;
        this.key = 'fire_weapon'
        this.cooldown = 0;
        this.stepOptions = [
            {key: 'set_bearing', configuration: {fudge: 5, parallel: true, alwaysRun: true}},
            {key: 'fire_weapon_at_target' },
        ]
    }

    beforeActionRun(currentState, core) {
        let targetEntity = core.getEntityWithId(currentState.targetedEntityId)
        if (targetEntity) {
            let entity1 = core.getEntityWithId(currentState.entityId)
            let targetPosition = targetEntity.getComponent('PositionComponent')
            currentState.desiredBearing = angleToWithVelocity(currentState.xPosition, currentState.yPosition, targetPosition.xPosition, targetPosition.yPosition, currentState.vectorMagnitude, currentState.vectorBearing)
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