import { default as System } from '@core/system';
import { default as Entity } from '@core/entity';
import { distanceFromTo, toMetersFromCoordinateUnits } from '@game/utilities/distance-util';
import PositionComponent from '@game/positioner/position-component';
import RenderComponent from '@game/renderer/render-component';
import SelectionComponent from '@game/selector/selection-component';
import GuiManifestListingComponent from '@game/gui/gui-manifest-listing-component';

export default class WaypointSystem extends System {
    constructor() {
      super();

      this.addHandler('INPUT_RECEIVED', (payload) => {
        if (payload.type == 'double_click') {
            this.setWaypoint(payload)
        }
      });
    }
    
    work() {
    };

    setWaypoint(payload) {
        if (!payload.world) {
            return;
        }
        let xPosition = payload.world.xPosition;
        let yPosition = payload.world.yPosition;

        let waypointName = `Waypoint ${this.generateRandomCode()}`;

        let entity = new Entity();
        entity.addComponent(new PositionComponent({xPosition: xPosition, yPosition: yPosition, width: 100, height: 100, }));
        entity.addComponent(new RenderComponent({imageWidth: 100, imageHeight: 100, imagePath: 'assets/icons/waypoint.png'}))
        entity.addComponent(new SelectionComponent({label: waypointName}));
        entity.addComponent(new GuiManifestListingComponent({label: waypointName, type: 'waypoint'}))

        this._core.addEntity(entity)
    }

    generateRandomCode() {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const codeLength = 3;
      let code = '';

      for (let i = 0; i < 2; i++) {
          code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      code += '-'
      
      for (let i = 0; i < 1; i++) {
          code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      return code;
    }
}