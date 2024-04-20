import { default as Tag } from '@core/tag'

export default class ViewportFollowable extends Tag {
    static tagType = 'ViewportFollowable'

    constructor() {
      super();
      this.tagType = 'ViewportFollowable'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent');
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
    };
  }
  