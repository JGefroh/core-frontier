export class TacticAttack {
    constructor(configuration = {}) {
        this.configuration = configuration;
        this.actionOptions = [
            // If a target is nearby, attack and destroy it.
            {key: 'select_nearby_target'},
            {key: 'fire_weapon_at_target'},
            // Go to the target
            {key: 'move_to', configuration: {xPosition: configuration.xPosition, yPosition: configuration.yPosition, radius: configuration.radius}},
            {key: 'idle'},
        ]
    }

    getActionOptions() {
        return this.actionOptions;
    }
}