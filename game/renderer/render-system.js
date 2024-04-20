import { default as System } from '@core/system';
import { renderToViewport } from '@game/utilities/canvas-util.js'

export default class RenderSystem extends System {
    constructor(config = {}) {
      super()
      this.stars = []
      this.fullScreen = true;
      this.secondaryScreen = config.secondaryScreen || false;
      this.overlay = true;

      this.addHandler('INPUT_RECEIVED', (payload) => {
        let message = payload.type
        if (payload.action === 'render_layer') {
          this.fullScreen = !this.fullScreen
        }
      });
    }
  
    work() {
      if (!this.fullScreen) {
        this._renderToPrimary(this.renderShapes.bind(this));
      }
      else {
        this._renderToPrimary(this.renderWorld.bind(this));
      }
      
      if (this.secondaryScreen) {
        this._renderToSecondary(this.renderWorld.bind(this));
      }
    };

    _renderToPrimary(renderFunction) {
      var canvasCtx = document.getElementById('canvas').getContext("2d");
      let viewport = this._core.getData('VIEWPORT') || {xPosition: 0, yPosition: 0, width: 1024, height: 768};

      renderFunction(canvasCtx, viewport, { overlay: this.overlay });
    }

    _renderToSecondary(renderFunction) {
      let canvas = document.getElementById('canvas')
      let offScreenCanvas = window.offScreenCanvas
      var offScreenCtx = offScreenCanvas.getContext('2d');
      let viewport = this._core.getData('SECONDARY_VIEWPORT')
      if (viewport) {
        renderFunction(offScreenCtx, viewport, { overlay: false });
        renderToViewport(canvas, offScreenCanvas)
      }
    }

    renderShapes(canvasCtx, viewport, options = {}) {
      canvasCtx.save();

      var renderable = this.getTag('Renderable');
      canvasCtx.canvas.width  = viewport.width;
      canvasCtx.canvas.height = viewport.height;

      let fillStyle = "#010707" 
      canvasCtx.fillStyle = fillStyle;
      canvasCtx.fillRect(0, 0, viewport.width, viewport.height);

      this._renderGrid(canvasCtx, viewport);

      this.forTaggedAs('Renderable', (entity) => {
        renderable.setEntity(entity);
        if (!renderable.getShouldRender()) {
          return;
        }

        let img = this._getCachedImage(renderable)

        let translateXPosition = ((renderable.getXPosition())  * viewport.scale - (viewport.xPosition)) 
        let translateYPosition = ((renderable.getYPosition())  * viewport.scale - (viewport.yPosition))  
        let imageWidth = renderable.getWidth() * viewport.scale;
        let imageHeight = renderable.getHeight() * viewport.scale;
        let xPosition = -this._calculateCenter(imageWidth)
        let yPosition = -this._calculateCenter(imageHeight)

        canvasCtx.save();

        canvasCtx.translate(translateXPosition, translateYPosition);
        canvasCtx.rotate(renderable.getBearingRadians())
        canvasCtx.fillStyle = renderable.getRenderColor();
        canvasCtx.strokeStyle = renderable.getRenderColor();
        canvasCtx.setLineDash(renderable.getLineDash())

        if (renderable.getRenderShape() == 'rectangle') {
          canvasCtx.fillRect(xPosition, yPosition, imageWidth, imageHeight);
        }
        else if (renderable.getRenderShape() == 'circle') {
          canvasCtx.beginPath();
          canvasCtx.arc(xPosition + (imageWidth / 2),  yPosition + imageHeight / 2, imageWidth / 2, 0, Math.PI * 2);
          canvasCtx.stroke();
          canvasCtx.fill();
        }
        else if (renderable.getRenderShape() == 'path') {
          canvasCtx.strokeStyle = renderable.getRenderOverlayColor();
          this.renderPathPoints(canvasCtx, renderable, viewport, translateXPosition, translateYPosition)
        }

        if (options.overlay) {
          this.applyOverlay(renderable, viewport, canvasCtx)
        }

        canvasCtx.restore()
      });
      canvasCtx.restore()
    }

    applyOverlay(renderable, viewport, canvasCtx) {

      if (!renderable.hasRenderOverlay()) {
        return;
      }

      let scaledImageWidth = renderable.getWidth() * viewport.scale;
      let scaledImageHeight = renderable.getHeight() * viewport.scale;
      let imageWidth = renderable.getWidth();
      let imageHeight = renderable.getHeight();
      let scaledXPosition = -this._calculateCenter(scaledImageWidth)
      let scaledYPosition = -this._calculateCenter(scaledImageHeight)
      let xPosition = -this._calculateCenter(imageWidth)
      let yPosition = -this._calculateCenter(imageHeight)
      let xSpacing = 18;
      let textFrameWidth = 200;
      let textFrameHeight = 100;

      canvasCtx.save()

      //Shape
      canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      canvasCtx.lineWidth = 2
      canvasCtx.strokeStyle = renderable.getRenderOverlayColor();

      if (renderable.getRenderOverlayShape() == 'rectangle') {
        canvasCtx.strokeRect(scaledXPosition - 4, scaledYPosition - 4, scaledImageWidth + 8, scaledImageHeight + 8);

        canvasCtx.rotate(-renderable.getBearingRadians())

        // Text Frame
        canvasCtx.beginPath();
        canvasCtx.moveTo(scaledXPosition + scaledImageWidth + xSpacing, scaledYPosition + (scaledImageHeight / 6));
        canvasCtx.lineTo(scaledXPosition + scaledImageWidth + xSpacing, scaledYPosition + ((scaledImageHeight / 6) * 5));
        canvasCtx.moveTo(scaledXPosition + scaledImageWidth + xSpacing, scaledYPosition + (scaledImageHeight / 2));
        canvasCtx.lineTo(scaledXPosition + scaledImageWidth + xSpacing + textFrameWidth, scaledYPosition + (scaledImageHeight / 2));
        canvasCtx.stroke();

        // Text
        if (renderable.getDetailLabel()) {
          canvasCtx.font = '16px Protomolecule, sans-serif';
          canvasCtx.fillStyle = 'white';
          canvasCtx.font = '20px Protomolecule, sans-serif'
          canvasCtx.fillText(renderable.getDetailLabel(), scaledXPosition + scaledImageWidth + (xSpacing * 2), yPosition + (imageHeight / 2) - 30);
        }
        if (renderable.getDetailCode()) {
          canvasCtx.font = '14px Protomolecule, sans-serif'
          canvasCtx.fillText(renderable.getDetailCode(), scaledXPosition + scaledImageWidth + (xSpacing * 2), yPosition + (imageHeight / 2) - 10);
        }
        if (renderable.getDetailSubtype()) {
          canvasCtx.fillStyle = 'white';
          canvasCtx.font = '12px Protomolecule, sans-serif'
          canvasCtx.fillText(renderable.getDetailSubtype(), scaledXPosition + scaledImageWidth + (xSpacing * 2), yPosition + (imageHeight / 2) + 20);
        }

        if (renderable.getDebugLine1()) {
          canvasCtx.fillStyle = 'white';
          canvasCtx.font = '12px Protomolecule, sans-serif'
          canvasCtx.fillText(renderable.getDebugLine1(), scaledXPosition + scaledImageWidth + (xSpacing * 2), yPosition + (imageHeight / 2) + 30);
        }
        if (renderable.getDebugLine2()) {
          canvasCtx.fillStyle = 'white';
          canvasCtx.font = '12px Protomolecule, sans-serif'
          canvasCtx.fillText(renderable.getDebugLine2(), scaledXPosition + scaledImageWidth + (xSpacing * 2), yPosition + (imageHeight / 2) + 40);
        }
      }
      else if (renderable.getRenderOverlayShape() == 'circle') {
        canvasCtx.strokeStyle = renderable.getRenderOverlayColor();
        canvasCtx.beginPath();
        canvasCtx.arc(scaledXPosition + (scaledImageWidth / 2),  scaledYPosition + (scaledImageHeight / 2), scaledImageWidth/2, 0, Math.PI * 2);
        canvasCtx.stroke();
        canvasCtx.rotate(-renderable.getBearingRadians())

        // Text Frame
        canvasCtx.beginPath();
        canvasCtx.moveTo(scaledXPosition + scaledImageWidth + xSpacing, scaledYPosition + (scaledImageHeight / 6));
        canvasCtx.lineTo(scaledXPosition + scaledImageWidth + xSpacing, scaledYPosition + ((scaledImageHeight / 6) * 5));
        canvasCtx.moveTo(scaledXPosition + scaledImageWidth + xSpacing, scaledYPosition + (scaledImageHeight / 2));
        canvasCtx.lineTo(scaledXPosition + scaledImageWidth + xSpacing + textFrameWidth, scaledYPosition + (scaledImageHeight / 2));
        canvasCtx.stroke();

        // Text
        if (renderable.getDetailLabel()) {
          canvasCtx.font = '16px Protomolecule, sans-serif';
          canvasCtx.fillStyle = 'white';
          canvasCtx.font = '20px Protomolecule, sans-serif'
          canvasCtx.fillText(renderable.getDetailLabel(), scaledXPosition + scaledImageWidth + (xSpacing * 2), yPosition + (imageHeight / 2) - 30);
        }
        if (renderable.getDetailCode()) {
          canvasCtx.font = '14px Protomolecule, sans-serif'
          canvasCtx.fillText(renderable.getDetailCode(), scaledXPosition + scaledImageWidth + (xSpacing * 2), yPosition + (imageHeight / 2) - 10);
        }
        if (renderable.getDetailSubtype()) {
          canvasCtx.fillStyle = 'white';
          canvasCtx.font = '12px Protomolecule, sans-serif'
          canvasCtx.fillText(renderable.getDetailSubtype(), scaledXPosition + scaledImageWidth + (xSpacing * 2), yPosition + (imageHeight / 2) + 20);
        }
      }
      else if (renderable.getRenderOverlayShape() == 'triangle') {
        canvasCtx.rotate(-renderable.getBearingRadians())
        // Determine the largest dimension of the image
        var largestDimension = Math.max(scaledImageWidth, scaledImageHeight) * 2;

        // Calculate the side length of the equilateral triangle
        var sideLength = Math.max(largestDimension, scaledImageWidth, scaledImageHeight) * 2;

        // Calculate the center of the image
        // var centerX = xPosition + scaledImageWidth / 2;
        // var centerY = yPosition + scaledImageHeight / 2;
        var centerX = 0;
        var centerY = 0;

        // Calculate the coordinates of the vertices of the equilateral triangle
        var x1 = centerX;
        var y1 = centerY - Math.sqrt(3) / 3 * sideLength;
        var x2 = centerX - 0.5 * sideLength;
        var y2 = centerY + Math.sqrt(3) / 6 * sideLength;
        var x3 = centerX + 0.5 * sideLength;
        var y3 = y2;

        // Draw the equilateral triangle
        canvasCtx.beginPath();
        canvasCtx.moveTo(x1, y1);
        canvasCtx.lineTo(x2, y2);
        canvasCtx.lineTo(x3, y3);
        canvasCtx.closePath();
        canvasCtx.stroke();

        if (renderable.hasDetail()) {
          canvasCtx.font = '16px Protomolecule, sans-serif';
          canvasCtx.fillStyle = 'white';
          canvasCtx.fillText(renderable.getDetailLabel(), scaledXPosition + scaledImageWidth, yPosition + (imageHeight / 2) - 30);
        }
      }
      canvasCtx.restore()
    }

    renderShipOverlay() {
      
    }

    renderWorld(canvasCtx, viewport, options = {}) {
      canvasCtx.save()

      var renderable = this.getTag('Renderable');
      canvasCtx.canvas.width  = viewport.width;
      canvasCtx.canvas.height = viewport.height;

      canvasCtx.save()
      let fillStyle = "#010707" 
      canvasCtx.fillStyle = fillStyle;
      canvasCtx.fillRect(0, 0, viewport.width, viewport.height);
      canvasCtx.restore()
      this._renderStars(canvasCtx);

      this.forTaggedAs('Renderable', (entity) => {
        renderable.setEntity(entity);
        if (!renderable.getShouldRender()) {
          return;
        }

        let translateXPosition = ((renderable.getXPosition())  * viewport.scale - (viewport.xPosition)) 
        let translateYPosition = ((renderable.getYPosition())  * viewport.scale - (viewport.yPosition))  

        canvasCtx.save();
        canvasCtx.translate(translateXPosition, translateYPosition);
        canvasCtx.rotate(renderable.getBearingRadians())

        if (renderable.getImagePath()) {
          let img = this._getCachedImage(renderable)
          let imageWidth = renderable.getWidth() * viewport.scale;
          let imageHeight = renderable.getHeight() * viewport.scale;
          let xPosition = -this._calculateCenter(imageWidth)
          let yPosition = -this._calculateCenter(imageHeight)

          canvasCtx.drawImage(img, xPosition, yPosition, imageWidth, imageHeight);
        }

          if (options.overlay) {
            this.applyOverlay(renderable, viewport, canvasCtx)
          }

          canvasCtx.restore()
      });
      canvasCtx.restore()
    }
    
    renderPathPoints(canvasCtx, renderable, viewport) {
      let pathPoints = renderable.getPathPoints();
      if (!pathPoints.length) {
          return;
      }
  
      canvasCtx.beginPath();
      canvasCtx.moveTo((pathPoints[0].xPosition - renderable.getXPosition()) * viewport.scale,
                       (pathPoints[0].yPosition - renderable.getYPosition()) * viewport.scale)

      // Draw a quadratic curve through the points
      for (let i = 1; i < pathPoints.length; i++) {
          if (i < pathPoints.length - 1) { // If not the last point
              const startX = (pathPoints[i].xPosition - renderable.getXPosition()) * viewport.scale;
              const startY = (pathPoints[i].yPosition - renderable.getYPosition()) * viewport.scale
              const endX = (pathPoints[i + 1].xPosition -  renderable.getXPosition()) * viewport.scale;
              const endY = (pathPoints[i + 1].yPosition -  renderable.getYPosition()) * viewport.scale
  
              // Calculate control point relative to start and end points
              const controlX = startX + (endX - startX) / 2;
              const controlY = startY + (endY - startY) / 2;
  
              canvasCtx.quadraticCurveTo(controlX, controlY, endX, endY);
          } else { 
              const lastX = (pathPoints[i].xPosition - renderable.getXPosition()) * viewport.scale;
              const lastY = (pathPoints[i].yPosition - renderable.getYPosition()) * viewport.scale;
              canvasCtx.lineTo(lastX, lastY);
          }
      }
  
      // Finalize the path
      canvasCtx.stroke();
  }
  
    _getCachedImage(renderable) {
      let img = renderable.getImageObject()
      
      if (!img) {
        img = new Image()
        img.src = renderable.getImagePath();
        renderable.setImageObject(img)
      }

      return img
    }
    



    /***
     * 
     * RENDERING STARS
     */
    _renderStars(canvasCtx) {
      if (!this.stars.length) {
        this._generateStars(canvasCtx.canvas.width, canvasCtx.canvas.height);
      }
      for (let i = 0; i < this.stars.length; i++) {
          this._drawStar(this.stars[i].x, this.stars[i].y, this.stars[i].radius + (Math.random() * 0.4), this.stars[i].color, canvasCtx);
      }
    }

    _generateStars(canvasWidth, canvasHeight) {
      const numStars = 200;
      const maxRadius = 2;
      const minRadius = 0.5;
      const colors = ['#FFFFFF', '#D3D3D3', '#C0C0C0', '#A9A9A9', '#808080']; // Various shades of gray

      for (let i = 0; i < numStars; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        const radius = Math.random() * (maxRadius - minRadius) + minRadius;
        const color = colors[Math.floor(Math.random() * colors.length)];

        this.stars.push({x: x, y: y, radius: radius, color: color})
      }
    }

    _drawStar(x, y, radius, color, ctx) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }



    /***
     * RENDERING GRID
     */
    _renderGrid(canvasCtx, viewport) {
      this.rows = 100;
      this.cols = 100;
      this.cellSize = 500 / (viewport.scale * 16);
      let fillStyle = 'rgb(3,13,34)'
      canvasCtx.fillStyle = fillStyle;
      canvasCtx.fillRect(0, 0, viewport.width, viewport.height);
      canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i <= this.rows; i++) {
        let yp = (this.cellSize * i) - (viewport.yPosition % this.cellSize);
      
        let startX = 0;
        let startY = yp;
        let endX = canvasCtx.canvas.width;
        let endY =  yp;

        canvasCtx.lineWidth = this._getLineWidth(i + Math.floor(viewport.yPosition / this.cellSize));
        canvasCtx.beginPath();
        canvasCtx.moveTo(startX, startY);
        canvasCtx.lineTo(endX, endY);
        canvasCtx.stroke();
      }

      for (let j = 0; j <= this.cols; j++) {
        let xp = (this.cellSize * j) - (viewport.xPosition % this.cellSize);
        let startX = xp;
        let startY = 0;
        let endX = xp;
        let endY =  canvasCtx.canvas.height;
        canvasCtx.lineWidth = this._getLineWidth(j + Math.floor(viewport.xPosition / this.cellSize));
        canvasCtx.beginPath();
        canvasCtx.moveTo(startX, startY);
        canvasCtx.lineTo(endX, endY);
        canvasCtx.stroke();
      }
      canvasCtx.lineWidth = 1;
      canvasCtx.strokeStyle = null;
  }

  _getLineWidth(index) {
    let highlightMediumFrequency = 4;
    let highlightHeavyFrequency = 16;

    if ((index / highlightHeavyFrequency) % 1 === 0) {
        return 4; 
    } else if ((index / highlightMediumFrequency) % 1 === 0) {
        return 2; 
    }
    else {
      return 1;
    }
  }

    _calculateCenter(size) {
      return (size / 2)
    }
}