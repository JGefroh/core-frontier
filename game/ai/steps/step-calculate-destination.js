import { StepBase } from '@game/ai/steps/step-base';
import { angleTo } from '@game/utilities/distance-util';

export class StepCalculateDestination extends StepBase {
    constructor(core, currentState, configuration) {
        super(configuration)
        this._core = core;
        this.configuration = configuration;
    }

    execute(currentState) {
        if (currentState.destinationXPosition != null && currentState.destinationYPosition != null) {
            return;
        }
        if (this.configuration.radius) {
            let coordinates = this.getRandomPointInCircle(this.configuration.radius, this.configuration.xPosition, this.configuration.yPosition)
            currentState.destinationXPosition = coordinates.x
            currentState.destinationYPosition = coordinates.y
        }
        else {
            if (this.configuration.destinationXPosition != null) {
                currentState.destinationXPosition = this.configuration.destinationXPosition;
            }
            if (this.configuration.destinationYPosition != null) {
                currentState.destinationYPosition = this.configuration.destinationYPosition;
            }
        }
        
        currentState.desiredBearing = angleTo(currentState.xPosition, currentState.yPosition, currentState.destinationXPosition, currentState.destinationYPosition)
    }

    meetsPreconditions() {
        return true;
    }

    checkCompleted(currentState) {
        return true;
    }
    
    getRandomPointInCircle(radius, destinationXPosition, destinationYPosition) {
        var angle = Math.random() * 2 * Math.PI;
        var randomX = destinationXPosition + radius * Math.cos(angle);
        var randomY = destinationYPosition + radius * Math.sin(angle);
        return { x: randomX, y: randomY };
    }
    
}