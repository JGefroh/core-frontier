import { StepBase } from '@game/ai/steps/step-base';

export class StepCalculateDecelerationBearing extends StepBase {
    constructor(core, currentState, configuration) {
        super(configuration)
        this._core = core;
    }
 
    execute(currentState, configuration) {
        currentState.desiredBearing = (currentState.vectorBearing + 180) % 360;
    }
    meetsPreconditions() {
        return true;
    }

    checkCompleted(currentState) {
        return true;
    }
}