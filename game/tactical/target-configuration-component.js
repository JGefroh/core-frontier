import { default as Component} from '@core/component'

export default class TargetConfigurationComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = "TargetConfigurationComponent"

        this.showFlightPath = payload.showFlightPath;
        this.showOverlayLabel = payload.showOverlayLabel == true || false
    }
}