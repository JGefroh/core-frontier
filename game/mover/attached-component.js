import { default as Component} from '@core/component'

export default class AttachedComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = "AttachedComponent";
        this.attachmentType = payload.attachmentType || 'fixed';
        this.attachedToEntity = payload.attachedToEntity;
        this.attachmentOptions = payload.attachmentOptions || {}
        this.sync = payload.sync || []
    }
}