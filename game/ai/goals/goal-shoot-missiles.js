export class GoalShootMissiles {
    constructor(configuration) {
        this.configuration = configuration
        this.tacticOptions = [
            {key: 'turret', configuration: configuration}
        ]
    }

    getTacticOptions() {
        return this.tacticOptions;
    }
}