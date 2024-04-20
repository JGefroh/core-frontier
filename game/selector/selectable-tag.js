import { default as Tag } from '@core/tag'
import { isPointInRotatedRect } from '@game/utilities/collision-util';

export default class Selectable extends Tag{
    static tagType = 'Selectable'

    constructor() {
        super()
        this.tagType = 'Selectable'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('SelectionComponent');
    };

    getLabel() {
      return this.entity.getComponent('SelectionComponent').label || this.entity.key;
    }

    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    }
    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    }

    wasSelected(selectedXPosition, selectedYPosition, viewport) {
      let xPosition = this.entity.getComponent('PositionComponent').xPosition;
      let yPosition = this.entity.getComponent('PositionComponent').yPosition
      let width = this.entity.getComponent('PositionComponent').width;
      let height = this.entity.getComponent('PositionComponent').height;
      let bearingDegrees = this.entity.getComponent('PositionComponent').bearingDegrees;
      if (!viewport) {
        return;
      }

      if (width * viewport.scale < 700) {
        width = 700; // Expand to make it a bit more clickable.
      }
      if (height * viewport.scale < 700) {
        height = 700; // Expand to make it a bit more clickable.
      }

      let result = isPointInRotatedRect(selectedXPosition, selectedYPosition, xPosition, yPosition, width, height, bearingDegrees, true)
      return result;
    }
  }
  