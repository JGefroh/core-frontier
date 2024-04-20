import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'

import { angleTo, toFriendlyMeters, distanceFromTo, toCoordinateUnitsFromMeters, toMetersFromCoordinateUnits } from '@game/utilities/distance-util';

export default class GuiRadarSystem extends System {
    constructor() {
      super()
      this.wait = 50
      setTimeout(() => {
        let viewport = this._core.getData('VIEWPORT');

        this.panelWidth = 290;
        this.panelHeight = 290;
        this.panelX = 14;
        this.panelY = viewport.height - this.panelHeight;

        this.radarScale = 0;
        this.radarCenterX = 0;
        this.radarCenterY = 0;
  
        this._addPanel()
        this.startSync = true;
      }, 100)
    }

    work() {
      if (!this.startSync) {
        return; // Avoid radar objects being rendered behind the radar.
      }
      // this.syncRadarViewport()
      this.syncRadarObjects();
    };


    syncRadarViewport() {
      let viewport = this._core.getData('VIEWPORT');
      let viewportAspectRatio = viewport.height / viewport.width;
  
      let minScale = 0.03;
      let maxScale = 1.4;

      let adjustedScalePercent = (viewport.scale / maxScale)


      // 1.4 * 100 = 140
      // 0.03 * 100 = 3  (Earth is ~170px)
      // 0.09 * 100 = 9  (Earth is 490px)
      // 100 - 9 = 91
      // 100 - 3 = 97

      let radarViewportWidth = (100 - (adjustedScalePercent * 100))
      let radarViewportHeight = radarViewportWidth * viewportAspectRatio;

      // Get initial X, then set to center of panel, then adjust for viewport width and height.
      let radarViewportX = this.panelX + this.panelWidth / 2 - (radarViewportWidth / 2);
      let radarViewportY = this.panelY + this.panelHeight / 2 - (radarViewportHeight / 2);
  
      // Update the GUI renderable with the new dimensions and position
      this.send('GUI_UPDATE_PROPERTIES', {
          key: 'radar-viewport-box', 
          value: {
              xPosition: radarViewportX,
              yPosition: radarViewportY,
              width: radarViewportWidth,
              height: radarViewportHeight,
          }
      });
    }

    syncRadarObjects() {
      let viewport = this._core.getData('VIEWPORT');
      let entitiesModified = []

    
      this.workForTag('GuiManifestListable', (tag, entity) => {
        let key = `radar-panel-object-${entity.id}`;
        entitiesModified.push(entity.getId())

        let radarTag = this._core.getKeyedAs(key)
        if (!radarTag) {
          this.send('ADD_GUI_RENDERABLE', {
            key: key,
            width: 8,
            height: 8,
            xPosition: 0,
            yPosition: 0,
          });
        }
        
        let radarPosition = this._calculateRadarPosition(viewport, entity);

        this.send('GUI_UPDATE_PROPERTIES', {key: key, value: {
          xPosition: radarPosition.xPosition, 
          yPosition: radarPosition.yPosition, 
          isVisible: !radarPosition.isOutside,
          width: Math.max(radarPosition.width, 4),
          height: Math.max(radarPosition.height, 4),
          fillStyle: tag.getRenderColor() || 'rgb(255,255,255,1)',
          strokeStyle: tag.getRenderColor() || 'rgb(255,255,255,1)'
        }})
      });


      this._removeOldRadarObjects(entitiesModified);
    }

    _calculateRadarPosition(viewport, entity) {
      let entityPosition = entity.getComponent('PositionComponent');
      let entityXPosition = entityPosition.xPosition;
      let entityYPosition = entityPosition.yPosition;
      let entityWidth = entityPosition.width;
      let entityHeight = entityPosition.height;
      let radarXPosition = this.panelX;
      let radarYPosition = this.panelY
      let radarWidth = 290;
      let radarHeight = 290;
      let radarViewportSize = 100 //The size of the viewport box for the radar

      const radarScaleVSWorldScale = 0.03 / (viewport.width / radarViewportSize);

      // 290 + (145) + (1000 * 0.003) = 293 
      // Set to X + (add centering) / scale
      // Set to X + (add centering) / scale
      let viewportXToWorld = (viewport.xPosition + (viewport.width / 2)) / viewport.scale
      let viewportYToWorld = (viewport.yPosition + (viewport.height / 2))  / viewport.scale

      //Determine the object size
      let radarObjectWidth = entityWidth * radarScaleVSWorldScale;
      let radarObjectHeight = entityHeight * radarScaleVSWorldScale
      let entitySize = Math.max(radarObjectWidth, 1)


      // Start with the Radar Position
      // Center it according to the box
      // Add in the entity's position, and factor in the viewport's world coordinate
      //  Multply by what the world scale should be.
      // Factor in the image Width and Heigt. 

      let radarXCoordinate = radarXPosition + (radarWidth / 2) + ((entityXPosition - viewportXToWorld) * radarScaleVSWorldScale) - (entitySize / 2)
      let radarYCoordinate = radarYPosition + (radarHeight / 2) + ((entityYPosition - viewportYToWorld) * radarScaleVSWorldScale) - (entitySize / 2)


      let isOutside = radarXCoordinate < radarXPosition ||
      radarXCoordinate > (radarXPosition + radarWidth) ||
      radarYCoordinate < radarYPosition ||
      radarYCoordinate > (radarYPosition + radarHeight);
  
      // Update the entity's radar position
      let result = { xPosition: radarXCoordinate, yPosition: radarYCoordinate, width: radarObjectWidth, height: radarObjectHeight, isOutside: isOutside };

      return result;
  }
  
    _removeOldRadarObjects(entitiesModified) {
      this.workForTag('GuiCanvasRenderable', (tag, entity) => {
        if (!entity) {
          return;
        }

        if (!entity.key.includes('radar-panel-object')) {
          return;
        }

        let entityId = parseInt(entity.key.split('radar-panel-object-')[1])
        
        if (!entitiesModified.includes(entityId)) {
          this.send('ENTITY_DESTROY_REQUESTED', {entityId: entity.getId()})
        }
      });
    }

    _addPanel() {
      let viewport = this._core.getData('VIEWPORT');

      this.send('ADD_GUI_RENDERABLE', {
        key: 'radar-panel',
        width: this.panelWidth,
        height: this.panelHeight,
        xPosition: this.panelX,
        yPosition: this.panelY,
        fontSize: 18,
      });

      this.send('ADD_GUI_RENDERABLE', {
        key: 'radar-circle',
        width: this.panelWidth,
        height: this.panelHeight,
        xPosition: this.panelX + this.panelWidth / 2,
        yPosition: this.panelY + this.panelHeight / 2,
        fontSize: 18,
        radius: this.panelWidth / 2,
        lineDash: [5,5],
        strokeStyle: 'rgba(255,255,255,0.5)'
      });

      let targetRadarViewportWidth = this.panelWidth / 8 * 5;
      let targetRadarViewportHeight = this.panelHeight / 8 * 2;
      let viewportAspectRatio = viewport.height / viewport.width
      let radarViewportWidth = targetRadarViewportWidth / viewportAspectRatio;
      let radarViewportHeight = targetRadarViewportHeight * viewportAspectRatio;

      // this.send('ADD_GUI_RENDERABLE', {
      //   key: 'radar-viewport-box',
      //   width: radarViewportWidth,
      //   height: radarViewportHeight,
      //   xPosition: this.panelWidth / 8 * 2,
      //   yPosition: this.panelY + this.panelHeight / 8 * 3,
      //   fontSize: 18,
      //   lineDash: [5,5],
      //   strokeStyle: 'rgba(255,255,255,0.5)'
      // });
    }
  }
  
  