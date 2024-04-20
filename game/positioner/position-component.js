import { default as Component} from '@core/component'

export default class PositionComponent extends Component {
    constructor(payload) {
        super();
        this.xPosition = payload.xPosition;
        this.yPosition = payload.yPosition;
        this.originXPosition = payload.xPosition;
        this.originYPosition = payload.yPosition;
        this.bearingDegrees = payload.bearingDegrees || 0;
        this.originalBearing = this.bearingDegrees;
        this.width = payload.width;
        this.height = payload.height;
        this.componentType = "PositionComponent"
        this.layer = payload.layer || 'world'
    }
}