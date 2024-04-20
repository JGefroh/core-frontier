import { default as Tag } from '@core/tag'

export default class Iff extends Tag {
    static tagType = 'Iff'

    constructor() {
      super();
      this.tagType = 'Iff'
    }

    static isAssignableTo(entity) {
        return entity.hasComponent('IffComponent');
      };

    setColor(color) {
        this.entity.getComponent('IffComponent').iffColor = color;
    }
    getColor() {
        return this.entity.getComponent('IffComponent').iffColor = color;
    }
    getIff() {
        return this.entity.getComponent('IffComponent').iff;
    }
}