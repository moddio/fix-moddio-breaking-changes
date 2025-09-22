var param = {

	// simplify data in vm to improve performance
	_createFakeEntity: function (id) {
		if (typeof id !== 'string' && id) {
			if (typeof id.id === 'function') {
				id = id.id();
			} else {
				return;
			}
		}

		return {
			_id: id,
			id: function () {
				return this._id;
			},
		};
	},

	// simplify data in vm to improve performance
	_setFromParam: function (o) {
		if (typeof o !== 'object' || o === null) {
			return;
		}

		if (o._from === 'param') {
			return;
		}

		Object.defineProperty(o, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});

		if (Array.isArray(o)) {
			o.forEach((p) => {
				this._setFromParam(p);
			});
		} else {
			Object.entries(o).forEach(([k, p]) => {
				if (!k.startsWith('_')) {
					this._setFromParam(p);
				}
			});
		}
	},

	/**
	 * Round a number to specified precision
	 * @param {number} num - Number to round
	 * @param {number} precision - Number of decimal places
	 * @returns {number} Rounded number
	 */
	roundOff: function (num, precision) {
		return Number(`${Math.round(`${num}e${precision}`)}e-${precision}`);
	},

	/**
	 * Returns the entire map region
	 * @returns {Region} The entire map region
	 */
	entireMapRegion: function () {
		const region = {
			x: 0,
			y: 0,
			width: taro.map.data.width,
			height: taro.map.data.height,
		};
		const obj = { _stats: { default: region } };
		Object.defineProperty(obj, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});

		return obj;
	},

	/**
	 * Get a random entity type from a type group based on probability weights
	 * @param {string} groupName - Name of the type group variable to select from
	 * @returns {string|undefined} Selected entity type name, or undefined if group not found
	 */
	randomTypeFromTypeGroup: function (groupName) {
		var group = taro.script.moddScriptParam.getVariableObject(groupName);
		let groupValue = group.value;
		if (groupValue) {
			var entityTypes = _.map(groupValue, (entityTypeInfo, entityType) => {
				return {
					entityType,
					probability: entityTypeInfo.probability,
				};
			});

			var totalProbability = entityTypes.reduce((partialSum, entity) => {
				return partialSum + entity.probability;
			}, 0);

			var randomNumber = _.random(0, totalProbability);
			var currentHead = 0;

			for (var i = 0; i < entityTypes.length; i++) {
				var entityType = entityTypes[i];

				if (_.inRange(randomNumber, currentHead, currentHead + entityType.probability)) {
					returnValue = entityType.entityType;
				}

				currentHead += entityType.probability;
			}

			// select last unit type if nothings selected
			if (!returnValue) {
				returnValue = entityTypes[entityTypes.length - 1].entityType;
			}
			return returnValue;
		}
	},

	/**
	 * Get a random position within a region
	 * @param {Object} region - The region to get position from
	 * @returns {Object} Position with x,y coordinates
	 */
	randomPositionInRegion: function (region) {
		if (region && typeof region.id === 'function') region = taro.$(region.id());
		if (region && region._stats && region._stats.default) {
			region = region._stats.default;
		}

		const toFixed = (n) => parseFloat(n.toFixed(2));
		var randomX = Math.random() * (region.x + region.width - region.x) + region.x;
		var randomY = Math.random() * (region.y + region.height - region.y) + region.y;
		var position = { x: 0, y: 0 };

		if (!isNaN(randomX) || !isNaN(randomY)) {
			position.x = toFixed(randomX);
			position.y = toFixed(randomY);
		}
		Object.defineProperty(position, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});

		return position;
	},

	/**
	 * Get a random 3D position within a region
	 * @param {Object} region - The region to get position from
	 * @returns {Object} Position with x,y,z coordinates
	 */
	randomPositionInRegion3d: function (region) {
		if (region && typeof region.id === 'function') region = taro.$(region.id());
		if (region && region._stats && region._stats.default) {
			region = region._stats.default;
		}

		const toFixed = (n) => parseFloat(n.toFixed(2));
		var randomX = Math.random() * (region.x + region.width - region.x) + region.x;
		var randomY = Math.random() * (region.y + region.height - region.y) + region.y;
		var randomZ = Math.random() * (region.z + region.depth - region.z) + region.z;
		var vector3 = { x: 0, y: 0, z: 0 };

		if (!isNaN(randomX) || !isNaN(randomY)) {
			vector3.x = toFixed(randomX);
			vector3.y = toFixed(randomY);
			vector3.z = toFixed(randomZ);
		}
		Object.defineProperty(vector3, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});

		return vector3;
	},

	/**
	 * Check if a position is inside a wall
	 * @param {Object} position - Position to check
	 * @returns {boolean} True if position is in wall
	 */
	isPositionInWall: function (position) {
		if (!position) {
			// throw new Error('position is a required parameter');
		}

		var wallLayer = null;

		for (var i = 0; i < taro.map.data.layers.length; i++) {
			var layer = taro.map.data.layers[i];
			if (layer.name === 'walls') {
				wallLayer = layer;
				break;
			}
		}

		if (!wallLayer || !position.x || isNaN(position.x) || !position.y || isNaN(position.y)) {
			return false;
		}

		var worldWidth = taro.map.data.width;

		var tile = {
			x: Math.floor(position.x),
			y: Math.floor(position.y),
		};

		var tileIndex = tile.x + tile.y * worldWidth;

		if (taro.is3DServerPhysics() && position.z) {
			const tileZ = Math.floor(position.z) + 1;
			const tileLayers = taro.map.data.layers.filter((layer) => layer.type === 'tilelayer');

			if (tileZ >= 0 && tileZ < tileLayers.length) {
				const layer = tileLayers[tileZ];
				return !!(layer && layer.data && layer.data[tileIndex]);
			}

			return false;
		}

		return !!(wallLayer && wallLayer.data[tileIndex]);
	},

	/**
	 * Get width of a unit type
	 * @param {string} entityTypeId - Unit type ID to check
	 * @returns {width: number, height: number, depth: number} size of the unit type
	 */
	entityTypePhysicsSize: function (entityTypeId) {
		if (!entityTypeId) {
			// throw new Error('entityTypeId is a required parameter');
		}

		let { entityCategory, entityTypeData } = taro.script.moddScriptParam._getEntityCategoryAndAsset(entityTypeId);
		if (entityTypeData) {
			let bodyData = entityCategory === 'item' ? entityTypeData.bodies?.dropped : entityTypeData.bodies?.default;
			let { width, height, depth } = bodyData;
			let obj = {
				width,
				height,
				depth,
			};
			Object.defineProperty(obj, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return obj;
		}
		return null;
	},

	/**
	 * Get entity opacity
	 * @param {Object} entity - Entity to check opacity for
	 * @returns {number} Entity opacity value
	 */
	opacity: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (!entity) {
			// throw new Error('entity is a required parameter');
		}
		if (taro.script.moddScriptParam._entity.script.action.entityCategories.indexOf(entity._category) > -1) {
			return entity.opacity();
		}
		return null;
	},

	/**
	 * Get entity physics size
	 * @param {Object} entity - Entity to get physics size for
	 * @returns {Object} Entity physics size value
	 */
	physicsSize: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (!entity) {
			// throw new Error('entity is a required parameter');
		}
		if (taro.script.moddScriptParam._entity.script.action.entityCategories.indexOf(entity._category) > -1) {
			let obj = {
				width: entity.width() * (isNaN(entity._stats.scaleBody) ? 1 : entity._stats.scaleBody),
				height: entity.height() * (isNaN(entity._stats.scaleBody) ? 1 : entity._stats.scaleBody),
				depth: (entity._bounds?.z || 0) * (isNaN(entity._stats.scaleBody) ? 1 : entity._stats.scaleBody),
			};

			Object.defineProperty(obj, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return obj;
		}
		return null;
	},

	/**
	 * Get map height
	 * @returns {number} Map height
	 */
	mapHeight: function () {
		if (!taro.map || !taro.map.data) {
			// throw new Error('Map data is not available');
		}
		return taro.map.data.height;
	},

	/**
	 * Get map width
	 * @returns {number} Map width
	 */
	mapWidth: function () {
		if (!taro.map || !taro.map.data) {
			// throw new Error('Map data is not available');
		}
		return taro.map.data.width;
	},

	/**
	 * Get map data as JSON string
	 * @returns {string} Map data as JSON
	 */
	mapJson: function () {
		if (!taro.map || !taro.map.data) {
			// throw new Error('Map data is not available');
		}
		return JSON.stringify(taro.map.data);
	},

	/**
	 * Get tile ID at specified coordinates and layer
	 * @param {number} x - X coordinate
	 * @param {number} y - Y coordinate
	 * @param {number} layer - Layer index
	 * @returns {number} Tile ID at position
	 */
	mapTileId: function (x, y, layer) {
		if (!taro.map || !taro.map.data) {
			// throw new Error('Map data is not available');
		}

		if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(layer)) {
			// throw new Error('x, y and layer must be integers');
		}

		var map = taro.map.data;

		if (layer < 0 || layer >= map.layers.length) {
			// throw new Error('Invalid layer index');
		}

		if (map.layers[layer].type !== 'tilelayer') {
			// throw new Error('Layer must be a tile layer');
		}

		if (x < 0 || x >= map.width) {
			// throw new Error('Invalid x coordinate');
		}

		if (y < 0 || y >= map.height) {
			// throw new Error('Invalid y coordinate');
		}

		return map.layers[layer].data[x + y * map.width];
	},

	/**
	 * Check if two players are hostile to each other
	 * @param {Player} playerA - First player to check
	 * @param {Player} playerB - Second player to check
	 * @returns {boolean} True if players are hostile
	 * @throws {Error} If either player is undefined
	 */
	playersAreHostile: function (playerA, playerB) {
		if (!playerA || !playerB) {
			// throw new Error('Both players must be defined to check hostility');
		}

		if (playerA && typeof playerA.id === 'function') playerA = taro.$(playerA.id());
		if (playerB && typeof playerB.id === 'function') playerB = taro.$(playerB.id());
		return playerA.isHostileTo(playerB);
	},

	/**
	 * Check if two players are friendly to each other
	 * @param {Player} playerA - First player to check
	 * @param {Player} playerB - Second player to check
	 * @returns {boolean} True if players are friendly
	 * @throws {Error} If either player is undefined
	 */
	playersAreFriendly: function (playerA, playerB) {
		if (!playerA || !playerB) {
			// throw new Error('Both players must be defined to check friendship');
		}

		if (playerA && typeof playerA.id === 'function') playerA = taro.$(playerA.id());
		if (playerB && typeof playerB.id === 'function') playerB = taro.$(playerB.id());
		return playerA.isFriendlyTo(playerB);
	},

	/**
	 * Check if two players are neutral to each other
	 * @param {Player} playerA - First player to check
	 * @param {Player} playerB - Second player to check
	 * @returns {boolean} True if players are neutral
	 * @throws {Error} If either player is undefined
	 */
	playersAreNeutral: function (playerA, playerB) {
		if (!playerA || !playerB) {
			// throw new Error('Both players must be defined to check neutrality');
		}

		if (playerA && typeof playerA.id === 'function') playerA = taro.$(playerA.id());
		if (playerB && typeof playerB.id === 'function') playerB = taro.$(playerB.id());
		return playerA.isNeutralTo(playerB);
	},

	/**
	 *
	 * @param {Player} player
	 * @returns {string} username
	 */
	username: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		return player?._stats?.username;
	},

	/**
	 *
	 * @param {Player} player
	 * @returns {boolean} whether player is creator
	 */
	isCreator: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		return player?._stats?.userId === taro.game.data.defaultData.owner;
	},

	/**
	 * Gets an attribute object for an entity by attribute name
	 * @param {Object} entity - The entity to get the attribute from
	 * @param {string} attributeName - Name of the attribute to get
	 * @returns {Object|undefined} The attribute object if found
	 * @returns {string} attribute.color - Hex color code for the attribute
	 * @returns {string} attribute.dataType - Data type of the attribute
	 * @returns {number} attribute.decimalPlaces - Number of decimal places to display
	 * @returns {boolean} attribute.displayValue - Whether to display the value
	 * @returns {Array} attribute.isVisible - Visibility conditions
	 * @returns {number} attribute.max - Maximum allowed value
	 * @returns {number} attribute.min - Minimum allowed value
	 * @returns {string} attribute.name - Name of the attribute
	 * @returns {number} attribute.prevValue - Previous value
	 * @returns {number} attribute.regenerateSpeed - Speed of regeneration
	 * @returns {boolean} attribute.showAsHUD - Whether to show in HUD
	 * @returns {string} attribute.type - Type of attribute
	 * @returns {number} attribute.value - Current value
	 */
	getAttribute: function (entity, attributeName) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let attributeId = taro.script.moddScriptParam._getAttributeIdByName(entity, attributeName);
		if (entity && attributeId) {
			var attr = entity._stats.attributes && entity._stats.attributes[attributeId];
			if (attr && typeof attr === 'object') {
				Object.defineProperty(attr, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return attr;
		}
	},

	_getAttributeIdByName: function (entity, attributeName) {
		let attributeId;
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (taro.script.moddScriptParam.cachedAttributeIdLut[attributeName]) {
			attributeId = taro.script.moddScriptParam.cachedAttributeIdLut[attributeName];
		} else {
			for (let [attrId, attr] of Object.entries(entity._stats.attributes)) {
				if (attr.name === attributeName) {
					taro.script.moddScriptParam.cachedAttributeIdLut[attributeName] = attrId;
					attributeId = attrId;
				}
			}
		}
		return attributeId;
	},

	/**
	 *
	 * @param {*} position
	 * @param {*} distance
	 * @param {*} angle
	 */
	positionInFrontOfPosition: function (position, distance, angle) {
		if (position && !isNaN(distance) && !isNaN(angle)) {
			angle = Math.radians(angle);
			angle -= Math.PI / 2;
			var result = {
				x: distance * Math.cos(angle) + position.x,
				y: distance * Math.sin(angle) + position.y,
				z: position.z ?? 0,
			};
			Object.defineProperty(result, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return result;
		}
	},

	/**
	 * Calculates the center position of a given region.
	 *
	 * @param {Object} region - The region to calculate the center position for.
	 * @returns {Object} An object containing the x, y, and z coordinates of the region's center.
	 */
	centerOfRegion: function (region) {
		if (region && typeof region.id === 'function') region = taro.$(region.id());
		if (region) {
			var result = {
				x: region._stats.default.x + region._stats.default.width / 2,
				y: region._stats.default.y + region._stats.default.height / 2,
				z: 0,
			};
			Object.defineProperty(result, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return result;
		}
	},

	/**
	 * Get the current mouse position for a player
	 * @param {Player} player - The player to get mouse position for
	 * @returns {Object|undefined} Mouse position with x,y coordinates or undefined if invalid
	 */
	mousePosition: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._category == 'player' && player.control) {
			if (
				player.control.input.mouse.x != undefined &&
				player.control.input.mouse.y != undefined &&
				!isNaN(player.control.input.mouse.x) &&
				!isNaN(player.control.input.mouse.y)
			) {
				var result = {
					x: parseFloat(player.control.input.mouse.x),
					y: parseFloat(player.control.input.mouse.y),
				};
				Object.defineProperty(result, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
				return result;
			}
		}
	},

	/**
	 * Get the current camera pitch for a player
	 * @param {Player} player - The player to get camera pitch for
	 * @returns {number|undefined} Camera pitch value or undefined if invalid
	 */
	cameraPitch: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._category == 'player' && player.control) {
			if (player.control.input.mouse.pitch != undefined && !isNaN(player.control.input.mouse.pitch)) {
				return parseFloat(player.control.input.mouse.pitch) * (180 / Math.PI);
			}
		}
	},

	/**
	 * Get the current camera yaw for a player
	 * @param {Player} player - The player to get camera yaw for
	 * @returns {number|undefined} Camera yaw value or undefined if invalid
	 */
	cameraYaw: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._category == 'player' && player.control) {
			if (player.control.input.mouse.yaw != undefined && !isNaN(player.control.input.mouse.yaw)) {
				return parseFloat(player.control.input.mouse.yaw) * (180 / Math.PI);
			}
		}
	},

	/**
	 *
	 * @returns last touched unit
	 */
	lastTouchedUnit: function () {
		var id = taro.game.lastTouchedUnitId;
		unit = this._createFakeEntity(id);

		Object.defineProperty(unit, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return unit;
	},

	/**
	 *
	 * @returns last touching unit
	 */
	lastTouchingUnit: function () {
		var id = taro.game.lastTouchingUnitId;
		unit = this._createFakeEntity(id);

		Object.defineProperty(unit, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return unit;
	},

	/**
	 *
	 * @param {*} entity
	 * @returns entity facing angle
	 */
	facingAngle: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity) {
			returnValue = entity._rotate && entity._rotate.z;
			returnValue =
				returnValue != undefined ? Math.degrees(taro.script.moddScriptParam.roundOff(returnValue, 3)) : undefined;
		}

		return returnValue;
	},

	/**
	 *
	 * @param {*} entity
	 * @returns {x: number, y: number, z: number} entity rotation
	 */
	rotation3d: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity) {
			return {
				x: Math.degrees(taro.script.moddScriptParam.roundOff(taro.physics.getPitch(entity), 3)),
				y: Math.degrees(taro.script.moddScriptParam.roundOff(taro.physics.getRoll(entity), 3)),
				z: Math.degrees(taro.script.moddScriptParam.roundOff(entity._rotate.z, 3)),
			};
		}
	},

	/**
	 * @returns this entity
	 */
	thisEntity: function () {
		var entity = this._createFakeEntity(taro.script.moddScriptParam.varsFromTrigger.thisEntity);
		if (entity && typeof entity === 'object') {
			Object.defineProperty(entity, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return entity;
	},

	/**
	 * get entities between two positions
	 * @param {*} posA
	 * @param {*} posB
	 * @param {*} entitiesToIgnore
	 * @returns entities between two positions
	 */
	entitiesBetweenTwoPositions: function (posA, posB, possibleEntitiesToIgnore) {
		if (posA && posB) {
			posA.x ??= 0;
			posA.y ??= 0;
			posA.z ??= 0;

			posB.x ??= 0;
			posB.y ??= 0;
			posB.z ??= 0;

			const collisionGroups =
				taro.physics.collisionGroups.Wall |
				taro.physics.collisionGroups.Unit |
				taro.physics.collisionGroups.Prop |
				taro.physics.collisionGroups.Item |
				taro.physics.collisionGroups.Projectile;

			taro.physics.raycast(posA, posB, possibleEntitiesToIgnore, false, collisionGroups);

			var entities = taro.game.entitiesCollidingWithLastRaycast;
			if (entities && typeof entities === 'object') {
				entities.forEach(function (entity) {
					if (entity && typeof entity === 'object') {
						Object.defineProperty(entity, '_from', {
							value: 'param',
							enumerable: false,
							configurable: true,
							writable: true,
						});
					}
				});
				Object.defineProperty(entities, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return entities;
		}
	},

	/**
	 * Get the category of an entity
	 * @param {Object} entity - The entity to get the category of
	 * @returns {string} The entity's category, defaults to 'wall' if not found
	 */
	entityCategory: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity) {
			return entity._category || 'wall';
		}
	},

	/**
	 * Get entities within a region that match allowed categories
	 * @param {Object} region - The region to check, either a TaroRegion instance or region data
	 * @returns {Array} Array of entities in the region matching allowed categories
	 */
	entitiesInRegion: function (region) {
		const returnValue = [];
		if (region && typeof region.id === 'function') region = taro.$(region.id());
		if (region) {
			// region represent some instance of TaroRegion
			taro.physics.getEntitiesInRegion(region._stats ? region._stats.default : region).forEach((e) => {
				if (taro.script.action.entityCategories.includes(e._category)) {
					const o = this._createFakeEntity(e.id());
					Object.defineProperty(o, '_from', {
						value: 'param',
						enumerable: false,
						configurable: true,
						writable: true,
					});
					returnValue.push(o);
				}
			});

			Object.defineProperty(returnValue, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		} else {
			taro.script.errorLog(
				'region is not a valid region',
				`${taro.script.moddScriptParam._script._entity._id}/${taro.script.moddScriptParam._script.currentScriptId}/${taro.script.moddScriptParam._script.currentActionName}/${taro.script.moddScriptParam._script.currentActionLineNumber}`,
				true
			);
		}
		return returnValue;
	},

	/**
	 *
	 * @param {Object} entity
	 * @returns {x: number, y:number, z:number} position of entity
	 */
	position: function (entity) {
		let returnValue;
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity) {
			if (
				entity._category === 'item' &&
				entity._stats &&
				entity._stats.currentBody &&
				entity._stats.currentBody.type === 'spriteOnly'
			) {
				var ownerUnit = entity.getOwnerUnit();
				var unitPosition = {};

				unitPosition.x =
					ownerUnit._translate.x +
					entity._stats.currentBody.unitAnchor.y * Math.cos(ownerUnit._rotate.z + Math.radians(-90)) +
					entity._stats.currentBody.unitAnchor.x * Math.cos(ownerUnit._rotate.z);
				unitPosition.y =
					ownerUnit._translate.y +
					entity._stats.currentBody.unitAnchor.y * Math.sin(ownerUnit._rotate.z + Math.radians(-90)) +
					entity._stats.currentBody.unitAnchor.x * Math.sin(ownerUnit._rotate.z);
				unitPosition.z = ownerUnit.translateZ;
				returnValue = unitPosition;
			} else {
				if (entity.x != undefined && entity.y != undefined) {
					let position = entity;
					returnValue = { x: position.x, y: position.y, z: entity.translateZ };
				} else if (entity._position) {
					let position = entity._position;
					returnValue = { x: position.x, y: position.y, z: entity.translateZ };
				} else if (entity._translate) {
					let position = entity._translate;
					returnValue = { x: position.x, y: position.y, z: entity.translateZ };
				} else {
					returnValue = { x: 0, y: 0, z: 0 };
				}
			}

			if (returnValue && typeof returnValue === 'object') {
				Object.defineProperty(returnValue, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
		}
		return returnValue;
	},

	/**
	 * Gets the name of an entity type from its ID
	 * @param {string} entityTypeId - The ID of the entity type to look up
	 * @returns {string|undefined} The name of the entity type if found, undefined otherwise
	 * @description Looks up an entity type by ID and returns its name. Works for units, items, projectiles, etc.
	 * Uses _getEntityCategoryAndAsset internally to determine the correct asset category.
	 */
	typeName: function (entityTypeId) {
		let { entityTypeData } = taro.script.moddScriptParam._getEntityCategoryAndAsset(entityTypeId);
		return entityTypeData?.name;
	},

	/**
	 *
	 * @param {Object} entity
	 * @returns {string} player name
	 */
	name: function (entity) {
		if (!entity) {
			return;
		}

		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity._category === 'region') {
			return entity._stats ? entity._stats.id : entity.key;
		}
		return entity._stats?.name;
	},

	/**
	 * Check if a position overlaps with an entity
	 * @param {Object} position - Position to check
	 * @returns {boolean} True if position overlaps an entity
	 */
	isPositionInEntity: function (position) {
		if (!position) {
			// throw new Error('position is a required parameter');
		}

		var entityCategory = ['unit'];
		var defaultArea = {
			height: 100 / 64,
			width: 100 / 64,
		};

		var entities = taro.physics.getEntitiesInRegion({
			x: position.x,
			y: position.y,
			width: defaultArea.width,
			height: defaultArea.height,
		});

		var returnValue = _.some(entities, function (entity) {
			return entityCategory.indexOf(entity._category) > -1;
		});

		return returnValue;
	},

	/**
	 * Check if a rectangle area is occupied
	 * @param {{x: number, y:number, z: number}} size - Size of the rectangle
	 * @param {{x: number, y:number, z: number}} position - Position to check
	 * @param {{x: number, y:number, z: number}} rotation - Rotation angle
	 * @returns {boolean} True if area is occupied
	 */
	isRectangleOccupied: function (size, position, rotation) {
		if (!size) {
			// throw new Error('size is a required parameter');
		}
		if (!position) {
			// throw new Error('position is a required parameter');
		}
		if (rotation === undefined) {
			// throw new Error('rotation is a required parameter');
		}

		return taro.physics.isRectangleOccupied(size, position, rotation);
	},

	/**
	 * Check if a circular area is occupied
	 * @param {number} radius - Radius of the circle
	 * @param {{x: number, y:number, z: number}} position - Position to check
	 * @returns {boolean} True if area is occupied
	 */
	isCircleOccupied: function (radius, position) {
		if (radius === undefined) {
			// throw new Error('radius is a required parameter');
		}
		if (!position) {
			// throw new Error('position is a required parameter');
		}

		return taro.physics.isCircleOccupied(radius, position);
	},

	/**
	 * Check if a quest is currently active
	 * @param {Player} player - Player to check
	 * @param {string} questId - ID of the quest
	 * @returns {boolean} True if quest is active
	 */
	isQuestActive: function (player, questId) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}
		if (!questId) {
			// throw new Error('questId is a required parameter');
		}

		player?.quest.init(player);
		var gameId = taro.game.data.defaultData._id;
		var quests = player?.quests;
		return quests?.active[gameId][questId] !== undefined;
	},

	getLengthOfArray: function (arrayFn, args) {
		return taro.script.moddScriptParam[arrayFn.name]?.(...args)?.length ?? 0;
	},

	// TODO: lazy registering the entity whenever it's really be visited
	// cache entity is hard, sync between host and quickjs after update it, and dispose it when it's no longer used
	//  [e1, e2, e3] host
	//  [] quickjs
	// register e1, e2, e3... this operation

	/**
	 * Get all entities of a specific type
	 * @param {string} entityTypeId - The type ID to filter by (e.g. unit type, item type, projectile type)
	 * @returns {Array} Array of entities matching the type
	 * @throws {Error} If entityTypeId parameter is missing
	 */
	allEntitiesOfType: function (entityTypeId) {
		if (!entityTypeId) {
			// throw new Error('entityTypeId is a required parameter');
		}
		let { entityCategory } = taro.script.moddScriptParam._getEntityCategoryAndAsset(entityTypeId);
		var entities = _.filter(taro.$$(entityCategory), (entity) => {
			return entity._stats.type == entityTypeId;
		}).map((e) => {
			const o = this._createFakeEntity(e.id());
			Object.defineProperty(e, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return o;
		});

		Object.defineProperty(entities, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return entities;
	},

	/**
	 * Get rotation speed of a unit type
	 * @param {string} unitType - The unit type to get rotation speed from
	 * @returns {number} The rotation speed
	 */
	rotateSpeed: function (unitType) {
		if (!unitType) {
			// throw new Error('unitType is a required parameter');
		}

		var unitTypeData = taro.game.cloneAsset('unitTypes', unitType);
		if (unitTypeData?.body?.rotationSpeed) {
			return unitTypeData.body.rotationSpeed;
		}
		return undefined;
	},

	/**
	 * Get persistent data for a unit
	 * @param {Unit} unit - The unit to get data from
	 * @returns {string} JSON stringified unit data
	 */
	unitData: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (!unit) {
			// throw new Error('unit is a required parameter');
		}

		var data = unit.getPersistentData('unit');
		if (data) {
			return JSON.stringify(data);
		}
		return undefined;
	},

	/**
	 * Get persistent data for a player
	 * @param {Player} player - The player to get data from
	 * @returns {string} JSON stringified player data
	 */
	playerData: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}

		var data = player.getPersistentData('player');
		if (data) {
			return JSON.stringify(data);
		}
		return undefined;
	},

	/**
	 * Get ID of an entity
	 * @param {Entity} entity - The entity to get ID from
	 * @returns {string} The entity's ID
	 */
	id: function (entity) {
		return entity?.id();
	},

	/**
	 * Get player by user ID
	 * @param {string} userId - The user ID to look up
	 * @returns {Object} The player object
	 */
	playerByUserId: function (userId) {
		var player = taro.game.getPlayerByUserId(userId);
		if (player && typeof player === 'object') {
			Object.defineProperty(player, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return player;
	},

	/**
	 * Get high score of a player
	 * @param {Player} player - The player to get high score from
	 * @returns {number} The player's high score
	 */
	highScore: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}

		return player._stats.highscore;
	},

	/**
	 * Filter a string using chat filter
	 * @param {string} string - String to filter
	 * @returns {string} Filtered string
	 */
	filterString: function (string) {
		if (!string) {
			// throw new Error('string is a required parameter');
		}

		if (taro.chat?.filter) {
			return taro.chat.filter.cleanHacked(string);
		}
		return string;
	},

	/**
	 * Get all units owned by a player
	 * @param {Player} player - The player to get units for
	 * @returns {Array} Array of unit objects
	 */
	allOwnedUnits: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}

		var units = [];
		for (var i = 0; i < player._stats.unitIds.length; i++) {
			var unitId = player._stats.unitIds[i];
			var unit = this._createFakeEntity(unitId);
			if (unit && typeof unit === 'object') {
				Object.defineProperty(unit, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			units.push(unit);
		}
		Object.defineProperty(units, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return units;
	},

	/**
	 * Get all human players
	 * @returns {Array} Array of human player objects
	 */
	humanPlayers: function () {
		var players = taro
			.$$('player')
			.filter(function (player) {
				return player._stats.controlledBy == 'human';
			})
			.map((e) => {
				const o = this._createFakeEntity(e.id());

				Object.defineProperty(o, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
				return o;
			});

		Object.defineProperty(players, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return players;
	},

	/**
	 * Get all computer players
	 * @returns {Array} Array of computer player objects
	 */
	computerPlayers: function () {
		var players = taro
			.$$('player')
			.filter(function (player) {
				return player._stats.controlledBy == 'computer';
			})
			.map((e) => {
				const o = this._createFakeEntity(e.id());

				Object.defineProperty(o, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
				return o;
			});
		Object.defineProperty(players, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return players;
	},

	/**
	 * Get all bot players
	 * @returns {Array} Array of bot player objects
	 */
	botPlayers: function () {
		var players = taro
			.$$('player')
			.filter(function (player) {
				return player._stats.isBot;
			})
			.map((e) => {
				const o = this._createFakeEntity(e.id());

				Object.defineProperty(o, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
				return o;
			});
		Object.defineProperty(players, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return players;
	},

	/**
	 * Get players of a specific player type
	 * @param {string} playerType - The player type to filter by
	 * @returns {Array} Array of matching player objects
	 */
	playersOfPlayerType: function (playerType) {
		if (!playerType) {
			// throw new Error('playerType is a required parameter');
		}

		var players = taro
			.$$('player')
			.filter((player) => {
				return player._stats.playerTypeId === playerType;
			})
			.map((e) => {
				const o = this._createFakeEntity(e.id());

				Object.defineProperty(o, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
				return o;
			});
		Object.defineProperty(players, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return players;
	},

	/**
	 * Get entities in a region in front of an entity at a distance
	 * @param {Object} entity - The reference entity
	 * @param {number} distance - Distance in front of entity
	 * @param {number} width - Width of region
	 * @param {number} height - Height of region
	 * @returns {Array} Array of entities in the region
	 */
	entitiesInRegionInFrontOfEntityAtDistance: function (entity, distance, width, height) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (!entity || isNaN(distance) || isNaN(width) || isNaN(height)) {
			// throw new Error('entity, distance, width and height are required parameters');
		}

		var region = {
			x: entity._translate.x + distance * Math.cos(entity._rotate.z + Math.radians(-90)),
			y: entity._translate.y + distance * Math.sin(entity._rotate.z + Math.radians(-90)),
			width: width,
			height: height,
		};

		if (taro.is3DServerPhysics()) {
			region.z = entity.translateZ;
		}

		region.x -= region.width / 2;
		region.y -= region.height / 2;

		if (
			region.x &&
			!isNaN(region.x) &&
			region.y &&
			!isNaN(region.y) &&
			region.width &&
			!isNaN(region.width) &&
			region.height &&
			!isNaN(region.height)
		) {
			var entities = taro.physics.getEntitiesInRegion(region).filter(({ _category }) => {
				return taro.script.moddScriptAction.entityCategories.includes(_category) || !_category;
			});

			entities = entities.map((e) => this._createFakeEntity(e.id()));

			entities.forEach(function (entity) {
				if (entity && typeof entity === 'object') {
					Object.defineProperty(entity, '_from', {
						value: 'param',
						enumerable: false,
						configurable: true,
						writable: true,
					});
				}
			});
			Object.defineProperty(entities, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return entities;
		}

		taro.script.errorLog(
			`region ${JSON.stringify(region)} is not a valid region`,
			`${taro.script.moddScriptParam._script._entity._id}/${taro.script.moddScriptParam._script.currentScriptId}/${taro.script.moddScriptParam._script.currentActionName}/${taro.script.moddScriptParam._script.currentActionLineNumber}`,
			true
		);
		return [];
	},

	/**
	 * Get region in front of an entity at a distance
	 * @param {Object} entity - The reference entity
	 * @param {number} distance - Distance in front of entity
	 * @param {number} width - Width of region
	 * @param {number} height - Height of region
	 * @param {number} [depth=0] - Depth of region (for 3D physics)
	 * @returns {Object|undefined} Region object or undefined if entity is invalid
	 */
	regionInFrontOfEntityAtDistance: function (entity, distance, width, height, depth = 0) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (!entity || isNaN(distance) || isNaN(width) || isNaN(height)) {
			// throw new Error('entity, distance, width and height are required parameters');
		}

		if (taro.script.moddScriptParam._entity.script.action.entityCategories.indexOf(entity._category) === -1) {
			return undefined;
		}

		var region = {
			x: entity._translate.x + distance * Math.cos(entity._rotate.z + Math.radians(-90)),
			y: entity._translate.y + distance * Math.sin(entity._rotate.z + Math.radians(-90)),
			z: entity.translateZ,
			width: width,
			height: height,
			depth,
		};

		region.x -= region.width / 2;
		region.y -= region.height / 2;
		region.z -= region.depth / 2;

		if (
			region.x &&
			!isNaN(region.x) &&
			region.y &&
			!isNaN(region.y) &&
			region.width &&
			!isNaN(region.width) &&
			region.height &&
			!isNaN(region.height)
		) {
			Object.defineProperty(region, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return region;
		}

		taro.script.errorLog(
			`region ${JSON.stringify(region)} is not a valid region`,
			`${taro.script.moddScriptParam._script._entity._id}/${taro.script.moddScriptParam._script.currentScriptId}/${taro.script.moddScriptParam._script.currentActionName}/${taro.script.moddScriptParam._script.currentActionLineNumber}`,
			true
		);
		return undefined;
	},

	/**
	 * Get currently playing animations for an entity
	 * @param {Object} entity - The entity to check animations for
	 * @returns {string} JSON stringified array of animation names
	 */
	animationsPlaying: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (!entity) {
			// throw new Error('entity is a required parameter');
		}

		const animationIds = entity._stats.animationIds;
		let animationNames = [];
		if (animationIds?.length > 0) {
			animationIds.forEach((id) => {
				const animation = entity._stats.animations[id];
				if (animation) {
					animationNames.push(animation.name);
				}
			});
		}
		return JSON.stringify(animationNames);
	},

	/**
	 * Get the state of an entity
	 * @param {Object} entity - Entity to get state from
	 * @returns {string} Entity state ID
	 */
	state: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (!entity) {
			// throw new Error('entity is a required parameter');
		}

		return entity._stats?.stateId;
	},

	/**
	 * Get the default data for a region
	 * @param {Object} region - The region entity to get default data from
	 * @returns {Object} The default stats data for the region
	 */
	defaultRegionData: function (region) {
		if (region && typeof region.id === 'function') region = taro.$(region.id());
		var data = region._stats.default;
		if (data && typeof data === 'object') {
			Object.defineProperty(data, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return data;
	},

	/**
	 * Get the description of an item
	 * @param {Object} item - Item to get description from
	 * @returns {string} Item description
	 */
	description: function (item) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (!item) {
			// throw new Error('item is a required parameter');
		}

		if (item._category === 'item') {
			return item._stats.description;
		}
		return undefined;
	},

	/**
	 * Get the damage value of an item type
	 * @param {string} itemTypeId - ID of item type
	 * @returns {number} Damage value
	 */
	itemTypeDamage: function (itemTypeId) {
		if (!itemTypeId) {
			// throw new Error('itemTypeId is a required parameter');
		}

		var itemType = taro.game.cloneAsset('itemTypes', itemTypeId);
		return itemType ? parseFloat(itemType.damage) : 0;
	},

	/**
	 * Get the particle type for an item
	 * @param {Object} item - Item entity
	 * @param {string} particleTypeId - ID of particle type
	 * @returns {string|undefined} Particle type ID if exists
	 */
	itemParticle: function (item, particleTypeId) {
		if (!item) {
			// throw new Error('entity is a required parameter');
		}
		if (!particleTypeId) {
			// throw new Error('particleTypeId is a required parameter');
		}

		if (item && typeof item.id === 'function') item = taro.$(item.id());

		if (item._category === 'item' && item._stats.particles) {
			var particleType = item._stats.particles[particleTypeId];
			return particleType ? particleTypeId : undefined;
		}
		return undefined;
	},
	/**
	 * Get angle between mouse and window center for a player
	 * @param {Player} player - Player to check angle for
	 * @returns {number} Angle in radians
	 */
	angleBetweenMouseAndWindowCenter: function (player) {
		if (!player) {
			// throw new Error('player is a required parameter');
		}

		if (player && typeof player.id === 'function') player = taro.$(player.id());
		return player.absoluteAngle || 0;
	},

	/**
	 * Get entities colliding with last raycast
	 * @returns {Array} Array of colliding entities
	 */
	entitiesCollidingWithLastRaycast: function () {
		var entities = taro.game.entitiesCollidingWithLastRaycast;
		if (entities && typeof entities === 'object') {
			entities.forEach(function (entity) {
				if (entity && typeof entity === 'object') {
					Object.defineProperty(entity, '_from', {
						value: 'param',
						enumerable: false,
						configurable: true,
						writable: true,
					});
				}
			});
			Object.defineProperty(entities, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return entities;
	},

	/**
	 * Get start position of entity's last raycast
	 * @param {Object} entity - Entity to check
	 * @returns {Object} Start position of raycast
	 */
	lastRaycastStartPosition: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (!entity) {
			// throw new Error('entity is a required parameter');
		}
		var position = entity.lastRaycast.start;
		if (position && typeof position === 'object') {
			Object.defineProperty(position, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return position;
	},

	/**
	 * Get collision position of entity's last raycast
	 * @param {Object} entity - Entity to check
	 * @returns {Object} Collision position of raycast
	 */
	lastRaycastCollisionPosition: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (!entity) {
			// throw new Error('entity is a required parameter');
		}
		var position = entity.lastRaycast.end;
		if (position && typeof position === 'object') {
			Object.defineProperty(position, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return position;
	},

	/**
	 * Calculate displacement vector between two positions
	 * @param {Object} positionA - Starting position
	 * @param {Object} positionB - Ending position
	 * @returns {Object} Displacement vector with x,y,z components
	 */
	displacementVector: function (positionA, positionB) {
		if (!positionA || !positionB) {
			// throw new Error('positionA and positionB are required parameters');
		}

		var result = {
			x: positionB.x - positionA.x,
			y: positionB.y - positionA.y,
			z: positionB.z - positionA.z,
		};
		Object.defineProperty(result, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return result;
	},

	/**
	 * Get interpolated position between two 3D points
	 * @param {Object} positionA - Starting position with x,y,z coordinates
	 * @param {Object} positionB - Ending position with x,y,z coordinates
	 * @param {number} alpha - Interpolation factor between 0 and 1
	 * @returns {Object} Interpolated position with x,y,z coordinates
	 */
	lerpPosition: function (positionA, positionB, alpha) {
		if (!positionA || !positionB || alpha == null) {
			// throw new Error('positionA, positionB and alpha are required parameters');
		}

		if (!positionA.z) {
			positionA.z = 0;
		}
		if (!positionB.z) {
			positionB.z = 0;
		}

		if (!positionA.x || !positionA.y || !positionB.x || !positionB.y || isNaN(alpha)) {
			// throw new Error('positionA and positionB must have valid x,y coordinates and alpha must be a number');
		}

		var result = {
			x: (positionB.x - positionA.x) * alpha + positionA.x,
			y: (positionB.y - positionA.y) * alpha + positionA.y,
			z: (positionB.z - positionA.z) * alpha + positionA.z,
		};
		Object.defineProperty(result, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return result;
	},

	/**
	 * Get a random playable position within a region
	 * @param {Object} region - Region to check
	 * @returns {Object} Random playable position {x, y} or undefined if no position found
	 */
	randomPlayablePositionInRegion: function (region) {
		if (!region) {
			// throw new Error('region is a required parameter');
		}

		if (region && typeof region.id === 'function') region = taro.$(region.id());
		var attempts = 20;
		var returnValue;

		for (var i = 0; i < attempts; i++) {
			var position = taro.script.moddScriptParam.getRandomPositionInRegion(region);
			var isPlayablePosition =
				!taro.script.moddScriptParam.isPositionInEntity(position) &&
				!taro.script.moddScriptParam.isPositionInWall(position);

			if (isPlayablePosition) {
				returnValue = {
					x: position.x,
					y: position.y,
				};
				Object.defineProperty(returnValue, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
				break;
			}
		}

		if (!returnValue) {
			taro.script.errorLog(
				`could not find valid position even after ${attempts} attempts`,
				`${taro.script.moddScriptParam._script._entity._id}/${taro.script.moddScriptParam._script.currentScriptId}/${taro.script.moddScriptParam._script.currentActionName}/${taro.script.moddScriptParam._script.currentActionLineNumber}`,
				true
			);
		}

		return returnValue;
	},

	/**
	 * Get the age of the server in milliseconds
	 * @returns {number} Server age in milliseconds
	 */
	serverAge: function () {
		const timestampStr = taro.server.startedAt;
		const timestamp = new Date(timestampStr);
		const millisecondsSinceEpoch = timestamp.getTime();
		return Date.now() - millisecondsSinceEpoch;
	},

	/**
	 * Get the server start time
	 * @returns {Date} Server start time
	 */
	serverStartTime: function () {
		return new Date(taro.server.startedAt);
	},

	/**
	 * Linear interpolation between two values
	 * @param {number} valueA - First value
	 * @param {number} valueB - Second value
	 * @param {number} alpha - Interpolation factor between 0 and 1
	 * @returns {number} Interpolated value
	 */
	lerp: function (valueA, valueB, alpha) {
		if (valueA == null || valueB == null || alpha == null) {
			// throw new Error('valueA, valueB and alpha are required parameters');
		}

		if (isNaN(valueA) || isNaN(valueB) || isNaN(alpha)) {
			// throw new Error('valueA, valueB and alpha must be numbers');
		}

		return (valueB - valueA) * alpha + valueA;
	},

	/**
	 * Get default quantity of an item type
	 * @param {string} itemTypeId - ID of the item type
	 * @returns {number} Default quantity
	 */
	defaultQuantityOfItemType: function (itemTypeId) {
		if (!itemTypeId) {
			// throw new Error('itemTypeId is a required parameter');
		}

		var itemType = taro.game.cloneAsset('itemTypes', itemTypeId);
		return itemType ? itemType.quantity : 0;
	},

	/**
	 * Get maximum quantity of an item type
	 * @param {string} itemTypeId - ID of the item type
	 * @returns {number} Maximum quantity
	 */
	maxQuantityOfItemType: function (itemTypeId) {
		if (!itemTypeId) {
			// throw new Error('itemTypeId is a required parameter');
		}

		var itemType = taro.game.cloneAsset('itemTypes', itemTypeId);
		return itemType ? itemType.maxQuantity : 0;
	},

	/**
	 * Get all item types in the game
	 * @returns {Object} Object containing all item types
	 */
	allItemTypesInGame: function () {
		var itemTypesObject = taro.game.data.itemTypes;
		if (itemTypesObject && typeof itemTypesObject === 'object') {
			Object.defineProperty(itemTypesObject, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return itemTypesObject || {};
	},

	/**
	 * Get all unit types in the game
	 * @returns {Object} Object containing all unit types
	 */
	allUnitTypesInGame: function () {
		var unitTypesObject = taro.game.data.unitTypes;
		if (unitTypesObject && typeof unitTypesObject === 'object') {
			Object.defineProperty(unitTypesObject, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return unitTypesObject || {};
	},

	/**
	 * Get last played time of a player
	 * @param {Player} player - Player object
	 * @returns {number} Last played timestamp
	 */
	lastPlayedTimeOfPlayer: function (player) {
		if (!player) {
			// throw new Error('player is a required parameter');
		}

		if (player && typeof player.id === 'function') player = taro.$(player.id());
		return player._stats.lastPlayed;
	},

	/**
	 * Get unit sensor radius
	 * @param {Object} unit - Unit object
	 * @returns {number} Sensor radius
	 */
	sensorRadius: function (unit) {
		if (!unit) {
			// throw new Error('unit is a required parameter');
		}

		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit.sensor) {
			return unit.sensor.getRadius();
		}

		return unit._stats?.ai?.sensorRadius || 0;
	},

	_getEntityCategoryAndAsset: function (entityTypeId) {
		let entityCategory;
		let entityType;
		let entityTypeData;
		for (let type of ['unitTypes', 'projectileTypes', 'propTypes', 'itemTypes']) {
			if (taro.game.data[type][entityTypeId]) {
				entityCategory = type.replace('Types', '');
				entityType = type;
				entityTypeData = taro.game.data[type][entityTypeId];
				break;
			}
		}
		return { entityCategory, entityType, entityTypeData };
	},

	/**
	 * Get unit type model sprite URL
	 * @param {EntityTypeId} entityTypeId - The unit type ID
	 * @returns {string} The sprite URL
	 */
	entityTypeModelOrSprite: function (entityTypeId) {
		if (!entityTypeId) {
			// throw new Error('entityTypeId is a required parameter');
		}

		let { entityTypeData } = taro.script.moddScriptParam._getEntityCategoryAndAsset(entityTypeId);

		if (!entityTypeData) {
			// throw new Error('unit type not found');
		}

		return entityTypeData.cellSheet.url;
	},

	/**
	 * Get the last created projectile
	 * @returns {Object} The last created projectile
	 */
	lastCreatedProjectile: function () {
		var id = taro.game.lastCreatedProjectileId;
		var projectile = this._createFakeEntity(id);
		if (projectile && typeof projectile === 'object') {
			Object.defineProperty(projectile, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return projectile;
	},

	/**
	 * Get the last player selecting dialogue option
	 * @returns {Object} The last player selecting dialogue option
	 */
	lastPlayerSelectingDialogueOption: function () {
		var id = taro.game.lastPlayerSelectingDialogueOption;
		var player = this._createFakeEntity(id);
		if (player && typeof player === 'object') {
			Object.defineProperty(player, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return player;
	},

	/**
	 * Get the last triggering quest ID
	 * @returns {string} The last triggering quest ID
	 */
	lastTriggeringQuestId: function () {
		return taro.game.lastTriggeringQuestId;
	},

	/**
	 * Get the last casting unit
	 * @returns {Object} The last casting unit
	 */
	lastCastingUnit: function () {
		var id = taro.game.lastCastingUnitId;
		var unit = this._createFakeEntity(id);

		Object.defineProperty(unit, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return unit;
	},

	/**
	 * Get all items dropped on ground
	 * @returns {Array} Array of items dropped on ground
	 */
	allItemsDroppedOnGround: function () {
		var items = taro
			.$$('item')
			.filter(function (item) {
				return !item.getOwnerUnit();
			})
			.map((e) => {
				const o = this._createFakeEntity(e.id());

				Object.defineProperty(o, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
				return o;
			});
		Object.defineProperty(items, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return items;
	},

	/**
	 * Check if AI is enabled for a unit
	 * @param {Object} unit - The unit to check
	 * @returns {boolean} Whether AI is enabled
	 */
	isAIEnabled: function (unit) {
		if (!unit) {
			// throw new Error('unit is a required parameter');
		}

		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			return unit._stats.aiEnabled;
		}
		return false;
	},

	/**
	 * Get the original position of a unit
	 * @param {Object} unit - The unit to get original position for
	 * @returns {Object} The original position
	 */
	aiOriginalPosition: function (unit) {
		if (!unit) {
			// throw new Error('unit is a required parameter');
		}
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit' && unit.ai) {
			const position = {
				x: unit.ai.originalPosition.x,
				y: unit.ai.originalPosition.y,
			};
			Object.defineProperty(position, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return position;
		}
		return undefined;
	},
	/**
	 * Get item at specified inventory slot for a unit
	 * @param {Object} unit - The unit to check inventory
	 * @param {number} slotIndex - The inventory slot index
	 * @returns {Object} The item in the slot
	 * @throws {Error} If required parameters are missing
	 */
	itemAtSlot: function (unit, slotIndex) {
		if (!unit) {
			// throw new Error('unit is a required parameter');
		}
		if (slotIndex == null) {
			// throw new Error('slotIndex is a required parameter');
		}

		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit._category !== 'unit') {
			return undefined;
		}

		var item = unit.inventory.getItemBySlotNumber(slotIndex);
		if (item && typeof item === 'object') {
			item = this._createFakeEntity(item.id());
			Object.defineProperty(item, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return item || undefined;
	},

	/**
	 * Get selected inventory slot number for a unit
	 * @param {Object} unit - The unit to check
	 * @returns {number} The selected slot number
	 * @throws {Error} If unit parameter is missing
	 */
	selectedSlot: function (unit) {
		if (!unit) {
			// throw new Error('unit is a required parameter');
		}

		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit._category !== 'unit') {
			return undefined;
		}

		return unit._stats.currentItemIndex + 1;
	},

	/**
	 * Get the last created item
	 * @returns {Object} The last created item
	 */
	lastCreatedItem: function () {
		var id = taro.game.lastCreatedItemId;
		var item = this._createFakeEntity(id);
		if (item && typeof item === 'object') {
			Object.defineProperty(item, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return item;
	},
	/**
	 * Returns the last touched item
	 * @returns {Object} The last touched item
	 */
	lastTouchedItem: function () {
		var id = taro.game.lastTouchedItemId;
		let item;
		if (taro.$(id)) {
			item = this._createFakeEntity(id);
			Object.defineProperty(item, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return item;
	},

	/**
	 * Returns the last attacking item
	 * @returns {Object} The last attacking item
	 */
	lastAttackingItem: function () {
		var id = taro.game.lastAttackingItemId;
		var item = this._createFakeEntity(id);

		Object.defineProperty(item, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return item;
	},

	/**
	 * Returns the last used item
	 * @returns {Object} The last used item
	 */
	lastUsedItem: function () {
		var id = taro.game.lastUsedItemId;
		var item = this._createFakeEntity(id);

		Object.defineProperty(item, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return item;
	},

	/**
	 * Get the last purchased unit
	 * @returns {Object} The last purchased unit
	 */
	lastPurchasedUnit: function () {
		var id = taro.game.lastPurchasedUnitId;
		var unit = this._createFakeEntity(id);
		Object.defineProperty(unit, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return unit;
	},

	/**
	 * Get the last attacking unit
	 * @returns {Object} The last attacking unit
	 */
	lastAttackingUnit: function () {
		var id = taro.game.lastAttackingUnitId;
		var unit = this._createFakeEntity(id);
		Object.defineProperty(unit, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return unit;
	},

	/**
	 * Get the last attacked unit
	 * @returns {Object} The last attacked unit
	 */
	lastAttackedUnit: function () {
		var id = taro.game.lastAttackedUnitId;
		var unit = this._createFakeEntity(id);
		Object.defineProperty(unit, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return unit;
	},

	/**
	 * Get the last touched prop
	 * @returns {Object} The last touched prop
	 */
	lastTouchedProp: function () {
		var id = taro.game.lastTouchedPropId;
		var prop = this._createFakeEntity(id);
		Object.defineProperty(prop, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return prop;
	},

	/**
	 * Get the target unit of a unit
	 * @param {Object} unit - The unit to get target for
	 * @returns {Object} The target unit
	 * @throws {Error} If unit parameter is missing
	 */
	targetUnit: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (!unit) {
			// throw new Error('unit is a required parameter');
		}

		var target = unit.ai ? unit.ai.getTargetUnit() : undefined;
		if (target && typeof target === 'object') {
			Object.defineProperty(target, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return target;
	},

	/**
	 * Get the velocity vector of an entity
	 * @param {Object} entity - The entity to check velocity for
	 * @returns {{x: number, y: number, z: number} | undefined} The velocity vector containing x, y and z components
	 * @throws {Error} If entity parameter is missing
	 */
	velocity: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (!entity) {
			// throw new Error('entity is a required parameter');
		}

		if (entity.hasPhysicsBody()) {
			var vel = entity.getLinearVelocity();
			if (vel && typeof vel === 'object') {
				Object.defineProperty(vel, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return vel;
		}
	},

	/**
	 * Convert a number to a shortened notation with suffix (e.g. 1000 -> 1K)
	 * @param {number} value - The number to convert
	 * @returns {string} The formatted number with suffix
	 * @throws {Error} If value parameter is missing
	 */
	convertNumberToLargeNotation: function (value) {
		if (!value) {
			// throw new Error('value is a required parameter');
		}

		const suffixes = [
			'',
			'K',
			'M',
			'B',
			'T',
			'Qa',
			'Qi',
			'Sx',
			'Sp',
			'Oc',
			'No',
			'De',
			'Un',
			'Do',
			'Tr',
			'Qad',
			'Qid',
			'Sxd',
			'Spd',
			'Od',
			'Nd',
			'Vi',
		];

		// Convert the value to a number and take its absolute value
		let absValue = Math.abs(Number(value));
		let returnValue = value;

		// Check if the absolute value is greater than or equal to 1000
		if (absValue >= 1000) {
			// Calculate the index for suffix selection
			const index = Math.max(0, Math.floor(Math.log10(absValue) / 3));

			// Ensure the index is within the range of suffixes
			if (index <= suffixes.length - 1) {
				// Select the appropriate suffix based on the index
				const suffix = suffixes[index];
				// Calculate the adjusted value and concatenate it with the suffix
				returnValue = `${(absValue / Math.pow(10, 3 * index)).toFixed(2)}${suffix}`;
			} else {
				// Number is too large, return in scientific notation
				returnValue = absValue.toExponential(2);
			}
		}

		return returnValue;
	},

	/**
	 * Check if a unit is currently moving
	 * @param {Object} unit - The unit to check
	 * @returns {boolean} True if unit is moving
	 * @throws {Error} If unit parameter is missing
	 */
	isMoving: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (!unit) {
			// throw new Error('unit is a required parameter');
		}

		if (unit._category !== 'unit') {
			// throw new Error('parameter must be a unit');
		}

		return unit.isMoving;
	},

	/**
	 * Get quantity of item type in an item type group
	 * @param {Object} groupName - The item type group to check
	 * @param {string} entityType - The item type to get quantity for
	 * @returns {number} The quantity of the item type in the group
	 * @throws {Error} If required parameters are missing
	 */
	quantityOfTypeInTypeGroup: function (groupName, entityType) {
		if (!groupName) {
			// throw new Error('groupName is a required parameter');
		}
		if (!entityType) {
			// throw new Error('entityType is a required parameter');
		}

		var returnValue = null;
		var variableObj = taro.script.moddScriptParam.getVariableObject(groupName).value;

		if (variableObj && variableObj[entityType]) {
			returnValue = variableObj[entityType].quantity;
		}

		return returnValue;
	},

	/**
	 * Get the quantity of an item
	 * @param {Object} item - The item to check
	 * @returns {number} The item quantity
	 * @throws {Error} If item parameter is missing
	 */
	itemQuantity: function (item) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (!item) {
			// throw new Error('item is a required parameter');
		}

		var returnValue = null;
		if (item._category === 'item') {
			returnValue = item._stats.quantity;
		}
		return returnValue;
	},

	/**
	 * Get the maximum quantity of an item
	 * @param {Object} item - The item to check
	 * @returns {number} The item's maximum quantity
	 * @throws {Error} If item parameter is missing
	 */
	itemMaxQuantity: function (item) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (!item) {
			// throw new Error('item is a required parameter');
		}

		var returnValue = null;
		if (item._category === 'item') {
			returnValue = item._stats.maxQuantity;
		}
		return returnValue;
	},

	/**
	 * Get default attribute value for a unit type
	 * @param {string} attributeTypeId - The attribute type ID
	 * @param {string} entityTypeId - The entity type ID
	 * @returns {number} The default attribute value
	 * @throws {Error} If required parameters are missing
	 */
	defaultAttributeValue: function (attributeName, entityTypeId) {
		if (!attributeName || !entityTypeId) {
			// throw new Error('attributeName and entityType are required parameters');
		}

		let { entityType, entityTypeData } = taro.script.moddScriptParam._getEntityCategoryAndAsset(entityTypeId);
		var entityTypeId = taro.game.cloneAsset('entityCategory', entityTypeData);
		let attributeTypeId = taro.script.moddScriptParam._getAttributeIdByName(entityType, attributeName);
		if (entityTypeId && entityTypeId.attributes && entityTypeId.attributes[attributeTypeId]) {
			return entityTypeId.attributes[attributeTypeId].value;
		}

		return null;
	},

	/**
	 * Get the last clicked UI element ID for a player
	 * @param {Player} player - Player to get UI element for
	 * @returns {string} ID of last clicked UI element
	 * @throws {Error} If player parameter is missing
	 */
	lastClickedUiElementId: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}

		var returnValue = null;
		if (player._category === 'player') {
			returnValue = player.lastHtmlUiClickData.id;
		}
		return returnValue;
	},

	/**
	 * Get the last message sent by a player
	 * @param {Player} player - Player to get message for
	 * @returns {string} Last message sent
	 * @throws {Error} If player parameter is missing
	 */
	lastPlayerMessage: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}

		var returnValue = null;
		if (player._category === 'player') {
			returnValue = player.lastMessageSent;
		}
		return returnValue;
	},

	/**
	 * Get the realtime CSS for a player
	 * @param {Player} player - Player to get CSS for
	 * @returns {Object} Realtime CSS object
	 * @throws {Error} If player parameter is missing
	 */
	realtimeCSSOfPlayer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}

		var returnValue = null;
		if (player._category === 'player') {
			returnValue = player.realtimeCSS;
			if (returnValue && typeof returnValue === 'object') {
				Object.defineProperty(returnValue, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
		}
		return returnValue;
	},

	/**
	 * Get the last custom input for a player
	 * @param {Player} player - Player to get input for
	 * @returns {*} The last custom input value
	 * @throws {Error} If player parameter is missing
	 */
	customInput: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}

		var returnValue = null;
		if (player._category === 'player') {
			returnValue = player.lastCustomInput;
		}

		return returnValue;
	},

	/**
	 *
	 * @param {*} player
	 * @returns {string} The current dialogue id of the player
	 * @throws {Error} If player parameter is missing
	 */

	currentDialogue: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}
		var returnValue = null;
		if (player._category === 'player') {
			returnValue = player._stats.currentOpenedDialogue;
		}

		return returnValue;
	},

	/**
	 * Get quest object for a player and quest ID
	 * @param {Player} player - Player to get quest for
	 * @param {string} questId - ID of quest to get
	 * @returns {Object} Quest object
	 * @throws {Error} If required parameters are missing
	 */
	questObject: function (player, questId) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player || !questId) {
			// throw new Error('player and questId are required parameters');
		}

		player?.quest.init(player);
		var quests = player.quests;
		var gameId = taro.game.data.defaultData._id;
		var returnValue = null;

		if (quests && quests.active[gameId][questId]) {
			returnValue = quests.active[gameId][questId];
			if (returnValue && typeof returnValue === 'object') {
				Object.defineProperty(returnValue, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
		}

		return returnValue;
	},

	/**
	 * Get all active quests in current map for a player
	 * @param {Player} player - Player to get quests for
	 * @returns {Object} Active quests in current map
	 * @throws {Error} If player parameter is missing
	 */
	activeQuestObjectsInThisMap: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}

		player?.quest.init(player);
		var quests = player.quests;
		var gameId = taro.game.data.defaultData._id;
		var returnValue = null;

		if (quests && quests.active) {
			returnValue = quests.active[gameId];
			if (returnValue && typeof returnValue === 'object') {
				Object.defineProperty(returnValue, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
		}

		return returnValue;
	},

	/**
	 * Get all active quests for a player
	 * @param {Player} player - Player to get quests for
	 * @returns {Object} All active quests
	 * @throws {Error} If player parameter is missing
	 */
	activeQuestObjects: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}

		player?.quest.init(player);
		var quests = player.quests;
		var returnValue = null;

		if (quests && quests.active) {
			returnValue = quests.active;
			if (returnValue && typeof returnValue === 'object') {
				Object.defineProperty(returnValue, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
		}

		return returnValue;
	},

	/**
	 * Get progress for a specific quest
	 * @param {Player} player - Player to get quest progress for
	 * @param {string} questId - ID of quest to get progress for
	 * @returns {number} Quest progress
	 * @throws {Error} If required parameters are missing
	 */
	questProgress: function (player, questId) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player || !questId) {
			// throw new Error('player and questId are required parameters');
		}

		player?.quest.init(player);
		var quests = player.quests;
		var gameId = taro.game.data.defaultData._id;
		var returnValue = null;

		if (quests && quests.active[gameId][questId]) {
			returnValue = quests.active[gameId][questId].progress;
		}

		return returnValue;
	},

	/**
	 * Check if a quest's progress is completed
	 * @param {Player} player - Player to check quest for
	 * @param {string} questId - ID of quest to check
	 * @returns {boolean} True if quest progress equals goal
	 * @throws {Error} If required parameters are missing
	 */
	isQuestProgressCompleted: function (player, questId) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player || !questId) {
			// throw new Error('player and questId are required parameters');
		}

		player?.quest.init(player);
		var quests = player.quests;
		var gameId = taro.game.data.defaultData._id;
		var returnValue = false;

		if (quests && quests.active && quests.active[gameId][questId]) {
			returnValue = quests.active[gameId][questId].progress === quests.active[gameId][questId].goal;
		}

		return returnValue;
	},

	/**
	 * Check if a quest is completed
	 * @param {Player} player - Player to check quest for
	 * @param {string} questId - ID of quest to check
	 * @returns {boolean} True if quest is completed
	 * @throws {Error} If required parameters are missing
	 */
	isQuestCompleted: function (player, questId) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player || !questId) {
			// throw new Error('player and questId are required parameters');
		}

		player?.quest.init(player);
		var quests = player.quests;
		var gameId = taro.game.data.defaultData._id;
		var returnValue = false;

		if (quests && quests.completed && quests.completed[gameId]) {
			returnValue = quests.completed[gameId].includes(questId);
		}

		return returnValue;
	},
	/**
	 * Check if two entities are touching each other
	 * @param {Object} sourceEntity - First entity to check
	 * @param {Object} targetEntity - Second entity to check
	 * @returns {boolean} True if entities are touching
	 * @throws {Error} If either entity parameter is not provided
	 */
	areEntitiesTouching: function (sourceEntity, targetEntity) {
		if (sourceEntity && typeof sourceEntity.id === 'function') sourceEntity = taro.$(sourceEntity.id());
		if (targetEntity && typeof targetEntity.id === 'function') targetEntity = taro.$(targetEntity.id());
		if (!sourceEntity || !targetEntity) {
			// throw new Error('sourceEntity and targetEntity are required parameters');
		}

		var sourceContactEntities = Object.keys(sourceEntity.bodiesInContact || {});
		return sourceContactEntities.includes(targetEntity.id());
	},

	/**
	 * Check if a player is logged in
	 * @param {Player} player - Player to check
	 * @returns {boolean} True if player is logged in
	 * @throws {Error} If player parameter is not provided
	 */
	isPlayerLoggedIn: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}
		return !!(player && player._stats.userId);
	},

	/**
	 * Check if a player has adblock enabled
	 * @param {Player} player - Player to check
	 * @returns {boolean} True if player has adblock enabled
	 * @throws {Error} If player parameter is not provided
	 */
	adblockEnabled: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!player) {
			// throw new Error('player is a required parameter');
		}
		return !!(player && player._stats.isAdBlockEnabled);
	},

	/**
	 * Check if an item fires projectiles
	 * @param {Object} item - Item to check
	 * @returns {boolean} True if item fires projectiles
	 * @throws {Error} If item parameter is not provided
	 */
	itemFiresProjectiles: function (item) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (!item) {
			// throw new Error('item is a required parameter');
		}
		return item._stats.isGun && item._stats.bulletType !== 'raycast';
	},

	/**
	 * Check if a unit is carrying an item type
	 * @param {Object} unit - Unit to check
	 * @param {string} itemType - Item type to check for
	 * @returns {boolean} True if unit is carrying the item type
	 */
	isCarryingItemType: function (unit, itemType) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (!unit || !itemType) {
			// throw new Error('unit and itemType are required parameters');
		}

		if (unit._category === 'unit' && unit.inventory) {
			return unit.inventory.hasItem(itemType);
		}
	},

	/**
	 * Check if a unit is inside a region
	 * @param {Object} region - Region to check
	 * @param {Object} entity - Entity to check
	 * @returns {boolean} True if entity is in region
	 */
	entityIsInRegion: function (region, entity) {
		if (region && typeof region.id === 'function') region = taro.$(region.id());
		if (!region || !entity) {
			return false;
		}

		// if region is an instance of TaroRegion component
		if (region._stats && region._stats.currentBody) {
			['width', 'height', 'depth'].forEach((k) => {
				region[k] = region._stats.currentBody[k];
			});
			region.x = region._translate.x - region._stats.currentBody.width / 2;
			region.y = region._translate.y - region._stats.currentBody.height / 2;
			region.z = region.translateZ - region._stats.currentBody.depth / 2;
		}

		// region is either dynamic or a variable with {x, y, height, width} properties
		return taro.physics.getEntitiesInRegion(region).some((e) => e.id() === entity.id());
	},

	/**
	 * Retrieve a variable object by its name, optionally considering an entity's context.
	 * @param {string} variableName - The name of the variable to retrieve.
	 * @param {Entity} [entity] - Optional entity to consider for entity-specific variables.
	 * @returns {dataType: string, value: any, default?:any} The variable object.
	 */
	getVariableObject: function (variableName, entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		//entity variables
		if (entity?.variables && variableName) {
			var entityVar = entity.variables[variableName];
			if (entityVar && typeof entityVar === 'object') {
				this._setFromParam(entityVar);
			}
			return entityVar;
		}

		// global variables
		var variable = taro.game.data.variables[variableName];
		if (variable) {
			// if variable's current value isn't set, set value as default
			if (variable.value == undefined && variable.default != undefined) {
				if (variable.dataType == 'player' || variable.dataType == 'unit') {
					variable.value = taro.game[variable.default];
				} else if (variable.dataType == 'region') {
					var region = taro.regionManager.getRegionById(variableName);
					variable.value = region || variable.default;
					variable.value.key = variableName;
					if (variable.value && typeof variable.value === 'object') {
						this._setFromParam(variable.value);
					}
					return variable.value;
				} else {
					variable.value = variable.default;
				}

				// after retrieving variable data, nullify the default value,
				// otherwise, if .value is set to null intentionally, default value will be returned instead.
				variable.default = null;
			}

			if (variable && typeof variable === 'object') {
				this._setFromParam(variable);
			}
			return variable;
		}
		return null;
	},

	/**
	 * Get the value of a variable
	 * @param {string} variableName - Name of variable to get value for
	 * @param {Entity} [entity] - Optional entity to check for entity-specific variables
	 * @returns {*} The current value of the variable
	 */
	getVariable: function (variableName, entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		const varObject = taro.script.moddScriptParam.getVariableObject(variableName, entity);
		if (varObject) {
			if (['projectile', 'item', 'unit', 'player', 'region', 'prop'].includes(varObject.dataType)) {
				var entityValue = this._createFakeEntity(varObject.value);
				if (entityValue && typeof entityValue === 'object') {
					Object.defineProperty(entityValue, '_from', {
						value: 'param',
						enumerable: false,
						configurable: true,
						writable: true,
					});
				}
				return entityValue;
			}
			if (typeof varObject?.value === 'object') {
				this._setFromParam(varObject.value);
			}
			return varObject?.value;
		}
	},

	/**
	 * Get the data type of a variable
	 * @param {string} variableName - Name of variable to get type for
	 * @param {Entity} [entity] - Optional entity to check for entity-specific variables
	 * @returns {string} The data type of the variable ('player', 'unit', 'region', etc)
	 */
	getVariableType: function (variableName, entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		return taro.script.moddScriptParam.getVariableObject(variableName, entity)?.dataType;
	},

	/**
	 * Get all variables of specified types
	 * @param {string[]} selectedTypes - Types of variables to get
	 * @returns {Object} Object containing all matching variables
	 */
	allVariables: function (selectedTypes) {
		var returnObj = {};

		for (var variableName in taro.game.data.variables) {
			var variable = taro.game.data.variables[variableName];

			if (!selectedTypes || selectedTypes.includes(variable.dataType)) {
				// if variable's current value isn't set, set value as default
				if (variable.value == undefined && variable.default != undefined) {
					if (variable.dataType == 'player' || variable.dataType == 'unit') {
						variable.value = taro.game[variable.default];
					} else if (variable.dataType == 'region') {
						var region = taro.regionManager.getRegionById(variableName);
						variable.value = region || variable.default;
						variable.value.key = variableName;
						return variable.value;
					} else {
						variable.value = variable.default;
					}

					// after retrieving variable data, nullify the default value,
					// otherwise, if .value is set to null intentionally, default value will be returned instead.
					variable.default = null;
				}

				returnObj[variableName] = variable.value;
			}
		}

		Object.defineProperty(returnObj, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return returnObj;
	},

	/**
	 * Get a random number between min and max values
	 * @param {number} min
	 * @param {number} max
	 * @returns {number} Random number between min and max
	 */
	randomNumberBetween: function (min, max) {
		var randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
		return randomNumber;
	},

	/* string */

	/**
	 * Get the current game ID
	 * @returns {string} The game ID
	 */
	gameId: function () {
		return taro.game.data.defaultData._id;
	},

	/**
	 * Get the last received POST response
	 * @returns {*} The last POST response
	 */
	lastReceivedPostResponse: function () {
		return taro.game.lastReceivedPostResponse;
	},

	/**
	 * Get the last received treasury balance
	 * @returns {number} The last received treasury balance
	 */
	lastReceivedTreasuryBalance: function () {
		return taro.game.lastReceivedTreasuryBalance;
	},

	/**
	 * Get name of last updated variable
	 * @returns {string} Name of last updated variable
	 */
	lastUpdatedVariableName: function () {
		return taro.game.lastUpdatedVariableName;
	},

	/**
	 * Get the player that triggered the current action
	 * @returns {Object|undefined} The triggering player entity
	 */
	triggeringPlayer: function () {
		if (
			taro.script.moddScriptParam.varsFromTrigger &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy.playerId
		) {
			var id = taro.script.moddScriptParam.varsFromTrigger.triggeredBy.playerId;
			var player = this._createFakeEntity(id);
			if (player && typeof player === 'object') {
				Object.defineProperty(player, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return player;
		}
	},

	/**
	 * Get details of the item that was purchased
	 * @returns {Object|undefined} The purchased item details object, only available when "player purchases an item" trigger is fired
	 */
	purchasedItemDetails: function () {
		if (taro.script.moddScriptParam.varsFromTrigger?.triggeredBy?.purchasedItemDetails) {
			const purchasedItemDetails = taro.script.moddScriptParam.varsFromTrigger.triggeredBy.purchasedItemDetails;
			if (purchasedItemDetails && typeof purchasedItemDetails === 'object') {
				Object.defineProperty(purchasedItemDetails, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return purchasedItemDetails;
		} else {
			taro.script.errorLog(
				'purchasedItemDetails: item details not found. this parameter is only defined when "player purchases an item" trigger is fired',
				`${taro.script.moddScriptParam._script._entity._id}/${taro.script.moddScriptParam._script.currentScriptId}/${taro.script.moddScriptParam._script.currentActionName}/${taro.script.moddScriptParam._script.currentActionLineNumber}`,
				true
			);
		}
	},

	/**
	 * Get player type of a player
	 * @param {Player} player - The player
	 * @returns {string|undefined} The player type ID
	 */
	playerTypeOfPlayer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._category == 'player') {
			return player._stats.playerTypeId;
		}
	},

	/**
	 * Get the owner of an entity
	 * @param {Entity} entity - The entity
	 * @returns {Player|Unit} player or unit
	 */
	owner: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (!entity) {
			// throw new Error('Entity must be defined to get owner');
		}

		if (entity._category == 'item') {
			var owner = entity.getOwnerUnit();

			if (owner) {
				owner = this._createFakeEntity(owner.id());
				Object.defineProperty(owner, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
				return owner;
			}
		}

		if (entity._category == 'sensor') {
			var owner = this._createFakeEntity(entity.ownerUnitId);
			if (owner && typeof owner === 'object') {
				Object.defineProperty(owner, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return owner;
		}

		if (entity._category == 'unit') {
			var owner = entity.getOwner();
			if (owner && typeof owner === 'object') {
				owner = this._createFakeEntity(owner.id());
				Object.defineProperty(owner, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return owner;
		}
	},

	/**
	 * Check if player is controlled by a human or a bot
	 * @param {Player} player - The player
	 * @returns {boolean} True if player is human controlled
	 */
	isControlledByHumanOrBot: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		return player && player._stats.controlledBy == 'human';
	},

	/**
	 * Check if player is on mobile device
	 * @param {Player} player - The player
	 * @returns {boolean} True if player is on mobile
	 */
	isOnMobile: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		return !!(player && player._stats.isMobile);
	},

	/**
	 * Get entity bounds
	 * @param {Entity} entity
	 * @returns {Object|undefined} The entity bounds
	 */
	bounds: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && taro.script.moddScriptParam._entity.script.action.entityCategories.indexOf(entity._category) > -1) {
			// for sprite-only items that are carried by units
			var bounds = entity.getBounds();
			if (bounds && typeof bounds === 'object') {
				Object.defineProperty(bounds, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return bounds;
		}
	},

	/**
	 * Get computer player by number
	 * @param {number} number
	 * @returns {Player|undefined} The computer player entity
	 */
	computerPlayer: function (number) {
		var player = taro.game.getComputerPlayerByNumber(number);
		if (player && typeof player === 'object') {
			Object.defineProperty(player, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return player;
	},

	/**
	 * Get the entity that triggered the current action
	 * @returns {Entity|undefined} The triggering entity
	 */
	triggeringEntity: function () {
		if (
			taro.script.moddScriptParam.varsFromTrigger &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy.entityId
		) {
			var id = taro.script.moddScriptParam.varsFromTrigger.triggeredBy.entityId;
			var entity = this._createFakeEntity(id);
			if (entity && typeof entity === 'object') {
				Object.defineProperty(entity, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return entity;
		}
	},

	/* unit */

	/**
	 * Get the unit that triggered the current action
	 * @returns {Unit|undefined} The triggering unit
	 */
	triggeringUnit: function () {
		if (
			taro.script.moddScriptParam.varsFromTrigger &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy.unitId
		) {
			var id = taro.script.moddScriptParam.varsFromTrigger.triggeredBy.unitId;
			var unit = this._createFakeEntity(id);
			if (unit && typeof unit === 'object') {
				Object.defineProperty(unit, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return unit;
		}
	},

	/**
	 * Get the prop that triggered the current action
	 * @returns {Prop|undefined} The triggering prop
	 */
	triggeringProp: function () {
		if (
			taro.script.moddScriptParam.varsFromTrigger &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy.propId
		) {
			var id = taro.script.moddScriptParam.varsFromTrigger.triggeredBy.propId;
			var prop = this._createFakeEntity(id);
			if (prop && typeof prop === 'object') {
				Object.defineProperty(prop, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return prop;
		}
	},

	/**
	 * Get the last created unit
	 * @returns {Unit|undefined} The last created unit
	 */
	lastCreatedUnit: function () {
		var id = taro.game.lastCreatedUnitId;
		var unit = this._createFakeEntity(id);
		if (unit && typeof unit === 'object') {
			Object.defineProperty(unit, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return unit;
	},

	/**
	 *
	 * @returns {number} player count
	 */
	playerCount: function () {
		return taro.getPlayerCount();
	},

	/**
	 * Get the last created prop
	 * @returns {Prop|undefined} The last created prop
	 */
	lastCreatedProp: function () {
		var id = taro.game.lastCreatedPropId;
		var prop = this._createFakeEntity(id);
		if (prop && typeof prop === 'object') {
			Object.defineProperty(prop, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return prop;
	},

	/**
	 * Checks if a role exists for a given player.
	 *
	 * @param {Player} player - The player to check the role for.
	 * @param {string} name - The name of the role to check.
	 * @returns {boolean} True if the role exists for the player, false otherwise.
	 */
	roleExistsForPlayer: function (player, name) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		var role = (taro.game.data.roles || []).find((role) => role.name === name);
		var roleId = role && role._id;

		return roleId && player && (player._stats.roleIds || []).includes(roleId);
	},

	/**
	 * Returns the last chat message sent by a player.
	 *
	 * @returns {string} The last chat message sent by a player.
	 */
	lastChatMessageSentByPlayer: function () {
		return taro.game.lastChatMessageSentByPlayer;
	},

	/**
	 * Returns the selected unit for a given player.
	 *
	 * @param {Player} player - The player to get the selected unit for.
	 * @returns {Unit|undefined} The selected unit or undefined if not found.
	 */
	selectedUnit: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		var unit = this._createFakeEntity(player?._stats?.selectedUnitId);
		if (unit && typeof unit === 'object') {
			Object.defineProperty(unit, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return unit;
	},

	/**
	 * Get source unit of a projectile
	 * @param {Projectile} projectile
	 * @returns {(Unit|undefined)} The source unit
	 */
	sourceUnit: function (projectile) {
		if (projectile && typeof projectile.id === 'function') projectile = taro.$(projectile.id());
		if (projectile && projectile._category == 'projectile') {
			var sourceUnitId = projectile._stats.sourceUnitId;
			unit = this._createFakeEntity(sourceUnitId);

			Object.defineProperty(unit, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return unit;
		}
	},
	/**
	 * Get all units in a region
	 * @param {Region} region
	 * @returns {Entity[]} Array of units in the region
	 */
	allUnitsInRegion: function (region) {
		if (region && typeof region.id === 'function') region = taro.$(region.id());
		// if we have the properties needed to get the units in a region

		if (region) {
			var regionBounds = region._stats ? region._stats.default : region;
			var units = taro.physics.getEntitiesInRegion(regionBounds).filter(({ _category }) => {
				return _category === 'unit';
			});

			units = units.map((e) => this._createFakeEntity(e.id()));
			units.forEach(function (unit) {
				if (unit && typeof unit === 'object') {
					Object.defineProperty(unit, '_from', {
						value: 'param',
						enumerable: false,
						configurable: true,
						writable: true,
					});
				}
			});
			Object.defineProperty(units, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return units;
		} else {
			// the entire map
			return [];
		}
	},

	/**
	 * Returns all units of a given unit type.
	 *
	 * @param {UnitTypeId} unitTypeId - The ID of the unit type to get units for.
	 * @returns {Unit[]} Array of units of the specified type.
	 */
	allUnitsOfUnitTypeId: function (unitTypeId) {
		var units = _.filter(taro.$$('unit'), (unit) => {
			return unit._stats.type == unitTypeId;
		}).map((e) => {
			const o = this._createFakeEntity(e.id());

			Object.defineProperty(o, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return o;
		});
		Object.defineProperty(units, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return units;
	},

	/**
	 * get number of players of playerType
	 * @param {PlayerTypeId} playerTypeId
	 * @returns
	 */
	numberOfPlayersOfPlayerTypeId: function (playerTypeId) {
		var players = taro.$$('player').filter((player) => {
			return player._stats.playerTypeId === playerTypeId;
		});

		return players.length;
	},

	/**
	 * Returns an object from the engine's object register by
	 * the object's id. If the item passed is not a string id
	 * then the item is returned as is. If no item is passed
	 * the engine itself is returned.
	 * @param {String || Object} id The id of the item to return,
	 * @returns {AllEntity | undefined} entity
	 * or if an object, returns the object as-is.
	 */
	getEntityById: function (id) {
		if (typeof id === 'number' && !isNaN(id)) {
			id = id.toString();
		}

		if (typeof id === 'string') {
			var entity = {
				_id: id,
				id: function () {
					return this._id;
				},
			};
			if (entity && typeof entity === 'object') {
				Object.defineProperty(entity, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return entity;
		}

		return undefined;
		// return this;
	},

	/**
	 * Returns an array of all objects that have been assigned
	 * the passed category name.
	 * @param {String} categoryName The name of the category to return
	 * all objects for.
	 */
	getEntitiesByCategory: function (categoryName) {
		var returnArray = taro._categoryRegister[categoryName] || new TaroArray();
		var entities = returnArray.filter(({ _isBeingRemoved }) => {
			return _isBeingRemoved != true;
		});
		entities.forEach(function (entity) {
			if (entity && typeof entity === 'object') {
				Object.defineProperty(entity, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
		});
		Object.defineProperty(entities, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return entities;
	},

	/**
	 * Returns an array of all objects that have been assigned
	 * the passed group name.
	 * @param {String} groupName The name of the group to return
	 * all objects for.
	 */
	getEntitiesByGroup: function (groupName) {
		var entities = taro._groupRegister[groupName] || new TaroArray();
		entities.forEach(function (entity) {
			if (entity && typeof entity === 'object') {
				Object.defineProperty(entity, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
		});
		Object.defineProperty(entities, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return entities;
	},

	/* unit type */
	/**
	 * Get number of units of a specific unit type
	 * @param {UnitTypeId} unitTypeId - The unitType
	 * @returns {number} Number of units of that type
	 */
	numberOfUnitsOfUnitType: function (unitTypeId) {
		var units = taro.$$('unit').filter((unit) => {
			// this needs to be optimized
			return unit._stats.type === unitTypeId;
		});

		return units.length;
	},

	/* item */

	/**
	 * Get the item that triggered the current action
	 * @returns {Item|undefined} The triggering item
	 */
	triggeringItem: function () {
		if (
			taro.script.moddScriptParam.varsFromTrigger &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy.itemId
		) {
			var id = taro.script.moddScriptParam.varsFromTrigger.triggeredBy.itemId;
			var item = this._createFakeEntity(id);
			if (item && typeof item === 'object') {
				Object.defineProperty(item, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return item;
		}
	},

	/**
	 * Get source item of a projectile
	 * @param {Object} projectile
	 * @returns {Object|undefined} The source item
	 */
	sourceItem: function (projectile) {
		if (projectile && typeof projectile.id === 'function') projectile = taro.$(projectile.id());
		if (projectile && projectile._category == 'projectile') {
			var item = projectile.getSourceItem();

			if (item) {
				Object.defineProperty(item, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
				return item;
			}
		}
	},

	/**
	 * Get item currently held by a unit
	 * @param {Object} unit
	 * @returns {Object|undefined} The held item
	 */
	currentlyHeldItem: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			var item = unit.getCurrentItem();
			if (item && typeof item.id === 'function') {
				const o = (item = this._createFakeEntity(item.id()));
				Object.defineProperty(item, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
				return o;
			}
		}
	},

	/**
	 * Get all items owned by a unit
	 * @param {Unit} unit
	 * @returns {Item[]} Array of items owned by the unit
	 */
	allOwnedItems: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		var items = taro
			.$$('item') // this needs to be optimized
			.filter(function (item) {
				return item._stats.ownerUnitId == unit.id();
			});
		items.forEach(function (item) {
			if (item && typeof item === 'object') {
				Object.defineProperty(item, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
		});
		Object.defineProperty(items, '_from', {
			value: 'param',
			enumerable: false,
			configurable: true,
			writable: true,
		});
		return items;
	},

	/* projectile */

	/**
	 * Get the last touched projectile
	 * @returns {Projectile|undefined} The last touched projectile
	 */
	lastTouchedProjectile: function () {
		var id = taro.game.lastTouchedProjectileId;
		projectile = this._createFakeEntity(id);

		if (projectile && projectile._category == 'projectile') {
			Object.defineProperty(projectile, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return projectile;
		}
	},

	/**
	 * Get type of entity/attribute
	 * @param {Player|Item|Unit|Prop|Attribute} entity
	 * @returns {string|undefined} The projectile type
	 */
	typeId: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		// get projectile type of projectile
		if (entity) {
			// attributes
			if (entity.type) {
				return entity.type;
			}

			if (entity._category == 'player') {
				return entity._stats.playerTypeId;
			}

			if (entity._category == 'item') {
				return entity._stats.itemTypeId;
			}

			return entity._stats.type;
		} else {
			ParameterComponent.prototype.log('entity not defined');
		}
	},

	/* sensor */

	/**
	 * Get the sensor that triggered the current action
	 * @returns {Object|undefined} The triggering sensor
	 */
	triggeringSensor: function () {
		if (
			taro.script.moddScriptParam.varsFromTrigger &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy.sensorId
		) {
			var id = taro.script.moddScriptParam.varsFromTrigger.triggeredBy.sensorId;
			var sensor = this._createFakeEntity(id);
			if (sensor && typeof sensor === 'object') {
				Object.defineProperty(sensor, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return sensor;
		}
	},

	/**
	 * Get the sensor of a unit
	 * @param {Object} unit
	 * @returns {Object|undefined} The sensor
	 */
	sensor: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			var sensor = unit.sensor;

			Object.defineProperty(sensor, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});

			return sensor;
		}
	},

	/**
	 * Get the projectile that triggered the current action
	 * @returns {Object|undefined} The triggering projectile
	 */
	triggeringProjectile: function () {
		if (
			taro.script.moddScriptParam.varsFromTrigger &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy.projectileId
		) {
			var id = taro.script.moddScriptParam.varsFromTrigger.triggeredBy.projectileId;
			var projectile = this._createFakeEntity(id);
			if (projectile && typeof projectile === 'object') {
				Object.defineProperty(projectile, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return projectile;
		}
	},

	/* region */
	/**
	 * Get the region that triggered the current action
	 * @returns {Object|undefined} The triggering region
	 */
	triggeringRegion: function () {
		if (
			taro.script.moddScriptParam.varsFromTrigger &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy.region
		) {
			var region = taro.script.moddScriptParam.varsFromTrigger.triggeredBy.region;
			if (region && typeof region === 'object') {
				Object.defineProperty(region, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return region;
		}
	},

	/**
	 * Get region by name
	 * @param {Object} name
	 * @returns {Object|undefined} The region
	 */
	getRegionByName: function (regionName) {
		if (regionName) {
			var region = taro.regionManager.getRegionById(regionName);
			if (region && typeof region === 'object') {
				Object.defineProperty(region, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return region;
		}
	},

	/**
	 * Calculate the angle between two positions
	 * @param {Object} positionA - The first position
	 * @param {Object} positionB - The second position
	 * @returns {number|undefined} The angle in radians, or undefined if positions are not valid
	 */
	angleBetweenPositions: function (positionA, positionB) {
		if (
			positionA != undefined &&
			positionB != undefined &&
			(positionB.y - positionA.y != 0 || positionB.x - positionA.x != 0) // two positions should be different
		) {
			return Math.atan2(positionB.y - positionA.y, positionB.x - positionA.x) + Math.radians(90);
		}
	},

	/**
	 * Check if two regions overlap
	 * @param {Object} regionA
	 * @param {Object} regionB
	 * @returns {boolean} True if regions overlap
	 */
	regionOverlapsWithRegion: function (regionA, regionB) {
		if (regionA && typeof regionA.id === 'function') regionA = taro.$(regionA.id());
		if (regionB && typeof regionB.id === 'function') regionB = taro.$(regionB.id());
		if (!regionA || !regionB) {
			return false;
		}
		if (regionA._category == 'region') {
			regionA = regionA.getBounds();
		}
		if (regionB._category == 'region') {
			regionB = regionB.getBounds();
		}
		if (regionA && regionB) {
			regionA = new TaroRect(regionA.x, regionA.y, regionA.width, regionA.height);
			regionB = new TaroRect(regionB.x, regionB.y, regionB.width, regionB.height);
			return regionA.intersects(regionB);
		}
	},

	/**
	 * Get name of triggering variable
	 * @returns {string|undefined} The variable name
	 */
	triggeringVariableName: function () {
		if (
			taro.script.moddScriptParam.varsFromTrigger &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy.variableName
		) {
			return taro.script.moddScriptParam.varsFromTrigger.triggeredBy.variableName;
		}
	},

	/* attribute */

	/**
	 * Get triggering attribute
	 * @returns {*} The attribute
	 */
	triggeringAttribute: function () {
		if (
			taro.script.moddScriptParam.varsFromTrigger &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy &&
			taro.script.moddScriptParam.varsFromTrigger.triggeredBy.attribute
		) {
			var attribute = taro.script.moddScriptParam.varsFromTrigger.triggeredBy.attribute;
			if (attribute && typeof attribute === 'object') {
				Object.defineProperty(attribute, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return attribute;
		}
	},
	/**
	 * Check if a player is controlled by computer AI
	 * @param {Player} player - The player to check
	 * @returns {boolean} True if player is computer controlled
	 */
	isComputerPlayer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		return player && player._stats.controlledBy == 'computer';
	},

	/**
	 * Check if a player is a bot
	 * @param {Player} player - The player to check
	 * @returns {boolean} True if player is a bot
	 */
	isBot: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		return player && player._stats.isBot;
	},

	/**
	 * Get client received data
	 * @param {Player} player - The player
	 * @returns {Object} The client received data
	 */
	clientReceivedData: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (taro.isServer) {
			if (player) {
				var data = player.lastClientReceivedData || {};
				if (data && typeof data === 'object') {
					Object.defineProperty(data, '_from', {
						value: 'param',
						enumerable: false,
						configurable: true,
						writable: true,
					});
				}
				return data;
			}
		}
	},

	/**
	 * Get item type inventory URL
	 * @param {Object} itemTypeId - The itemTypeId
	 * @returns {string} The inventory image URL
	 */
	itemTypeInventoryUrl: function (itemTypeId) {
		var itemType = taro.game.data.itemTypes[itemTypeId];

		if (itemType) {
			return itemType.inventoryImage;
		} else {
			return '';
		}
	},

	/**
	 * Get number of invites by player
	 * @param {Player} player - The player
	 * @returns {number} Number of invites
	 */
	numberOfInvites: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player) {
			return player._stats.invitedUsersCount || 0;
		}
	},

	/**
	 * Get wallet address
	 * @param {Player} player - The player
	 * @returns {string} The wallet address
	 */
	walletAddress: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (taro.isServer) {
			if (player) {
				return player._stats.walletAddress || '';
			}
		} else {
			return '';
		}
	},

	/**
	 * Get token swap info
	 * @param {Player} player - The player
	 * @returns {Object} The token swap info
	 */
	tokenSwapInfo: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player) {
			var info = player._stats.lastTokenSwapObject || {};
			if (info && typeof info === 'object') {
				Object.defineProperty(info, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return info;
		}
	},

	/**
	 * Get last requested competition details
	 * @returns {Object} The competition details
	 */
	lastRequestedCompetitionDetails: function () {
		var details = taro.competition.details || {};
		if (details && typeof details === 'object') {
			Object.defineProperty(details, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
		}
		return details;
	},

	/**
	 * Get last requested competition participants
	 * @returns {Array} The competition participants
	 */
	lastRequestedCompetitionParticipants: function () {
		if (taro.isServer) {
			var participants = taro.competition.participants || [];
			if (participants && typeof participants === 'object') {
				Object.defineProperty(participants, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return participants;
		} else {
			return [];
		}
	},

	/**
	 * Get competing players
	 * @returns {Array} The competing players
	 */
	competingPlayers: function () {
		if (taro.isServer) {
			var players = taro.competition.getCompetingPlayers();
			if (players && typeof players === 'object') {
				Object.defineProperty(players, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return players;
		} else {
			return [];
		}
	},

	/**
	 * Calculate direction vector between two positions
	 * @param {Object} positionA - First position with x,y,z coordinates
	 * @param {Object} positionB - Second position with x,y,z coordinates
	 * @returns {Object} Normalized direction vector with x,y,z components
	 */
	directionVectorBetweenPositions: function (positionA, positionB) {
		if (positionA && positionB) {
			const a = positionB.x - positionA.x;
			const b = positionB.y - positionA.y;
			const c = positionB.z - positionA.z;
			const magnitude = Math.sqrt(a * a + b * b + c * c);

			const result = {
				x: a / magnitude,
				y: b / magnitude,
				z: c / magnitude,
			};
			Object.defineProperty(result, '_from', {
				value: 'param',
				enumerable: false,
				configurable: true,
				writable: true,
			});
			return result;
		}
	},

	/**
	 * Calculate 2D distance between two positions
	 * @param {Object} positionA - First position with x,y coordinates
	 * @param {Object} positionB - Second position with x,y coordinates
	 * @returns {number} Distance between the two positions
	 */
	distanceBetweenPositions: function (positionA, positionB) {
		if (positionA && positionB) {
			var a = positionA.x - positionB.x;
			var b = positionA.y - positionB.y;
			return Math.sqrt(a * a + b * b);
		}
	},

	/**
	 * Get player's play time
	 * @param {Player} player - The player
	 * @returns {number} Time difference between join game and current time
	 */
	playTime: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		return player && player._stats.receivedJoinGame - taro.now;
	},

	/**
	 * Get last competition participation cost
	 * @param {Player} player - The player
	 * @returns {number} The last competition participation cost
	 */
	lastCompetitionParticipationCost: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (taro.isServer) {
			return (
				taro.competition.participants.find((participant) => participant.playerUserId === player._stats.userId)
					?.amount || 0
			);
		} else {
			return 0;
		}
	},

	/**
	 * Get last competition reward amount
	 * @param {Player} player - The player
	 * @returns {number} The last competition reward amount
	 */
	lastCompetitionRewardAmount: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (taro.isServer) {
			return (
				taro.competition.participants.find((participant) => participant.playerUserId === player._stats.userId)
					?.rewardAmount || 0
			);
		} else {
			return 0;
		}
	},

	/**
	 * Check if player is an AI agent
	 * @param {Player} player - The player
	 * @returns {boolean} True if player is an AI agent
	 */
	isAiAgent: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		return player?._stats?.agentId?.length > 0;
	},

	/**
	 * Get player agent ID
	 * @param {Player} player - The player
	 * @returns {string} The player agent ID
	 */
	agentId: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		return player?._stats?.agentId || '';
	},

	/**
	 * Get this request data
	 * @returns {Object} The this request data
	 */
	thisRequestData: function () {
		if (taro.isServer) {
			var data = typeof taro.game.thisRequestData === 'object' ? taro.game.thisRequestData : {};
			if (data && typeof data === 'object') {
				Object.defineProperty(data, '_from', {
					value: 'param',
					enumerable: false,
					configurable: true,
					writable: true,
				});
			}
			return data;
		} else {
			return {};
		}
	},
};

