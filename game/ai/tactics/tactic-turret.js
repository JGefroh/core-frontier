export class TacticTurret {
    constructor(configuration = {}) {
        this.configuration = configuration;
        this.actionOptions = [
            {key: 'fire_weapon', configuration: { weaponKey: 'pdc' }},
            {key: 'select_nearby_target'},
            {key: 'idle'},
        ]
    }

    getActionOptions() {
        return this.actionOptions;
    }
}