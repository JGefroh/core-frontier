import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'

import { toFriendlyMeters, distanceFromTo, toMetersFromCoordinateUnits } from '@game/utilities/distance-util';

export default class GuiTrackingSystem extends System {
    constructor() {
      super()
      this.wait = 200
      this.selectedEntityId = null;
      this.lastSelectedEntityId = null;
      this.compressToWidth = 280;
      this.compressToHeight = 180;

      setTimeout(() => {
        this._addPanel()
        this._addTrackingPanelOptions();
      }, 100)

      this.addHandler('UI_CLICKED', (payload) => {
        if (payload.key.indexOf('button-filter') != -1) {
          this.currentFilter = payload.key.split('button-filter-')[1]
        }
        if (payload.key == 'tracking-panel-button-follow-player') {
          this.send("INPUT_RECEIVED", { type: 'action', action: 'follow', entityId: null});
        }
        if (payload.key == 'tracking-panel-follow-target') {
          this.send("INPUT_RECEIVED", { type: 'action', action: 'follow', entityId: this.selectedEntityId});
        }
        if (payload.key == 'tracking-panel-toggle-flight-path') {
          this.send("CONFIGURE_TARGET", { key: 'config-toggle-flight-path', entityId: this.selectedEntityId});
        }
        if (payload.key == 'tracking-panel-focus-mode') {
          this.send("INPUT_RECEIVED", { type: 'action', action: 'focus-mode', entityId: this.selectedEntityId});
        }
      });

      this.addHandler('INPUT_RECEIVED', (payload) =>{  
        if (payload.action == 'focus') {
          this.send("INPUT_RECEIVED", { type: 'action', action: 'focus-mode', entityId: this.selectedEntityId});
        }
      });

      this.addHandler('TRACK_ENTITY_REQUESTED', (payload) => {
        this.selectedEntityId = payload.entityId
      })
    }

    work() {
        if (!this.selectedEntityId) {
            return;
        }

        if (this.selectedEntityId == this.lastSelectedEntityId) {
          return; // Selected Entity hasn't changed.
        }

        let entity = this._core.getEntityWithId(this.selectedEntityId);
        if (!entity) {
            this.send('GUI_UPDATE_PROPERTIES', {
                key: 'tracking-panel-displayed-object',
                value: {
                    imagePath: null,
                    imageObject: null,
                    width: 0,
                    height: 0,
                }
            })

            return;
        }

        this.send("GUI_UPDATE_VISIBLE", {
          key: 'tracking-panel-toggle-tactical-label',
          isVisible: false
        })

        this.send("GUI_UPDATE_VISIBLE", {
          key: 'tracking-panel-toggle-flight-path',
          isVisible: false
        })

        this.send("GUI_UPDATE_VISIBLE", {
          key: 'tracking-panel-follow-target',
          isVisible: false
        })

        this.send("GUI_UPDATE_VISIBLE", {
          key: 'tracking-panel-focus-mode',
          isVisible: false
        })
        
        

        let renderComponent = entity.getComponent('RenderComponent')
        let detailComponent = entity.getComponent('DetailComponent')
        let guiComponent = entity.getComponent('GuiManifestListingComponent')
        let proportionalDimensions = this._calculateProportionalDimensions(renderComponent.width, renderComponent.height, this.compressToWidth, this.compressToHeight)
        let deltaWidth = this.compressToWidth - proportionalDimensions.width;
        let deltaHeight = this.compressToHeight - proportionalDimensions.height;
        let viewport = this._core.getData('VIEWPORT');
        let xPosition = viewport.width - 304 + (deltaWidth / 2)
        let yPosition = 60 + (deltaHeight / 2)

        this.send('GUI_UPDATE_PROPERTIES', {
            key: 'tracking-panel-displayed-object',
            value: {
                imagePath: entity.getComponent('RenderComponent').imagePath,
                imageObject: entity.getComponent('RenderComponent').imageObject,
                width: proportionalDimensions.width,
                height: proportionalDimensions.height,
                xPosition: xPosition,
                yPosition: yPosition
            }
        })
        this.send('GUI_UPDATE_TEXT', {
          key: 'tracking-panel-displayed-object-box',
          value: guiComponent.label
        })

        if (detailComponent) {
          this.send("GUI_UPDATE_TEXT", { 
            key: 'tracking-panel-target-name',
            value: detailComponent.label 
          });

          this.send("GUI_UPDATE_TEXT", { 
            key: 'tracking-panel-target-description',
            value: detailComponent.shortDescription
          });

          this.send("GUI_UPDATE_VISIBLE", {
            key: 'tracking-panel-toggle-tactical-label',
            isVisible: detailComponent.type == 'Ship'
          })
          this.send("GUI_UPDATE_VISIBLE", {
            key: 'tracking-panel-toggle-flight-path',
            isVisible: detailComponent.type == 'Ship'
          })
          this.send("GUI_UPDATE_VISIBLE", {
            key: 'tracking-panel-follow-target',
            isVisible: true
          })
          this.send("GUI_UPDATE_VISIBLE", {
            key: 'tracking-panel-focus-mode',
            isVisible: true
          })
        }
        
        this.lastSelectedEntityId = this.selectedEntityId;
    };

    _addPanel() {
      let viewport = this._core.getData('VIEWPORT');

      this.panelX = viewport.width - 324;
      this.panelY = 18;
      this.send('ADD_GUI_RENDERABLE', {
        key: 'tracking-panel',
        width: 320,
        height: 212,
        xPosition: this.panelX,
        yPosition: this.panelY,
        text: 'D-Scope',
        textOffsetY: 8,
        textOffsetX: 8,
        fontSize: 18,
        fillStyle: 'rgba(0,0,0,0)',
        postRender: (renderable, canvasCtx) => {
          let numLines = 23;
          let lineHeight = 1;
          let lineSpacing = 8;
          let initialY = 50;
          for (var i = 0; i < numLines; i++) {
            var yPos = initialY + lineHeight * i * lineSpacing
            canvasCtx.strokeStyle = 'rgba(255,255,255,0.1)'
            canvasCtx.beginPath();
            canvasCtx.moveTo(viewport.width - 324, yPos);
            canvasCtx.lineTo(viewport.width - 324 + 320, yPos);
            canvasCtx.stroke();
          }
        }
      });

      this.send('ADD_GUI_RENDERABLE', {
        key: 'tracking-panel',
        width: 320,
        height: 220,
        xPosition: this.panelX,
        yPosition: this.panelY,
        text: 'D-Scope',
        textOffsetY: 8,
        textOffsetX: 8,
        fontSize: 18,
        fillStyle: 'rgba(0,0,0,0)',
        strokeStyle: 'rgba(0,0,0,0)'
      });

      this.send('ADD_GUI_RENDERABLE', {
        key: 'tracking-panel-banner',
        width: 320,
        height: 30,
        xPosition: this.panelX,
        yPosition: this.panelY,
        text: 'D-Scope',
        textOffsetY: 8,
        textOffsetX: 8,
        fontSize: 18,
      });

      this.send('ADD_GUI_RENDERABLE', {
        key: `tracking-panel-button-follow-player`,
        xPosition: this.panelX + 220,
        yPosition: this.panelY + 8,
        width: 92,
        height: 14,
        textOffsetX: 6,
        text: 'Track Player',
      })

      this.send('ADD_GUI_RENDERABLE', {
        key: 'tracking-panel-displayed-object-box',
        width: 280,
        height: 150,
        xPosition: this.panelX + 20,
        yPosition: this.panelY + 47,
        fontSize: 18,
        fillStyle: 'rgba(0,0,0,0)',
        strokeStyle: 'rgba(255,255,255,1)',
        lineDash: [20, 50],
        textOffsetY: 12,
        textOffsetX: 12
      });

    }

    _addTrackingPanelOptions() {
      this.send('ADD_GUI_RENDERABLE', {
        key: 'tracking-panel-options',
        width: 320,
        height: 120,
        xPosition: this.panelX,
        yPosition: this.panelY + 212,
        fontSize: 18,
        textOffsetY: 12,
        textOffsetX: 12
      });
      this.send('ADD_GUI_RENDERABLE', {
        key: `tracking-panel-target-name`,
        xPosition: this.panelX,
        yPosition: this.panelY + 212,
        width: 320,
        height: 22,
        textOffsetX: 6,
        textOffsetY: 4,
        text: '',
      })
      this.send('ADD_GUI_RENDERABLE', {
        key: `tracking-panel-target-description`,
        xPosition: this.panelX,
        yPosition: this.panelY + 234,
        width: 200,
        height: 100,
        textOffsetX: 6,
        textOffsetY: 4,
        text: '',
      })
      this.send('ADD_GUI_RENDERABLE', {
        key: `tracking-panel-toggle-flight-path`,
        xPosition: this.panelX + 200,
        yPosition: this.panelY + 234,
        width: 120,
        height: 24,
        textOffsetX: 6,
        textOffsetY: 5,
        text: 'Predict path',
        isVisible: false,
        hoverStyles: {
          fillStyle: 'green'
        }
      })
      this.send('ADD_GUI_RENDERABLE', {
        key: `tracking-panel-follow-target`,
        xPosition: this.panelX + 200,
        yPosition: this.panelY + 258,
        width: 120,
        height: 24,
        textOffsetX: 6,
        textOffsetY: 5,
        text: 'Track',
        isVisible: false,
        hoverStyles: {
          fillStyle: 'green'
        }
      })

      this.send('ADD_GUI_RENDERABLE', {
        key: `tracking-panel-focus-mode`,
        xPosition: this.panelX + 200,
        yPosition: this.panelY + 282,
        width: 120,
        height: 24,
        textOffsetX: 6,
        textOffsetY: 5,
        text: 'Focus',
        isVisible: false,
        hoverStyles: {
          fillStyle: 'green'
        }
      })
      // this.send('ADD_GUI_RENDERABLE', {
      //   key: `tracking-panel-toggle-tactical-label`,
      //   xPosition: this.panelX + 200,
      //   yPosition: this.panelY + 258,
      //   width: 120,
      //   height: 24,
      //   textOffsetX: 6,
      //   textOffsetY: 5,
      //   isVisible: false,
      //   text: 'Toggle Label',
      //   hoverStyles: {
      //     fillStyle: 'green'
      //   }
      // })
    }
    _calculateProportionalDimensions(originalWidth, originalHeight, targetWidth, targetHeight) {
        // Calculate aspect ratios
        const originalAspectRatio = originalWidth / originalHeight;
        const targetAspectRatio = targetWidth / targetHeight;

        let newWidth, newHeight;

        if (originalAspectRatio > targetAspectRatio) {
            // Original image is wider than the target image
            newWidth = Math.min(targetWidth, originalWidth);
            newHeight = newWidth / originalAspectRatio;
        } else {
            // Original image is taller than or equal to the target image
            newHeight = Math.min(targetHeight, originalHeight);
            newWidth = newHeight * originalAspectRatio;
        }

        return { width: newWidth, height: newHeight };
    }
  }
  
  