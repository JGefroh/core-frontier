export class GoalDefend {
    constructor(configuration) {
        this.configuration = configuration
        this.tacticOptions = [
            {key: 'patrol', configuration: configuration}
        ]
    }

    getTacticOptions() {
        return this.tacticOptions;
    }
}