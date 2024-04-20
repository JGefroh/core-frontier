export default class Tag {
  constructor() {
    this.id;
    this.entity;
    this.tagType;
  }
  getId() {
    return this.entity.id;
  }

  setId(id) { 
    this.entity.id = id;
  }

  static isAssignableTo(entity) {
  }

  setEntity(entity) {
    this.entity = entity;
  }

  getEntity() {
    return this.entity;
  }

  static getTagType() {
    return this.tagType;
  }
}
