export class TacticPatrol {
    constructor(configuration = {}) {
        this.configuration = configuration;
        this.actionOptions = [
            {key: 'move_to', configuration: {xPosition: configuration.xPosition, yPosition: configuration.yPosition, radius: configuration.radius}},
            {key: 'fire_weapon_at_target'},
            {key: 'select_nearby_target'},
            {key: 'idle'},
        ]
    }

    getActionOptions() {
        return this.actionOptions;
    }
}