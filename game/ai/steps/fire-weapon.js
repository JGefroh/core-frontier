import { StepBase } from '@game/ai/steps/step-base';
import { distanceFromTo } from '@game/utilities/distance-util';

export class StepFireWeapon extends StepBase {
    constructor(core, currentState, configuration) {
        super(configuration)
        this._core = core;
    }

    execute(currentState) {
        let entity = this._core.getEntityWithId(currentState.targetedEntityId)
        let attached = entity.getComponent('AttachedComponent')
        this._core.send("REQUEST_FIRE_WEAPON", {
                entityId: attached?.attachedToEntity?.id || currentState.entityId, 
                weaponKey: this.configuration.weaponKey, 
                fireRequested: true})
    }

    meetsPreconditions() {
        return true;
    }

    checkCompleted(currentState) {
        return true;
    }
}