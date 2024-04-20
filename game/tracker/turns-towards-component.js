import { default as Component} from '@core/component'

export default class TurnsTowardsComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = "TurnsTowardsComponent"
        this.turnSpeed = payload.turnSpeed || 1;
        this.turnTarget = payload.turnTarget || 'mouse'
    }
}