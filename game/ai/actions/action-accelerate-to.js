import { distanceFromTo, angleTo, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';
import { ActionBase } from '@game/ai/actions/action-base';

export class ActionAccelerateTo extends ActionBase {
    constructor(configuration) {
        super(configuration)
        this.score = 0;
        this.key = 'accelerate_to'
        this.cooldown = 3000
        this.stepOptions = [
            {key: 'calculate_destination', configuration: {xPosition: configuration.xPosition, yPosition: configuration.yPosition, radius: 3000}},
            {key: 'set_bearing'}, // turn towards
            {key: 'calculate_random_acceleration'}, // choose acceleration
            {key: 'set_acceleration'}, 
            {key: 'wait_til_turn_point'},
            {key: 'set_acceleration', configuration: {desiredAcceleration: 0}}, // turn off
            {key: 'calculate_deceleration_bearing'}, //find opposite x,y
            {key: 'set_bearing'}, // turn towards
            {key: 'set_acceleration', configuration: {matchSpeed: true}} // re-accelerate to
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