import { default as System } from '@core/system';
import { default as Entity } from '@core/entity';
import { default as Tag } from '@core/tag';

import ExplosionComponent from '@game/explosions/explosion-component';
import PositionComponent from '@game/positioner/position-component';

export default class ExplosionSystem extends System {
    constructor() {
      super();

      this.lastExplosionId = 0;

      this.addHandler('EXPLOSION_EFFECT_REQUESTED', (payload) => {
        this.lastExplosionId += 1
        let explosionDetails = {
            id: this.lastExplosionId,
            particleCount: 100,
            maxRadius: 200,
            currentRadius: 1,
            xPosition: payload.xPosition,
            yPosition: payload.yPosition
        }
        this.createExplosion(explosionDetails)
      })
    }
    
    work() {
        this.workForTag('Explosion', (tag, entity) => {
            this.adjustExplosion(tag)
            this.renderExplosion(tag)
        })
    };

    createExplosion(explosionDetails) {
        let entity = new Entity({key: `explosion-${explosionDetails.id}`});
        entity.addComponent(new ExplosionComponent({ radius: 1, maxRadius: explosionDetails.maxRadius, particleCount: explosionDetails.particleCount, rateOfChange: 1.3 }))
        entity.addComponent(new PositionComponent({ xPosition: explosionDetails.xPosition, yPosition: explosionDetails.yPosition, width: explosionDetails.radius * 2, height: explosionDetails.radius * 2 }));
        this._core.addEntity(entity);
    }


    adjustExplosion(explosion) {
        if (explosion.getCurrentRadius() >= explosion.getMaxRadius()) {
            this.send('ENTITY_DESTROY_REQUESTED', {entityId: explosion.getEntity().getId()})
            return;
        }
        explosion.setCurrentRadius(explosion.getCurrentRadius() * explosion.getRateOfChange());
    }

    renderExplosion(explosion) {
        let canvasCtx = document.getElementById('canvas').getContext("2d");
        let viewport = this._core.getData('VIEWPORT') || {xPosition: 0, yPosition: 0, width: 1024, height: 768};

        let translateXPosition = ((explosion.getXPosition())  * viewport.scale - (viewport.xPosition)) 
        let translateYPosition = ((explosion.getYPosition())  * viewport.scale - (viewport.yPosition))  
        let xPosition = 0;
        let yPosition = 0;

        canvasCtx.save()

        canvasCtx.translate(translateXPosition, translateYPosition);
  
        let particleCount =  explosion.getParticleCount()
        let radius = explosion.getCurrentRadius() * viewport.scale;
  
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * radius;
          const x = xPosition + Math.cos(angle) * distance;
          const y = yPosition + Math.sin(angle) * distance;
          const intensity = Math.random() * 0.5 + 0.5; // Random intensity between 0.5 and 1.0
          const size = (Math.random() * 6) * viewport.scale; // Random size of flames
          
          canvasCtx.beginPath();
          canvasCtx.arc(x, y, size, 0, Math.PI * 2);
          canvasCtx.fillStyle = `rgba(255, ${Math.floor(255 * intensity)}, 0, ${intensity})`; // Varying color and opacity
          canvasCtx.fill();
        }
    
        canvasCtx.restore()
      }
  }  