import Core from '@core/core';
import Entity from '@core/entity.js';

//Critical systems
import AudioSystem from '@game/audio/audio-system.js';
import GuiSystem from '@game/gui/gui-system.js';
import ViewportSystem from '@game/renderer/viewport-system';
import RenderSystem from '@game/renderer/render-system';

//Background systems
import OrbitSystem from '@game/orbiter/orbit-system.js';

import Renderable from '@game/renderer/render-tags';
import GuiCanvasRenderable from '@game/gui/gui-canvas-renderable-tag.js';
import Orbiter from '@game/orbiter/orbiter-tag.js';

//For background entity
import RenderComponent from '@game/renderer/render-component';
import PositionComponent from '@game/positioner/position-component';
import OrbitComponent from '@game/orbiter/orbit-component.js';

import { startGame } from  '@game/title/start-game.js'


function addSystems() {
  Core.addTag(Renderable)
  Core.addTag(GuiCanvasRenderable)
  Core.addTag(Orbiter)
  
  Core.addSystem(new ViewportSystem())
  Core.addSystem(new RenderSystem({secondaryScreen: false}))
  Core.addSystem(new AudioSystem())
  Core.addSystem(new GuiSystem());
  Core.addSystem(new OrbitSystem());
  Core.start();
}

function showTitle() {
  Core.send('ADD_GUI_RENDERABLE', {
    key: `title-card-1`,
    xPosition: 40,
    yPosition: 400,
    text: '', 
    fontSize: 75,
    fontType: 'Protomolecule'
  });

  Core.send('ADD_GUI_RENDERABLE', {
    key: `title-card-3`,
    xPosition: 46,
    yPosition: 480,
    text: 'by Joseph Gefroh',
    fontSize: 22,
  });


  Core.send('ADD_GUI_RENDERABLE', {
    key: `title-card-2`,
    xPosition: 46,
    yPosition: 600,
    text: 'Press any key to start',
    fontSize: 22,
  });
}

function addEntities() {
  let planetData = [
    { name: "earth", diameterKm: 12742, orbitalRadiusAU: 1, imageWidth: 2048, imageHeight: 2048, aspectRatio: 1, mapOrbitRadius: 100, startingAngle: 0, orbitPeriod: 1 },
  ];
  
  const randomIndex = Math.floor(Math.random() * planetData.length);
  let planet = planetData[randomIndex];
  let earthEntity = new Entity({key: planet.name});
  earthEntity.addComponent(new RenderComponent({  width: planet.imageWidth * 4, height: planet.imageHeight * 4, imagePath: `assets/planets/${planet.name}.png`, renderScale: 1}))
  earthEntity.addComponent(new PositionComponent({ xPosition: 0, yPosition: 0, width: 5000, height: 5000 }));
  earthEntity.addComponent(new OrbitComponent({orbitRadius: -3700, orbitCompletionTime: 5000, orbitXPosition: -1000, orbitYPosition: 0, startAngle: 3.15}));
  Core.addEntity(earthEntity);

  //Add sattelite
  let enemyEntity = new Entity({key: 'enemy'});
  enemyEntity.addComponent(new RenderComponent({ width: 260, height: 244, imagePath: 'assets/ships/satellite-defense-turret.png', renderOverlayColor: 'rgba(168,17,48,1)' }))
  enemyEntity.addComponent(new PositionComponent({ xPosition: 200, yPosition: 200, width: 75, height: 20 }));
  enemyEntity.addComponent(new OrbitComponent({orbitRadius: 3800, orbitCompletionTime: 1000, orbitXPosition: 0, orbitYPosition: 0, startAngle: 2.8, orbitEntityKey: planet.name}));
  Core.addEntity(enemyEntity);


  setTimeout(() => { Core.send('GUI_UPDATE_TEXT', {key: 'title-card-1', value: '   N     '})}, 300)
  setTimeout(() => { Core.send('GUI_UPDATE_TEXT', {key: 'title-card-1', value: '_r N i _'})}, 600)
  setTimeout(() => { Core.send('GUI_UPDATE_TEXT', {key: 'title-card-1', value: '_roN i r'})}, 900)
  setTimeout(() => { Core.send('GUI_UPDATE_TEXT', {key: 'title-card-1', value: ' roNti_r'})}, 1200)
  setTimeout(() => { Core.send('GUI_UPDATE_TEXT', {key: 'title-card-1', value: 'Fronti_r'})}, 1500)
  setTimeout(() => { Core.send('GUI_UPDATE_TEXT', {key: 'title-card-1', value: 'Fronti_r'})}, 1800)
  setTimeout(() => { Core.send('GUI_UPDATE_TEXT', {key: 'title-card-1', value: 'Frontier'})}, 2100)
}

function resetSystems() {
  Core.clear();
}

function addHandler() {
  window.onclick = function(event) {
    Core.addSystem(new AudioSystem())
  }
  window.onkeydown = function(event) {
    event.stopPropagation();
    event.preventDefault();
    resetSystems()
    startGame();
  };
}

if (window.location.href.includes('skiptitle')) {
  startGame()
}
else {
  addSystems();
  showTitle();
  addEntities();
  addHandler();
}