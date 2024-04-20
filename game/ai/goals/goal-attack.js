export class GoalAttack {
    constructor(configuration = {}) {
        this.configuration = configuration;
        this.tacticOptions = [
            {key: 'attack', configuration: configuration}
        ]
    }

    getTacticOptions() {
        return this.tacticOptions;
    }
}