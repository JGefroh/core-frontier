import { default as Component } from '@core/component';

export default class TargetableComponent extends Component {
    constructor(payload = {}) {
        super()
        this.componentType = 'TargetableComponent'
    }
}