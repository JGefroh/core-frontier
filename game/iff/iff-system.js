import { default as System } from '@core/system';
import { distanceFromTo, toMetersFromCoordinateUnits } from '@game/utilities/distance-util';

import IffTag from '@game/iff/iff-tag.js';

export default class IffSystem extends System {
    constructor() {
      super();

      this.wait = 1000;
      this.iffSettings = {
        'enemy': 'rgb(228, 19, 19)', // Red
        'ally':'rgb(16, 113, 229)', // Blue
        'player': 'rgb(0, 138, 14)', // Green
        'neutral': 'rgb(250,222,65)', // Yellow,
        'civilian': 'rgb(255,255,255,0.4)' // grey
      }
      this.iffKeys = Object.keys(this.iffSettings)

      this.addHandler('SET_IFF', (payload) => {
        this.setIff(payload.entityId, payload.iff)
      });
    }
    
    work() {
      this.workForTag('Iff', (tag, entity) => {
        tag.setColor(this.iffSettings[tag.getIff()]);
      });
    };

    setIff(entityId, setIffTo) {
        if (!entityId) {
            return;
        }
        let entity = this._core.getEntityWithId(entityId);

        if (!entity) {
            return;
        }

        let renderOverlay = entity.getComponent('RenderOverlayComponent')
        if (!renderOverlay) {
            return;
        }

        renderOverlay.overlayColor = this.getOverlayColor(setIffTo)
    }

    getOverlayColor(setIffTo) {
        return this.iffSettings[setIffTo]
    }
  }