import { default as Component } from '@core/component';

export default class DecayerComponent extends Component {
    constructor(payload) {
        super()
        this.componentType = 'DecayerComponent'
        this.decayStartedAt = Date.now();
        this.decayIn = payload.decayIn || 3000
        this.onDecayEffect = payload.onDecayEffect || 'destroy_entity'
    }
}