import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'
import { getPositionInOrbit } from '@game/orbiter/orbit-util';

import { angleTo, toFriendlyMeters, distanceFromTo, toMetersFromCoordinateUnits, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';
import OrbitComponent from '@game/orbiter/orbit-component.js';

export default class GuiMapSystem extends System {
    constructor() {
      super()
      this.wait = 200

      this.startDate = new Date().getTime() / 1000;

      this.planetData = [
        { name: "mercury", diameterKm: 4879, orbitalRadiusAU: 0.39, imageWidth: 2048, imageHeight: 2048, aspectRatio: 1, mapOrbitRadius: 30, startingAngle: 0, orbitPeriod: 0.24  },
        { name: "venus", diameterKm: 12104, orbitalRadiusAU: 0.72, imageWidth: 2048, imageHeight: 2048, aspectRatio: 1, mapOrbitRadius: 60, startingAngle: 0, orbitPeriod: 0.62 },
        { name: "earth", diameterKm: 12742, orbitalRadiusAU: 1, imageWidth: 2048, imageHeight: 2048, aspectRatio: 1, mapOrbitRadius: 100, startingAngle: 0, orbitPeriod: 1 },
        { name: "mars", diameterKm: 6779, orbitalRadiusAU: 1.52, imageWidth: 225, imageHeight: 225, aspectRatio: 1, mapOrbitRadius: 150, startingAngle: 0, orbitPeriod: 1.88 },
        { name: "jupiter", diameterKm: 139822, orbitalRadiusAU: 5.20, imageWidth: 2048, imageHeight: 1152, aspectRatio: 0.5625, mapOrbitRadius: 200, startingAngle: 0, orbitPeriod: 11.86 },
        { name: "saturn", diameterKm: 116464, orbitalRadiusAU: 9.58, imageWidth: 2048, imageHeight: 2048,  aspectRatio: 1, mapOrbitRadius: 250, startingAngle: 0, orbitPeriod: 29.46 },
        { name: "uranus", diameterKm: 50724, orbitalRadiusAU: 19.22, imageWidth: 2048, imageHeight: 1280, aspectRatio: 0.625, mapOrbitRadius: 300, startingAngle: 0, orbitPeriod: 84.01 },
        { name: "neptune", diameterKm: 49244, orbitalRadiusAU: 30.05, imageWidth: 2048, imageHeight: 1152, aspectRatio: 0.5625, mapOrbitRadius: 350, startingAngle: 0, orbitPeriod: 164.79 },
      ];

      setTimeout(() => {
        // this._addPanel()
      }, 100)

      this.addHandler('UI_CLICKED', (payload) => {
        if (payload.key == 'navigation-panel-label') {
          this.send('GUI_UPDATE_VISIBLE', {relatedKeyPrefix: 'sector-map'})
        }
      })
    }

    work() {
      this.planetData.forEach((planetData) => {
        let viewport = this._core.getData('VIEWPORT');
        let renderDetails = this.getPlanetInfo(planetData);
        let panelWidth = viewport.width - 700;
        let panelHeight = viewport.height - 100;
        let panelXPosition = 335;
        let panelYPosition = 48;
        let orbitCenterX = (panelWidth / 2) + panelXPosition
        let orbitCenterY = (panelHeight / 2) + panelYPosition
        let positionInOrbit = getPositionInOrbit(orbitCenterX, orbitCenterY, planetData.mapOrbitRadius, planetData.orbitPeriod * 3.154e+10, this.startDate, planetData.orbitPeriod * 1000);
        this.send('GUI_UPDATE_PROPERTIES', {key: `sector-map-planet-${planetData.name}`, value: {
          xPosition: positionInOrbit.x,
          yPosition: positionInOrbit.y,
        }})
      });
    };

    _addPanel() {
      let viewport = this._core.getData('VIEWPORT');
      let panelWidth = viewport.width - 700;
      let panelHeight = viewport.height - 100;
      let panelXPosition = 335;
      let panelYPosition = 48;
      let orbitCenterX = (panelWidth / 2) + panelXPosition
      let orbitCenterY = (panelHeight / 2) + panelYPosition

      this.send('ADD_GUI_RENDERABLE', {
        key: 'sector-map-panel',
        width: panelWidth,
        height: panelHeight,
        xPosition: panelXPosition,
        yPosition: panelYPosition,
      });

      this.send('ADD_GUI_RENDERABLE', {
        key: 'sector-map-sun',
        width: 20,
        height: 20,
        xPosition: orbitCenterX,
        yPosition: orbitCenterY,
        radius: 10,
        fillStyle: 'yellow'
      });

      this.planetData.forEach((planetData) => {
        let renderDetails = this.getPlanetInfo(planetData);

        let positionInOrbit = getPositionInOrbit(orbitCenterX, orbitCenterY, renderDetails.sizeInPixels, 100, this.startDate, planetData.startingAngle);
        this.send('ADD_GUI_RENDERABLE', {
          key: `sector-map-planet-${planetData.name}`,
          width: renderDetails.sizeInPixels,
          height: renderDetails.sizeInPixels,
          xPosition: positionInOrbit.x,
          yPosition: positionInOrbit.y,
          radius: 10 + (planetData.mapOrbitRadius / 70),
          fillStyle: 'rgba(255,255,255,0.7)'
        });

        this.send('ADD_GUI_RENDERABLE', {
          key: `sector-map-orbit-${planetData.name}`,
          width: 5,
          height: 5,
          xPosition: orbitCenterX,
          yPosition: orbitCenterY,
          radius: planetData.mapOrbitRadius,
          strokeStyle: 'white'
        });
      });
    }

    getPlanetInfo(planet) {
      const kmToPixels = 1 / 10000; // 1 pixel represents 10,000 kilometers
      const auToPixels = 500; // 1 AU is represented by 50 pixels
      
      const sizeInPixels = planet.diameterKm * kmToPixels;
      const distanceFromSun = planet.orbitalRadiusAU * auToPixels;

      return { name: planet.name, sizeInPixels, distanceFromSun };
    }
  }
  
  