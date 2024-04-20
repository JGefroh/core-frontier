import { default as Tag } from '@core/tag'

export default class Commandable extends Tag {
    static tagType = 'Damageable'

    constructor() {
        super()
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('CommandComponent');
    };
}
  