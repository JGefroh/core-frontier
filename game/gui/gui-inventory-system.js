import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'

import { angleTo, toFriendlyMeters, distanceFromTo, toCoordinateUnitsFromMeters, toMetersFromCoordinateUnits } from '@game/utilities/distance-util';
import InventoryItem from '@game/inventory/inventory-item';

export default class GuiInventorySystem extends System {
    constructor() {
      super()
      this.itemDatabaseById = InventoryItem.allItemsById();

      setTimeout(() => {
        let viewport = this._core.getData('VIEWPORT');

        this.panelWidth = viewport.width - 700;
        this.panelHeight = viewport.height - 405;
        this.categoriesWidth = 150
        this.detailsWidth = 300;
        this.listWidth = this.panelWidth - this.categoriesWidth - this.detailsWidth;
        this.panelX = 335;
        this.panelY = 45
        this.itemsPerPage = 25;
        this.currentPage = 0;

        this.viewedEntityId = null;
        this.viewedInventoryItems = [];
        this.viewedInventoryItem = null;
        this.showInventory = true;
        

        this._addPanel();

        this.addHandler('INPUT_RECEIVED', (payload) => {
            if (payload.action == 'toggle_inventory') {
                this.showInventory = !this.showInventory;
                this.send("GUI_UPDATE_VISIBLE", {relatedKeyPrefix: 'inventory-panel'})
            }
        })

        this.addHandler('UI_CLICKED', (payload) => {
            if (payload.key.startsWith('inventory-panel-list-item')) {
                this.handleRowClick(payload);
            }
        });
      }, 100)
    }

    work() {
        if (!this.viewedEntityId) {
            this.viewedEntityId = this._core.getKeyedAs('PLAYER')?.id
        }

        let entity = this._core.getEntityWithId(this.viewedEntityId);
        if (!entity) {
            return;
        }

        let inventoryItems = entity.getComponent('InventoryComponent')?.items || [];
        this.viewedInventoryItems = entity.getComponent('InventoryComponent')?.items || [];
        for (let row = 0; row < this.itemsPerPage; row++) {
            let inventoryItem = this.viewedInventoryItems[(this.currentPage * this.itemsPerPage) + row]
            if (inventoryItem) {
                this.updateItemRow(this.itemDatabaseById[inventoryItem.id], inventoryItem, row + 1)
            }
            else {
                this.updateItemRow(null, null, row + 1) // Clear the row
            }
        }
    };

    _addPanel() {
      let viewport = this._core.getData('VIEWPORT');

      this.send('ADD_GUI_RENDERABLE', {
        key: 'inventory-panel',
        width: this.panelWidth,
        height: this.panelHeight,
        xPosition: this.panelX,
        yPosition: this.panelY,
        fontSize: 18,
        text: 'Inventory',
        textOffsetX: 18,
        textOffsetY: 18
      });

    //   this.send('ADD_GUI_RENDERABLE', {
    //     key: 'inventory-panel-categories',
    //     width: this.categoriesWidth,
    //     height: this.panelHeight,
    //     xPosition: this.panelX,
    //     yPosition: this.panelY,
    //     fontSize: 18,
    //     fillStyle: 'purple'
    //   });

      this.send('ADD_GUI_RENDERABLE', {
        key: 'inventory-panel-list',
        width: this.listWidth,
        height: this.panelHeight,
        xPosition: this.panelX + this.categoriesWidth,
        yPosition: this.panelY,
        fontSize: 18,
      });

      this.addDetailsPanel();

      this.defineTable();
      this.send("GUI_UPDATE_VISIBLE", {relatedKeyPrefix: 'inventory-panel', isVisible: this.showInventory})
    }

    addDetailsPanel() {
        this.send('ADD_GUI_RENDERABLE', {
            key: 'inventory-panel-details',
            width: this.detailsWidth,
            height: this.panelHeight,
            xPosition: this.panelX + this.categoriesWidth + this.listWidth,
            yPosition: this.panelY,
            fontSize: 18,
        });
        this.send('ADD_GUI_RENDERABLE', {
            key: 'inventory-panel-details-image',
            width: 300,
            height: 300,
            xPosition: this.panelX + this.categoriesWidth + this.listWidth,
            yPosition: this.panelY,
        }); 
        this.send('ADD_GUI_RENDERABLE', {
            key: 'inventory-panel-details-label',
            width: this.detailsWidth,
            height: 30,
            xPosition: this.panelX + this.categoriesWidth + this.listWidth,
            yPosition: this.panelY + 300,
            fontSize: 18,
            textOffsetX: 8,
            textOffsetY: 4,
        });
        this.send('ADD_GUI_RENDERABLE', {
            key: 'inventory-panel-details-description',
            width: this.detailsWidth,
            height: 295,
            xPosition: this.panelX + this.categoriesWidth + this.listWidth,
            yPosition: this.panelY + 300 + 30,
            fontSize: 18,
            textOffsetX: 8,
            textOffsetY: 4,
        });
    }

    defineTable() {
        let table = {
            key: 'inventory-panel-list',
            rows: this.itemsPerPage + 1,
            rowHeight: 24,
            width: this.listWidth,
            height: 500,
            xPosition: this.panelX + this.categoriesWidth,
            yPosition: this.panelY,
            textOffsetX: 4,
            textOffsetY: 5,
            columns: [
                { label: 'Type', key: 'category', width: 150 },
                { label: 'Subtype', key: 'subcategory', width: 150 },
                { label: 'Item', key: 'label', width: 192 },
                { label: 'Quantity', key: 'quantity', width: 100 },
                { label: 'Unit', key: 'unit', width: 100 },
                { label: 'Volume', key: 'volume', width: 100 }
            ]
        }

        this.send('GUI_ADD_TABLE', table)
    }

    updateItemRow(databaseItem, inventoryItem, row) {
        if (!databaseItem) {
            this.send('GUI_UPDATE_TABLE', {
                key: `inventory-panel-list`,
                value: {}
            });
            return;
        }
        this.send('GUI_UPDATE_TABLE', {
            key: `inventory-panel-list`,
            value: {
                row: row,
                label: databaseItem.label,
                quantity: `${inventoryItem.count}` || 0,
                category: databaseItem.category,
                subcategory: databaseItem.subcategory,
                volume: databaseItem.volumePerUnit,
                unit: databaseItem.unit
            }
        });
    }

    handleRowClick(payload) {
        let row = parseInt(payload.key.split('inventory-panel-list-item-row-')[1].split('-')[0]);
        this.viewedInventoryItem = this.viewedInventoryItems[(this.itemsPerPage * this.currentPage) + row - 1]
        this.showItemDetails(this.itemDatabaseById[this.viewedInventoryItem?.id] || {});
    }

    showItemDetails(item) {
        this.send("GUI_UPDATE_PROPERTIES", {
            key: 'inventory-panel-details-image',
            value: {
                imagePath: item.imagePath || 'assets/items/default.png'
            }
        });

        this.send("GUI_UPDATE_TEXT", {
            key: 'inventory-panel-details-label',
            value: item.label,
        });
        this.send("GUI_UPDATE_TEXT", {
            key: 'inventory-panel-details-description',
            value: item.description,
        });
    }
  }
  