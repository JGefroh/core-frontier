import { default as Entity } from '@core/entity.js';
import { default as System } from '@core/system';

import PositionComponent from '@game/positioner/position-component';
import RenderComponent from '@game/renderer/render-component';

export default class PathPredictorSystem extends System {
    constructor() {
      super()
      this.wait = 100
    }
  
    work() {
      this.workForTag('PathPredictor', (tag, entity) => {
        if (tag.showFlightPath()) {
          this.predictPath(tag)
        }
        else {
          let entity = this._core.getKeyedAs(`path-predictor-${tag.getId()}-path`);
          if (!entity) {
            return;
          }
          entity.getComponent('RenderComponent').pathPoints = [];
        }
      });
    };


    predictPath(tag) {
      let pathPoints = [
        {xPosition: tag.getXPosition(), yPosition: tag.getYPosition()}
      ]
      for (let i = 1; i < 15; i++) {
        let step = i < 5 ? i : i > 12 ? (i * 10) : i * 5;
        let position = this._predictFuturePosition(tag.getXPosition(), tag.getYPosition(), tag.getBearingDegrees(), 
        tag.getVectorMagnitude(), tag.getVectorAngleDegrees(), tag.getAccelerationMagnitude(), tag.getBearingDegrees(), i)
        pathPoints.push(position)
      }
      this.createOrUpdateMarkerComponent(tag, pathPoints)
    }

    createOrUpdateMarkerComponent(tag, pathPoints) {
      let key = `path-predictor-${tag.getId()}-path`;
      let entity = this._core.getKeyedAs(key);
      if (!entity) {
        entity = new Entity({key: key});
        let iffColor = tag.getEntity().getComponent("IffComponent")
        entity.addComponent(new PositionComponent({xPosition: tag.getXPosition(), yPosition: tag.getYPosition(), width: 100, height: 100, }));
        entity.addComponent(new RenderComponent({pathPoints: pathPoints, renderShape: 'path', renderColor: iffColor, lineDash: [10, 10]}))
        entity.addComponent(tag.getEntity().getComponent("IffComponent"))
        this._core.addEntity(entity)
      }
      else {
        entity.getComponent('PositionComponent').xPosition = tag.getXPosition()
        entity.getComponent('PositionComponent').yPosition = tag.getYPosition()
        entity.getComponent('RenderComponent').pathPoints = pathPoints;
      }
    }
    _predictFuturePosition(x0, y0, bearingDegrees, vectorMagnitude, vectorAngleDegrees, accelerationMagnitude, accelerationBearingDegrees, timeInterval) {
      // Convert vector and acceleration from polar to Cartesian coordinates
      const velocityX = vectorMagnitude * Math.cos(vectorAngleDegrees * Math.PI / 180);
      const velocityY = vectorMagnitude * Math.sin(vectorAngleDegrees * Math.PI / 180);
      
      const accelerationX = accelerationMagnitude * Math.cos(accelerationBearingDegrees * Math.PI / 180);
      const accelerationY = accelerationMagnitude * Math.sin(accelerationBearingDegrees * Math.PI / 180);
  
      // Predict future position in x and y dimensions using kinematic equations
      const x = x0 + velocityX * timeInterval + 0.5 * accelerationX * Math.pow(timeInterval, 2);
      const y = y0 + velocityY * timeInterval + 0.5 * accelerationY * Math.pow(timeInterval, 2);
  
      // Predict future bearing (direction) of the object
      const futureBearingDegrees = bearingDegrees + (accelerationMagnitude >= 0 ? 0 : 180);
  
      return { xPosition: x, yPosition: y, bearingDegrees: futureBearingDegrees };
  }
}
  