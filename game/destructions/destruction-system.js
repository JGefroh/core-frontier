import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'

import { default as RenderComponent } from '@game/renderer/render-component'
import { default as PositionComponent } from '@game/positioner/position-component'
import VectorComponent from '@game/mover/vector-component.js';
import { toMetersFromCoordinateUnits, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util.js';
import DecayerComponent from '@game/decayer/decayer-component';

export default class DestructionSystem extends System {
    constructor() {
      super()

      this.addHandler('DESTRUCTION_EFFECT_REQUESTED', (payload) => {
        for (let i = 0; i < 12; i++) {
          this.addDestructionEffect(payload.xPosition, payload.yPosition);
        }
      });
    }

    work() {
    }

    addDestructionEffect(xPosition, yPosition) {
        let shrapnelSize = 50
        let width = shrapnelSize * Math.random();
        let height = shrapnelSize * Math.random();
        let shrapnel = new Entity({key: 'shrapnel'});
        let id = Math.floor(Math.random() * 3) + 1
        shrapnel.addComponent(new RenderComponent({  width: width, height: height, imagePath: `assets/debris/shrapnel-${id}.png`}))
        shrapnel.addComponent(new PositionComponent({ xPosition: xPosition, yPosition: yPosition, width: width, height: height }));
        let vector = new VectorComponent({ maxMagnitude: toCoordinateUnitsFromMeters(200) * Math.random() })
        vector.addVector(toCoordinateUnitsFromMeters(70 * Math.random()), Math.random() * 360);
        shrapnel.addComponent(vector);
        shrapnel.addComponent(new DecayerComponent({ decayIn: 60000}));
        this._core.addEntity(shrapnel);
    }
  }
  