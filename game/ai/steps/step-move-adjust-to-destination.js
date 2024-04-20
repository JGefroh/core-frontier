import { StepBase } from '@game/ai/steps/step-base';
import { distanceFromTo, calculateRequiredAccelerationForDestination, toCoordinateUnitsFromMeters} from '@game/utilities/distance-util';

export class StepMoveAdjustToDestination extends StepBase {
    constructor(core, currentState, configuration) {
        super(configuration)
        this._core = core;
    }

    execute(currentState) {
        // let entity = this._core.getEntityWithId(currentState.targetedEntityId)
        let details = calculateRequiredAccelerationForDestination(
            this.configuration.xPosition || currentState.destinationXPosition, 
            this.configuration.yPosition || currentState.destinationYPosition, 
            100, currentState.xPosition, currentState.yPosition, currentState.vectorMagnitude, 
            currentState.vectorBearing, toCoordinateUnitsFromMeters(30)) 
        this._core.send("REQUEST_SET_BEARING", {entityId: currentState.entityId, adjustTo: details.angleDegrees})
        this._core.send("REQUEST_SET_ACCELERATION", {entityId: currentState.entityId, adjustTo: details.magnitude})
    }

    meetsPreconditions() {
        return true;
    }

    checkCompleted(currentState) {
        return false;
    }
}