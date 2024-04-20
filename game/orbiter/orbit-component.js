import { default as Component} from '@core/component'

export default class OrbitComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = "OrbitComponent"
        this.orbitEntityKey = payload.orbitEntityKey || null;
        this.orbitEntityId = payload.orbitEntityId || null;
        this.orbitXPosition = payload.orbitXPosition || 0;
        this.orbitYPosition = payload.orbitYPosition || 0;
        this.orbitCompletionTime = payload.orbitCompletionTime || 1;
        this.orbitRadius = payload.orbitRadius || 1;
        this.startAngle = payload.startAngle || 0
    }
}