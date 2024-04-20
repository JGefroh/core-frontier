import { default as Component } from '@core/component';

export default class HealthComponent extends Component {
    constructor(payload) {
        super()
        this.componentType = 'HealthComponent';
        this.health = payload.health;
    }
}