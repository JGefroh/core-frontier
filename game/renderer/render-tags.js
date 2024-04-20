import { default as Tag } from '@core/tag'

export default class Renderable extends Tag {
    static tagType = 'Renderable'

    constructor() {
      super();
      this.tagType = 'Renderable'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('RenderComponent') && entity.hasComponent('PositionComponent');
    };

    getShouldRender() {
      return this.entity.getComponent('RenderComponent').shouldRender;
    }

    setShouldRender(shouldRender) {
      return this.entity.getComponent('RenderComponent').shouldRender = shouldRender;
    }
  
    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    };
  
    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    };
  
    getWidth() {
      return this.entity.getComponent('RenderComponent').width || this.entity.getComponent('PositionComponent').width;
    };

    getHeight() {
      return this.entity.getComponent('RenderComponent').height || this.entity.getComponent('PositionComponent').height;
    }

    getImagePath() {
      return this.entity.getComponent('RenderComponent').imagePath;
    }

    setImageObject(imageObject) {
      return this.entity.getComponent('RenderComponent').setImageObject(imageObject);
    }

    getImageObject() {
      return this.entity.getComponent('RenderComponent').imageObject;
    }

    getBearingDegrees() {
      return this.entity.getComponent('PositionComponent').bearingDegrees
    }
    
    getBearingRadians() {
      return (this.entity.getComponent('PositionComponent').bearingDegrees * Math.PI) / 180
    }

    getText() {
      return this.entity.getComponent('RenderComponent').text
    }

    getLayer() {
      return this.entity.getComponent('PositionComponent').layer
    }

    getRenderScale() {
      return this.entity.getComponent('RenderComponent').renderScale;
    }

    getRenderColor() {
      if (this.entity.getComponent('IffComponent')) {
        return this.entity.getComponent('IffComponent').iffColor;
      }
      else {
        return this.entity.getComponent('RenderComponent').renderColor;
      }
    }
    
    getRenderShape() {
      return this.entity.getComponent('RenderComponent').renderShape;
    }

    hasRenderOverlay() {
      return !!this.entity.getComponent('RenderOverlayComponent');
    }

    getRenderOverlayColor() {
      if (this.entity.getComponent('IffComponent')) {
        return this.entity.getComponent('IffComponent').iffColor;
      }
      else {
        return this.entity.getComponent('RenderOverlayComponent').overlayColor;
      }
    }
    getRenderOverlayShape() {
      return this.entity.getComponent('RenderOverlayComponent').overlayShape;
    }


    hasDetail() {
      return this.entity.getComponent('DetailComponent')
    }

    getDetailLabel(){
      return this.entity.getComponent('DetailComponent').label
    }
    getDetailCode() {
      return this.entity.getComponent('DetailComponent').code
    }
    getDetailSubtype() {
      return this.entity.getComponent('DetailComponent').subtype
    }
    getDetailType() {
      return this.entity.getComponent('DetailComponent').type
    }
    getDebugLine1() {
      return this.entity.getComponent('DetailComponent').debugLine1
    }
    getDebugLine2() {
      return this.entity.getComponent('DetailComponent').debugLine2
    }

    getPathPoints() {
      return this.entity.getComponent('RenderComponent').pathPoints || [];
    }

    getLineDash() {
      return this.entity.getComponent('RenderComponent')?.lineDash;
    }
  }
  