import { default as Tag } from '@core/tag'

export default class Collidable extends Tag {
    static tagType = 'Collidable'

    constructor() {
      super();
      this.tagType = 'Collidable'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('CollisionComponent');
    };

    getCollisionGroup() {
      return this.entity.getComponent('CollisionComponent').collisionGroup;
    }

    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition
    }

    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition
    }

    getWidth() {
      return this.entity.getComponent('PositionComponent').width;
    }

    getHeight() {
      return this.entity.getComponent('PositionComponent').height;
    }

    getBearingDegrees() {
      return this.entity.getComponent('PositionComponent').bearingDegrees;
    }

    getIsEnemy(entity) {
      if (!entity.getComponent('RelationshipComponent') || !this.entity.getComponent('RelationshipComponent')) {
        return 'neutral'
      }
      let relationshipSelf = this.entity.getComponent('RelationshipComponent')
      let relationshipOther = entity.getComponent('RelationshipComponent')
      return ['neutral', 'enemy'].includes(relationshipSelf.getClassificationForNation(relationshipOther.nation))
    }
  }
  