import { default as System } from '@core/system';

export default class AudioSystem extends System {
    constructor() {
      super()

      this.audioState = {
      }

      this.addHandler('PLAY_AUDIO', (payload) => {
        if (payload.exclusive && this.audioState[payload.audioKey]) {
          return;
        }
        this.audioState[payload.audioKey] = true;

        try {
          let audio = new Audio(`assets/audio/${payload.audioKey}`);
          audio.currentTime = payload.startAt || 0;
          audio.loop = payload.loop; 
          audio.volume = payload.volume || 1;
          audio.play();
          if (payload.endAt) {
            audio.addEventListener('timeupdate', () => {
              if (!this.audioState[payload.audioKey]) {
                audio.pause();
              }
  
              if (audio.currentTime >= payload.endAt) {
                  audio.pause();
                  this.audioState[payload.audioKey] = false
              }
            });
          }
        }
        catch(exception) {
          console.error(`Audio error - ${exception}`);
        }
        
      })

      this.addHandler('STOP_AUDIO', (payload) => {
        delete this.audioState[payload.audioKey]
      })
      this.send('PLAY_AUDIO', {audioKey: 'ambience-1.mp3', loop: true, volume: 0.1})
    }
  
    work() {
    };
  }
  