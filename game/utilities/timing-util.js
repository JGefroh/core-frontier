export let notYetTime = (desiredTimesPerSecond, lastRunTimestamp) => {
    if (!lastRunTimestamp || !desiredTimesPerSecond) {
        return false;
    }
    
    let framesPerSecond = 60;
    let maxTimePerFrame = 1 / framesPerSecond;
    let timeToWaitInMs = 1000 / desiredTimesPerSecond

    if (Date.now() - lastRunTimestamp <= timeToWaitInMs) {
        return true;
    }

    return false;
}
