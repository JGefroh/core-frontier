import { default as Component } from '@core/component';

export default class GuiCanvasRenderComponent extends Component {
    constructor(payload) {
        super()
        this.componentType = 'GuiCanvasRenderComponent';

        //Render
        this.postRender = payload.postRender;

        // Dimensions
        this.xPosition = payload.xPosition;
        this.yPosition = payload.yPosition;
        this.width = payload.width;
        this.height = payload.height;
        this.bearingDegrees = payload.bearingDegrees || 0
        
        //Circles
        this.radius = payload.radius

        //Images
        this.imageObject = payload.imageObject;
        this.imagePath = payload.imagePath;

        //Text
        this.text = payload.text;
        this.textOffsetX = payload.textOffsetX || 0; // Required for math.
        this.textOffsetY = payload.textOffsetY || 0; // Required for math.

        //Styles
        this.strokeStyle = payload.strokeStyle;
        this.fillStyle = payload.fillStyle;
        this.fontSize = payload.fontSize;
        this.lineWidth = payload.lineWidth;
        this.fontColor = payload.fontColor;
        this.lineDash = payload.lineDash || [] // Required or else Canvas will throw error.
        this.hoverStyles = payload.hoverStyles;
        this.fontType = payload.fontType;

        //Interaction
        this.isHovered = false;
        this.isVisible = payload.isVisible == false ? false : true
        
    }
}