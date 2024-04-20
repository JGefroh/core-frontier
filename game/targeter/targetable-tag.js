import { default as Tag } from '@core/tag'

export default class Targetable extends Tag {
    static tagType = 'Targetable'

    constructor() {
        super()
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('TargetableComponent');
    };

    getRelationshipTo(entity) {
      if (!entity.getComponent('RelationshipComponent') || !this.entity.getComponent('RelationshipComponent')) {
        return 'neutral'
      }
      let relationshipSelf = this.entity.getComponent('RelationshipComponent')
      let relationshipOther = entity.getComponent('RelationshipComponent')
      return relationshipSelf.getClassificationForNation(relationshipOther.nation)
    }
}
