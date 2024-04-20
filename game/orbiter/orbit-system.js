import { default as System } from '@core/system';
import { distanceFromTo, toMetersFromCoordinateUnits } from '@game/utilities/distance-util';
import { getPositionInOrbit } from '@game/orbiter/orbit-util';

export default class OrbitSystem extends System {
    constructor() {
      super();
      this.startDate = new Date().getTime() / 1000
    }
    
    work() {
      this.workForTag('Orbiter', (tag, entity) => {
        if (!entity.id) {
          return;
        }
        let orbitXPosition = tag.getOrbitXPosition();
        let orbitYPosition = tag.getOrbitYPosition();

        if (tag.getOrbitEntityId()) {
          let orbitEntity = this._core.getEntityWithId(tag.getOrbitEntityId())
          orbitXPosition = orbitEntity.getComponent('PositionComponent').xPosition
          orbitYPosition = orbitEntity.getComponent('PositionComponent').yPosition
        }
        else if (tag.getOrbitEntityKey()) {
          let orbitEntity = this._core.getKeyedAs(tag.getOrbitEntityKey())
          orbitXPosition = orbitEntity.getComponent('PositionComponent').xPosition
          orbitYPosition = orbitEntity.getComponent('PositionComponent').yPosition
        }
        let expectedOrbitPosition = getPositionInOrbit(orbitXPosition, orbitYPosition, tag.getOrbitRadius(), tag.getOrbitCompletionTime(), this.startDate, tag.getStartAngle());
        tag.setCurrentPosition(expectedOrbitPosition.x, expectedOrbitPosition.y)
        const viewport = this._core.getData('VIEWPORT') || { xPosition: 0, yPosition: 0, width: 1024, height: 768 };
    
        const ctx = document.getElementById('canvas').getContext('2d');
    
        this.renderOrbit(ctx, viewport, orbitXPosition, orbitYPosition, tag.getOrbitRadius(), tag.getOrbitCompletionTime())
      });
      
    };
  
    renderOrbit(ctx, viewport, orbitXPosition, orbitYPosition, orbitRadius, orbitCompletionTime) {
      const time = Date.now(); // Current time in seconds
      const period = orbitCompletionTime * 1000; // Orbit completion time in milliseconds

      ctx.save();

      // Apply viewport transformations only to the orbit path
      ctx.scale(viewport.scale, viewport.scale);

      // Calculate the translated position of the orbit center based on the viewport position
      const translateXPosition = orbitXPosition - (viewport.xPosition / viewport.scale);
      const translateYPosition = orbitYPosition - (viewport.yPosition / viewport.scale);

      ctx.translate(translateXPosition, translateYPosition);

      // Set the line width
      ctx.lineWidth = 14; // Set the desired line width
      ctx.strokeStyle = 'rgba(0,0,0,0)'

      ctx.beginPath();

      for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
          // Calculate position on the ellipse relative to world coordinates
          const x = orbitRadius * Math.cos(angle);
          const y = orbitRadius * Math.sin(angle);

          // Convert time to an angle
          const orbitAngle = (time % period) / period * Math.PI * 2;

          // Rotate the position by the orbit angle
          const rotatedX = Math.cos(orbitAngle) * x - Math.sin(orbitAngle) * y;
          const rotatedY = Math.sin(orbitAngle) * x + Math.cos(orbitAngle) * y;

          // Plot the point
          if (angle === 0) {
              ctx.moveTo(rotatedX, rotatedY);
          } else {
              ctx.lineTo(rotatedX, rotatedY);
          }
      }

      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
}