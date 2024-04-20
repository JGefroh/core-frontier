import { default as Component} from '@core/component'

export default class DetailComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = "DetailComponent"
        this.label = payload.label || 'Entity' // Display-label (eg. the name)
        this.code = payload.code || '' // Display-code (eg. a callsign or other identifier
        this.type = payload.type || 'Unknown' // Thye type or categorization of entity (eg. Missile, Ammunition, etc.)
        this.subtype = payload.subtype || 'Unknown' // The subtype categorization of entity (eg. Missile, Ammunition, etc.)
        this.shortDescription = payload.shortDescription
        this.longDescription = payload.longDescription
        this.technicalDescription = payload.technicalDescription

        this.debugLine1 = null;
        this.debugLine2 = null;
    }
}