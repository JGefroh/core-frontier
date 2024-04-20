
export let toCoordinateUnitsFromMeters = (meters) => {
    return 6.56 * meters;
}

export let toCoordinateUnitsFromFeet = (feet) => {
    return 2 * feet
}

export let toCoordinateUnitsFromPixels = (pixels) => {
    return pixels;
}

export let toMetersFromCoordinateUnits = (coordinateUnits) => {
    return coordinateUnits / 6.56;
}

export let toPixelsFromCoordinateUnits = (coordinateUnits) => {
    return coordinateUnits;
}

export let toFeetFromCoordinateUnits = (coordinateUnits) => {
    return coordinateUnits / 2
}

export let toFriendlyMeters = (meters, fixedUnits = 2) => {
    if (meters < 1000) {
        return meters.toFixed(fixedUnits) + 'm';
    } else if (meters < 1000000) {
        return (meters / 1000).toFixed(fixedUnits) + 'k';
    } else if (meters < 1000000000) {
        return (meters / 1000000).toFixed(fixedUnits) + 'Mm';
    } else if (meters < 0.5 * 149600000 * 1000) { // 0.5 AU in meters
        return (meters / (149600000 * 1000)).toFixed(fixedUnits) + 'AU';
    } else {
        return (meters / (149600000 * 1000)).toFixed(fixedUnits) + 'AU';
    }
}

export let distanceFromTo = (fromXPosition, fromYPosition, toXPosition, toYPosition) => {
    let xDelta = (Math.max(fromXPosition, toXPosition) - Math.min(fromXPosition, toXPosition))
    let yDelta = (Math.max(fromYPosition, toYPosition) - Math.min(fromYPosition, toYPosition))
    return Math.sqrt(xDelta*xDelta + yDelta*yDelta);
}

export let distanceBetween = (entity1, entity2) => {
    let fromXPosition = entity1.getComponent('PositionComponent').xPosition
    let fromYPosition = entity1.getComponent('PositionComponent').yPosition
    let toXPosition = entity2.getComponent('PositionComponent').xPosition
    let toYPosition = entity2.getComponent('PositionComponent').yPosition
    return distanceFromTo(fromXPosition, fromYPosition, toXPosition, toYPosition)
}





export let angleTo = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    let angleRad = Math.atan2(dy, dx);
    
    let angleDeg = angleRad * (180 / Math.PI);
    
    if (angleDeg < 0) {
        angleDeg += 360;
    }
    else if (angleDeg >= 360) {
        angleDeg -= 360;
    }
    
    return angleDeg;
}
export let angleToWithVelocity = (x1, y1, x2, y2, vx, vy, range, targetVx, targetVy) => {
    // Calculate the distance between the current position and the target position
    const distance = distanceFromTo(x1, y1, x2, y2);
    
    // Calculate the adjusted target position based on the velocity and range
    const adjustedX = x2 + (vx - targetVx) * (distance / range);
    const adjustedY = y2 + (vy - targetVy) * (distance / range);
    
    // Calculate the angle between the adjusted position and the current position
    const dx = adjustedX - x1;
    const dy = adjustedY - y1;
    
    let angleRad = Math.atan2(dy, dx);
    
    let angleDeg = angleRad * (180 / Math.PI);
    
    if (angleDeg < 0) {
        angleDeg += 360;
    }
    else if (angleDeg >= 360) {
        angleDeg -= 360;
    }
    
    return angleDeg;
}
export let calculateAcceleration = (currentMagnitude, currentAngle, targetMagnitude, targetAngle) => {
    // Convert angles to radians
    currentAngle = currentAngle * Math.PI / 180;
    targetAngle = targetAngle * Math.PI / 180;

    // Calculate current velocity components
    let currentVx = currentMagnitude * Math.cos(currentAngle);
    let currentVy = currentMagnitude * Math.sin(currentAngle);

    // Calculate target velocity components
    let targetVx = targetMagnitude * Math.cos(targetAngle);
    let targetVy = targetMagnitude * Math.sin(targetAngle);

    // Calculate required acceleration components
    let accelerationX = targetVx - currentVx;
    let accelerationY = targetVy - currentVy;

    // Calculate magnitude and angle of acceleration
    let accelerationMagnitude = Math.sqrt(accelerationX ** 2 + accelerationY ** 2);
    let requiredAccelerationAngle = Math.atan2(accelerationY, accelerationX) * 180 / Math.PI;
    requiredAccelerationAngle = (requiredAccelerationAngle + 360) % 360;

    return { magnitude: accelerationMagnitude, angleDegrees: requiredAccelerationAngle };
}
export let calculateRequiredAccelerationForDestination = (xPosition, yPosition, targetMagnitude, currentX, currentY, currentMagnitude, currentAngleDegrees, maxAcceleration) => {
    // Calculate distance to target
    let distanceToTarget = Math.sqrt((xPosition - currentX) ** 2 + (yPosition - currentY) ** 2);

    // Check if already at the target position
    if (distanceToTarget <= 0.1) { // Adjust this threshold as needed
        return { magnitude: 0, angleDegrees: 0 };
    }

    // Calculate angle towards target
    let angleToTarget = Math.atan2(yPosition - currentY, xPosition - currentX) * 180 / Math.PI;

    // Calculate current velocity components
    let currentVx = currentMagnitude * Math.cos(currentAngleDegrees * Math.PI / 180);
    let currentVy = currentMagnitude * Math.sin(currentAngleDegrees * Math.PI / 180);

    // Calculate required velocity components to reach the target position
    let requiredVx = xPosition - currentX;
    let requiredVy = yPosition - currentY;

    // Calculate required acceleration components
    let accelerationX = requiredVx - currentVx;
    let accelerationY = requiredVy - currentVy;

    // Calculate magnitude and angle of required acceleration
    let requiredAccelerationMagnitude = Math.sqrt(accelerationX ** 2 + accelerationY ** 2);
    let requiredAccelerationAngle = Math.atan2(accelerationY, accelerationX) * 180 / Math.PI;

    // Normalize the required acceleration vector
    let scaleFactor = targetMagnitude / requiredAccelerationMagnitude;
    accelerationX *= scaleFactor;
    accelerationY *= scaleFactor;

    // Cap acceleration magnitude to maxAcceleration
    let accelerationMagnitude = Math.sqrt(accelerationX ** 2 + accelerationY ** 2);
    if (accelerationMagnitude > maxAcceleration) {
        scaleFactor = maxAcceleration / accelerationMagnitude;
        accelerationX *= scaleFactor;
        accelerationY *= scaleFactor;
    }

    // Recalculate magnitude and angle of required acceleration after normalization
    requiredAccelerationMagnitude = Math.sqrt(accelerationX ** 2 + accelerationY ** 2);
    requiredAccelerationAngle = Math.atan2(accelerationY, accelerationX) * 180 / Math.PI;

    return { magnitude: requiredAccelerationMagnitude, angleDegrees: requiredAccelerationAngle };
}
 
export let angleToPredicted = (
    sourceXPosition,
    sourceYPosition,
    sourceVelocityMagnitude,
    sourceVelocityDegrees,
    targetXPosition,
    targetYPosition,
    targetWidth,
    targetHeight,
    targetBearingDegrees,
    targetVelocityMagnitude,
    targetVelocityDegrees,
    projectileSpeed
) => {
    // Check if the target is stationary
    if (targetVelocityMagnitude === 0) {
        // Calculate angle directly to the target
        let angleToTarget = Math.atan2(targetYPosition - sourceYPosition, targetXPosition - sourceXPosition) * 180 / Math.PI;
        // Ensure angle is within the range [0, 360)
        if (angleToTarget < 0) {
            angleToTarget += 360;
        } else if (angleToTarget >= 360) {
            angleToTarget -= 360;
        }
        return angleToTarget;
    }

    // Check if the source is stationary
    if (sourceVelocityMagnitude === 0) {
        // Calculate angle directly to the target
        let angleToTarget = Math.atan2(targetYPosition - sourceYPosition, targetXPosition - sourceXPosition) * 180 / Math.PI;
        // Ensure angle is within the range [0, 360)
        if (angleToTarget < 0) {
            angleToTarget += 360;
        } else if (angleToTarget >= 360) {
            angleToTarget -= 360;
        }
        return angleToTarget;
    }

    // Convert degrees to radians
    const sourceVelocityRadians = sourceVelocityDegrees * Math.PI / 180;
    const targetBearingRadians = targetBearingDegrees * Math.PI / 180;
    const targetVelocityRadians = targetVelocityDegrees * Math.PI / 180;

    // Calculate relative position of the target with respect to the source
    const relativeX = targetXPosition - sourceXPosition;
    const relativeY = targetYPosition - sourceYPosition;

    // Calculate relative velocity components of the target with respect to the source
    const relativeVelocityX = targetVelocityMagnitude * Math.cos(targetVelocityRadians) - sourceVelocityMagnitude * Math.cos(sourceVelocityRadians);
    const relativeVelocityY = targetVelocityMagnitude * Math.sin(targetVelocityRadians) - sourceVelocityMagnitude * Math.sin(sourceVelocityRadians);

    // Adjust relative velocity considering projectile speed on top of source velocity
    const relativeVelocityXAdjusted = relativeVelocityX - sourceVelocityMagnitude * Math.cos(sourceVelocityRadians);
    const relativeVelocityYAdjusted = relativeVelocityY - sourceVelocityMagnitude * Math.sin(sourceVelocityRadians);

    // Calculate time to intercept target
    const a = relativeVelocityXAdjusted ** 2 + relativeVelocityYAdjusted ** 2 - projectileSpeed ** 2;
    const b = 2 * (relativeX * relativeVelocityXAdjusted + relativeY * relativeVelocityYAdjusted);
    const c = relativeX ** 2 + relativeY ** 2;

    // Calculate discriminant
    const discriminant = b ** 2 - 4 * a * c;

    if (discriminant < 0) {
        // No valid interception time, return default angle
        return 0;
    }

    // Calculate time to intercept using the quadratic formula
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    let timeToIntercept = 0;

    if (t1 > 0 && t2 > 0) {
        // Both roots are positive, choose the smaller one
        timeToIntercept = Math.min(t1, t2);
    } else if (t1 > 0) {
        // Only t1 is positive
        timeToIntercept = t1;
    } else if (t2 > 0) {
        // Only t2 is positive
        timeToIntercept = t2;
    } else {
        // Both roots are non-positive, no valid interception time
        return 0;
    }

    // Calculate future position of the target
    const futureTargetX = targetXPosition + targetVelocityMagnitude * Math.cos(targetVelocityRadians) * timeToIntercept;
    const futureTargetY = targetYPosition + targetVelocityMagnitude * Math.sin(targetVelocityRadians) * timeToIntercept;

    // Calculate angle between source's current position and vector pointing to future target position
    let angleToTurn = Math.atan2(futureTargetY - sourceYPosition, futureTargetX - sourceXPosition) * 180 / Math.PI;

    // Ensure angle is within the range [0, 360)
    if (angleToTurn < 0) {
        angleToTurn += 360;
    } else if (angleToTurn >= 360) {
        angleToTurn -= 360;
    }

    return angleToTurn;
};