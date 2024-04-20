import { default as Component } from '@core/component';

export default class RenderOverlayComponent extends Component {
    constructor(payload) {
        super()
        this.componentType = 'RenderOverlayComponent'

        this.imagePath = payload.imagePath
        this.imageObject = null;

        this.overlayColor = payload.overlayColor || 'rgba(255,255,255,0.4)';
        this.overlayShape = payload.overlayShape || 'rectangle'
    }

    setImageObject(imageObject) {
        this.imageObject = imageObject;
    }
}