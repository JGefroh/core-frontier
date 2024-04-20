import { distanceBetween, angleTo, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';
import { ActionBase } from '@game/ai/actions/action-base';

export class ActionSelectNearbyTarget extends ActionBase {
    constructor(configuration) {
        super(configuration)
        this.score = 0;
        this.key = 'select_nearby_target'
        this.cooldown = 1000;
        this.stepOptions = [
            {key: 'select_nearest_target'},
        ]
    }

    prepareAction(currentState, core) {
        if (currentState.targetedEntityId) {
            if (!core.getEntityWithId(currentState.targetedEntityId)) {
                delete currentState.targetedEntityId
            }
        }

    }

    calculateScore(currentState, core) {
        if (!currentState.targetedEntityId) {
            this.score = 1000;
            return;
        }


        let currentEntity = core.getEntityWithId(currentState.entityId);
        let target = core.getEntityWithId(currentState.targetedEntityId)

        if (!currentEntity || !target) {
            this.score = 3000;
            return;
        }

        if (distanceBetween(currentEntity, target) >= toCoordinateUnitsFromMeters(1000)) {
            this.score = 3000;
            return;
        }

        return 0;
    }
}