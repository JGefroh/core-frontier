import { default as Tag } from '@core/tag'

export default class GuiManifestListable extends Tag {
    static tagType = 'GuiManifestListable'
    constructor() {
      super();
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('GuiManifestListingComponent');
    };
    setLabel(label) {
      this.entity.getComponent('GuiManifestListingComponent').label = label;
    }
  
    getLabel() {
      return this.entity.getComponent('DetailComponent').label;
    }

    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    }

    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    }
    
    getType() {
      return this.entity.getComponent('GuiManifestListingComponent').type;
    }
    getTypeLabel() {
      return this.entity.getComponent('GuiManifestListingComponent').typeLabel;
    }

    getRenderColor() {
      return this.entity.getComponent('IffComponent')?.iffColor;
    }
  }
  