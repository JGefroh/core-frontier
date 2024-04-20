import { StepBase } from '@game/ai/steps/step-base';

export class StepSetMagnitude extends StepBase {
    constructor(core, currentState, configuration) {
        super(configuration)
        this._core = core;
        this.configuration = configuration;
    }

    execute(currentState) {
        let desiredAcceleration = this.getDesiredAcceleration(currentState)
        
        if (currentState.vectorMagnitude >= desiredAcceleration) {
            // already going above desired speed
            this._core.send("REQUEST_SET_ACCELERATION", {entityId: currentState.entityId, adjustTo: 0} );
            return;
        }
        else {
            this._core.send("REQUEST_SET_ACCELERATION", {entityId: currentState.entityId, adjustTo: desiredAcceleration - currentState.vectorMagnitude} );
        }

    }

    meetsPreconditions() {
        return true;
    }

    checkCompleted(currentState) {
        return true;
    }

    getDesiredAcceleration(currentState) {
        if (this.configuration.desiredAcceleration != null) {
            return this.configuration.desiredAcceleration
        }
        else {
            return currentState.desiredAcceleration;
        }
    }
}