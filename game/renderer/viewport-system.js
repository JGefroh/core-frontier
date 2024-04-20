import { default as System } from '@core/system';

export default class ViewportSystem extends System {
  constructor() {
    super()
    this.viewportXPosition = 0;
    this.viewportYPosition = 0;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.viewportScale = 0.25;
    this.viewportMode = 'follow'
    this.viewportWorldXPosition = 0;
    this.viewportWorldYPosition = 0;

    this.viewportYOffset = 0; //Offset is used in follow mode to follow but still allow for camera panning.
    this.viewportXOffset = 0; //Offset is used in follow mode to follow but still allow for camera panning.

    this.secondaryViewportXPosition = 0;
    this.secondaryViewportYPosition = 0;
    this.secondaryViewportWidth = window.innerWidth;
    this.secondaryViewportHeight = window.innerHeight;
    this.secondaryViewportScale = 1;
    this.secondaryViewportMode = 'follow'

    this.viewportMin = 0.03;
    this.viewportMax = 1.4;

    this.followEntityId = null;
    this.primaryFollowEntityId = null;


    this.addHandler('INPUT_RECEIVED', (payload) => {
      if (payload.action == 'move_viewport_up') {
        if (this.viewportMode == 'follow') {
          this.viewportYOffset -= (30 / this.viewportScale);
        }
        else {
          this.viewportWorldYPosition -= (30 / this.viewportScale);
        }
      }
      if (payload.action == 'move_viewport_down') {
        if (this.viewportMode == 'follow') {
          this.viewportYOffset += (30 / this.viewportScale);
        }
        else {
          this.viewportWorldYPosition += (30 / this.viewportScale);
        }
      }
      if (payload.action == 'move_viewport_left') {
        if (this.viewportMode == 'follow') {
          this.viewportXOffset -= (30 / this.viewportScale);
        }
        else {
          this.viewportWorldXPosition -= (30 / this.viewportScale);
        }
      }
      if (payload.action == 'move_viewport_right') {
        if (this.viewportMode == 'follow') {
          this.viewportXOffset += (30 / this.viewportScale);
        }
        else {
          this.viewportWorldXPosition += (30 / this.viewportScale);
        }
      }

      if (payload.action == 'toggle-follow') {
        this.viewportMode = this.viewportMode == 'follow' ? 'free' : 'follow';
        this.primaryFollowEntityId = payload.entityId;
        this.viewportXOffset = 0;
        this.viewportYOffset = 0;
      }
      if (payload.action == 'follow') {
        this.viewportMode = 'follow';
        this.primaryFollowEntityId = payload.entityId;
        this.viewportXOffset = 0;
        this.viewportYOffset = 0;
      }
      if (payload.action == 'main_viewport_zoom_in') {
        this.viewportScale = Math.min(this.viewportMax, this.viewportScale + .03);
      }
      if (payload.action == 'main_viewport_zoom_out') {
        this.viewportScale = Math.max(this.viewportMin, this.viewportScale - .03)
      }
      if (payload.action == 'main_viewport_zoom_reset') {
        this.viewportScale = 0.25;
      }
      if (payload.action == 'main_viewport_viewport_follow') {
        this.viewportMode = 'follow';
        this.viewportXOffset = 0;
        this.viewportYOffset = 0;
      }

      if (payload.action == 'focus-mode') {
        this.viewportMode = 'focus'
        this.primaryFollowEntityId = payload.entityId;
        this.viewportXOffset = 0;
        this.viewportYOffset = 0;
      }
    });

    this.addHandler('TRACK_ENTITY_REQUESTED', (payload) => {
      this.followEntityId = payload.entityId;
    })
  }

  work() {
    this.updatePrimaryViewport();
    this.updateSecondaryViewport();
  }

  updatePrimaryViewport() {
    this.viewportWidth  = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    let viewport = null;
    let followEntity = this._core.getEntityWithId(this.primaryFollowEntityId) || this._core.getKeyedAs('PLAYER');

    if (!followEntity && this.viewportMode == 'follow') {
      this.viewportMode = 'free'
    }

    if (this.viewportMode == 'follow') {
      let viewportFollowable = this.getTag('ViewportFollowable');
      if (viewportFollowable) {
        viewportFollowable.setEntity(followEntity)
        this.viewportXPosition = ((viewportFollowable.getXPosition() + this.viewportXOffset) * this.viewportScale - (this.viewportWidth / 2))
        this.viewportYPosition = ((viewportFollowable.getYPosition() + this.viewportYOffset) * this.viewportScale - (this.viewportHeight / 2))
        
        this.viewportWorldXPosition = viewportFollowable.getXPosition()// Keep the world position synced so we can switch seamlessly
        this.viewportWorldYPosition = viewportFollowable.getYPosition()

        viewport = { xPosition: this.viewportXPosition, 
                    yPosition: this.viewportYPosition, 
                    width: this.viewportWidth, 
                    height: this.viewportHeight, 
                    scale: this.viewportScale}
      }
    }
    else if (this.viewportMode == 'focus') {
      let viewportFollowable1 = this.getTag('ViewportFollowable');
      viewportFollowable1.setEntity(this._core.getKeyedAs('PLAYER'))
      let viewportFollowable2 = this.getTag('ViewportFollowable')
      viewportFollowable2.setEntity(followEntity);

      if (viewportFollowable1.getEntity()?.id == viewportFollowable2.getEntity()?.id) {
        this.viewportMode = 'follow';
        this.primaryFollowEntityId = viewportFollowable2.getEntity()?.id;
        this.viewportXOffset = 0;
        this.viewportYOffset = 0;
        this.viewportScale = 1;
        return;
      }
      this._showBothObjects(viewportFollowable1, viewportFollowable2, 300, 300)

      viewport = { xPosition: this.viewportXPosition, 
                  yPosition: this.viewportYPosition, 
                  width: this.viewportWidth, 
                  height: this.viewportHeight, 
                  scale: this.viewportScale}
    }
    else {
        this.viewportXPosition = (this.viewportWorldXPosition *  this.viewportScale - (this.viewportWidth / 2))
        this.viewportYPosition = (this.viewportWorldYPosition * this.viewportScale - (this.viewportHeight / 2))

        viewport = { xPosition: this.viewportXPosition, 
                    yPosition: this.viewportYPosition, 
                    width: this.viewportWidth, 
                    height: this.viewportHeight, 
                    scale: this.viewportScale}
    }

    if (!viewport) {
      viewport = { xPosition: this.viewportXPosition, 
                   yPosition: this.viewportYPosition, 
                   width: this.viewportWidth, 
                   height: this.viewportHeight, 
                   scale: this.viewportScale}
    }

    this._core.publishData('VIEWPORT', viewport);
    this.send("DEBUG_DATA", {type: 'viewport', ...viewport})
  }

  updateSecondaryViewport() {
    this.secondaryViewportWidth  = window.innerWidth;
    this.secondaryViewportHeight = window.innerHeight;
    let viewport = null;
    if (!this.followEntityId) {
      return;
    }

    if (this.followEntityId) {
      let viewportFollowable = this.getTag('ViewportFollowable');
      let entity = this._core.getEntityWithId(this.followEntityId);
      if (viewportFollowable && entity) {
        viewportFollowable.setEntity(entity)
        this.secondaryViewportXPosition = (viewportFollowable.getXPosition() * this.secondaryViewportScale - (this.secondaryViewportWidth / 2))
        this.secondaryViewportYPosition = (viewportFollowable.getYPosition() * this.secondaryViewportScale - (this.secondaryViewportHeight / 2))

        if (viewportFollowable.getWidth() < 1000) {
          this.secondaryViewportScale = 4;
        }
        else if(viewportFollowable.getWidth() >= 1000) {
          this.secondaryViewportScale = 0.5
        }

        viewport = { xPosition: this.secondaryViewportXPosition, 
                    yPosition: this.secondaryViewportYPosition, 
                    width: this.secondaryViewportWidth, 
                    height: this.secondaryViewportHeight, 
                    scale: this.secondaryViewportScale}
      }
    }

    if (!viewport) {
      viewport = { xPosition: this.secondaryViewportXPosition, 
                   yPosition: this.secondaryViewportYPosition, 
                   width: this.secondaryViewportWidth, 
                   height: this.secondaryViewportHeight, 
                   scale: this.secondaryViewportScale}
    }

    this._core.publishData('SECONDARY_VIEWPORT', viewport);
  }
  _showBothObjects(object1, object2, xPaddingCanvas, yPaddingCanvas) {
    let wDistanceX = Math.abs(object1.getXPosition() - object2.getXPosition());
    let wDistanceY = Math.abs(object1.getYPosition() - object2.getYPosition());

    let wDistanceXWithPadding = wDistanceX + (xPaddingCanvas / this.viewportScale);
    let wDistanceYWithPadding = wDistanceY + (yPaddingCanvas / this.viewportScale);

    let wDistanceDiagonal = Math.sqrt(wDistanceXWithPadding ** 2 + wDistanceYWithPadding ** 2);

    let viewportScale = Math.min(this.viewportWidth / wDistanceDiagonal, this.viewportHeight / wDistanceDiagonal);
    this.viewportScale = viewportScale;

    let wCenterXPosition = (object1.getXPosition() + object2.getXPosition()) / 2;
    let wCenterYPosition = (object1.getYPosition() + object2.getYPosition()) / 2;

    let cCenterXPosition = wCenterXPosition * this.viewportScale;
    let cCenterYPosition = wCenterYPosition * this.viewportScale;

    this.viewportXPosition = cCenterXPosition - (this.viewportWidth / 2);
    this.viewportYPosition = cCenterYPosition - (this.viewportHeight / 2);
  }
}
  