import { default as Tag } from '@core/tag'

export default class Orbiter extends Tag{
  static tagType = 'Orbiter'

    constructor() {
        super()
        this.tagType = 'Orbiter'
    }
    // (tag.getXPosition(), tag.getYPosition(), tag.getOrbitalRadius(), tag.getOrbitCompletionTime());
    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('OrbitComponent');
    };

    getXPosition() {
      return this.entity.hasComponent('PositionComponent').xPosition;
    }

    getYPosition() {
      return this.entity.hasComponent('PositionComponent').yPosition;
    }


    getOrbitXPosition() {
      return this.entity.hasComponent('OrbitComponent').orbitXPosition;
    }

    getOrbitYPosition() {
      return this.entity.hasComponent('OrbitComponent').orbitYPosition;
    }
    
    getOrbitRadius() {
      return this.entity.hasComponent('OrbitComponent').orbitRadius;
    }
    getOrbitCompletionTime() {
      return this.entity.hasComponent('OrbitComponent').orbitCompletionTime;
    }

    setCurrentPosition(x, y) {
      this.entity.hasComponent('PositionComponent').xPosition = x;
      this.entity.hasComponent('PositionComponent').yPosition = y;
    }

    getStartAngle() {
      return this.entity.hasComponent('OrbitComponent').startAngle;
    }

    getOrbitEntityId() {
      return this.entity.hasComponent('OrbitComponent').orbitEntityId;
    }

    getOrbitEntityKey() {
      return this.entity.hasComponent('OrbitComponent').orbitEntityKey;
    }
  }
  