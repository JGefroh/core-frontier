import { default as Component } from '@core/component';

export default class IffComponent extends Component {
    constructor(payload) {
        super()
        this.componentType = 'IffComponent'
        this.iff = payload.iff || 'neutral'
        this.iffColor = null;
    }
}