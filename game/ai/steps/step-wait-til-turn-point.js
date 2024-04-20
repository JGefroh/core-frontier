import { StepBase } from '@game/ai/steps/step-base';
import { distanceFromTo, angleTo, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';

export class WaitTilTurnPoint extends StepBase {
    constructor(core, currentState, configuration) {
        super(configuration)
        this._core = core;
    }

    execute(currentState) {
    }

    meetsPreconditions() {
        return true;
    }
    
    checkCompleted(currentState) {
        const remainingDistance = distanceFromTo(currentState.xPosition, currentState.yPosition, currentState.destinationXPosition, currentState.destinationYPosition)
        const initialVelocity = currentState.vectorMagnitude;
        const decelerationRequired = (initialVelocity * initialVelocity) / (2 * remainingDistance);
        const timeToStop = initialVelocity / decelerationRequired;

        if (decelerationRequired > currentState.accelerationMagnitude) {
            return true;
        }
        const remainingTime = remainingDistance / initialVelocity;
        
        if (timeToStop <= remainingTime) {
            return true;
        }
    }
}