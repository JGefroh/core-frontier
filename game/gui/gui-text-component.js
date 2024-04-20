import { default as Component } from '@core/component';

export default class GuiTextComponent extends Component {
    constructor(payload) {
        super()
        this.imagePath = payload.imagePath
        this.imageObject = null;
        this.componentType = 'GuiTextComponent'
        this.text = payload.text;
        this.layer = payload.layer || 'canvas'
        this.updateWith = payload.updateWith;
        this.fontSize = payload.fontSize || '16'
        this.textOffsetX = payload.textOffsetX || 0;
        this.textOffsetY = payload.textOffsetY || 0;
    }

    setText(text) {
        this.text = text;
    }
}