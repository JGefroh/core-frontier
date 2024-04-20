
// Function to calculate the distance at which the ship should start decelerating to come to a complete stop
export function calculateDecelerationDistance(currentVectorMagnitude, currentAcceleration) {
    // Calculate the time it would take to decelerate from the current velocity to zero
    const decelerationTime = Math.abs(currentVectorMagnitude / currentAcceleration);

    // Calculate the distance covered during deceleration
    return 0.5 * currentAcceleration * Math.pow(decelerationTime, 2);
}

export function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function calculateStoppingDistance(xPosition, yPosition, destinationXPosition, destinationYPosition, currentVectorMagnitude, currentAcceleration) {
    var distanceToDestination = calculateDistance(xPosition, yPosition, destinationXPosition, destinationYPosition);
    var timeToStop = currentVectorMagnitude / currentAcceleration;
    var distanceDeceleration = (currentVectorMagnitude * currentVectorMagnitude) / (2 * currentAcceleration);
    var stoppingDistance = distanceDeceleration;
    if (distanceToDestination > distanceDeceleration) {
        stoppingDistance += distanceToDestination - distanceDeceleration;
    }
    
    return {
        distanceToDestination: distanceToDestination,
        timeToStop: timeToStop,
        distanceDeceleration: distanceDeceleration,
        stoppingDistance: stoppingDistance
    }
}

// Function to find the shortest angle between two angles (in degrees)
export function shortestAngle(angle1, angle2) {
    let angle = (angle2 - angle1 + 360) % 360;
    if (angle > 180) {
        angle -= 360;
    }
    return angle;
}