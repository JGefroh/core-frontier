import { default as System } from '@core/system';

export default class MouseTrackerSystem extends System {
    constructor() {
      super()
      this.cursorCoordinates = {
        canvas: {},
        world: {},
      }

      this.addHandler('INPUT_RECEIVED', (payload) => {
        if (payload.type == 'cursor_position') {
            let viewport = this._core.getData('VIEWPORT');

            if (!viewport) {
              return;
            }

            this.cursorCoordinates = { 
                canvas: {xPosition: payload.xPosition, yPosition: payload.yPosition}, 
                world: {xPosition: (payload.xPosition + viewport.xPosition) * viewport.scale, 
                        yPosition: (payload.yPosition + viewport.yPosition) * viewport.scale  } 
            }
            this._core.publishData('CURSOR_COORDINATES', this.cursorCoordinates);
            this.send("DEBUG_DATA", {type: 'cursor', ...this.cursorCoordinates})
        }
      });
    }
  
    work() {
      var cursor = this.getTag('Cursorable');

      this.forTaggedAs('Cursorable', (entity) => {
        cursor.setEntity(entity);
        cursor.setPosition(this.cursorCoordinates.world.xPosition, this.cursorCoordinates.world.yPosition);
      });
      this.adjustCursorForViewport()
    };

    adjustCursorForViewport() {
      let viewport = this._core.getData('VIEWPORT')
      let cursor = this._core.getData('CURSOR_COORDINATES')
      if (cursor) {
        this.cursorCoordinates = { 
          canvas: {xPosition: cursor.canvas.xPosition, yPosition: cursor.canvas.yPosition}, 
          world: {xPosition: (cursor.canvas.xPosition + viewport.xPosition) / viewport.scale, 
                  yPosition: (cursor.canvas.yPosition + viewport.yPosition) / viewport.scale  } 
        }
        this._core.publishData('CURSOR_COORDINATES', this.cursorCoordinates);
        this.send("DEBUG_DATA", {type: 'cursor', ...this.cursorCoordinates})
      }
    }
  }
  