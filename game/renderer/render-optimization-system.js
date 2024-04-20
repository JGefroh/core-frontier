import { default as System } from '@core/system';

export default class RenderOptimizationSystem extends System {
    constructor() {
      super()
    }
  
    work() {
      return // this is broken, ignore for now
      var renderable = this.getTag('Renderable');
      this.forTaggedAs('Renderable', (entity) => {
        renderable.setEntity(entity);

        renderable.setShouldRender(this._isInViewport(renderable))
      });
    };

    _isInViewport(renderable) {
      // If item is not in viewport, then mark to skip rendering.
      let viewport = this._core.getData('VIEWPORT');
      
      let result = (renderable.getXPosition() - renderable.getWidth() / 2 >= 0 - viewport.xPosition
			&& renderable.getXPosition() + renderable.getWidth() / 2 <= viewport.width
			&& renderable.getYPosition() - renderable.getHeight() / 2 >= 0 - viewport.yPosition
			&& renderable.getYPosition() + renderable.getHeight() / 2 <= viewport.height);

      return result;
    }
  }
  