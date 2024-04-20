import { default as Component } from '@core/component';

export default class SelectionComponent extends Component {
    constructor(payload = {}) {
        super()
        this.componentType = 'SelectionComponent'
        this.label = payload.label || null;
    }
}