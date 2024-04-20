import { StepBase } from '@game/ai/steps/step-base';
import { angleTo, distanceBetween, toCoordinateUnitsFromMeters} from '@game/utilities/distance-util';

// Select the nearest hostile target.
export class StepSelectNearestTarget extends StepBase {
    constructor(core, currentState, configuration) {
        super(configuration)
        this._core = core;
    }

    execute(currentState) {
        let target = null;
        let currentEntity = this._core.getEntityWithId(currentState.entityId);

        if (currentState.targetedEntityId) {
            target = this._core.getEntityWithId(currentState.targetedEntityId)
        }
        else {
            let tag = this._core.getTag('Targetable')
            let targets = this._core.getTaggedAs('Targetable')
            tag.setEntity(currentEntity)
            let enemyTargets = []
            targets.forEach((target) => { 
                if (tag.getRelationshipTo(target) == 'enemy') {
                    if (distanceBetween(currentEntity, target) < toCoordinateUnitsFromMeters(1000)) {
                        enemyTargets.push(target)
                    }
                }
            })
            target = enemyTargets[Math.floor(Math.random()*(enemyTargets.length - 1))]
        }

        if (target && distanceBetween(currentEntity, target) > toCoordinateUnitsFromMeters(1000)) {
            target = null;
        }

        if (!target) {
            this._core.send('TARGET_REQUESTED', {sourceEntityId: currentState.entityId, targetEntityId: null})
            currentState.targetedEntityId = null
            return;
        }
        else {
            this._core.send('TARGET_REQUESTED', {sourceEntityId: currentState.entityId, targetEntityId: target.id})
            currentState.targetedEntityId = target.id
        }

    }
    meetsPreconditions() {
        return true;
    }

    checkCompleted(currentState) {
        return true;
    }
}