import { default as Component } from '@core/component';

export default class GuiManifestListingComponent extends Component {
    constructor(payload) {
        super()
        this.componentType = 'GuiManifestListingComponent';

        this.typeLabel = payload.typeLabel;
        this.type = payload.type;
    }
}