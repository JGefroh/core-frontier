export class StepBase {
    constructor(configuration) {
        this.state = 'not_started'
        this.configuration = configuration || {}
    }

    executeStep(currentState) {
        this.execute(currentState)
    }
    
    isNotStarted() {
        return this.state == 'not_started'
    }

    isInProgress() {
        return this.state == 'in_progress'
    }

    isCompleted() {
        return this.state == 'completed'
    }

    setState(state) {
        this.state = state;
    }

    alwaysRunUntilComplete() {
        // Always run this for every action invocation
        // until it is completed
        return this.configuration.alwaysRunUntilComplete
    }

    alwaysRun() {
        // Always run this for every action invocation
        // regardless of completion
        return this.configuration.alwaysRun
    }
}