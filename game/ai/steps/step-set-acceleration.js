import { StepBase } from '@game/ai/steps/step-base';

export class StepSetAcceleration extends StepBase {
    constructor(core, currentState, configuration) {
        super(configuration)
        this._core = core;
    }

    execute(currentState) {
        let desiredAcceleration = this.getDesiredAcceleration(currentState)
        this._core.send("REQUEST_SET_ACCELERATION", {entityId: currentState.entityId, adjustTo: desiredAcceleration} );
    }

    meetsPreconditions() {
        return true;
    }

    checkCompleted(currentState) {
        let desiredAcceleration = this.getDesiredAcceleration(currentState)
        if (this.configuration.matchSpeed) {
            return currentState.vectorMagnitude <= 0.01
        }
        else {
            return currentState.accelerationMagnitude == Math.min(desiredAcceleration, currentState.accelerationMagnitudeMax);
        }
    }

    getDesiredAcceleration(currentState) {
        if (this.configuration.matchSpeed) {
            return currentState.vectorMagnitude;
        }
        else if (this.configuration.desiredAcceleration != null) {
            return this.configuration.desiredAcceleration
        }
        else {
            return currentState.desiredAcceleration;
        }
    }
}