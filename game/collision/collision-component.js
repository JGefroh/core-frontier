import { default as Component} from '@core/component'

export default class CollisionComponent extends Component {
    constructor(payload = {}) {
        super();
        this.collisionGroup = payload.collisionGroup || 'default';
        this.componentType = "CollisionComponent"
    }
}