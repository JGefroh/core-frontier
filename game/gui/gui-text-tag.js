import { default as Tag } from '@core/tag'

export default class GuiText extends Tag {
    static tagType = 'GuiText'
    constructor() {
      super();
      this.tagType = 'GuiText'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('GuiTextComponent') && entity.hasComponent('PositionComponent');
    };
  
    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    };
  
    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    };
  
    getWidth() {
      return this.entity.getComponent('PositionComponent').width;
    };

    getHeight() {
      return this.entity.getComponent('PositionComponent').height;
    }

    getText() {
      return this.entity.getComponent('GuiTextComponent').text
    }

    setText(text) {
      this.entity.getComponent('GuiTextComponent').text = text;
    }

    getFontSize() {
      return this.entity.getComponent('GuiTextComponent').fontSize;
    }

    getImagePath() {
      return this.entity.getComponent('GuiTextComponent').imagePath;
    }

    getLayer() {
      return this.entity.getComponent('GuiTextComponent').layer
    }

    setLayer(layer) {
      this.entity.getComponent('GuiTextComponent').layer = layer
    }
    
    getUpdateWith() {
      return this.entity.getComponent('GuiTextComponent').updateWith;
    }

    getShouldRender() {
      return !this.entity.getComponent('RenderComponent') || this.entity.getComponent('RenderComponent').shouldRender;
    }

    getBearingDegrees() {
      return this.entity.getComponent('PositionComponent').bearingDegrees
    }

    setImageObject(imageObject) {
      this.entity.getComponent('GuiTextComponent').imageObject = imageObject
    }

    getImageObject() {
      return this.entity.getComponent('GuiTextComponent').imageObject
    }

    getTotalVector() {
      if (this.entity.getComponent('VectorComponent')) {
        return this.entity.getComponent('VectorComponent').calculateTotalVector()
      }
    }

    getTextOffsetX() {
      return this.entity.getComponent('GuiTextComponent').textOffsetX;
    }

    getTextOffsetY() {
      return this.entity.getComponent('GuiTextComponent').textOffsetY;
    }
  }
  