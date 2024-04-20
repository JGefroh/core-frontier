import { default as Tag } from '@core/tag'

export default class Cursorable extends Tag {
    static tagType = 'Cursorable'

    constructor() {
        super()
        this.tagType = 'Cursorable'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('MouseTrackerComponent') && entity.hasComponent('PositionComponent');
    };

    setPosition(xPosition, yPosition) {
      this.entity.getComponent('PositionComponent').xPosition = xPosition;
      this.entity.getComponent('PositionComponent').yPosition = yPosition;
    }
  }
  