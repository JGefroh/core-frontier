import { default as Tag } from '@core/tag'

export default class GuiCanvasRenderable extends Tag {
    static tagType = 'GuiCanvasRenderable'
    constructor() {
      super();
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('GuiCanvasRenderComponent');
    };
  
    getXPosition() {
      return this.entity.getComponent('GuiCanvasRenderComponent').xPosition;
    };
  
    getYPosition() {
      return this.entity.getComponent('GuiCanvasRenderComponent').yPosition;
    };
  
    getWidth() {
      return this.entity.getComponent('GuiCanvasRenderComponent').width;
    };

    getHeight() {
      return this.entity.getComponent('GuiCanvasRenderComponent').height;
    }

    getText() {
      return this.entity.getComponent('GuiCanvasRenderComponent').text
    }

    setText(text) {
      this.entity.getComponent('GuiCanvasRenderComponent').text = text;
    }

    getImagePath() {
      return this.entity.getComponent('GuiCanvasRenderComponent').imagePath;
    }

    getBearingDegrees() {
      return this.entity.getComponent('GuiCanvasRenderComponent').bearingDegrees
    }

    getRadius() {
        return this.entity.getComponent('GuiCanvasRenderComponent').radius;   
    }

    setImageObject(imageObject) {
      this.entity.getComponent('GuiCanvasRenderComponent').imageObject = imageObject
    }

    getImageObject() {
      return this.entity.getComponent('GuiCanvasRenderComponent').imageObject
    }

    getTextOffsetX() {
      return this.entity.getComponent('GuiCanvasRenderComponent').textOffsetX;
    }

    getTextOffsetY() {
      return this.entity.getComponent('GuiCanvasRenderComponent').textOffsetY;
    }

    getFontSize() {
        return this.entity.getComponent('GuiCanvasRenderComponent').fontSize;
    }
    getFillStyle() {
        return this.entity.getComponent('GuiCanvasRenderComponent').fillStyle;   
    }
    getStrokeStyle() {
        return this.entity.getComponent('GuiCanvasRenderComponent').strokeStyle;   
    }
    getLineWidth() {
        return this.entity.getComponent('GuiCanvasRenderComponent').lineWidth;   
    }
    getFontColor() {
      return this.entity.getComponent('GuiCanvasRenderComponent').fontColor;
    }
    getLineDash() {
      return this.entity.getComponent('GuiCanvasRenderComponent').lineDash;
    }

    setFillStyle(fillStyle) {
      this.entity.getComponent('GuiCanvasRenderComponent').fillStyle = fillStyle;
    }
    
    getHoverStyle() {
      return this.entity.getComponent('GuiCanvasRenderComponent').hoverStyle;
    }

    setIsHovered(isHovered) {
      this.entity.getComponent('GuiCanvasRenderComponent').isHovered = isHovered;
    }

    getIsHovered() {
      return this.entity.getComponent('GuiCanvasRenderComponent').isHovered;
    }

    getHoverStyles() {
      return this.entity.getComponent('GuiCanvasRenderComponent').hoverStyles
    }

    getFontType() {
      return this.entity.getComponent('GuiCanvasRenderComponent').fontType
    }
    setIsVisible() {
      this.entity.getComponent('GuiCanvasRenderComponent').isVisible = !this.entity.getComponent('GuiCanvasRenderComponent').isVisible;
    }

    getIsVisible() {
      return this.entity.getComponent('GuiCanvasRenderComponent').isVisible
    }

    updateProperties(properties) {
      Object.assign(this.entity.getComponent('GuiCanvasRenderComponent'), properties)
    }

    hasPostRender() {
      return this.entity.getComponent('GuiCanvasRenderComponent').postRender;
    }
    postRender(renderable, canvasCtx) {
      this.entity.getComponent('GuiCanvasRenderComponent').postRender(renderable, canvasCtx);
    }
  }
  