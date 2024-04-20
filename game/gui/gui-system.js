import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'

import { isPointInRotatedRect } from '@game/utilities/collision-util';
import { notYetTime } from '@game/utilities/timing-util.js'

import GuiCanvasRenderComponent from '@game/gui/gui-canvas-render-component';


export default class GuiSystem extends System {
    constructor() {
      super()

      this.panelBorderColor = 'rgb(83,110,128)'
      this.panelBackgroundColor = 'rgba(6,20,35,1)'
      this.buttonBackgroundColor = 'rgba(154,37,52,1)'

      this.hoverLastChecked = null;
      this.lastHoverStyle = null;

      this._addUIHandlers();
    }

    _addUIHandlers() {
        this.addHandler('INPUT_RECEIVED', (payload) => {
          this.checkUIClick(payload)
        });

        this.addHandler('GUI_ADD_TABLE', (payload) => {
          this._addTable(payload)
        });

        this.addHandler('ADD_GUI_RENDERABLE', (payload) => {
          this._addGuiRenderable(payload)
        });

        this.addHandler('GUI_ADD_TEXT', (payload) => {
          this._addText(payload.key, payload.text, payload.xPosition, payload.yPosition, payload.width, payload.height, payload.fontSize)
        });

        this.addHandler('GUI_UPDATE_TEXT', (payload) => {
            this._updateText(payload.key, payload.value)
        });

        this.addHandler('GUI_UPDATE_TABLE', (payload) => {
          this._updateTable(payload.key, payload.value)
        });

        this.addHandler('GUI_UPDATE_VISIBLE', (payload) => {
          if (payload.isVisible != undefined) {
            this._updateProperties(payload.key, { isVisible: payload.isVisible })
          } 
          else {
            this._toggleVisible(payload.key)
          }

          if (payload.relatedKeyPrefix) {
            this.workForTag('GuiCanvasRenderable', (renderable, entity) => {
              if (entity.getKey().startsWith(payload.relatedKeyPrefix)) {
                this._toggleVisible(entity.getKey())
              }
            });
          }
        });

        this.addHandler('GUI_UPDATE_PROPERTIES', (payload) => {
            this._updateProperties(payload.key, payload.value)
        });
    }


    work() {
      let canvasCtx = document.getElementById('canvas').getContext("2d");


      this._renderCanvas(canvasCtx)

      if (!notYetTime(30, this.hoverLastChecked)) {
        this.hoverLastChecked = Date.now();
        this.checkUIHover();
      }
    };

    _renderCanvas(canvasCtx) {
      canvasCtx.save();

      this.workForTag('GuiCanvasRenderable', (renderable, entity) => {
        if (!renderable.getIsVisible()) {
          return;
        }

        if (entity.getKey().indexOf('button') !== -1) {
          canvasCtx.fillStyle = renderable.getFillStyle() || this.buttonBackgroundColor;
          canvasCtx.strokeStyle = renderable.getStrokeStyle() || 'rgba(0,0,0,0)'; // Set border color
          canvasCtx.lineWidth = renderable.getLineWidth() || '1px'; // Set border width
        }
        else if(entity.getKey().indexOf('panel') !== -1) {
          canvasCtx.fillStyle = renderable.getFillStyle() || this.panelBackgroundColor;
          canvasCtx.strokeStyle = renderable.getStrokeStyle() || this.panelBorderColor; // Set border color
          canvasCtx.lineWidth = renderable.getLineWidth() || '2px'; // Set border width
        }
        else {
          canvasCtx.fillStyle = renderable.getFillStyle() || 'rgba(0,0,0,0)';
          canvasCtx.strokeStyle = renderable.getStrokeStyle() || 'rgba(0,0,0,0)'; // Set border color
          canvasCtx.lineWidth = renderable.getLineWidth() || '16px'; // Set border width
        }

        if (renderable.getIsHovered()) {
          canvasCtx.fillStyle = renderable.getHoverStyles()?.fillStyle
        }

        if (renderable.getImagePath()) {
          this._renderImage(renderable, canvasCtx);
        }
        else if (!renderable.getRadius()) {
          this._renderRectangle(renderable, canvasCtx)
        }
        else if (renderable.getRadius()) {
          this._renderCircle(renderable, canvasCtx)
        }

        if (renderable.getText()) {
          this._renderText(renderable, canvasCtx)
        }

        this._postRender(renderable, canvasCtx)
      });

      canvasCtx.restore()
    }

    _postRender(renderable, canvasCtx) {
      if (renderable.hasPostRender()) {
        renderable.postRender(renderable, canvasCtx);
      }
    }

    _renderImage(renderable, canvasCtx) {
        let img = renderable.getImageObject();
        if (!img) {
          img = new Image()
          img.src = renderable.getImagePath();
          renderable.setImageObject(img)
        }
        canvasCtx.drawImage(img, renderable.getXPosition(), renderable.getYPosition(), renderable.getWidth(), renderable.getHeight());
    }

    _renderRectangle(renderable, canvasCtx) {
      canvasCtx.setLineDash(renderable.getLineDash())
      canvasCtx.fillRect(renderable.getXPosition(), renderable.getYPosition(), renderable.getWidth(), renderable.getHeight()); 
      canvasCtx.strokeRect(renderable.getXPosition(), renderable.getYPosition(), renderable.getWidth(), renderable.getHeight());
    }

    _renderCircle(renderable, canvasCtx) {
        canvasCtx.beginPath();
        canvasCtx.arc(renderable.getXPosition(), renderable.getYPosition(), renderable.getRadius(), 0, Math.PI * 2, false);
        canvasCtx.fill(); // Fill the circle with color
        canvasCtx.stroke(); // Draw the border
    }
    
    _renderText(renderable, canvasCtx) {
      if (!`${renderable.getText()}`) {
        return;
      }
      canvasCtx.fillStyle = renderable.getFontColor() || '#FFFFFF';
      canvasCtx.font = `${renderable.getFontSize() || 14}px ${renderable.getFontType() || 'sans-serif'}`;
      canvasCtx.textBaseline = 'top';

      if (`${renderable.getText()}`.split(' ').length <= 2) {
        // It's unlikely that a couple words will require a split.
        canvasCtx.fillText(renderable.getText(), renderable.getXPosition() + renderable.getTextOffsetX(), renderable.getYPosition() + renderable.getTextOffsetY());
        return;
      }
      
      let x = renderable.getXPosition() + renderable.getTextOffsetX();
      let y = renderable.getYPosition() + renderable.getTextOffsetY();
      let width = renderable.getWidth() - renderable.getTextOffsetX() || canvasCtx.canvas.width; // Set the maxWidth based on canvas width or renderable's specified maxWidth
      let lineHeight = renderable.getFontSize() || '14'; // Set the lineHeight or use a default value

      // Draw wrapped text
      this.drawWrappedText(canvasCtx, `${renderable.getText()}`, x, y, width, lineHeight);
    }
    
    drawWrappedText(canvasCtx, text, x, y, maxWidth, lineHeight) {
      let lines = [];
      let words = text.split(' ');
      if (canvasCtx.measureText(text).width <= maxWidth) {
        // Fits on one line.
        canvasCtx.fillText(text, x, y);
        return;
      }

  
      let line = '';
      for (let i = 0; i < words.length; i++) {
          let word = words[i];
          let parts = word.split('\n');
          
          for (let j = 0; j < parts.length; j++) {
              let part = parts[j];
  
              if (line !== '') {
                  let testLine = line + ' ' + part;
                  let metrics = canvasCtx.measureText(testLine);
                  let testWidth = metrics.width;
                  
                  if (testWidth > maxWidth) {
                      lines.push(line);
                      line = part; // Start a new line
                  } else {
                      line = testLine;
                  }
              } else {
                  line = part;
              }
  
              // Push the line if we encounter a \n or it's the last part
              if (j < parts.length - 1 || i === words.length - 1) {
                  lines.push(line);
                  line = ''; // Start a new line
              }
          }
      }
  
      // Draw each line
      for (let i = 0; i < lines.length; i++) {
          canvasCtx.fillText(lines[i], x, y + (i * lineHeight));
      }
  }
    /**
     * Add elements to the renderable.
     */

    _addGuiRenderable(payload) {
      let entity = new Entity({key: payload.key});
      let renderComponent = new GuiCanvasRenderComponent(payload)
      entity.addComponent(renderComponent);
      this._core.addEntity(entity)
    }

    _addTable(payload) {

      /**
       * eg.
        let table = {
            key: 'inventory-panel-list',
            rows: 20,
            rowHeight: 18,
            width: this.listWidth,
            height: 500,
            xPosition: this.panelX + this.categoriesWidth,
            yPosition: this.panelY,
            textOffsetX: 1,
            textOffsetY: 2,
            columns: [
                { label: 'Item', key: 'label', width: 192 },
                { label: 'Quantity', key: 'quantity', width: 100 },
                { label: 'Type', key: 'category', width: 150 },
                { label: 'Volume', key: 'volume', width: 100 },
                { label: 'Unit', key: 'unit', width: 100 }
            ]
        }
       */
      for (let row = 0; row < payload.rows; row++) {
        let sumWidth = 0;
        let guiRenderPayload = {
          key: `${payload.key}-item-row-${row}`,
          width: payload.width,
          height: payload.rowHeight,
          xPosition: payload.xPosition,
          yPosition: payload.yPosition + row * payload.rowHeight,
          hoverStyles: {
            fillStyle: 'green'
          },
        }
        this._addGuiRenderable(guiRenderPayload)
        payload.columns.forEach((column) => {
          let guiRenderPayload = {
            key: `${payload.key}-item-row-${row}-column-${column.key}`,
            width: column.width,
            height: payload.rowHeight,
            xPosition: payload.xPosition + sumWidth,
            yPosition: payload.yPosition + row * payload.rowHeight,
            fontSize: 14,
            textOffsetX: payload.textOffsetX,
            textOffsetY: payload.textOffsetY,
            text: row == 0 ? column.label : null,
            fillStyle: 'rgba(0,0,0,0)'
          }
          this._addGuiRenderable(guiRenderPayload)
          sumWidth += column.width;
        });
      }
    }

    
    /**
     * Update elements on the GUI
     */

    _updateGuiCanvasRenderable(key, callback) {
        let entity = this._core.getKeyedAs(key);
        let tag = this.getTag('GuiCanvasRenderable')
        renderable.setEntity(entity);
        callback(tag)
    }
  
    _updateProperties(key, properties) {
      let renderable = this.getTag('GuiCanvasRenderable');

      if (!renderable) {
        return;
      }
      this.forKeyedAs(key, (entity) => {
        renderable.setEntity(entity);
        renderable.updateProperties(properties);
      });
    }

    _toggleVisible(key) {
      let renderable = this.getTag('GuiCanvasRenderable');

      if (!renderable) {
        return;
      }
      this.forKeyedAs(key, (entity) => {
        renderable.setEntity(entity);
        renderable.setIsVisible(!renderable.getIsVisible())
      });
    }
  
    _updateText(key, value) {
      let renderable = this.getTag('GuiCanvasRenderable');

      if (!renderable) {
        return;
      }
      this.forKeyedAs(key, (entity) => {
        renderable.setEntity(entity);
        renderable.setText(value);
      });
    }

    _updateTable(key, object) {
      Object.keys(object).forEach((objKey) => {
        this._updateText(`${key}-item-row-${object.row}-column-${objKey}`, object[objKey])
      });
    }
    

    /**
     * Handel UI interacitons
     */

    checkUIHover() {
      let cursorCoordinates = this._core.getData('CURSOR_COORDINATES');
      if (!cursorCoordinates || !cursorCoordinates.canvas) {
        return;
      }
      let hoveredEntity = null;

      this.workForTag('GuiCanvasRenderable', (renderable, entity) => {
        let xPosition = renderable.getXPosition();
        let yPosition = renderable.getYPosition();
        let width = renderable.getWidth();
        let height = renderable.getHeight();
        let bearingDegrees = renderable.getBearingDegrees();

        let isHovered = isPointInRotatedRect(cursorCoordinates.canvas.xPosition, cursorCoordinates.canvas.yPosition, xPosition, yPosition, width, height, bearingDegrees, false)

        renderable.setIsHovered(isHovered)
      });
    }

    handleUiHover(selectedEntity) {
      if (!selectedEntity) {
        return 
      }
      this.send('UI_HOVER', {key: selectedEntity.getKey()})
    }

    checkUIClick(payload) {
      let selectedEntity = null;
      if (payload.type == 'click') {
        let selectedEntity = null;
        this.workForTag('GuiCanvasRenderable', (renderable, entity) => {
          if (!renderable.getIsVisible()) {
            return; // Can't interact with invisible GUI elements.
          }
          let xPosition = renderable.getXPosition();
          let yPosition = renderable.getYPosition();
          let width = renderable.getWidth();
          let height = renderable.getHeight();
          let bearingDegrees = renderable.getBearingDegrees();

          let wasSelected = isPointInRotatedRect(payload.canvas.xPosition, payload.canvas.yPosition, xPosition, yPosition, width, height, bearingDegrees, false)

          if (wasSelected) {
            selectedEntity = entity;
            this.handleUiClick(selectedEntity)
          }
        });

        if (selectedEntity) {
          this.send('PLAY_AUDIO', {audioKey: 'ui-click.mp3'})
        }
      }
    }

    handleUiClick(selectedEntity) {
      if (!selectedEntity) {
        return 
      }

      this.send('UI_CLICKED', {key: selectedEntity.getKey()})

      if (selectedEntity.key.indexOf('gui-weapon-') != -1) {
        const regex = /\d+/;
        const match = selectedEntity.key.match(regex);
        let entityId = parseInt(match[0], 10)
        this.send("INPUT_RECEIVED", { type: 'action', action: `ADJUST_WEAPON_GROUP_${entityId}`});
      }
    }
  }
  
  