import { StepBase } from '@game/ai/steps/step-base';
import { toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';

export class StepCalculateRandomAcceleration extends StepBase {
    constructor(core, currentState, configuration) {
        super(configuration)
        this._core = core;
    }

    execute(currentState) {
        if (currentState.desiredAcceleration) {
            return;
        }
        let minimum =  toCoordinateUnitsFromMeters(9.81);
        if (this.configuration.accelerationType == 'attack') {
            minimum = toCoordinateUnitsFromMeters(140);
        }
        let newAcceleration = Math.random() *  toCoordinateUnitsFromMeters(300);
        currentState.desiredAcceleration = newAcceleration + minimum;
    }
    meetsPreconditions() {
        return true;
    }

    checkCompleted(currentState) {
        return currentState.desiredAcceleration;
    }
}