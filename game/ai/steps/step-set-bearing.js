import { StepBase } from '@game/ai/steps/step-base';
import { distanceFromTo, angleToWithVelocity, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';

export class StepSetBearing extends StepBase {
    constructor(core, currentState, configuration) {
        super(configuration)
        this._core = core;
    }

    execute(currentState) {
        let core = this._core
        this._core.send("REQUEST_SET_BEARING", {entityId: currentState.entityId, adjustTo: currentState.desiredBearing} );
    }

    meetsPreconditions() {
        return true;
    }
    
    checkCompleted(currentState) {
        return (currentState.desiredBearing == null) || currentState.bearingDegrees == currentState.desiredBearing;
    }
}