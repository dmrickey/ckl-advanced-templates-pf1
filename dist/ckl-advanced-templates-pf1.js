function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _classStaticPrivateMethodGet(receiver, classConstructor, method) {
  _classCheckPrivateStaticAccess(receiver, classConstructor);

  return method;
}

function _classCheckPrivateStaticAccess(receiver, classConstructor) {
  if (receiver !== classConstructor) {
    throw new TypeError("Private static access of wrong provenance");
  }
}

const MODULE_NAME = 'ckl-advanced-templates-pf1';
const CONSTS = {
  placement: {
    circle: {
      grid: 'grid',
      self: 'self',
      splash: 'splash'
    },
    cone: {
      selectTargetSquare: 'selectTargetSquare',
      self: 'self'
    },
    useSystem: 'useSystem'
  },
  flags: {
    placementType: 'placementType',
    circle: {
      areaType: 'areaType',
      movesWithToken: 'movesWithToken'
    },
    cone: {},
    exireAtTurnEnd: 'exireAtTurnEnd',
    ignoreRange: 'ignoreRange',
    hideHighlight: 'hideHighlight'
  },
  areaType: {
    burst: 'burst',
    emanation: 'emanation',
    spread: 'spread'
  }
};

const settings = {
  client: {
    debug: {
      key: 'debug',
      name: `${MODULE_NAME}.settings.debug.name`,
      hint: `${MODULE_NAME}.settings.debug.hint`,
      type: Boolean,
      config: true,
      default: false
    },
    target: {
      key: 'target',
      name: `${MODULE_NAME}.settings.target.name`,
      hint: `${MODULE_NAME}.settings.target.hint`,
      type: Boolean,
      config: true,
      default: true
    },
    reExpand: {
      key: 'reExpand',
      name: `${MODULE_NAME}.settings.reExpand.name`,
      hint: `${MODULE_NAME}.settings.reExpand.hint`,
      type: Boolean,
      config: true,
      default: false
    }
  },
  world: {
    cone15Alternate: {
      key: 'cone15Alternate',
      name: `${MODULE_NAME}.settings.cone15Alternate.name`,
      hint: `${MODULE_NAME}.settings.cone15Alternate.hint`,
      type: Boolean,
      config: false,
      default: false
    },
    coneRotation: {
      key: 'coneRotation',
      name: `${MODULE_NAME}.settings.coneRotation.name`,
      hint: `${MODULE_NAME}.settings.coneRotation.hint`,
      type: Boolean,
      config: false,
      default: false
    },
    useSystem: {
      key: 'useSystem',
      name: `${MODULE_NAME}.settings.useSystem.name`,
      hint: `${MODULE_NAME}.settings.useSystem.hint`,
      type: Boolean,
      config: false,
      default: false
    }
  }
};

const initSetting = scope => Object.keys(settings[scope]).map(key => settings[scope][key]).forEach(setting => game.settings.register(MODULE_NAME, setting.key, _objectSpread2(_objectSpread2({}, setting), {}, {
  scope
})));
/**
 * Setup module-specific settings
 */


function registerSettings() {
  initSetting('client');
  initSetting('world');
}
class Settings {
  static get cone15Alternate() {
    return _classStaticPrivateMethodGet(Settings, Settings, _getSetting).call(Settings, 'cone15Alternate');
  }

  static get coneRotation() {
    return _classStaticPrivateMethodGet(Settings, Settings, _getSetting).call(Settings, 'coneRotation');
  }

  static get debug() {
    return _classStaticPrivateMethodGet(Settings, Settings, _getSetting).call(Settings, 'debug');
  }

  static get reExpand() {
    return _classStaticPrivateMethodGet(Settings, Settings, _getSetting).call(Settings, 'reExpand');
  }

  static get target() {
    return _classStaticPrivateMethodGet(Settings, Settings, _getSetting).call(Settings, 'target');
  }

  static get useSystem() {
    return _classStaticPrivateMethodGet(Settings, Settings, _getSetting).call(Settings, 'useSystem');
  }

}

function _getSetting(key) {
  return game.settings.get(MODULE_NAME, key);
}

const self = me => typeof me === 'function' ? me() : me;

var ifDebug = (func => {
  if (game.settings.get(MODULE_NAME, 'debug')) {
    return self(func);
  }
});

const getToken = itemPf => {
  var _itemPf$parent, _itemPf$parent$getAct;

  return (itemPf === null || itemPf === void 0 ? void 0 : (_itemPf$parent = itemPf.parent) === null || _itemPf$parent === void 0 ? void 0 : (_itemPf$parent$getAct = _itemPf$parent.getActiveTokens()) === null || _itemPf$parent$getAct === void 0 ? void 0 : _itemPf$parent$getAct[0]) || undefined;
};

const localize = key => game.i18n.localize(`${MODULE_NAME}.${key}`);

const localizeF = (key, opts) => game.i18n.format(`${MODULE_NAME}.${key}`, opts);

/**
 * Common logic and switch statement for placing all templates
 *
 * @param {Function} wrapped The base `promptMeasureTemplate`
 *
 * @param {object} shared The shared context passed between different functions when executing an Attack
 *
 * @returns {object} The template creation data
 */

async function promptMeasureTemplate(wrapped, shared) {
  var _this$data$data$measu, _this$data$data$measu2;

  ifDebug(() => console.log('promptMeasureTemplate', this, shared)); // return success early if user isn't allowed to place templates

  if (!hasTemplatePermission()) {
    return {
      delete: () => {},
      place: () => {},
      result: true
    };
  }

  if (this.getFlag(MODULE_NAME, CONSTS.flags.placementType) === CONSTS.placement.useSystem) {
    return wrapped(shared);
  }

  const windows = Object.values(ui.windows).filter(x => !!x.minimize && !x._minimized);
  await Promise.all(windows.map(x => x.minimize()));
  const type = this.data.data.measureTemplate.type;
  const token = getToken(this) || {};
  const icon = this.data.img === 'systems/pf1/icons/misc/magic-swirl.png' ? undefined : this.data.img;
  const {
    minRange,
    maxRange
  } = this;
  const templateData = {
    _id: randomID(16),
    distance: _getSize(this, shared) || 5,
    t: type,
    flags: {
      [MODULE_NAME]: _objectSpread2(_objectSpread2({}, this.data.flags[MODULE_NAME]), {}, {
        icon,
        maxRange,
        minRange,
        tokenId: token === null || token === void 0 ? void 0 : token.id
      })
    },
    user: game.userId,
    fillColor: (_this$data$data$measu = this.data.data.measureTemplate) !== null && _this$data$data$measu !== void 0 && _this$data$data$measu.overrideColor ? this.data.data.measureTemplate.customColor : game.user.color,
    texture: (_this$data$data$measu2 = this.data.data.measureTemplate) !== null && _this$data$data$measu2 !== void 0 && _this$data$data$measu2.overrideTexture ? this.data.data.measureTemplate.customTexture : null
  };
  const template = await game[MODULE_NAME].AbilityTemplateAdvanced.fromData(templateData, this);

  if (!template) {
    return {
      result: false
    };
  }

  const result = await template.drawPreview();

  if (!result.result) {
    await Promise.all(windows.map(x => x.maximize()));
    return result;
  }

  if (Settings.reExpand) {
    await Promise.all(windows.map(x => x.maximize()));
  }

  shared.template = await result.place();
  return result;
}

const _getSize = (itemPf, shared) => typeof itemPf.data.data.measureTemplate.size === 'string' ? RollPF.safeTotal(itemPf.data.data.measureTemplate.size, shared.rollData) : game.pf1.utils.convertDistance(itemPf.data.data.measureTemplate.size)[0];

const hasTemplatePermission = () => game.permissions.TEMPLATE_CREATE.includes(game.user.role);

class CirclePlacement {
  // emanation or burst "centered on you" spreads from edge - not center
  constructor(itemPf) {
    _defineProperty(this, "_placementTypes", {
      [CONSTS.placement.circle.grid]: {
        key: CONSTS.placement.circle.grid,
        label: localize('templates.circle.placement.grid.label')
      },
      [CONSTS.placement.circle.self]: {
        key: CONSTS.placement.circle.self,
        label: localize('templates.circle.placement.self.label')
      },
      [CONSTS.placement.circle.splash]: {
        key: CONSTS.placement.circle.splash,
        label: localize('templates.circle.placement.splash.label')
      },
      [CONSTS.placement.useSystem]: {
        key: CONSTS.placement.useSystem,
        label: localize('templates.placement.useSystem.label')
      }
    });

    _defineProperty(this, "_getAreaType", () => {
      var _this$itemPf$data$dat, _this$itemPf$data$dat2;

      const areaType = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.circle.areaType);

      if (areaType) {
        return areaType;
      } // todo extract these to either a language or a game setting to handle localized terms


      const spellArea = (_this$itemPf$data$dat = (_this$itemPf$data$dat2 = this.itemPf.data.data.spellArea) === null || _this$itemPf$data$dat2 === void 0 ? void 0 : _this$itemPf$data$dat2.toLowerCase()) !== null && _this$itemPf$data$dat !== void 0 ? _this$itemPf$data$dat : '';

      if (spellArea.includes('emanat') || spellArea.includes(localize('templates.circle.placement.type.emanation').toLowerCase())) {
        return CONSTS.areaType.emanation;
      } else if (spellArea.includes('spread') || spellArea.includes(localize('templates.circle.placement.type.spread').toLowerCase())) {
        return CONSTS.areaType.spread;
      }

      return CONSTS.areaType.burst;
    });

    _defineProperty(this, "_getPlacementForLabel", label => {
      for (const placementTypeKey in this._placementTypes) {
        const placement = this._placementTypes[placementTypeKey];

        if (placement.label === label) {
          return placement.key;
        }
      }

      return this._placementTypes[CONSTS.placement.circle.grid].key;
    });

    _defineProperty(this, "_getPlacementType", () => {
      const placementType = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.placementType);
      return placementType || this._placementTypes[CONSTS.placement.circle.grid].key;
    });

    this.itemPf = itemPf;
  }

  async showPlacementMenu() {
    const areaType = this._getAreaType();

    const currentPlacementType = this._getPlacementType();

    const movesWithToken = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.circle.movesWithToken);
    const deleteAtTurnEnd = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.exireAtTurnEnd);
    const ignoreRange = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.ignoreRange);
    const ok = localize("ok");
    const dialogResult = await warpgate.menu({
      inputs: [{
        type: 'info',
        label: localizeF('templates.placement.selection.label', {
          itemType: this.itemPf.type
        })
      }, {
        type: 'radio',
        label: this._placementTypes[CONSTS.placement.circle.grid].label,
        options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.circle.grid].key]
      }, {
        type: 'radio',
        label: this._placementTypes[CONSTS.placement.circle.self].label,
        options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.circle.self].key]
      }, {
        type: 'radio',
        label: this._placementTypes[CONSTS.placement.circle.splash].label,
        options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.circle.splash].key]
      }, {
        type: 'radio',
        label: this._placementTypes[CONSTS.placement.useSystem].label,
        options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.useSystem].key]
      }, {
        type: 'info',
        label: '<hr style="width: 100%;" />'
      }, {
        type: 'info',
        label: localize('templates.circle.placement.type.label')
      }, {
        type: 'radio',
        label: localize('templates.circle.placement.type.burst'),
        options: ['areaType', areaType === 'burst']
      }, {
        type: 'radio',
        label: localize('templates.circle.placement.type.emanation'),
        options: ['areaType', areaType === 'emanation']
      }, {
        type: 'radio',
        label: localize('templates.circle.placement.type.spread'),
        options: ['areaType', areaType === 'spread']
      }, {
        type: 'checkbox',
        label: localize('templates.deleteAtTurnEnd'),
        options: !!deleteAtTurnEnd
      }, {
        type: 'checkbox',
        label: localize('templates.ignoreRange'),
        options: !!ignoreRange
      }, {
        type: 'checkbox',
        label: localize('templates.circle.placement.attachToToken'),
        options: !!movesWithToken
      }],
      buttons: [{
        label: ok,
        value: ok
      }, {
        label: localize('cancel')
      }]
    }, {
      title: localizeF('templates.modalTitle', {
        itemName: this.itemPf.data.name
      })
    });
    ifDebug(() => console.log('circle dialogResult', dialogResult));
    const {
      buttons: confirmed
    } = dialogResult;

    if (confirmed) {
      const [_, grid, self, splash, useDefault, __, ___, burstResult, emanationResult, spreadResult, deleteAtTurnEndResult, ignoreRangeResult, movesWithTokenResult] = dialogResult.inputs;

      const chosenPlacement = this._getPlacementForLabel(grid || self || splash || useDefault);

      const chosenAreaType = burstResult && CONSTS.areaType.burst || spreadResult && CONSTS.areaType.spread || emanationResult && CONSTS.areaType.emanation || '';
      const flags = {
        [MODULE_NAME]: {
          [CONSTS.flags.placementType]: chosenPlacement,
          [CONSTS.flags.circle.areaType]: chosenAreaType,
          [CONSTS.flags.circle.movesWithToken]: !!movesWithTokenResult,
          [CONSTS.flags.exireAtTurnEnd]: !!deleteAtTurnEndResult,
          [CONSTS.flags.ignoreRange]: !!ignoreRangeResult
        }
      };
      await this.itemPf.update({
        flags
      });
    }

    return !!confirmed;
  }

}

class ConePlacement {
  constructor(itemPf) {
    _defineProperty(this, "_placementTypes", {
      [CONSTS.placement.cone.self]: {
        key: CONSTS.placement.cone.self,
        label: localize('templates.cone.placement.self.label')
      },
      [CONSTS.placement.cone.selectTargetSquare]: {
        key: CONSTS.placement.cone.selectTargetSquare,
        label: localize('templates.cone.placement.selectTargetSquare.label')
      },
      [CONSTS.placement.useSystem]: {
        key: CONSTS.placement.useSystem,
        label: localize('templates.placement.useSystem.label')
      }
    });

    _defineProperty(this, "_getPlacementForLabel", label => {
      for (const placementTypeKey in this._placementTypes) {
        const placement = this._placementTypes[placementTypeKey];

        if (placement.label === label) {
          return placement.key;
        }
      }

      return this._placementTypes[CONSTS.placement.cone.self].key;
    });

    _defineProperty(this, "_getPlacementType", () => {
      const placementType = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.placementType);
      return placementType || this._placementTypes[CONSTS.placement.cone.self].key;
    });

    this.itemPf = itemPf;
  }

  /**
   * Shows the menu, saves the result, then returns the result
   *
   * @returns {bool} True if a placement type was selected, false if it was canceled.
   */
  async showPlacementMenu() {
    const currentPlacementType = this._getPlacementType();

    const deleteAtTurnEnd = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.exireAtTurnEnd);
    const ok = localize('ok');
    const dialogResult = await warpgate.menu({
      inputs: [{
        type: 'info',
        label: localizeF('templates.placement.selection.label', {
          itemType: this.itemPf.type
        })
      }, {
        type: 'radio',
        label: this._placementTypes[CONSTS.placement.cone.self].label,
        options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.cone.self].key]
      }, {
        type: 'radio',
        label: this._placementTypes[CONSTS.placement.cone.selectTargetSquare].label,
        options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.cone.selectTargetSquare].key]
      }, {
        type: 'radio',
        label: this._placementTypes[CONSTS.placement.useSystem].label,
        options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.useSystem].key]
      }, {
        type: 'checkbox',
        label: localize('templates.deleteAtTurnEnd'),
        options: !!deleteAtTurnEnd
      }],
      buttons: [{
        label: ok,
        value: ok
      }, {
        label: localize('cancel')
      }]
    }, {
      title: localizeF('templates.modalTitle', {
        itemName: this.itemPf.data.name
      })
    });
    ifDebug(() => console.log('cone dialogResult', dialogResult));
    const {
      buttons: confirmed
    } = dialogResult;

    if (confirmed) {
      const [_, self, selectTargetSquare, useSystem, deleteAtTurnEndResult] = dialogResult.inputs;

      const chosenPlacement = this._getPlacementForLabel(selectTargetSquare || self || useSystem);

      const flags = {
        [MODULE_NAME]: {
          [CONSTS.flags.placementType]: chosenPlacement,
          [CONSTS.flags.exireAtTurnEnd]: !!deleteAtTurnEndResult
        }
      };
      await this.itemPf.update({
        flags
      });
    }

    return !!confirmed;
  }

  _getSize() {
    const rollData = this.itemPf.actor._rollData;
    return typeof this.itemPf.data.data.measureTemplate.size === 'string' ? RollPF.safeTotal(this.itemPf.data.data.measureTemplate.size, rollData) : game.pf1.utils.convertDistance(this.itemPf.data.data.measureTemplate.size)[0];
  }

}

var template = `
<div class="form-group">
    <label>Advanced Template Options</label>
    <div class="form-fields">
        <button type="button" class="file-picker-alt">
        </button>
    </div>
</div>`;

/**
 * Adds advanced template options button to abilities with configured templates (that are supported)
 *
 * @param {*} sheet The actor sheet
 *
 * @param {*} jq jquery
 *
 * @param {*} _options unused
 */

async function injectTemplateSelector (sheet, jq, _options) {
  var _item$data$data$measu, _jq$0$querySelector;

  const item = sheet.item;
  const type = item === null || item === void 0 ? void 0 : (_item$data$data$measu = item.data.data.measureTemplate) === null || _item$data$data$measu === void 0 ? void 0 : _item$data$data$measu.type;

  if (!['circle', 'cone'].includes(type)) {
    return;
  }

  const templateGroupOptions = (_jq$0$querySelector = jq[0].querySelector('input[name="data.measureTemplate.overrideTexture"]')) === null || _jq$0$querySelector === void 0 ? void 0 : _jq$0$querySelector.parentElement.parentElement;

  if (templateGroupOptions) {
    const div = document.createElement('div');
    div.innerHTML = template;
    const button = div.querySelector('button');
    button.innerText = localize('templates.chooseOptions');
    button.addEventListener('click', async () => {
      switch (type) {
        case 'circle':
          {
            const placement = new CirclePlacement(item);
            await placement.showPlacementMenu();
          }
          break;

        case 'cone':
          {
            const placement = new ConePlacement(item);
            await placement.showPlacementMenu();
          }
          break;
      }
    });
    templateGroupOptions.after(div.firstElementChild);
  }
}

// then it would need to exist as soon as Foundry starts. So it can't be in its own file and exported. It needs to all be defined in
// memory at startup after PF1 has been initialized

const initMeasuredTemplate = () => {
  const MeasuredTemplatePF = CONFIG.MeasuredTemplate.objectClass;

  class MeasuredTemplatePFAdvanced extends MeasuredTemplatePF {
    get shouldOverrideTokenEmanation() {
      var _this$data$flags, _this$data$flags$MODU, _this$data$flags2, _this$data$flags2$MOD;

      return game.settings.get('pf1', 'measureStyle') && this.data.t === 'circle' && ((_this$data$flags = this.data.flags) === null || _this$data$flags === void 0 ? void 0 : (_this$data$flags$MODU = _this$data$flags[MODULE_NAME]) === null || _this$data$flags$MODU === void 0 ? void 0 : _this$data$flags$MODU[CONSTS.flags.placementType]) === CONSTS.placement.circle.self && ['burst', 'emanation'].includes((_this$data$flags2 = this.data.flags) === null || _this$data$flags2 === void 0 ? void 0 : (_this$data$flags2$MOD = _this$data$flags2[MODULE_NAME]) === null || _this$data$flags2$MOD === void 0 ? void 0 : _this$data$flags2$MOD[CONSTS.flags.circle.areaType]);
    }

    get hideHighlight() {
      var _this$data$flags3, _this$data$flags3$MOD;

      return !!((_this$data$flags3 = this.data.flags) !== null && _this$data$flags3 !== void 0 && (_this$data$flags3$MOD = _this$data$flags3[MODULE_NAME]) !== null && _this$data$flags3$MOD !== void 0 && _this$data$flags3$MOD[CONSTS.flags.hideHighlight]);
    }

    get tokenSizeSquares() {
      var _this$data$flags4, _this$data$flags4$MOD;

      const tokenId = (_this$data$flags4 = this.data.flags) === null || _this$data$flags4 === void 0 ? void 0 : (_this$data$flags4$MOD = _this$data$flags4[MODULE_NAME]) === null || _this$data$flags4$MOD === void 0 ? void 0 : _this$data$flags4$MOD.tokenId;
      const token = canvas.tokens.placeables.find(x => x.id === tokenId);
      const sizeSquares = (token === null || token === void 0 ? void 0 : token.data.width) || 1;
      return {
        token,
        sizeSquares
      };
    }

    get tokenGridCorners() {
      const {
        sizeSquares
      } = this.tokenSizeSquares;
      const {
        x,
        y
      } = this.data;
      const gridSize = canvas.grid.h;
      const bottom = y + gridSize * sizeSquares / 2;
      const left = x - gridSize * sizeSquares / 2;
      const top = y - gridSize * sizeSquares / 2;
      const right = x + gridSize * sizeSquares / 2;
      const rightSpots = [...new Array(sizeSquares + 1)].map((_, i) => ({
        x: right,
        y: top + gridSize * i
      }));
      const bottomSpots = [...new Array(sizeSquares + 1)].map((_, i) => ({
        x: right - gridSize * i,
        y: bottom
      }));
      bottomSpots.shift();
      bottomSpots.pop();
      const leftSpots = [...new Array(sizeSquares + 1)].map((_, i) => ({
        x: left,
        y: bottom - gridSize * i
      }));
      const topSpots = [...new Array(sizeSquares + 1)].map((_, i) => ({
        x: left + gridSize * i,
        y: top
      }));
      topSpots.shift();
      topSpots.pop();
      const allSpots = [...rightSpots, ...bottomSpots, ...leftSpots, ...topSpots];
      return allSpots;
    }

    _getEmanationShape() {
      const {
        sizeSquares
      } = this.tokenSizeSquares;
      const dimensions = canvas.dimensions;
      let {
        distance: radius
      } = this.data;
      radius *= dimensions.size / dimensions.distance;
      radius += dimensions.size * sizeSquares / 2;
      this.shape = new PIXI.RoundedRectangle(-radius, -radius, radius * 2, radius * 2, radius - dimensions.size * sizeSquares / 2);
    }
    /** @override */


    refresh() {
      if (!this.shouldOverrideTokenEmanation) {
        return super.refresh();
      }
      /* ALL OF THIS IS THE ORIGINAL METHOD EXCEPT FOR THE PARTS IN MY IF(SHOULDOVERRIDE) BLOCKS */


      const d = canvas.dimensions;
      this.position.set(this.data.x, this.data.y); // Extract and prepare data

      let {
        direction,
        distance,
        width
      } = this.data;
      distance *= d.size / d.distance;
      width *= d.size / d.distance;
      direction = Math.toRadians(direction);

      if (this.shouldOverrideTokenEmanation) {
        const {
          sizeSquares
        } = this.tokenSizeSquares;
        distance += d.size * sizeSquares / 2;
      } // Create ray and bounding rectangle


      this.ray = Ray.fromAngle(this.data.x, this.data.y, direction, distance); // Get the Template shape

      switch (this.data.t) {
        case 'circle':
          this.shape = this._getCircleShape(distance);
          break;

        case 'cone':
          this.shape = this._getConeShape(direction, this.data.angle, distance);
          break;

        case 'rect':
          this.shape = this._getRectShape(direction, distance);
          break;

        case 'ray':
          this.shape = this._getRayShape(direction, distance, width);
          break;
      }

      if (this.shouldOverrideTokenEmanation) {
        this._getEmanationShape();
      } // Draw the Template outline


      this.template.clear().lineStyle(this._borderThickness, this.borderColor, 0.75).beginFill(0x000000, 0.0); // Fill Color or Texture

      if (this.texture) {
        this.template.beginTextureFill({
          texture: this.texture
        });
      } else {
        this.template.beginFill(0x000000, 0.0);
      } // Draw the shape


      this.template.drawShape(this.shape); // Draw origin and destination points

      this.template.lineStyle(this._borderThickness, 0x000000).beginFill(0x000000, 0.5).drawCircle(0, 0, 6).drawCircle(this.ray.dx, this.ray.dy, 6); // Update the HUD

      this.hud.icon.visible = this.layer._active;
      this.hud.icon.border.visible = this._hover;

      this._refreshRulerText();

      return this;
    }
    /**
     * Draw the ControlIcon for the MeasuredTemplate
     *
     * @returns {ControlIcon}
     *
     * @private
     */

    /** @override */


    _drawControlIcon() {
      var _this$data$flags5, _this$data$flags5$MOD;

      const size = Math.max(Math.round(canvas.dimensions.size * 0.5 / 20) * 20, 40);
      const iconTexture = (_this$data$flags5 = this.data.flags) === null || _this$data$flags5 === void 0 ? void 0 : (_this$data$flags5$MOD = _this$data$flags5[MODULE_NAME]) === null || _this$data$flags5$MOD === void 0 ? void 0 : _this$data$flags5$MOD.icon;
      const icon = new ControlIcon({
        texture: iconTexture || CONFIG.controlIcons.template,
        size
      });
      icon.x -= size * 0.5;
      icon.y -= size * 0.5;
      return icon;
    }
    /** @override */


    getHighlightedSquares() {
      if (this.hideHighlight) {
        return [];
      }

      if (!this.shouldOverrideTokenEmanation) {
        return super.getHighlightedSquares();
      }

      if (!this.id || !this.shape) {
        return [];
      }

      const {
        token,
        sizeSquares
      } = this.tokenSizeSquares;

      if (!token || sizeSquares < 2) {
        return super.getHighlightedSquares();
      }

      const grid = canvas.grid;
      const d = canvas.dimensions; // Get number of rows and columns

      const nr = Math.ceil(this.data.distance * 1.5 / d.distance / (d.size / grid.h));
      const nc = Math.ceil(this.data.distance * 1.5 / d.distance / (d.size / grid.w)); // Get the center of the grid position occupied by the template

      const result = [];
      const origins = this.tokenGridCorners;
      origins.forEach(({
        x,
        y
      }) => {
        const [cx, cy] = grid.getCenter(x, y);
        const [col0, row0] = grid.grid.getGridPositionFromPixels(cx, cy);

        const measureDistance = function measureDistance(p0, p1) {
          const gs = canvas.dimensions.size;
          const ray = new Ray(p0, p1); // How many squares do we travel across to get there? If 2.3, we should count that as 3 instead of 2; hence, Math.ceil

          const nx = Math.ceil(Math.abs(ray.dx / gs));
          const ny = Math.ceil(Math.abs(ray.dy / gs)); // Get the number of straight and diagonal moves

          const nDiagonal = Math.min(nx, ny);
          const nStraight = Math.abs(ny - nx); // Diagonals in PF pretty much count as 1.5 times a straight

          const distance = Math.floor(nDiagonal * 1.5 + nStraight);
          const distanceOnGrid = distance * canvas.dimensions.distance;
          return distanceOnGrid;
        };

        for (let a = -nc; a < nc; a++) {
          for (let b = -nr; b < nr; b++) {
            // Position of cell's top-left corner, in pixels
            const [gx, gy] = canvas.grid.grid.getPixelsFromGridPosition(col0 + a, row0 + b); // Position of cell's center, in pixels

            const [cellCenterX, cellCenterY] = [gx + d.size * 0.5, gy + d.size * 0.5]; // Determine point of origin

            const origin = {
              x,
              y
            }; // Determine point we're measuring the distance to - always in the center of a grid square

            const destination = {
              x: cellCenterX,
              y: cellCenterY
            };
            const distance = measureDistance(destination, origin);

            if (distance <= this.data.distance) {
              result.push({
                x: gx,
                y: gy
              });
            }
          }
        }
      });
      const filtered = [...new Set(result.map(JSON.stringify))].map(JSON.parse);
      return filtered;
    }

  }

  CONFIG.MeasuredTemplate.objectClass = MeasuredTemplatePFAdvanced;

  class AbilityTemplateAdvanced extends MeasuredTemplatePFAdvanced {
    static async fromData(templateData, itemPf) {
      const {
        t: type,
        distance
      } = templateData;

      if (!type || !distance || !canvas.scene || !['cone', 'circle'].includes(type)) {
        return null;
      } // Return the template constructed from the item data


      const cls = CONFIG.MeasuredTemplate.documentClass;
      const template = new cls(templateData, {
        parent: canvas.scene
      });
      const placementType = itemPf.getFlag(MODULE_NAME, CONSTS.flags.placementType);
      let abilityCls;

      switch (type) {
        case 'circle':
          switch (placementType) {
            case CONSTS.placement.circle.self:
              abilityCls = AbilityTemplateCircleSelf;
              break;

            case CONSTS.placement.circle.splash:
              abilityCls = AbilityTemplateCircleSplash;
              break;

            case CONSTS.placement.circle.grid:
            default:
              abilityCls = AbilityTemplateCircle;
              break;
          }

          break;

        case 'cone':
          switch (placementType) {
            case CONSTS.placement.cone.selectTargetSquare:
              abilityCls = AbilityTemplateConeTarget;
              break;

            case CONSTS.placement.cone.self:
            default:
              abilityCls = AbilityTemplateConeSelf;
              break;
          }

          break;
      }

      const thisTemplate = new abilityCls(template);
      await thisTemplate.initializePlacement(itemPf);
      return thisTemplate;
    }

    async drawPreview() {
      var _this = this;

      const initialLayer = canvas.activeLayer;
      await this.draw();
      this.active = true;
      this.layer.activate();
      this.layer.preview.addChild(this);

      if (this.controlIcon) {
        this.controlIcon.removeAllListeners();
      }

      this.hitArea = new PIXI.Polygon([]);
      const finalized = await this.commitPreview();
      this.active = false;
      const hl = canvas.grid.getHighlightLayer(`Template.${this.id}`);
      hl.clear();
      this.destroy();
      initialLayer.activate();
      return finalized ? {
        result: true,
        place: async function () {
          _this.data.update(_this.data);

          const doc = (await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [_this.data.toObject()]))[0];
          _this.document = doc;
          return doc;
        },
        delete: () => {
          return this.document.delete();
        }
      } : {
        result: false
      };
    }

    refresh() {
      if (!this.template || !canvas.scene) {
        return;
      }

      super.refresh();

      if (this.active) {
        this.highlightGrid();
      }

      return this;
    }
    /**
     * returns true if committed, false if cancelled
     */


    async commitPreview() {}
    /**
     * sets up data specififc to template placement (initial position, rotation, set up points array for cones around token, extra width info for emanations, etc)
     *
     * @param {ItemPF} itemPf used to grab the token data for initial placement
     */


    async initializePlacement(itemPf) {}

  }

  class AbilityTemplateCircleSelf extends AbilityTemplateAdvanced {
    /** @override */
    async commitPreview() {
      ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));
      return true;
    }
    /** @override */


    async initializePlacement(itemPf) {
      ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));
      const token = getToken(itemPf) || {
        center: {
          x: 0,
          y: 0
        }
      };
      const {
        x,
        y
      } = token.center;
      this.data.x = x;
      this.data.y = y;

      if (Settings.target && !isNaN(x) && !isNaN(x)) {
        const targets = this.getTokensWithin();
        const ids = targets.map(t => t.id);
        game.user.updateTokenTargets(ids);
      }
    }

  }

  class AbilityTemplateCircle extends AbilityTemplateAdvanced {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "_maxRange", void 0);

      _defineProperty(this, "_hasMaxRange", void 0);

      _defineProperty(this, "_minRange", void 0);

      _defineProperty(this, "_hasMinRange", void 0);

      _defineProperty(this, "_tokenSquare", void 0);
    }

    _calculateTokenSquare(token) {
      const heightSquares = Math.max(Math.round(token.data.height), 1);
      const widthSquares = Math.max(Math.round(token.data.width), 1);
      const gridSize = canvas.grid.h;
      const {
        x,
        y,
        h,
        w
      } = token;
      const bottom = y + h;
      const left = x;
      const top = y;
      const right = x + w;
      const rightSpots = [...new Array(heightSquares)].map((_, i) => ({
        x: right,
        y: top + gridSize * i
      }));
      const leftSpots = [...new Array(heightSquares)].map((_, i) => ({
        x: left,
        y: bottom - gridSize * i
      }));
      const topSpots = [...new Array(widthSquares)].map((_, i) => ({
        x: left + gridSize * i,
        y: top
      }));
      const bottomSpots = [...new Array(widthSquares)].map((_, i) => ({
        x: right - gridSize * i,
        y: bottom
      }));
      const allSpots = [...rightSpots, ...bottomSpots, ...leftSpots, ...topSpots];
      return {
        x: left,
        y: top,
        center: token.center,
        top,
        bottom,
        left,
        right,
        h,
        w,
        heightSquares,
        widthSquares,
        allSpots
      };
    }
    /** @override */


    async commitPreview() {
      var _this$controlIcon,
          _this2 = this;

      ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

      if (Settings.target) {
        game.user.updateTokenTargets();
      }

      const existingIcon = (_this$controlIcon = this.controlIcon) === null || _this$controlIcon === void 0 ? void 0 : _this$controlIcon.iconSrc;
      let isInRange = true;

      const updateTemplateLocation = async function updateTemplateLocation(crosshairs) {
        while (crosshairs.inFlight) {
          await warpgate.wait(20);
          _this2.data.flags[MODULE_NAME].icon = existingIcon;
          const {
            x,
            y
          } = crosshairs.center;

          if (_this2.data.x === x && _this2.data.y === y) {
            continue;
          }

          if ((_this2._hasMaxRange || _this2._hasMinRange) && !_this2.data.flags[MODULE_NAME].ignoreRange) {
            var _this2$controlIcon;

            const rays = _this2._tokenSquare.allSpots.map(spot => ({
              ray: new Ray(spot, crosshairs)
            }));

            const distances = rays.map(ray => canvas.grid.measureDistances([ray], {
              gridSpaces: true
            })[0]);
            const range = Math.min(...distances);
            let icon;

            if (_this2._hasMinRange && range < _this2._minRange || _this2._hasMaxRange && range > _this2._maxRange) {
              icon = 'icons/svg/hazard.svg';
              _this2.data.flags[MODULE_NAME][CONSTS.flags.hideHighlight] = true;
              isInRange = false;
            } else {
              icon = existingIcon;
              _this2.data.flags[MODULE_NAME][CONSTS.flags.hideHighlight] = false;
              isInRange = true;
            }

            const unit = game.settings.get('pf1', 'units') === 'imperial' ? game.i18n.localize('PF1.DistFtShort') : game.i18n.localize('PF1.DistMShort');
            crosshairs.label = `${range} ${unit}`;
            crosshairs.label = localizeF('range', {
              range,
              unit
            });

            if (icon && icon !== ((_this2$controlIcon = _this2.controlIcon) === null || _this2$controlIcon === void 0 ? void 0 : _this2$controlIcon.iconSrc)) {
              _this2.data.flags[MODULE_NAME].icon = icon;

              if (_this2.controlIcon) {
                _this2.controlIcon.destroy();
              }

              _this2.controlIcon = _this2.addChild(_this2._drawControlIcon());
            }
          }

          _this2.data.x = x;
          _this2.data.y = y;

          _this2.refresh();

          if (Settings.target) {
            const targets = _this2.getTokensWithin();

            const ids = targets.map(t => t.id);
            game.user.updateTokenTargets(ids);
          }
        }
      };

      const targetConfig = {
        drawIcon: false,
        drawOutline: false,
        interval: 1
      };
      const crosshairs = await warpgate.crosshairs.show(targetConfig, {
        show: updateTemplateLocation
      });

      if (crosshairs.cancelled || !isInRange) {
        if (Settings.target) {
          game.user.updateTokenTargets();
        }

        return false;
      }

      return true;
    }
    /** @override */


    async initializePlacement(itemPf) {
      ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));
      const token = getToken(itemPf);

      if (token) {
        var _this$data$flags6, _this$data$flags6$MOD, _this$data$flags7, _this$data$flags7$MOD;

        this._maxRange = (_this$data$flags6 = this.data.flags) === null || _this$data$flags6 === void 0 ? void 0 : (_this$data$flags6$MOD = _this$data$flags6[MODULE_NAME]) === null || _this$data$flags6$MOD === void 0 ? void 0 : _this$data$flags6$MOD.maxRange;
        this._hasMaxRange = !!this._maxRange && !isNaN(this._maxRange);
        this._minRange = (_this$data$flags7 = this.data.flags) === null || _this$data$flags7 === void 0 ? void 0 : (_this$data$flags7$MOD = _this$data$flags7[MODULE_NAME]) === null || _this$data$flags7$MOD === void 0 ? void 0 : _this$data$flags7$MOD.minRange;
        this._hasMinRange = !!this._minRange && !isNaN(this._minRange);
        this._tokenSquare = this._calculateTokenSquare(token);
      }

      const mouse = canvas.app.renderer.plugins.interaction.mouse;
      const position = mouse.getLocalPosition(canvas.app.stage);
      const {
        x,
        y
      } = position;
      this.data.x = x;
      this.data.y = y;
    }

  }

  class AbilityTemplateCircleSplash extends AbilityTemplateCircle {
    /** @override */
    async commitPreview() {
      var _this$controlIcon2,
          _this3 = this;

      ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

      if (Settings.target) {
        game.user.updateTokenTargets();
      }

      const existingIcon = (_this$controlIcon2 = this.controlIcon) === null || _this$controlIcon2 === void 0 ? void 0 : _this$controlIcon2.iconSrc;
      let isInRange = true;

      const updateTemplateLocation = async function updateTemplateLocation(crosshairs) {
        while (crosshairs.inFlight) {
          await warpgate.wait(20);
          _this3.data.flags[MODULE_NAME].icon = existingIcon;
          const {
            x,
            y
          } = crosshairs.center;

          if (_this3.data.x === x && _this3.data.y === y) {
            continue;
          }

          let mouse = canvas.app.renderer.plugins.interaction.mouse;
          let mouseCoords = mouse.getLocalPosition(canvas.app.stage);

          const boundsContains = (bounds, point) => bounds.left <= point.x && point.x <= bounds.right && bounds.top <= point.y && point.y <= bounds.bottom;

          const found = !!canvas.tokens.placeables.map(x => x.bounds).find(b => boundsContains(b, mouseCoords));
          crosshairs.interval = found ? -1 : 1;

          if ((_this3._hasMaxRange || _this3._hasMinRange) && !_this3.data.flags[MODULE_NAME].ignoreRange) {
            var _this3$controlIcon;

            const rays = _this3._tokenSquare.allSpots.map(spot => ({
              ray: new Ray(spot, crosshairs)
            }));

            const distances = rays.map(ray => canvas.grid.measureDistances([ray], {
              gridSpaces: true
            })[0]);
            const range = Math.min(...distances);
            let icon;

            if (_this3._hasMinRange && range < _this3._minRange || _this3._hasMaxRange && range > _this3._maxRange) {
              icon = 'icons/svg/hazard.svg';
              _this3.data.flags[MODULE_NAME][CONSTS.flags.hideHighlight] = true;
              isInRange = false;
            } else {
              icon = existingIcon;
              _this3.data.flags[MODULE_NAME][CONSTS.flags.hideHighlight] = false;
              isInRange = true;
            }

            const unit = game.settings.get('pf1', 'units') === 'imperial' ? game.i18n.localize('PF1.DistFtShort') : game.i18n.localize('PF1.DistMShort');
            crosshairs.label = `${range} ${unit}`;
            crosshairs.label = localizeF('range', {
              range,
              unit
            });

            if (icon && icon !== ((_this3$controlIcon = _this3.controlIcon) === null || _this3$controlIcon === void 0 ? void 0 : _this3$controlIcon.iconSrc)) {
              _this3.data.flags[MODULE_NAME].icon = icon;

              if (_this3.controlIcon) {
                _this3.controlIcon.destroy();
              }

              _this3.controlIcon = _this3.addChild(_this3._drawControlIcon());
            }
          }

          _this3.data.x = x;
          _this3.data.y = y;

          _this3.refresh();

          if (Settings.target) {
            const targets = _this3.getTokensWithin();

            const ids = targets.map(t => t.id);
            game.user.updateTokenTargets(ids);
          }
        }
      };

      const targetConfig = {
        drawIcon: false,
        drawOutline: false,
        interval: 1
      };
      const crosshairs = await warpgate.crosshairs.show(targetConfig, {
        show: updateTemplateLocation
      });

      if (crosshairs.cancelled || !isInRange) {
        if (Settings.target) {
          game.user.updateTokenTargets();
        }

        return false;
      }

      return true;
    }

  }

  class AbilityTemplateConeBase extends AbilityTemplateAdvanced {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "_tokenSquare", void 0);

      _defineProperty(this, "_is15", void 0);
    }

    /** @override */
    async commitPreview() {
      var _this4 = this;

      ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

      if (Settings.target) {
        game.user.updateTokenTargets();
      }

      const targetConfig = {
        drawIcon: false,
        drawOutline: false
      };
      let currentSpotIndex = 0;

      const updateTemplateRotation = async function updateTemplateRotation(crosshairs) {
        while (crosshairs.inFlight) {
          await warpgate.wait(100);
          const totalSpots = _this4._tokenSquare.allSpots.length;

          const radToNormalizedAngle = rad => {
            let angle = rad * 180 / Math.PI % 360; // offset the angle for even-sided tokens, because it's centered in the grid it's just wonky without the offset

            const offset = _this4._is15 ? 0 : 1;

            if (_this4._tokenSquare.heightSquares % 2 === offset && _this4._tokenSquare.widthSquares % 2 === offset) {
              angle -= 360 / totalSpots / 2;
            }

            const normalizedAngle = Math.round(angle / (360 / totalSpots)) * (360 / totalSpots);
            return normalizedAngle < 0 ? normalizedAngle + 360 : normalizedAngle;
          };

          const ray = new Ray(_this4._tokenSquare.center, crosshairs);
          const angle = radToNormalizedAngle(ray.angle);
          const spotIndex = Math.ceil(angle / 360 * totalSpots);

          if (spotIndex === currentSpotIndex) {
            continue;
          }

          currentSpotIndex = spotIndex;
          const spot = _this4._tokenSquare.allSpots[currentSpotIndex];
          const {
            direction,
            x,
            y
          } = spot;
          _this4.data.direction = direction;
          _this4.data.x = x;
          _this4.data.y = y;

          _this4.refresh();

          if (Settings.target) {
            const targets = _this4.getTokensWithin();

            const ids = targets.map(t => t.id);
            game.user.updateTokenTargets(ids);
          }
        }
      };

      const rotateCrosshairs = await warpgate.crosshairs.show(targetConfig, {
        show: updateTemplateRotation
      });

      if (rotateCrosshairs.cancelled) {
        if (Settings.target) {
          game.user.updateTokenTargets();
        }

        return false;
      }

      return true;
    }
    /** @override */


    async initializeConeData(token) {
      ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));
      const {
        distance
      } = this.data;
      this._is15 = distance === 15;

      if (typeof token === 'undefined' || !token) {
        const sourceConfig = {
          drawIcon: true,
          drawOutline: false,
          interval: -1,
          label: 'Cone Start' // grab icon from item

        };
        const source = await warpgate.crosshairs.show(sourceConfig);

        if (source.cancelled) {
          return;
        }

        this._tokenSquare = this._sourceSquare({
          x: source.x,
          y: source.y
        }, 1, 1);
      } else {
        const width = Math.max(Math.round(token.data.width), 1);
        const height = Math.max(Math.round(token.data.height), 1);
        this._tokenSquare = this._sourceSquare(token.center, width, height);
      }

      const {
        x,
        y
      } = this._tokenSquare.allSpots[0];
      this.data.x = x;
      this.data.y = y;
      this.data.angle = 90;
    }

    _sourceSquare(center, widthSquares, heightSquares) {
      const gridSize = canvas.grid.h;
      const h = gridSize * heightSquares;
      const w = gridSize * widthSquares;
      const bottom = center.y + h / 2;
      const left = center.x - w / 2;
      const top = center.y - h / 2;
      const right = center.x + w / 2; // todo read from a gm setting to see if the gm wants to allow the alternate 15' option and figure how to do both simultaneously
      // 15 foot cones originate in the middle of the grid, so for every square-edge there's one origin point instead of two

      const gridOffset = this._is15 ? gridSize / 2 : 0;
      const qtyOffset = this._is15 ? 0 : 1;
      const rightSpots = [...new Array(heightSquares + qtyOffset)].map((_, i) => ({
        direction: 0,
        x: right,
        y: top + gridSize * i + gridOffset
      }));
      const bottomSpots = [...new Array(widthSquares + qtyOffset)].map((_, i) => ({
        direction: 90,
        x: right - gridSize * i - gridOffset,
        y: bottom
      }));
      const leftSpots = [...new Array(heightSquares + qtyOffset)].map((_, i) => ({
        direction: 180,
        x: left,
        y: bottom - gridSize * i - gridOffset
      }));
      const topSpots = [...new Array(widthSquares + qtyOffset)].map((_, i) => ({
        direction: 270,
        x: left + gridSize * i + gridOffset,
        y: top
      }));
      const allSpots = [...rightSpots.slice(Math.floor(rightSpots.length / 2)), {
        direction: 45,
        x: right,
        y: bottom
      }, ...bottomSpots, {
        direction: 135,
        x: left,
        y: bottom
      }, ...leftSpots, {
        direction: 225,
        x: left,
        y: top
      }, ...topSpots, {
        direction: 315,
        x: right,
        y: top
      }, ...rightSpots.slice(0, Math.floor(rightSpots.length / 2))];
      return {
        x: left,
        y: top,
        center,
        top,
        bottom,
        left,
        right,
        h,
        w,
        heightSquares,
        widthSquares,
        allSpots
      };
    }

  }

  class AbilityTemplateConeSelf extends AbilityTemplateConeBase {
    /** @override */
    async initializePlacement(itemPf) {
      ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));
      const token = getToken(itemPf);
      await super.initializeConeData(token);
    }

  }

  class AbilityTemplateConeTarget extends AbilityTemplateConeBase {
    /** @override */
    async initializePlacement(itemPf) {
      ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));
      await super.initializeConeData();
    }

  }

  game[MODULE_NAME] = {
    AbilityTemplateAdvanced,
    MeasuredTemplatePFAdvanced
  };
};

class DurationTracker {
  static endOfTurnCallback(callback) {
    DurationTracker.endOfTurnExpirations.push(callback);
  }

  static async expireAll() {
    for (const e of DurationTracker.endOfTurnExpirations) {
      try {
        await e();
      } catch (_unused) {// don't really care
      }
    }

    DurationTracker.endOfTurnExpirations = [];
    await DurationTracker.removeEndOfTurnTemplates();
  }

  static async removeEndOfTurnTemplates() {
    const templateIds = canvas.templates.placeables.filter(t => {
      var _t$data$flags, _t$data$flags$MODULE_;

      return !!((_t$data$flags = t.data.flags) !== null && _t$data$flags !== void 0 && (_t$data$flags$MODULE_ = _t$data$flags[MODULE_NAME]) !== null && _t$data$flags$MODULE_ !== void 0 && _t$data$flags$MODULE_[CONSTS.flags.exireAtTurnEnd]);
    }).map(t => t.id);

    if (templateIds.length) {
      await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateIds);
    }
  }

  static init() {
    Hooks.on('deleteCombat', async function (_combat) {
      warpgate.plugin.queueUpdate(() => DurationTracker.expireAll());
    });
    Hooks.on('updateCombat', async function (combat, changed) {
      if (!('turn' in changed || 'round' in changed) && changed.round !== 1 || game.combats.get(combat.id).data.combatants.size === 0) {
        return;
      }

      warpgate.plugin.queueUpdate(() => DurationTracker.expireAll());
    });
    Hooks.on('updateWorldTime', async function (_worldTime, delta) {
      if (delta) {
        warpgate.plugin.queueUpdate(() => DurationTracker.expireAll());
      }
    });
  }

}

_defineProperty(DurationTracker, "endOfTurn", 'endOfTurn');

_defineProperty(DurationTracker, "endOfTurnExpirations", []);

const deleteTemplatesForToken = async token => {
  const templateIds = _getTemplateIdsForToken(token);

  if (templateIds.length) {
    ifDebug(() => console.log(`Deleting templates for token (${token.id})`, templateIds));
    await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateIds);
  }
};

const moveTemplatesToToken = async token => {
  const templateIds = _getTemplateIdsForToken(token);

  if (templateIds.length) {
    ifDebug(() => console.log(`Moving templates for token (${token.id})`, templateIds));
    const updates = templateIds.map(id => _objectSpread2({
      _id: id
    }, token.object.center));
    await canvas.scene.updateEmbeddedDocuments("MeasuredTemplate", updates);
  }
};

const _getTemplateIdsForToken = token => canvas.templates.placeables.filter(t => {
  var _t$data$flags, _t$data$flags$MODULE_;

  return !!((_t$data$flags = t.data.flags) !== null && _t$data$flags !== void 0 && (_t$data$flags$MODULE_ = _t$data$flags[MODULE_NAME]) !== null && _t$data$flags$MODULE_ !== void 0 && _t$data$flags$MODULE_[CONSTS.flags.circle.movesWithToken]);
}).filter(t => {
  var _t$data$flags2, _t$data$flags2$MODULE;

  return ((_t$data$flags2 = t.data.flags) === null || _t$data$flags2 === void 0 ? void 0 : (_t$data$flags2$MODULE = _t$data$flags2[MODULE_NAME]) === null || _t$data$flags2$MODULE === void 0 ? void 0 : _t$data$flags2$MODULE.tokenId) === token.id;
}).map(t => t.id);

// Initialize module

Hooks.once('init', async () => {
  console.log('ckl-advanced-templates-pf1 | Initializing ckl-advanced-templates-pf1');
  registerSettings();
}); // When ready

Hooks.once('ready', async () => {
  Hooks.on('renderItemSheetPF', injectTemplateSelector);
  DurationTracker.init(); // new BasicApplication().render(true, { focus: true })
}); // Add any additional hooks if necessary

Hooks.on('pf1.postInit', () => {
  initMeasuredTemplate();
  libWrapper.register(MODULE_NAME, 'game.pf1.ItemAttack.promptMeasureTemplate', promptMeasureTemplate, 'MIXED');
  Hooks.on('canvasReady', () => {
    canvas.templates.placeables.forEach(template => {
      template.highlightGrid();
    });
  });
});
Hooks.on('updateToken', async (token, update, _options, _userId) => {
  // eslint-disable-next-line
  if (!(update !== null && update !== void 0 && update.hasOwnProperty('x')) && !(update !== null && update !== void 0 && update.hasOwnProperty('y'))) {
    return;
  }

  const gm = game.pf1.utils.getFirstActiveGM();
  const isFirstGM = game.user === gm;

  if (isFirstGM || !gm && game.user.id === _userId) {
    await moveTemplatesToToken(token);
  }
});
Hooks.on('deleteToken', async (token, _options, _userId) => {
  const gm = game.pf1.utils.getFirstActiveGM();
  const isFirstGM = game.user === gm;

  if (isFirstGM || !gm && game.user.id === _userId) {
    await deleteTemplatesForToken(token);
  }
});
//# sourceMappingURL=ckl-advanced-templates-pf1.js.map
