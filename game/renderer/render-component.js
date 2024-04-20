import { default as Component } from '@core/component';

export default class RenderComponent extends Component {
    constructor(payload) {
        super()
        this.width = payload.width;
        this.height = payload.height;
        this.imagePath = payload.imagePath
        this.imageObject = null;
        this.componentType = 'RenderComponent'
        this.text = payload.text;
        this.shouldRender = true;
        this.renderColor = payload.renderColor || 'rgba(255,255,255,0.4)';
        this.renderShape = payload.renderShape || 'rectangle';
        this.renderScale = payload.renderScale >= 0 ? payload.renderScale : 1; // The scale at which the object should respond to viewport changes.
        this.renderOverlayColor = payload.renderOverlayColor || 'rgba(255,255,255,1)';

        this.lineDash = payload.lineDash || [] // Required or else Canvas will throw error.
    }
    

    setImageObject(imageObject) {
        this.imageObject = imageObject;
    }

    setText(text) {
        this.text = text;
    }
}