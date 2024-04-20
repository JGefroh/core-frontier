import { default as Tag } from '@core/tag'

export default class Attached extends Tag{
  static tagType = 'Attached'

    constructor() {
        super()
        this.tagType = 'Attached'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('AttachedComponent');
    };

    isStillAttached() {
      return this.entity.getComponent('AttachedComponent').attachedToEntity.id;
    }

    shouldSync(property) {
      return this.entity.getComponent('AttachedComponent').sync.indexOf(property) !== -1
    }

    syncXPosition() {
      let attachmentOptions = this.entity.getComponent('AttachedComponent').attachmentOptions;
      let attachedToEntity = this.entity.getComponent('AttachedComponent').attachedToEntity;

      // Get position of the attached entity
      let xPosition = attachedToEntity.getComponent('PositionComponent').xPosition;
      let yPosition = attachedToEntity.getComponent('PositionComponent').yPosition;
  
      // Get width and height of the attached entity (rectangle)
      let width = attachedToEntity.getComponent('PositionComponent').width;
      let height = attachedToEntity.getComponent('PositionComponent').height;
  
      // Get center position of the rectangle
      let centerX = xPosition + width / 2;
      let centerY = yPosition + height / 2;
  
      // Get rotation angle of the rectangle (in radians)
      let rotationAngleRadians = attachedToEntity.getComponent('PositionComponent').bearingDegrees * Math.PI / 180;
  
      // Define arbitrary offset from center
      let offsetX = attachmentOptions.xPosition || 0;
      let offsetY = attachmentOptions.yPosition || 0;
  
      // Calculate the rotated position based on the rotation angle and offset
      let rotatedXPosition = centerX + offsetX * Math.cos(rotationAngleRadians) - offsetY * Math.sin(rotationAngleRadians);
      let rotatedYPosition = centerY + offsetX * Math.sin(rotationAngleRadians) + offsetY * Math.cos(rotationAngleRadians);

        // Apply the rotated positions to the entity's position
      
      this.entity.getComponent('PositionComponent').xPosition = rotatedXPosition - width / 2; // Adjust for center offset
      this.entity.getComponent('PositionComponent').yPosition = rotatedYPosition - height / 2; // Adjust for center offset
    }

    syncYPosition() {
    }

    syncBearingDegrees() {
      let attachmentOptions = this.entity.getComponent('AttachedComponent').attachmentOptions
      let attachedToEntity = this.entity.getComponent('AttachedComponent').attachedToEntity;
      let bearingDegrees = attachedToEntity.getComponent('PositionComponent').bearingDegrees
      this.entity.getComponent('PositionComponent').bearingDegrees = bearingDegrees + (attachmentOptions.bearingDegrees || 0)
    }
  }
  