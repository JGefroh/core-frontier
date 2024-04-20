class Core {
  constructor() {
    this.clear();
  }

  addEntity(entity) {
    if (!entity || this.isTracked(entity)) {
      return;
    }

    if (!entity.getId()) {
      entity.setId(this.generateId());
    }

    this.entitiesById[entity.getId()] = entity;
    this.entitiesByKey[entity.getKey()] = entity;
    this.updateTags(entity);
    this.send("DEBUG_DATA", {type: 'entity_added', entity: entity})
  }

  isTracked(entity) {
    return entity && entity.getId() && this.entitiesById[entity.getId()];
  }

  generateId() {
    return ++this.lastAssignedId;
  }

  getEntityWithId(id) {
    return this.entitiesById[id]
  }

  updateTags(entity) {
    if (!entity) {
      return;
    }

    this.tagTypes = Object.keys(this.knownTags);
    let tags = this.tagTypes.map((tagType) => {
      return this.knownTags[tagType];
    });


    for (let index = 0; index < tags.length; index++) {
      let tag = tags[index];
      if (tag.isAssignableTo(entity)) {
        this.assignTag(entity, tag);
      }
      else {
        this.unassignTag(entity, tag);
      }
    }
  }

  assignTag(entity, tag) {
    let entities = this.entitiesByTag[tag.getTagType()];
    if (!entities) {
      this.entitiesByTag[tag.getTagType()] = [];
      entities = this.entitiesByTag[tag.getTagType()];
    }
    let isAlreadyAssigned = false;
    for (let index = 0; index < entities.length; index++) {
      if (entities[index].getId() === entity.getId()) {
        isAlreadyAssigned = true;
        break;
      }
    }

    if (!isAlreadyAssigned) {
      entities.push(entity);
    }
  }

  unassignTag(entity, tag) {
    let entities = this.entitiesByTag[tag.getTagType()];
    if (!entities) {
      return;
    }
    let entityIndex = null;

    for (let index = 0; index < entities.length; index++) {
      if (entities[index].getId() === entity.getId()) {
        entityIndex = index;
      }
    }

    if (entityIndex) {
      entities.splice(entityIndex, 1);
    }
  }

  markRemoveEntity(entityId) {
    if (this.entitiesById[entityId]) {
      this.entitiesById[entityId].destroy = true;
    }
  }

  removeEntity(entity) {
    if (!entity) {
      return;
    }

    if (typeof entity === 'number' || typeof entity == 'string') {
      entity = this.entitiesById[entity]
    }
    if (!entity) {
      return;
    }

    entity.removeAllComponents();
    this.updateTags(entity);
    this.entitiesById[entity.getId()] = undefined;
    this.entitiesByKey[entity.getKey()] = undefined;
    delete this.entitiesById[entity.getId()]
    delete this.entitiesByKey[entity.getKey()]
    this.syncChangedEntities();
    entity.setId(null)
  }

  addSystem(system) {
    this.systems.push(system);
    system.lastRanTimestamp = Date.now();
  }

  removeSystem(system) {
    this.systems.splice(this.systems.indexOf(system), 1);
  }

  work() {
    this.tick++
    this.t1 = performance.now();
    let slowestSystem = {system: 'Unknown', time: 0}
    this.updateTimer();
    this.syncChangedEntities();
    for (let i = 0; i < this.systems.length; i++) {
      let t3 = performance.now()
      let systemLastRanTimestamp = this.systems[i].lastRanTimestamp
      let systemDesiredWaitTime = this.systems[i].wait
      if (!systemLastRanTimestamp || !systemDesiredWaitTime || (Date.now() - systemLastRanTimestamp > systemDesiredWaitTime)) {
        let skippedRun = this.systems[i].work();
        if (!skippedRun) {
          this.systems[i].postWork();
        }
        let t4 = performance.now()
        if (t4 - t3 > slowestSystem.time) {
          slowestSystem = {system: this.systems[i], time: t4-t3}
        }
      }
    }
    this.t2 = performance.now();
    this.send("DEBUG_DATA", {type: 'timing', workTime: this.t2 - this.t1, slowestSystem: slowestSystem.system.constructor.name, slowestSystemTime: slowestSystem.time})
    
    
    Object.keys(this.entitiesById).forEach((entityId) => {
      if (this.entitiesById[entityId] && this.entitiesById[entityId].destroy) {
        this.removeEntity(entityId)
      }
    });
  }

  syncChangedEntities() {
    let ids = Object.keys(this.entitiesById);
    let entities = ids.map((id) => {
      return this.entitiesById[id];
    });

    for (let index = 0; index < entities.length; index++) {
      let entity = entities[index];
      if (entity && entity.hasChanged()) {
        this.updateTags(entity);
        entity.markChanged(false);
      }
    }
  }

  getTag(tagType) {
    let tag = this.knownTags[tagType]
    if (tag) {
      return new tag();
    }
    else {
      console.warn(`Acces attempted for ${tagType}, not yet registered`)
      return null;
    }
  }

  now() {
    return timer / 1000000;
  }

  updateTimer() {
    this.now = performance.now();
    if (!this.isPaused) {
      this.timePassed =  this.now - this.timeLastChecked;
      this.timer += this.timePassed;
    }
    this.timeLastChecked = this.now;
  }

  start() {
    window.setTimeout(() => {
      this.work();
      this.start();
    }, 1000 / this.desiredFPS);
  }

  stop() {
    clearInterval(this.workInterval);
  }

  getTaggedAs(tag) {
    return this.entitiesByTag[tag] || [];
  }

  getKeyedAs(key) {
    return this.entitiesByKey[key];
  }

  addTag(tag) {
    if (tag && !this.knownTags[tag.getTagType()]) {
      this.knownTags[tag.getTagType()] = tag;
    }
  }

  send(messageType, payload) {
    let handlersForMessage = this.handlersByMessageType[messageType];
    if (handlersForMessage) {
      for (let index = 0; index < handlersForMessage.length; index++) {
        try {
          handlersForMessage[index](payload);
        }
        catch(error) {
          console.error(`Core.send | Error sending ${messageType} to ${handlersForMessage[index]} - ${error}.`)
        }
      }
    }
  }

  publishData(dataKey, payload) {
    this.publishedData[dataKey] = payload;
  }

  getData(dataKey) {
    return this.publishedData[dataKey];
  }

  addHandler(messageType, handler) {
    let handlersForMessage = this.handlersByMessageType[messageType];
    if (!handlersForMessage) {
      this.handlersByMessageType[messageType] = [];
      handlersForMessage = this.handlersByMessageType[messageType];
    }
    if (handlersForMessage.indexOf(handler) === -1) {
      handlersForMessage.push(handler);
    }
  }

  getTick() {
    return this.tick;
  }

  clear() {
    this.systems;
    this.entitiesById;
    this.lastAssignedId;
    this.timer;
    this.timeLastChecked;
    this.entitiesByTag;
    this.knownTags;
    this.workInterval;
    this.isPaused;
    this.handlersByMessageType;
    this.desiredFPS = 60;
    this.tick = 0;

    this.systems = [];
    this.entitiesById = {};
    this.entitiesByTag = {};
    this.entitiesByKey = {};
    this.lastAssignedId = 0;
    this.knownTags = {};
    this.handlersByMessageType = {};
    this.publishedData = {}
  }
}

export default new Core()