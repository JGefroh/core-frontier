import { StepBase } from '@game/ai/steps/step-base';
import { distanceFromTo } from '@game/utilities/distance-util';

export class StepFireWeaponAtTarget extends StepBase {
    constructor(core, currentState, configuration) {
        super(configuration)
        this._core = core;
    }

    execute(currentState) {
        let entity = this._core.getEntityWithId(currentState.targetedEntityId)
        if (Math.floor(Math.random() * 600) % 600 == 0) {
            this._core.send("REQUEST_FIRE_WEAPON", {
                    entityId: currentState.entityId, 
                    weaponKey: 'missile', 
                    fireRequested: true})
        }
        else {
            this._core.send("REQUEST_FIRE_WEAPON", {
                entityId: currentState.entityId, 
                weaponKey: 'machinegun', 
                fireRequested: true})
        }
    }

    meetsPreconditions() {
        return true;
    }

    checkCompleted(currentState) {
        return true;
    }
}