import { default as Component } from '@core/component';

export default class ExplosionComponent extends Component {
    constructor(payload) {
        super()
        this.componentType = 'ExplosionComponent'
        this.particleCount = payload.particleCount || 100;
        this.maxRadius = payload.maxRadius || 50;
        this.currentRadius = 1;
        this.rateOfChange = payload.rateOfChange || 1.1
    }
}