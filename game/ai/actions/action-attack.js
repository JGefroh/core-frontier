import { distanceFromTo, angleToWithVelocity, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';
import { ActionBase } from '@game/ai/actions/action-base';

export class ActionAttack extends ActionBase {
    constructor(configuration) {
        super(configuration)
        this.score = 0;
        this.key = 'attack'
        this.cooldown = 0;
        this.stepOptions = [
            // {key: 'calculate_random_acceleration', configuration: {accelerationType: 'attack'}},
            // {key: 'set_acceleration'},
        ]
    }

    prepareAction(currentState, core) {
        delete currentState.desiredAcceleration
        delete currentState.desiredBearing
        let targetEntity = core.getEntityWithId(currentState.targetedEntityId)
        if (targetEntity) {
            let targetPosition = targetEntity.getComponent('PositionComponent')

        }
        else {
            delete currentState.targetedEntityId
        }
    }

    calculateScore(currentState) {
        if (currentState.targetedEntityId) {
            // range is 7k for hmg
            this.score = 2000;
        }
        else {
            this.score = 0;
        }
    }
}