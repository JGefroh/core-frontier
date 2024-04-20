import { distanceFromTo, angleTo, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';
import { ActionBase } from '@game/ai/actions/action-base';

export class ActionMoveTo extends ActionBase {
    constructor(configuration) {
        super(configuration)
        this.score = 0;
        this.key = 'move_to'
        this.cooldown = 3000
        this.stepOptions = [
            {key: 'calculate_destination', configuration: {xPosition: configuration.xPosition, yPosition: configuration.yPosition, radius: configuration.radius}},
            {key: 'move_adjust_to_destination', configuration: {xPosition: configuration.xPosition, yPosition: configuration.yPosition, radius: configuration.radius, alwaysRun: true}},
        ]
    }

    prepareAction(currentState) {
    }

    onActionCompleted(currentState) {
        delete currentState.desiredDegrees
        delete currentState.desiredAcceleration;
        delete currentState.destinationXPosition;
        delete currentState.destinationYPosition;
    }

    calculateScore(currentState) {
        this.score = 100;
    }
}