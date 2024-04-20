export function getPositionInOrbit(xPosition, yPosition, orbitalRadius, orbitCompletionTime, startTime, startAngle = 0) {
    const orbitPeriod = orbitCompletionTime; // Convert completion time to milliseconds
    const currentTime = new Date().getTime() / 1000; // Current time in seconds
    const elapsedTime = ((currentTime - startTime) % orbitPeriod) / orbitPeriod; // Calculate elapsed time relative to starting time as a fraction of the orbit period
    const angle = (elapsedTime * 2 * Math.PI) + startAngle; // Convert elapsed time to an angle (radians), adding start angle

    // Calculate position in orbit based on angle
    const x = xPosition + orbitalRadius * Math.cos(angle);
    const y = yPosition + orbitalRadius * Math.sin(angle);

    return { x, y };
}