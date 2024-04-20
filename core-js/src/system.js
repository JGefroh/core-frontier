import { default as Core } from '@core/core'
import { notYetTime } from '@game/utilities/timing-util.js'

export default class System {
  constructor() {
    this.isStarted = false;
    this._core = Core;
    this.lastRanTimestamp = null;
    this.lastRanTick = 0;
  }
  
  start() {
    isStarted = true;
  };

  stop() {
    isStarted = false;
  };

  work() {
  };

  postWork() {
    this.lastRanTimestamp = Date.now();
    this.lastRanTick = this._core.getTick();
  }

  forTaggedAs(tag, callback) {
    var entities = this._core.getTaggedAs(tag);
    for (var index = 0; index < entities.length; index++) {
      if (entities[index].id) {
        callback(entities[index]);
      }
    }
  };

  forKeyedAs(key, callback) {
    var entity = this._core.getKeyedAs(key);
    if (entity?.key) {
        callback(entity);
    }
};

  getTag(tagType) {
    return this._core.getTag(tagType);
  };

  send(messageType, payload) {
    this._core.send(messageType, payload);
  };

  addHandler(messageType, handler) {
    this._core.addHandler(messageType, handler);
  };

  notYetTime(desiredTimesPerSecond, lastRanTimestamp) {
    return notYetTime(desiredTimesPerSecond, lastRanTimestamp)
  }

  workForTag(tagName, callback) {
    let tag = this.getTag(tagName);
    this.forTaggedAs(tagName, (entity) => {
      tag.setEntity(entity);
      if (entity.id) {
        callback(tag, entity)
      }
    });
  }

  workForEntityWithTag(entityId, tagName, callback) {
    let tag = this.getTag(tagName);
    let entity = this._core.getEntityWithId(entityId)
    if (!entity || !tag) {
      return;
    }
    tag.setEntity(entity);
    callback(entity, tag)
  }
}
