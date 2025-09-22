let action = {
	filterSerializable: function (obj) {
		// Check for circular references or non-objects
		if (Array.isArray(obj)) {
			const result = [];
			obj.forEach((element) => {
				try {
					result.push(JSON.stringify(element));
				} catch (e) { }
			});
			return result;
		} else if (typeof obj === 'object') {
			const result = {};
			Object.entries(obj).forEach(([k, v]) => {
				try {
					result[k] = JSON.stringify(v);
				} catch (e) { }
			});
			return result;
		} else {
			return obj;
		}
	},

	_iter: function (arrayFn, args, fn) {
		taro.script.moddScriptParam[arrayFn.name]?.(...args)?.forEach((i) => {
			const fnString = fn.toString();

			// Extract parameter name from different function formats
			let paramName = 'u'; // default fallback

			if (fnString.includes('=>')) {
				// Arrow function: (param) => {} or param => {}
				const arrowMatch = fnString.match(/\(([^)]+)\)\s*=>/);
				if (arrowMatch) {
					// Multiple parameters: (a, b, c) => {}
					const params = arrowMatch[1].split(',').map((p) => p.trim());
					paramName = params[0];
				} else {
					// Single parameter: param => {}
					const singleParamMatch = fnString.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/);
					if (singleParamMatch) {
						paramName = singleParamMatch[1];
					}
				}
			} else {
				// Regular function: function(param) {}
				const funcMatch = fnString.match(/function\s*\(([^)]+)\)/);
				if (funcMatch) {
					const params = funcMatch[1].split(',').map((p) => p.trim());
					paramName = params[0];
				}
			}

			// Extract function body
			let body;
			if (fnString.includes('=>')) {
				const afterArrow = fnString.split('=>')[1].trim();
				if (afterArrow.startsWith('{') && afterArrow.endsWith('}')) {
					body = afterArrow.slice(1, -1).trim();
				} else {
					// Single expression arrow function
					body = `return ${afterArrow}`;
				}
			} else {
				const bodyMatch = fnString.match(/\{([\s\S]*)\}/);
				body = bodyMatch ? bodyMatch[1].trim() : '';
			}

			const modifiedBody = body
				.replaceAll('param.', 'globalThis.taro.script.moddScriptParam.')
				.replaceAll('action.', 'globalThis.taro.script.moddScriptAction.');

			const newFunction = new Function(paramName, modifiedBody);
			newFunction(i);
		});
	},

	/**
	 * Sends a Player to a Map
	 * @param {Player} player - The Player to send
	 * @param {string} gameId - ID of the destination map
	 */
	sendPlayerToMap: function (player, gameId) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (taro.isServer) {
			if (player && player._stats && player._stats.clientId) {
				taro.workerComponent.sendPlayerToMap(gameId, [player._stats.userId || 'guest']).then((res) => {
					console.log('user switched map', res);
					if (res && res.gameSlug) {
						// ask client to reload game
						taro.network.send(
							'sendPlayerToMap',
							{
								type: 'sendPlayerToMap',
								gameSlug: res.gameSlug,
								gameId: res.gameId,
								autoJoinToken: res.autoJoinTokens[player._stats.userId || 'guest'],
							},
							player._stats.clientId
						);
					}
				});
			}
		}
	},

	/**
	 * Sends a player to a game
	 * @param {Player} player - The player to send
	 * @param {string} gameId - ID of the destination game
	 */
	sendPlayerToGame: function (player, gameId) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (taro.isServer) {
			if (player && player._stats && player._stats.clientId) {
				taro.workerComponent.sendPlayerToGame(gameId).then((res) => {
					if (res && res.gameSlug) {
						// ask client to reload game
						taro.network.send(
							'sendPlayerToGame',
							{
								type: 'sendPlayerToGame',
								gameSlug: res.gameSlug,
								gameId: res.gameId,
							},
							player._stats.clientId
						);
					}
				});
			}
		}
	},

	/**
	 * Sends a group of players to a map
	 * @param {string} gameId - ID of the destination map
	 * @param {Array<Object>} players - Array of players to send
	 */
	sendPlayerGroupToMap: function (gameId, players) {
		if (players) {
			players = players.map((p) => taro.$(p.id()));
		}
		if (taro.isServer) {
			let userIds = [];
			for (let l = 0; l < players.length; l++) {
				let player = taro.$(players[l].id());
				if (player && player._stats && player._stats.clientId && !userIds.includes(player._stats.userId || 'guest')) {
					userIds.push(player._stats.userId || 'guest');
				}
			}
			taro.workerComponent.sendPlayerToMap(gameId, userIds).then((res) => {
				console.log('user switched map', userIds, res);
				if (res && res.gameSlug) {
					for (let l = 0; l < players.length; l++) {
						let player = players[l];
						// ask client to reload game
						taro.network.send(
							'sendPlayerToMap',
							{
								type: 'sendPlayerToMap',
								gameSlug: res.gameSlug,
								gameId: res.gameId,
								autoJoinToken: res.autoJoinTokens[player._stats.userId || 'guest'],
								serverId: res.serverId,
							},
							player._stats.clientId
						);
					}
				}
			});
		}
	},

	/**
	 * Sends a player to their last spawning map
	 * @param {Player} player - The player to send
	 */
	sendPlayerToSpawningMap: function (player) {
		if (taro.isServer) {
			player = taro.$(player.id());
			if (player && player._stats && player._stats.clientId) {
				taro.workerComponent.sendPlayerToMap('lastSpawned', [player._stats.userId || 'guest']).then((res) => {
					console.log('user switched spawning map', res);
					if (res && res.gameSlug) {
						// ask client to reload game
						taro.network.send(
							'sendPlayerToMap',
							{
								type: 'sendPlayerToMap',
								gameSlug: res.gameSlug,
								gameId: res.gameId,
								autoJoinToken: res.autoJoinTokens[player._stats.userId || 'guest'],
							},
							player._stats.clientId
						);
					}
				});
			}
		}
	},

	/**
	 * Add Entity To Entity Group
	 * @param {Entity} entity - The entity to add to the group
	 * @param {String} groupName - Name of the entity group variable
	 */
	addEntityToGroup: function (entity, groupName) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (taro.game.data.variables.hasOwnProperty(groupName)) {
			let group = taro.game.data.variables[groupName];
			group.value ??= [];
			let type = group.dataType;
			if (!type.includes('Group') || type.includes('Type')) {
				// throw new Error(`${groupName} is not a entityGroup`);
			}
			if (`${entity._category}Group` !== type) {
				// throw new Error(`type of entity: ${entity._category} doesn't match ${type}`);
			}

			group.value.push(entity);
			taro.game.lastUpdatedVariableName = groupName;
		} else {
			// throw new Error(`${groupName} is not exist`);
		}
	},

	/**
	 * Remove Entity From Entity Group
	 * @param {Entity} entity - The entity to remove from the group
	 * @param {String} groupName - Name of the entity group variable
	 */
	removeEntityFromGroup: function (entity, groupName) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let groupLength = taro.game.data.variables[groupName]?.value?.length;
		if (groupLength) {
			for (let i = 0; i < groupLength; i++) {
				if (entity._category === 'player') {
					if (taro.game.data.variables[groupName].value[i]?._stats?.clientId == entity?._stats?.clientId) {
						taro.game.data.variables[groupName].value.splice(i, 1);
					}
				} else {
					if (taro.game.data.variables[groupName].value[i]?.id() == entity?.id()) {
						taro.game.data.variables[groupName].value.splice(i, 1);
					}
				}
				break;
			}
		}
	},

	/**
	 * Set Variable
	 * @param {String} variableName - Name of variable to set
	 * @param {*} newValue - New value to set
	 */
	setVariable: function (variableName, newValue) {
		if (newValue && typeof newValue.id === 'function') newValue = taro.$(newValue.id());
		if (taro.game.data.variables.hasOwnProperty(variableName)) {
			taro.game.lastUpdatedVariableName = variableName;
			taro.game.data.variables[variableName].value = newValue;
			// if variable has default field then it will be returned when variable's value is undefined
			if (newValue === undefined && taro.game.data.variables[variableName].hasOwnProperty('default')) {
				taro.game.data.variables[variableName].default = undefined;
			}
		}
		// causing issues so disabled on client for now
		if (taro.isServer) {
			taro.game.updateDevConsole({ type: 'setVariable', params: this.varsFromTrigger });
		}
	},

	/**
	 * Runs a script with given parameters
	 * @param {ScriptIds[keyof ScriptIds]} scriptId - Id of the script to run
	 */
	runScript: function (scriptId) {
		let previousScriptId = this._script.currentScriptId;
		let previousActionBlockIdx = this._script.currentActionLineNumber;
		const scriptParams = {
			...this.varsFromTrigger,
			triggeredFrom: this.varsFromTrigger.isWorldScript ? 'world' : 'map',
		};
		this._script.runScript(scriptId, scriptParams);
		this._script.currentScriptId = previousScriptId;
		this._script.currentActionLineNumber = previousActionBlockIdx;
	},

	/**
	 * Runs a script on an entity
	 * @param {Entity} entity - Entity to run the script on
	 * @param {string} ScriptId - Id of the script to run
	 */
	runEntityScript: function (entity, ScriptId) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let previousScriptId = this._script.currentScriptId;
		let previousActionBlockIdx = this._script.currentActionLineNumber;
		if (entity) {
			if (entity._category === 'unit') {
				this.varsFromTrigger.triggeredBy.unitId = entity.id();
			} else if (entity._category === 'item') {
				this.varsFromTrigger.triggeredBy.itemId = entity.id();
			} else if (entity._category === 'projectile') {
				this.varsFromTrigger.triggeredBy.projectileId = entity.id();
			}
			const scriptParams = {
				...this.varsFromTrigger,
				triggeredFrom: this.varsFromTrigger.isWorldScript ? 'world' : 'map',
			};
			entity.script.runScript(ScriptId, scriptParams);
			this._script.currentScriptId = previousScriptId;
			this._script.currentActionLineNumber = previousActionBlockIdx;
		}
	},

	/**
	 * Runs a script on a client
	 * @param {Player} localPlayer - Player whose client will run the script
	 * @param {string} scriptId - Id of the script to run
	 */
	runScriptOnClient: function (localPlayer, scriptId) {
		if (taro.isServer) {
			if (localPlayer && typeof localPlayer.id === 'function') localPlayer = taro.$(localPlayer.id());
			let previousScriptId = this._script.currentScriptId;
			let previousActionBlockIdx = this._script.currentActionLineNumber;
			const localScriptParams = {
				...this.varsFromTrigger,
				triggeredFrom: this.varsFromTrigger.isWorldScript ? 'world' : 'map',
			};
			localPlayer.streamUpdateData(
				[{ script: { name: scriptId, params: this.filterSerializable(localScriptParams) } }],
				localPlayer._stats.clientId
			);

			this._script.currentScriptId = previousScriptId;
			this._script.currentActionLineNumber = previousActionBlockIdx;
		}
	},

	/**
	 * Runs an entity script on a client
	 * @param {Entity} entity - Entity to run the script on
	 * @param {Player} localPlayer - Player whose client will run the script
	 * @param {string} scriptId - Id of the script to run
	 */
	runEntityScriptOnClient: function (entity, localPlayer, scriptId) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (taro.isServer) {
			let previousScriptId = this._script.currentScriptId;
			let previousActionBlockIdx = this._script.currentActionLineNumber;
			if (entity) {
				if (localPlayer && typeof localPlayer.id === 'function') localPlayer = taro.$(localPlayer.id());
				const localScriptParams = {
					...this.varsFromTrigger,
					triggeredFrom: this.varsFromTrigger.isWorldScript ? 'world' : 'map',
				};
				localPlayer.streamUpdateData(
					[
						{
							script: {
								name: scriptId,
								entityId: entity.id(),
								params: this.filterSerializable(localScriptParams),
							},
						},
					],
					localPlayer._stats.clientId
				);
				this._script.currentScriptId = previousScriptId;
				this._script.currentActionLineNumber = previousActionBlockIdx;
			}
		}
	},

	/**
	 * Transforms a region's dimensions
	 * @param {Region} region - The region to transform
	 * @param {number} x - New x position
	 * @param {number} y - New y position
	 * @param {number} width - New width
	 * @param {number} height - New height
	 */
	transformRegionDimensions: function (region, x, y, width, height) {
		if (region && typeof region.id === 'function') region = taro.$(region.id());
		// regionId seems like unnecessary stream data
		if (region) {
			// this change makes it so we don't stream data that is unchanged
			let data = [
				{ x: x !== region._stats.default.x ? x : null },
				{ y: y !== region._stats.default.y ? y : null },
				{ width: width !== region._stats.default.width ? width : null },
				{ height: height !== region._stats.default.height ? height : null },
			];
			// there's gotta be a better way to do this, i'm just blind right now
			data = data.filter((obj) => obj[Object.keys(obj)[0]] !== null);
			region.streamUpdateData(data);
		}
	},

	/**
	 * Changes a region's color
	 * @param {Region} region - The region to modify
	 * @param {string} insideColor - Color for region interior
	 * @param {number} alpha - Opacity value between 0 and 1
	 */
	setRegionColor: function (region, insideColor, alpha) {
		if (region && typeof region.id === 'function') region = taro.$(region.id());
		if (region) {
			let data = [{ inside: insideColor }, { alpha: alpha }];
			data = data.filter((obj) => obj[Object.keys(obj)[0]] !== null);
			region.streamUpdateData(data);
		}
	},

	/**
	 * Sets the last attacking unit
	 * @param {Unit} unit - The unit that performed the attack
	 */
	setLastAttackingUnit: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		taro.game.lastAttackingUnitId = unit.id();
	},

	/**
	 * Sets the last attacked unit
	 * @param {Unit} unit - The unit that was attacked
	 */
	setLastAttackedUnit: function (unit) {
		taro.game.lastAttackedUnitId = unit.id();
	},

	/**
	 * Sets the last attacking item
	 * @param {Item} item - The item used in the attack
	 */
	setLastAttackingItem: function (item) {
		taro.game.lastAttackingItemId = item.id();
	},

	/**
	 * Kicks a player from the game
	 * @param {Player} player - The player to kick
	 * @param {string} message - Message to show the kicked player
	 */
	kickPlayer: function (player, message) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._category == 'player') {
			taro.game.kickPlayer(player.id(), message);
		}
	},

	/**
	 * Plays an animation on an entity
	 * @param {string} animationTypeId - ID of the animation to play
	 * @param {Entity} entity - Entity to animate
	 */
	playAnimation: function (animationTypeId, entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity) {
			entity.applyAnimationById(animationTypeId);
		}
	},

	/**
	 * Stops playing an animation on an entity
	 * @param {string} animationTypeId - ID of the animation to stop
	 * @param {Entity} entity - Entity to stop animating
	 */
	stopPlayAnimation: function (animationTypeId, entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity) {
			entity.stopAnimationById(animationTypeId);
		}
	},

	/**
	 * Stops all animations currently playing on an entity
	 * @param {Entity} entity - The entity to stop animations for
	 */
	stopAllAnimations: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity) {
			entity.stopAnimationById('');
		}
	},

	/**
	 * Updates a Player's display name
	 * @param {string} name - The new name to set
	 * @param {Player} player - The Player whose name to update
	 */
	setPlayerName: function (name, player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._category == 'player') {
			player.streamUpdateData([{ name: name }]);
		}
	},

	/**
	 * Assigns a new player type to a Player
	 * @param {Player} player - The Player to update
	 * @param {PlayerTypeId} playerTypeId - ID of the new player type to assign
	 */
	assignPlayerType: function (player, playerTypeId) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		// map scripts not allowed to assign player type
		if (taro.game.isWorldMap && !this.varsFromTrigger.isWorldScript) {
			this._script.errorLog('can not update player type from map');
			console.log('can not update player type from map', path, playerTypeId);
			return;
		}

		if (player && player._category == 'player') {
			player.streamUpdateData([{ playerTypeId: playerTypeId }]);
		}
	},

	/**
	 * Updates a Player's variable value
	 * @param {Player} player - The Player whose variable to update
	 * @param {string} variableId - The variable ID
	 * @param {*} value - The new value to set for the variable
	 */
	setPlayerVariable: function (player, variableId, value) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		let playerType = taro.game.getAsset('playerTypes', player._stats.playerTypeId);
		const isWorldPlayerVariable = playerType && playerType.isWorld;

		const canBeUpdatedByMap = playerType?.variables?.[variableId]?.canBeUpdatedByMap;

		if (taro.game.isWorldMap && !this.varsFromTrigger.isWorldScript && isWorldPlayerVariable && !canBeUpdatedByMap) {
			this._script.errorLog(`can not update world player variable from map (variable: ${variableId})`);
			console.log(`can not update world player variable from map (variable: ${variableId})`, path, variableId);
			return;
		}

		player.variable.update(variableId, value);
	},

	/**
	 * Updates an item's description text
	 * @param {Item} item - The item to update
	 * @param {string} description - The new description text
	 */
	setDescriptionOfItem: function (item, description) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (item && description) {
			item.streamUpdateData([{ description: description }]);
		}
	},

	/**
	 * Updates an item's inventory image
	 * @param {Item} item - The item to update
	 * @param {string} url - URL of the new inventory image
	 */
	setItemInventoryImage: function (item, url) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (item && url) {
			item.streamUpdateData([{ inventoryImage: url }]);
		}
	},

	/**
	 * Enables accepting new players into the game
	 */
	startAcceptingPlayers: function () {
		taro.workerComponent.setAcceptingPlayerStatus(true);
	},

	/**
	 * Disables accepting new players into the game
	 */
	stopAcceptingPlayers: function () {
		taro.workerComponent.setAcceptingPlayerStatus(false);
	},

	/**
	 * Saves a unit's persistent data
	 * @param {Unit} unit - The unit whose data to save
	 */
	saveUnitData: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		let ownerPlayer = unit.getOwner();
		let userId = ownerPlayer._stats.userId || ownerPlayer._stats.guestUserId;
		let isGuestUser = !!(!ownerPlayer._stats.userId && ownerPlayer._stats.guestUserId);

		if (unit && ownerPlayer && userId && ownerPlayer.persistentDataLoaded) {
			if (taro.game.isWorldMap && !this.varsFromTrigger.isWorldScript) {
				this._script.errorLog('can not save unit data from map');
				console.log('can not save unit data from map', path);
				return;
			}

			let data = unit.getPersistentData('unit');
			taro.workerComponent.saveUserData(userId, data, 'unit', 'saveUnitData', isGuestUser);
		} else {
			if (unit && !unit.persistentDataLoaded) {
				// throw new Error('Fail saving unit data bcz persisted data not set correctly');
			} else {
				// throw new Error('Fail saving unit data');
			}
		}
	},
	/**
	 * Saves a player's persistent data and their selected unit's data
	 * @param {Player} player - The player whose data to save
	 */
	savePlayerData: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		let userId = player && player._stats && (player._stats.userId || player._stats.guestUserId);
		let isGuestUser = !!(!player._stats.userId && player._stats.guestUserId);

		if (player && userId && player.persistentDataLoaded) {
			if (taro.game.isWorldMap && !this.varsFromTrigger.isWorldScript) {
				this._script.errorLog('can not save player data from map');
				console.log('can not save player data from map', path);
				return;
			}

			let data = player.getPersistentData('player');

			const persistedData = { player: data };

			let unit = player.getSelectedUnit();

			if (unit && player && userId && unit.persistentDataLoaded) {
				let data = unit.getPersistentData('unit');
				persistedData.unit = data;

				// save unit and player data both
				taro.workerComponent.saveUserData(userId, persistedData, null, 'savePlayerData', isGuestUser);
			} else {
				// save player data only
				taro.workerComponent.saveUserData(userId, persistedData.player, 'player', 'savePlayerData', isGuestUser);

				if (unit && !unit.persistentDataLoaded) {
					// throw new Error('Fail saving unit data bcz persisted data not loaded correctly');
				} else {
					// throw new Error('a player unit was destroyed without being saving its data');
				}
			}
		} else {
			if (player && !player.persistentDataLoaded) {
				// throw new Error('Fail saving unit data bcz persisted data not loaded correctly');
			} else {
				// throw new Error('Fail saving player data');
			}
		}
	},

	/**
	 * Makes a player select a specific unit
	 * @param {Player} player - The player who will select the unit
	 * @param {Unit} unit - The unit to be selected
	 */
	makePlayerSelectUnit: function (player, unit) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		// only computer player can be forced to say stuff
		if (player && unit) {
			player.selectUnit(unit.id());
		}
	},

	/**
	 * Sends coins to a player's account
	 * @param {number} coins - Amount of coins to send
	 * @param {Player} player - The player to receive the coins
	 */
	sendCoinsToPlayer: function (coins, player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		let userId = player && player._stats && player._stats.userId;
		if (player && userId && coins && Math.floor(coins) > 0) {
			taro.server.sendCoinsToPlayer(userId, coins);
		}
	},

	/**
	 * Sends utility tokens to a player's account
	 * @param {Player} player - The player to receive the tokens
	 * @param {number} rewardAmount - Amount of utility tokens to send
	 * @param {string} rewardReason - Reason for sending the tokens
	 * @returns {void}
	 */
	sendUtilityTokenToPlayer: function (player, rewardAmount, rewardReason) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (!taro.isServer) {
			return;
		}
		if (!taro.isUtilityTokenEnabledForCurrentGame()) {
			this._script.errorLog(`sendUtilityTokenToPlayer: utility token is not enabled`);
			return;
		}

		let userId = player?._stats?.userId;
		let walletAddress = player?._stats?.walletAddress;

		const getParamsMissing = (params) => {
			return Object.keys(params)
				.filter((key) => !params[key])
				.join(', ');
		};

		if (player && userId && rewardAmount && walletAddress) {
			taro.server.rewardPlayer(userId, rewardReason, rewardAmount);
		} else {
			this._script.errorLog(
				`sendUtilityTokenToPlayer: missing params ${getParamsMissing({ player, userId, rewardAmount, walletAddress })}`
			);
		}
	},

	/**
	 * Sends coins to a player's account with a 10/9 multiplier
	 * @param {number} coins - Base amount of coins to send
	 * @param {Player} player - The player to receive the coins
	 */
	sendCoinsToPlayer2: function (coins, player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		let userId = player && player._stats && player._stats.userId;
		if (player && userId && coins && Math.floor(coins) > 0) {
			// only difference is the addition *10/9
			taro.server.sendCoinsToPlayer(userId, coins, true);
		}
	},

	/**
	 * Shows UI text for a specific player
	 * @param {Player} player - The player who will see the text
	 * @param {string} target - The target UI element ID
	 */
	showUiTextForPlayer: function (player, target) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats) {
			taro.gameText.updateText({ target, value: undefined, action: 'show' }, player._stats.clientId);
		}
	},

	/**
	 * Shows UI text for all players
	 * @param {string} target - The target UI element ID
	 */
	showUiTextForEveryone: function (target) {
		taro.gameText.updateText({ target, value: undefined, action: 'show' });
	},

	/**
	 * Hides UI text for a specific player
	 * @param {Player} player - The player for whom to hide the text
	 * @param {string} target - The target UI element ID
	 */
	hideUiTextForPlayer: function (player, target) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats) {
			taro.gameText.updateText({ target, value: undefined, action: 'hide' }, player._stats.clientId);
		}
	},

	/**
	 * Hides UI text for all players
	 * @param {string} target - The target UI element ID
	 */
	hideUiTextForEveryone: function (target) {
		taro.gameText.updateText({ target, value: undefined, action: 'hide' });
	},

	/**
	 * Updates UI text for a specific player for a limited time
	 * @param {string} text - The text content to display
	 * @param {number} time - Duration in milliseconds to show the text
	 * @param {string} target - The target UI element ID
	 * @param {Player} [player] - Optional player to show text to, if undefined shows to all
	 */
	updateUiTextForTimeForPlayer: function (text, time, target, player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		// don't send text to AI players. If player is undefined, then send to all players
		if (player == undefined || (player && player._stats && player._stats.controlledBy == 'human')) {
			taro.gameText.updateTextForTime(
				{
					target,
					value: text,
					action: 'update',
					time,
				},
				player && player._stats && player._stats.clientId
			);
		}
	},

	/**
	 * Updates UI text for a specific player
	 * @param {string} text - The text content to display
	 * @param {string} target - The target UI element ID
	 * @param {Player} player - The player who will see the text
	 */
	updateUiTextForPlayer: function (text, target, player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats) {
			taro.gameText.updateText({ target, value: text, action: 'update' }, player._stats.clientId);
		}
	},

	/**
	 * Appends realtime CSS for a player
	 * @param {Player} player - The player to append CSS for
	 * @param {string} value - The CSS text to append
	 */
	appendRealtimeCSSForPlayer: function (player, value) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		let text = value;
		if (player && player._stats && player._stats.controlledBy == 'human' && player._stats.clientId) {
			taro.network.send('updateUiRealtimeCSS', { action: 'append', style: text }, player._stats.clientId);
			player.realtimeCSS += `
	${text}`;
		}
	},

	/**
	 * Updates realtime CSS for a player
	 * @param {Player} player - The player to update CSS for
	 * @param {string} value - The CSS text to set
	 */
	updateRealtimeCSSForPlayer: function (player, value) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		let text = value;
		if (player && player._stats && player._stats.controlledBy == 'human' && player._stats.clientId) {
			taro.network.send('updateUiRealtimeCSS', { action: 'update', style: text }, player._stats.clientId);
			player.realtimeCSS = text;
		}
	},

	/**
	 * Shows game suggestions UI for a player
	 * @param {Player} player - The player to show suggestions to
	 */
	showGameSuggestionsForPlayer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._stats.clientId) {
			taro.network.send('gameSuggestion', { type: 'show' }, player._stats.clientId);
		}
	},

	/**
	 * Hides game suggestions UI for a player
	 * @param {Player} player - The player to hide suggestions from
	 */
	hideGameSuggestionsForPlayer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._stats.clientId) {
			taro.network.send('gameSuggestion', { type: 'hide' }, player._stats.clientId);
		}
	},

	/**
	 * Updates UI text for all players
	 * @param {string} text - The text content to display
	 * @param {string} target - The target UI element ID
	 */
	updateUiTextForEveryone: function (text, target) {
		taro.gameText.updateText({ target, value: text, action: 'update' });
	},

	/**
	 * Shows an input modal dialog for a player
	 * @param {Player} player - The player to show the modal to
	 * @param {string} inputLabel - Label text for the input field
	 */
	showInputModalToPlayer: function (player, inputLabel) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._stats.clientId) {
			taro.network.send(
				'ui',
				{
					command: 'showInputModal',
					fieldLabel: inputLabel,
					isDismissible: false,
				},
				player._stats.clientId
			);
		}
	},

	/**
	 * Shows a dismissible input modal dialog for a player
	 * @param {Player} player - The player to show the modal to
	 * @param {string} inputLabel - Label text for the input field
	 */
	showDismissibleInputModalToPlayer: function (player, inputLabel) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._stats.clientId) {
			taro.network.send(
				'ui',
				{
					command: 'showInputModal',
					fieldLabel: inputLabel,
					isDismissible: true,
				},
				player._stats.clientId
			);
		}
	},

	/**
	 * Shows a custom modal dialog with HTML content for a player
	 * @param {Player} player - The player to show the modal to
	 * @param {string} htmlContent - HTML content to display in the modal
	 * @param {string} title - Title text for the modal
	 */
	showCustomModalToPlayer: function (player, htmlContent, title) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		let content = htmlContent;
		let modalTitle = title;
		if (player && player._stats && player._stats.clientId) {
			taro.network.send(
				'ui',
				{
					command: 'showCustomModal',
					title: modalTitle,
					content,
					isDismissible: true,
				},
				player._stats.clientId
			);
		}
	},

	/**
	 * Shows a modal containing a website for a player
	 * @param {Player} player - The player to show the modal to
	 * @param {string} url - URL of the website to display
	 */
	showWebsiteModalToPlayer: function (player, string) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		let url = string;
		if (player && player._stats && player._stats.clientId) {
			taro.network.send(
				'ui',
				{
					command: 'showWebsiteModal',
					url: url,
					isDismissible: true,
				},
				player._stats.clientId
			);
		}
	},

	/**
	 * Shows a social share modal dialog for a player
	 * @param {Player} player - The player to show the modal to
	 */
	showSocialShareModalToPlayer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._stats.clientId) {
			taro.network.send(
				'ui',
				{
					command: 'showSocialShareModal',
					isDismissible: true,
				},
				player._stats.clientId
			);
		}
	},

	/**
	 * Opens a website in a new window/tab for a player
	 * @param {Player} player - The player to open the website for
	 * @param {string} url - URL of the website to open
	 */
	openWebsiteForPlayer: function (player, url) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._stats.clientId) {
			taro.network.send(
				'ui',
				{
					command: 'openWebsite',
					url: url,
					isDismissible: true,
				},
				player._stats.clientId
			);
		}
	},

	/**
	 * Shows the invite friends modal for a player
	 * @param {Player} player - The player to show the modal to
	 */
	showInviteFriendsModal: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._stats.clientId) {
			taro.network.send(
				'ui',
				{
					command: 'showFriendsModal',
				},
				player._stats.clientId
			);
		}
	},

	/**
	 * Shows the game menu for a player
	 * @param {Player} player - The player to show the menu to
	 */
	showMenu: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats) {
			taro.network.send('ui', { command: 'showMenu' }, player._stats.clientId);
		}
	},

	/**
	 * Shows the login prompt for a player
	 * @param {Player} player - The player to show the login prompt to
	 */
	promptLogin: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats) {
			if (taro.isServer) {
				taro.network.send('ui', { command: 'promptLogin' }, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.playerUi.promptLogin();
			}
		}
	},

	/**
	 * Makes a player send a chat message
	 * @param {Player} player - The player who will send the message
	 * @param {string} message - The message content to send
	 */
	makePlayerSendChatMessage: function (player, message) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (
			player &&
			player._stats &&
			player._stats.clientId &&
			(player._stats.controlledBy == 'computer' || player._stats.isBot || player._stats?.agentId?.length > 0)
		) {
			taro.chat.sendToRoom('1', message, undefined, player._stats.clientId, {
				isExecutedByScript: true,
				isExecutedByBot: player._stats.isBot,
				playerName: player._stats.name,
			});
		}
	},

	/**
	 * Sends a chat message to all players
	 * @param {string} message - The message content to send
	 */
	sendChatMessage: function (message) {
		taro.chat.sendToRoom('1', message, undefined, undefined);
	},

	/**
	 * Sets an entity's active state
	 * @param {Entity} entity - The entity to modify
	 * @param {boolean} active - Whether to set the entity as active or inactive
	 */
	setActive: function (entity, active) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && entity._stats) {
			entity.setActive(active);
		}
	},

	/**
	 * Removes a quest from a player
	 * @param {Player} player - The player to remove the quest from
	 * @param {string} questId - ID of the quest to remove
	 */
	removeQuestForPlayer: function (player, questId) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		player?.quest.init(player);
		let gameId = taro.game.data.defaultData._id;
		if (
			player.quests.active[gameId][questId] !== undefined ||
			player.quests.completed[gameId].includes(questId) === true
		) {
			player.quest.removeQuest(questId);
			taro.game.lastTriggeringQuestId = questId;
			let triggeredBy = {};
			if (selectedUnit && selectedUnit.script) {
				triggeredBy.unitId = selectedUnit.id();
				selectedUnit.script.trigger('questRemoved', triggeredBy);
			}
			triggeredBy.playerId = player.id();
			taro.script.trigger('questRemoved', triggeredBy);
			// console.log('addQuest', JSON.stringify(player.quests));
		}
	},

	/**
	 * Adds a new quest for a player
	 * @param {Player} player - The player to add the quest for
	 * @param {string} questId - Unique ID for the quest
	 * @param {string} name - Display name of the quest
	 * @param {string} goal - Description of the quest goal
	 * @param {string} description - Detailed description of the quest
	 */
	addQuestToPlayer: function (player, questId, name, goal, description) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		player?.quest.init(player);
		let gameId = taro.game.data.defaultData._id;
		if (
			player.quests.active[gameId][questId] === undefined &&
			player.quests.completed[gameId].includes(questId) === false
		) {
			player.quest.addQuest(questId, { name, description, goal, progress: 0 });
			taro.game.lastTriggeringQuestId = questId;
			let triggeredBy = {};
			if (selectedUnit && selectedUnit.script) {
				triggeredBy.unitId = selectedUnit.id();
				selectedUnit.script.trigger('questAdded', triggeredBy);
			}
			triggeredBy.playerId = player.id();
			taro.script.trigger('questAdded', triggeredBy);
			// console.log('addQuest', JSON.stringify(player.quests));
		}
	},

	/**
	 * Completes a quest for a player
	 * @param {Player} player - The player to complete the quest for
	 * @param {string} questId - Unique ID of the quest to complete
	 */
	completeQuest: function (player, questId) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		player?.quest.init(player);
		let gameId = taro.game.data.defaultData._id;
		let newObj = player.quests;
		if (newObj.active[gameId] && newObj['active'][gameId][questId]) {
			let selectedUnit = player.getSelectedUnit();
			let triggeredBy = {};
			taro.game.lastTriggeringQuestId = questId;
			player.quest.completeQuest(questId);
			if (selectedUnit && selectedUnit.script) {
				triggeredBy.unitId = selectedUnit.id();
				selectedUnit.script.trigger('questCompleted', triggeredBy);
			}
			triggeredBy.playerId = player.id();
			taro.script.trigger('questCompleted', triggeredBy);
		}
		// console.log('completeQuest', JSON.stringify(player.quests));
	},

	/**
	 * Updates the progress of a quest for a player
	 * @param {Player} player - The player whose quest to update
	 * @param {string} questId - ID of the quest to update
	 * @param {number} progress - New progress value to set
	 */
	setQuestProgress: function (player, questId, progress) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		player?.quest.init(player);
		let gameId = taro.game.data.defaultData._id;
		const quests = player.quests;
		if (quests.active[gameId] !== undefined && quests.active[gameId][questId] !== undefined) {
			if (quests.active[gameId][questId].progress !== progress) {
				let oldProgress = quests.active[gameId][questId].progress;
				player.quest.setProgress(questId, Math.min(progress, quests.active[gameId][questId].goal));
				let selectedUnit = player.getSelectedUnit();
				let triggeredBy = {};
				taro.game.lastTriggeringQuestId = questId;
				triggeredBy.playerId = player.id();
				taro.script.trigger('questProgressUpdated', triggeredBy);
				if (oldProgress !== quests.active[gameId][questId].goal && progress === quests.active[gameId][questId].goal) {
					let selectedUnit = player.getSelectedUnit();
					let triggeredBy = {};
					taro.game.lastTriggeringQuestId = questId;
					if (selectedUnit && selectedUnit.script) {
						triggeredBy.unitId = selectedUnit.id();
						selectedUnit.script.trigger('questProgressCompleted', triggeredBy);
					}
					triggeredBy.playerId = player.id();
					taro.script.trigger('questProgressCompleted', triggeredBy);
				}
			}
		}
		// console.log('setQuestProgress', JSON.stringify(player.quests));
	},

	/**
	 * Sends a chat message to a specific player
	 * @param {Player} player - The player to send the message to
	 * @param {string} message - The message content to send
	 */
	sendChatMessageToPlayer: function (player, message) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._category == 'player' && player._stats.clientId) {
			let clientId = player._stats.clientId;
			taro.chat.sendToRoom('1', message, clientId, undefined);
		}
	},

	/**
	 * Adds words to the chat filter
	 * @param {string} words - Comma-separated list of words to filter
	 */
	addChatFilter: function (words) {
		if (words) {
			words = words.match(/(?=S)[^,]+?(?=s*(,|$))/g);
			taro.chat.filter?.addWords(...words);
		}
	},

	/**
	 * Ban Player From Chat
	 * @param {Player} player
	 */
	mutePlayerFromChat: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		taro.server.updateTempMute({
			player,
			banChat: true,
		});
	},

	/**
	 * Unban Player From Chat
	 * @param {Player} player
	 */
	unmutePlayerFromChat: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		taro.server.updateTempMute({
			player,
			banChat: false,
		});
	},

	/**
	 * Ends the current game session by killing the server
	 */
	endGame: function () {
		taro.server.kill('end game called');
	},
	/**
	 * Makes the specified unit start moving upward
	 * @param {Unit} unit - The unit to move
	 */
	startMovingUnitUp: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category === 'unit' && unit.ability) {
			unit.ability.moveUp();
		}
	},

	/**
	 * Makes the specified unit start moving downward
	 * @param {Unit} unit - The unit to move
	 */
	startMovingUnitDown: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category === 'unit' && unit.ability) {
			unit.ability.moveDown();
		}
	},

	/**
	 * Makes the specified unit start moving left
	 * @param {Unit} unit - The unit to move
	 */
	startMovingUnitLeft: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category === 'unit' && unit.ability) {
			unit.ability.moveLeft();
		}
	},

	/**
	 * Makes the specified unit start moving right
	 * @param {Unit} unit - The unit to move
	 */
	startMovingUnitRight: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category === 'unit' && unit.ability) {
			unit.ability.moveRight();
		}
	},

	/**
	 * Stops the specified unit's horizontal movement
	 * @param {Unit} unit - The unit to stop moving
	 */
	stopMovingUnitX: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category === 'unit' && unit.ability) {
			unit.ability.stopMovingX();
		}
	},

	/**
	 * Stops the specified unit's vertical movement
	 * @param {Unit} unit - The unit to stop moving
	 */
	stopMovingUnitY: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category === 'unit' && unit.ability) {
			unit.ability.stopMovingY();
		}
	},

	/**
	 * Stops all movement of the specified unit
	 * @param {Unit} unit - The unit to stop moving
	 */
	stopMovingUnit: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category === 'unit' && unit.ability) {
			unit.ability.stopMovingX();
			unit.ability.stopMovingY();
		}
	},

	/**
	 * Create Unit At Position
	 * @param {UnitTypeId} unitTypeId - The ID of the unit type to create
	 * @param {Player} player - The player creating the unit
	 * @param {{x: number, y: number, z: number}} position - The position where the unit will be created
	 * @param {number} angle - The angle at which the unit will be facing
	 */
	createUnit: function (unitTypeId, player, position, angle) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		let unitTypeData = taro.game.cloneAsset('unitTypes', unitTypeId);
		let spawnPosition = position;
		let facingAngle = angle;
		if (player && spawnPosition && unitTypeId && unitTypeData) {
			let data = Object.assign(unitTypeData, {
				type: unitTypeId,
				defaultData: {
					translate: spawnPosition,
					rotate: facingAngle,
				},
				isHidden: false,
			});
			let unit = player.createUnit(data);
			taro.game.lastCreatedUnitId = unit.id();
		} else {
			let invalidParameters = [];
			if (!player) invalidParameters.push('player');
			if (!spawnPosition) invalidParameters.push('spawn position');
			if (!unitTypeId) invalidParameters.push('unit type');
			if (!unitTypeData) invalidParameters.push('unit type data');
			// throw new Error(`cannot create unit. invalid parameter(s) given: ${invalidParameters.toString()}`);
		}
	},

	/**
	 * Change Unit Type
	 * @param {Unit} unit
	 * @param {UnitTypeId} unitType
	 */
	changeUnitType: function (unit, unitType) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		let unitTypeId = unitType;
		if (unit && unit._category == 'unit' && unitTypeId != null) {
			unit.streamUpdateData([{ type: unitTypeId }]);
		} else {
			let invalidParameters = [];
			if (!unit) invalidParameters.push('unit');
			if (!unitTypeId) invalidParameters.push('unit type');
			// throw new Error(`cannot change unit type. invalid parameter(s) given: ${invalidParameters.toString()}`);
		}
	},
	/**
	 * Change Entity Model Sprite
	 * @param {Entity} entity
	 * @param {string} url
	 */
	setModelOrSprite: function (entity, url) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && this.entityCategories.indexOf(entity._category) > -1 && url && typeof url === 'string') {
			if (taro.isServer) {
				entity.streamUpdateData([{ url: url }]);
			} else if (taro.isClient && entity._stats.cellSheet.url !== url) {
				entity._stats.cellSheet.url = url;
				entity.updateTexture();
			}
		} else {
			let invalidParameters = [];
			if (!entity) invalidParameters.push('entity');
			if (!url) invalidParameters.push('url');
			// throw new Error(`cannot change entity model. invalid parameter(s) given: ${invalidParameters.toString()}`);
		}
	},

	/**
	 * Change Unit Speed
	 * @param {Unit} unit
	 * @param {number} unitSpeed
	 */
	setUnitSpeed: function (unit, unitSpeed) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		let bonusSpeed = unitSpeed;
		if (unit != undefined && unit._stats != undefined && unit._category != undefined && bonusSpeed != undefined) {
			unit.streamUpdateData([{ bonusSpeed: bonusSpeed }]);
		}
	},

	/**
	 * Change Sensor Radius
	 * @param {Sensor} sensor
	 * @param {number} radius
	 */
	setSensorRadius: function (sensor, radius) {
		if (sensor && typeof sensor.id === 'function') sensor = taro.$(sensor.id());
		if (sensor && sensor.unit) {
			let unit = sensor.unit;
			if (unit.sensor === undefined) {
				unit.sensor = new Sensor(unit, unit._stats.ai.sensorRadius);
			}
		}
		// console.log('changeSensorRadius', sensor.id(), radius);
		if (sensor && sensor._category == 'sensor') {
			if (!isNaN(radius)) {
				sensor.updateRadius(radius);
			}
		}
	},

	/**
	 * Set Max Attack Range
	 * @param {Unit} unit
	 * @param {number} maxAttackRange
	 */
	setMaxAttackRange: function (unit, number) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		let value = number;
		if (unit) {
			if (!isNaN(value)) {
				unit._stats.ai.maxAttackRange = value;
				unit.ai.maxAttackRange = value;
			}
		}
	},
	/**
	 * Set Let Go Distance
	 * @param {Unit} unit
	 * @param {number} number
	 */
	setLetGoDistance: function (unit, number) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		let value = number;
		if (unit) {
			if (!isNaN(value)) {
				unit._stats.ai.letGoDistance = value;
				unit.ai.letGoDistance = value;
			} else {
				unit._stats.ai.letGoDistance = undefined;
				unit.ai.letGoDistance = undefined;
			}
		}
	},

	/**
	 * Set Max Travel Distance
	 * @param {Unit} unit
	 * @param {number} number
	 */
	setMaxTravelDistance: function (unit, number) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		let value = number;
		if (unit) {
			if (!isNaN(value)) {
				unit._stats.ai.maxTravelDistance = value;
				unit.ai.maxTravelDistance = value;
			} else {
				unit._stats.ai.maxTravelDistance = undefined;
				unit.ai.maxTravelDistance = undefined;
			}
		}
	},

	/**
	 * Set Entity Velocity Direction
	 * @param {Entity} entity
	 * @param {number} speed
	 * @param {(number|{x: number, y: number, z: number})} direction - If number, it's treated as a direction in degrees. If object, expected format is {x: number, y: number, z: number}.
	 */
	setVelocity: function (entity, speed, direction) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (typeof direction === 'object') {
			if (entity && !isNaN(direction.x) && !isNaN(direction.y) && !isNaN(direction.z) && !isNaN(speed)) {
				const magnitude = Math.hypot(direction.x, direction.y, direction.z);
				if (magnitude !== 0) {
					direction.x /= magnitude;
					direction.y /= magnitude;
					direction.z /= magnitude;
					entity.setLinearVelocity(direction.x * speed, direction.y * speed, direction.z * speed);
				}
			}
		} else {
			if (entity && direction !== undefined && !isNaN(direction) && !isNaN(speed)) {
				let radians = direction + Math.radians(-90);
				entity.setLinearVelocity(Math.cos(radians) * speed, Math.sin(radians) * speed);
			}
		}
	},

	/**
	 * Set Unit Owner
	 * @param {Unit} unit
	 * @param {Player} player
	 */
	setUnitOwner: function (unit, player) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (unit && player) {
			unit.setOwnerPlayer(player.id());
		}
	},

	/**
	 * Set Unit Name Label
	 * @param {Unit} unit
	 * @param {string} name
	 */
	setUnitNameLabel: function (unit, name) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit) {
			unit.streamUpdateData([{ name: name }]);
		}
	},

	/**
	 * Set Unit Name Label Color For Player
	 * @param {Unit} unit
	 * @param {string} color
	 * @param {Player} player
	 */
	setUnitNameLabelColorForPlayer: function (unit, color, player) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		try {
			if (unit && player && typeof color === 'string' && Colors.isValidColor(color)) {
				unit.setNameLabelColor(color, player);
			} else {
				// throw new Error(`Is '${color}' a valid hex code or extended color string? Correct unit, player?`);
			}
		} catch (err) {
			taro.script.errorLog(err, path);
		}
	},

	/**
	 * Set Item Name
	 * @param {Item} item
	 * @param {string} name
	 */
	setItemName: function (item, name) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (item) {
			item.streamUpdateData([{ name: name }]);
		}
	},

	/**
	 * Set Fading Text Of Unit
	 * @param {Unit} unit
	 * @param {string} text
	 * @param {string} color
	 */
	setFadingTextOfUnit: function (unit, text, color) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (text == undefined) {
			text = 'undefined';
		}
		if (unit && unit._category === 'unit') {
			unit.streamUpdateData([{ setFadingText: `${text}|-|${color}` }]);
		}
	},

	/**
	 * Create Floating Text
	 * @param {{x:number, y:number, z:number}} position
	 * @param {string} text
	 * @param {string} color
	 */
	createFloatingText: function (position, text, color) {
		if (text == undefined) {
			text = 'undefined';
		}
		if (taro.isServer) {
			taro.network.send('createFloatingText', { position: position, text: text, color: color });
		} else if (taro.isClient) {
			taro.client.emit('floating-text', {
				text: text,
				x: position.x ?? 0,
				y: position.y ?? 0,
				z: position.z ?? 0,
				color: color || 'white',
			});
		}
	},

	/**
	 * Create Dynamic Floating Text
	 * @param {{x:number, y:number, z:number}} position
	 * @param {string} text
	 * @param {string} color
	 * @param {number} duration
	 */
	createDynamicFloatingText: function (position, text, color, duration) {
		if (text == undefined) {
			text = 'undefined';
		}
		if (taro.isServer) {
			taro.network.send('createDynamicFloatingText', { position, text, color, duration });
		} else if (taro.isClient) {
			taro.client.emit('dynamic-floating-text', {
				text,
				x: position.x ?? 0,
				y: position.y ?? 0,
				z: position.z ?? 0,
				color: color || 'white',
				duration,
			});
		}
	},

	/**
	 * Starts the active usage of an item
	 * @param {Entity} item - The item entity to start using
	 * @description Begins using an item if it is not already in use. Only works on entities with category 'item'.
	 */
	startUsingItem: function (item) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (item && item._category == 'item') {
			item.startUsing();
		}
	},

	/**
	 * Use Item Once
	 * @param {Item} item
	 */
	useItemOnce: function (item) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (item && item._category == 'item') {
			// item.use();
			item.streamUpdateData([{ useQueued: true }]);
		}
	},

	/**
	 * Stop the current usage of an item
	 * @param {Item} item - The item entity to stop using
	 * @description Stops the active usage of an item if it is currently being used. Only works on entities with category 'item'.
	 */
	stopUsingItem: function (item) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (item && item._category == 'item') {
			item.stopUsing();
		}
	},

	/**
	 * Update Item Quantity
	 * @param {Entity} entity
	 * @param {number} quantity
	 */
	updateItemQuantity: function (entity, quantity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let item = entity;
		if (item && item._category == 'item') {
			item.updateQuantity(quantity);
		}
	},

	/**
	 * Set Item Fire Rate
	 * @param {Entity} item
	 * @param {number} number
	 */
	setItemFireRate: function (item, number) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		let value = number;
		if (item && item._category == 'item') {
			item.streamUpdateData([{ fireRate: value }]);
		}
	},

	/**
	 * Change Inventory Slot Color
	 * @param {Entity} item
	 * @param {string} color
	 */
	setSlotColor: function (item, color) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (item && color) {
			item.streamUpdateData([{ inventorySlotColor: color }]);
		}
	},

	/**
	 * Set Item Ammo
	 * @param {Item} item
	 * @param {number} ammo
	 */
	setItemAmmo: function (item, ammo) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		let newAmmo = ammo;
		// because in item stream update quantity value is decremented by 1
		newAmmo++;
		if (item && item._category === 'item' && item._stats.type === 'weapon' && !isNaN(newAmmo)) {
			item.streamUpdateData([{ quantity: newAmmo }]);
		}
	},

	/**
	 * Drop Item
	 * @param {Unit} unit
	 */
	dropItem: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category === 'unit') {
			let item = unit.getCurrentItem();

			if (unit && item && unit._stats && unit._stats.itemIds) {
				let itemIndex = -1;

				for (itemIndex = 0; itemIndex < unit._stats.itemIds.length; itemIndex++) {
					if (item.id() === unit._stats.itemIds[itemIndex]) {
						return;
					}
				}

				if (itemIndex <= unit._stats.itemIds.length) {
					unit.dropItem(itemIndex);
				}
			}
		}
	},

	/**
	 * Drop Item At Position
	 * @param {Item} item
	 * @param {{x: number, y: number, z: number}} position
	 */
	dropItemAtPosition: function (item, position) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (item) {
			if (item._stats && item._stats.controls && !item._stats.controls.undroppable) {
				let ownerUnit = item.getOwnerUnit();
				let itemIndex = item._stats.slotIndex;
				if (ownerUnit) {
					ownerUnit.dropItem(itemIndex, position);
				}
			} else {
				// // throw new Error(`unit cannot drop an undroppable item ${item._stats.name}`);
			}
		} else {
			// // throw new Error('invalid item');
		}
	},

	/**
	 * Enable Rotate To Face Mouse Cursor
	 * @param {Item} item
	 */
	enableRotateToFaceMouseCursor: function (item) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (item && item._category == 'item') {
			item.streamUpdateData([{ rotateToFaceMouseCursor: true }]);
		}
	},

	/**
	 * Disable Rotate To Face Mouse Cursor
	 * @param {Item} item
	 */
	disableRotateToFaceMouseCursor: function (item) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (item && item._category == 'item') {
			item.streamUpdateData([{ rotateToFaceMouseCursor: false }]);
		}
	},

	/**
	 * Makes a unit cast an ability
	 * @param {Unit} unit - The unit that will cast the ability
	 * @param {string} abilityName - Name of the ability to cast
	 */
	castAbility: function (unit, abilityName) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit' && unit.ability && abilityName) {
			unit.ability.cast(abilityName);
		}
	},

	/**
	 * Start Casting Ability
	 * @param {Entity} entity
	 * @param {string} ability
	 */
	startCastingAbility: function (entity, ability) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let unit = entity;
		unit.ability.startCasting(ability);
	},

	/**
	 * Stop Casting Ability
	 * @param {Entity} entity
	 * @param {string} ability
	 */
	stopCastingAbility: function (entity, ability) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let unit = entity;
		unit.ability.stopCasting(ability);
	},

	/**
	 * drop all items
	 * @param {Unit} unit
	 */
	dropAllItems: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			for (let i = 0; i < unit._stats.itemIds.length; i++) {
				if (unit._stats.itemIds[i]) {
					let item = unit.dropItem(i);
					// slightly push item away from the unit at random angles
					if (item) {
						randomForceX = Math.floor(Math.random() * 101) - 50;
						randomForceY = Math.floor(Math.random() * 101) - 50;
						item.applyForce(randomForceX, randomForceY);
					}
				}
			}
		}
	},

	/**
	 * Open Shop For Player
	 * @param {ShopTypeId} shopTypeId
	 * @param {Player} player
	 */
	openShopForPlayer: function (shopTypeId, player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._category === 'player' && player._stats.clientId) {
			player._stats.lastOpenedShop = shopTypeId;
			taro.network.send('openShop', { type: shopTypeId }, player._stats.clientId);
		}
	},

	/**
	 * Close Shop For Player
	 * @param {Player} player
	 */
	closeShopForPlayer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._category === 'player' && player._stats.clientId) {
			taro.network.send('ui', { command: 'closeShop' }, player._stats.clientId);
		}
	},

	/**
	 * Open Dialogue For Player
	 * @param {Player} player
	 * @param {String} dialogue
	 */
	openDialogueForPlayer: function (player, dialogue) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		let primitiveVariables = taro.script.moddScriptParam.allVariables(['string', 'number', 'boolean']);
		let dialogueId = dialogue;
		if (dialogueId != undefined && player && player._category === 'player' && player._stats.clientId) {
			// filter out primitive variables using typeof
			primitiveVariables = Object.entries(primitiveVariables).reduce((acc, [key, value]) => {
				if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
					acc[key] = value;
				}
				return acc;
			}, {});
			player._stats.lastOpenedDialogue = dialogue;
			player._stats.currentOpenedDialogue = dialogueId;
			const data = {
				dialogueId: dialogueId,
				extraData: {
					playerName: player._stats && player._stats.name,
					variables: primitiveVariables,
					dialogueTemplate: _.get(taro, 'game.data.ui.dialogueview.htmlData', ''),
				},
			};
			if (taro.isServer) {
				taro.network.send('openDialogue', data, player._stats.clientId);
			} else {
				taro.playerUi.openDialogueModal(data.dialogueId, data.extraData);
			}
		}
	},

	/**
	 * Close Dialogue For Player
	 * @param {Player} player
	 */
	closeDialogueForPlayer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._category === 'player' && player._stats.clientId) {
			player._stats.currentOpenedDialogue = null;
			if (taro.isServer) {
				taro.network.send('closeDialogue', {}, player._stats.clientId);
			} else {
				taro.playerUi.closeDialogueModal();
			}
		}
	},
	/**
	 * Refills ammunition for an item that has ammo capacity
	 * @param {Item} item - The item entity whose ammo should be refilled
	 */
	refillAmmo: function (item) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (item && item._category == 'item') {
			item.refillAmmo();
		}
	},

	/**
	 * Drop Item In Inventory Slot
	 * @param {number} slotIndex
	 * @param {Unit} unit
	 */
	dropItemInSlot: function (slotIndex, unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit' && slotIndex != undefined) {
			unit.dropItem(slotIndex - 1);
		}
	},

	/**
	 * Make Unit To Always Face Position
	 * @param {Entity} entity
	 * @param {Position} position
	 */
	makeUnitToAlwaysFacePosition: function (entity, position) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && entity._category == 'unit') {
			if (!isNaN(position.x) && !isNaN(position.y)) {
				entity.isLookingAt = position;
			}
		}
	},

	/**
	 * Makes a unit continuously rotate to face the mouse cursor position
	 * @param {Unit} unit - The unit entity that should track the mouse
	 */
	makeUnitToAlwaysFaceMouseCursor: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			unit.isLookingAt = 'mouse';
		}
	},

	/**
	 * Makes a unit completely invisible, including its name label
	 * @param {Unit} unit - The unit entity to make invisible
	 */
	makeUnitInvisible: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			unit.streamUpdateData([{ isInvisible: true }, { isNameLabelHiddenToHostile: true }]);
		}
	},

	/**
	 * Makes a previously invisible unit visible again, including its name label
	 * @param {Unit} unit - The unit entity to make visible
	 */
	makeUnitVisible: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			unit.streamUpdateData([{ isInvisible: false }, { isNameLabelHiddenToHostile: false }]);
		}
	},

	/**
	 * Makes a unit invisible only to players on the same team
	 * @param {Unit} unit - The unit entity to hide from friendly players
	 */
	makeUnitInvisibleToFriendlyPlayers: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			unit.streamUpdateData([{ isInvisibleToFriendly: true }, { isNameLabelHiddenToFriendly: true }]);
		}
	},

	/**
	 * Makes a previously hidden unit visible again to players on the same team
	 * @param {Unit} unit - The unit entity to show to friendly players
	 */
	makeUnitVisibleToFriendlyPlayers: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			unit.streamUpdateData([{ isInvisibleToFriendly: false }, { isNameLabelHiddenToFriendly: false }]);
		}
	},

	/**
	 * Hide Unit Name Label From Player
	 * @param {Entity} entity
	 * @param {Player} player
	 */
	hideUnitNameLabelFromPlayer: function (entity, player) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let unit = entity;
		if (unit && player && player._stats && unit._stats) {
			taro.network.send('hideUnitNameLabelFromPlayer', { unitId: unit.id() }, player._stats.clientId);
		}
	},

	/**
	 * Show Unit Name Label To Player
	 * @param {Entity} entity
	 * @param {Player} player
	 */
	showUnitNameLabelToPlayer: function (entity, player) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let unit = entity;
		if (unit && player && player._stats && unit._stats) {
			taro.network.send('showUnitNameLabelFromPlayer', { unitId: unit.id() }, player._stats.clientId);
		}
	},

	/**
	 * Hide Unit From Player
	 * @param {Entity} entity
	 * @param {Player} player
	 */
	hideUnitFromPlayer: function (entity, player) {
		// deprecated
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let unit = entity;
		if (unit && player && player._stats && unit._stats) {
			taro.network.send('hideUnitFromPlayer', { unitId: unit.id() }, player._stats.clientId);
		}
	},

	/**
	 * Show Unit To Player
	 * @param {Entity} entity
	 * @param {Player} player
	 */
	showUnitToPlayer: function (entity, player) {
		// deprecated
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let unit = entity;
		if (unit && player && player._stats && unit._stats) {
			taro.network.send('showUnitFromPlayer', { unitId: unit.id() }, player._stats.clientId);
		}
	},

	/**
	 * Hide Entity
	 * @param {Entity} entity
	 */
	hide: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && entity._stats) {
			entity.hide();
		}
	},

	/**
	 * Show Entity
	 * @param {Entity} entity
	 */
	show: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && entity._stats) {
			entity.show();
		}
	},
	/**
	 * Makes a unit invisible to neutral players by setting both visibility and name label flags
	 * @param {Unit} unit - The unit entity to make invisible
	 * @description When called, this function will hide both the unit model and its name label from neutral players,
	 * while keeping it visible to allied and enemy players. The unit must have the 'unit' category.
	 */
	makeUnitInvisibleToNeutralPlayers: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			unit.streamUpdateData([{ isInvisibleToNeutral: true }, { isNameLabelHiddenToNeutral: true }]);
		}
	},

	/**
	 * Makes a unit visible to neutral players by clearing both visibility and name label flags
	 * @param {Unit} unit - The unit entity to make visible
	 * @description When called, this function will show both the unit model and its name label to neutral players.
	 * The unit must have the 'unit' category.
	 */
	makeUnitVisibleToNeutralPlayers: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			unit.streamUpdateData([{ isInvisibleToNeutral: false }, { isNameLabelHiddenToNeutral: false }]);
		}
	},

	/**
	 * Hides the name label displayed above a unit
	 * @param {Unit} unit - The unit entity whose name label should be hidden
	 * @description When called, this function will hide the name label that appears above the unit.
	 * The entity must have the 'unit' category for this to work.
	 */
	hideUnitNameLabel: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			unit.streamUpdateData([{ isNameLabelHidden: true }]);
		}
	},

	/**
	 * Shows the name label displayed above a unit
	 * @param {Unit} unit - The unit entity whose name label should be shown
	 * @description When called, this function will show the name label that appears above the unit.
	 * The entity must have the 'unit' category for this to work.
	 */
	showUnitNameLabel: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._category == 'unit') {
			unit.streamUpdateData([{ isNameLabelHidden: false }]);
		}
	},

	/**
	 * Create Projectile At Position
	 * @param {ProjectileTypeId} projectileTypeId
	 * @param {{x:number, y:number, z:number}} position
	 * @param {number} force
	 * @param {Unit} unit
	 * @param {number} angle
	 */
	//FIXME: angle issue
	createProjectile: function (projectileTypeId, position, force, unit, angle) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (projectileTypeId) {
			let projectileData = taro.game.cloneAsset('projectileTypes', projectileTypeId);
			if (
				projectileData != undefined &&
				position != undefined &&
				position.x != undefined &&
				position.y != undefined &&
				force != undefined &&
				angle != undefined
			) {
				let facingAngleInRadians = angle;
				let unitId = unit ? unit.id() : undefined;
				let data = Object.assign(projectileData, {
					type: projectileTypeId,
					bulletForce: force,
					sourceItemId: undefined,
					sourceUnitId: unitId,
					defaultData: {
						rotate: facingAngleInRadians,
						translate: position,
						velocity: {
							x: Math.cos(angle) * force,
							y: Math.sin(angle) * force,
						},
					},
				});
				let projectile = new Projectile(data);
				taro.game.lastCreatedProjectileId = projectile._id;
				taro.script.trigger('entityCreatedGlobal', { entityId: projectile.id() });
				projectile.script.trigger('entityCreated');
			} else {
				if (!projectileData) {
					// throw new Error('invalid projectile data');
				}
				if (!position || position.x == undefined || position.y == undefined) {
					// throw new Error('invalid position data');
				}
				if (force == undefined) {
					// throw new Error('invalid force value');
				}
				if (angle == undefined) {
					// throw new Error('invalid angle value');
				}
			}
		}
	},

	/**
	 * Create Prop At Position
	 * @param {propTypeId} propTypeId
	 * @param {{x:number, y:number, z:number}} position
	 * @param {number} angle
	 */
	createProp: function (propTypeId, position, angle) {
		let propTypeData = taro.game.cloneAsset('propTypes', propTypeId);
		let spawnPosition = position;
		let facingAngle = angle;
		if (spawnPosition && propTypeId && propTypeData) {
			let data = Object.assign(propTypeData, {
				type: propTypeId,
				defaultData: {
					translate: spawnPosition,
					rotate: facingAngle,
				},
				isHidden: false,
			});
			let prop = new Prop(data);
			taro.game.lastCreatedPropId = prop.id();
		} else {
			let invalidParameters = [];
			if (!spawnPosition) invalidParameters.push('spawn position');
			if (!propTypeId) invalidParameters.push('prop type');
			if (!propTypeData) invalidParameters.push('prop type data');
			// throw new Error(`cannot create prop. invalid parameter(s) given: ${invalidParameters.toString()}`);
		}
	},

	/**
	 * Player Camera Track Unit
	 * @param {Unit} unit
	 * @param {Player} player
	 */
	cameraTrackUnit: function (unit, player) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (unit && player && player._stats.clientId) {
			player.cameraTrackUnit(unit.id());
		}
	},

	/**
	 * Player Camera Set Zoom
	 * @param {Player} player
	 * @param {number} zoom
	 */
	setCameraZoom: function (player, zoom) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._category == 'player' && zoom != undefined && player._stats.clientId) {
			if (taro.isServer) {
				taro.network.send('camera', { cmd: 'zoom', zoom: zoom }, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.client.setZoom(zoom);
			}
		}
	},

	/**
	 * Player Camera Set Pitch
	 * @param {Player} player
	 * @param {number} angle
	 */
	setCameraPitch: function (player, angle) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats.clientId) {
			player.setCameraPitch(angle);
		}
	},

	/**
	 * Player Camera Set Yaw
	 * @param {Player} player
	 * @param {number} angle
	 */
	setCameraYaw: function (player, angle) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats.clientId) {
			player.setCameraYaw(angle);
		}
	},

	/**
	 * Player Camera Stop Tracking
	 * @param {Player} player
	 */
	stopCameraTracking: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats.clientId) {
			player.cameraStopTracking();
		}
	},

	/**
	 * Change Player Camera Pan Speed
	 * @param {number} panSpeed
	 * @param {Player} player
	 */
	setCameraPanSpeed: function (panSpeed, player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats.clientId) {
			player.changeCameraPanSpeed(panSpeed);
		}
	},

	/**
	 * Position Camera
	 * @param {{x:number, y:number, z:number}} position
	 * @param {Player} player
	 */
	setCameraPosition: function (position, player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (position && player && player._stats.clientId) {
			if (taro.isServer) {
				taro.network.send('camera', { cmd: 'positionCamera', position: position }, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.client.emit('stop-follow');
				taro.client.emit('camera-position', [position.x, position.y]);
			}
		}
	},

	/**
	 * Player Camera Unlock
	 * @param {Player} player
	 */
	cameraUnlock: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats.clientId) {
			if (taro.isServer) {
				taro.network.send('camera', { cmd: 'unlock' }, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.client.emit('camera-unlock');
			}
		}
	},

	/**
	 * Create Item At Position With Quantity
	 * @param {ItemTypeId} itemTypeId - The unique identifier for the item type
	 * @param {{x:number, y:number, z:number}} position - The position coordinates where the item should be created
	 * @param {number} quantity - The quantity of the item to be created
	 */
	createItem: function (itemTypeId, position, quantity) {
		let itemData = taro.game.cloneAsset('itemTypes', itemTypeId);
		if (quantity == -1 || !quantity) {
			quantity = null;
		}

		if (taro.game.isWorldMap && !this.varsFromTrigger.isWorldScript) {
			let itemAttributes = [];
			itemAttributes = itemAttributes.concat(Object.keys(itemData?.bonus?.consume?.unitAttribute || {}) || []);
			itemAttributes = itemAttributes.concat(Object.keys(itemData?.bonus?.consume?.playerAttribute || {}) || []);
			itemAttributes = itemAttributes.concat(Object.keys(itemData?.bonus?.passive?.unitAttribute || {}) || []);
			itemAttributes = itemAttributes.concat(Object.keys(itemData?.bonus?.passive?.playerAttribute || {}) || []);
		}

		if (itemData) {
			itemData.itemTypeId = itemTypeId;
			itemData.isHidden = false;
			itemData.stateId = 'dropped';
			itemData.quantity = quantity;
			itemData.spawnPosition = position;
			itemData.defaultData = {
				translate: position,
				rotate: Math.random(0, 700) / 100,
			};
			let item = new Item(itemData);
			taro.game.lastCreatedItemId = item._id;
			taro.script.trigger('entityCreatedGlobal', { entityId: item.id() });
			item.script.trigger('entityCreated');
		} else {
			// throw new Error('invalid item type data');
		}
	},

	/**
	 * Creates an item with maximum allowed quantity at the specified position
	 * @param {ItemTypeId} itemTypeId - The unique identifier for the item type
	 * @param {{x:number, y:number, z:number}} position - The position coordinates where the item should be created
	 */
	createItemWithMaxQuantity: function (itemTypeId, position) {
		let itemData = taro.game.cloneAsset('itemTypes', itemTypeId);
		let quantity = itemData.maxQuantity;

		if (quantity == -1) {
			quantity = null;
		}

		if (taro.game.isWorldMap && !this.varsFromTrigger.isWorldScript) {
			let itemAttributes = [];
			itemAttributes = itemAttributes.concat(Object.keys(itemData?.bonus?.consume?.unitAttribute || {}) || []);
			itemAttributes = itemAttributes.concat(Object.keys(itemData?.bonus?.consume?.playerAttribute || {}) || []);
			itemAttributes = itemAttributes.concat(Object.keys(itemData?.bonus?.passive?.unitAttribute || {}) || []);
			itemAttributes = itemAttributes.concat(Object.keys(itemData?.bonus?.passive?.playerAttribute || {}) || []);
		}

		if (itemData) {
			itemData.itemTypeId = itemTypeId;
			itemData.isHidden = false;
			itemData.stateId = 'dropped';
			itemData.spawnPosition = position;
			itemData.quantity = quantity;
			itemData.defaultData = {
				translate: position,
				rotate: Math.random(0, 700) / 100,
			};
			let item = new Item(itemData);
			taro.game.lastCreatedItemId = item._id;
			taro.script.trigger('entityCreatedGlobal', { entityId: item.id() });
			item.script.trigger('entityCreated');
		} else {
			// throw new Error('invalid item type data');
		}
	},

	/**
	 * Give New Item To Unit
	 * @param {ItemTypeId} itemTypeId
	 * @param {Unit} unit
	 */
	giveNewItemToUnit: function (itemType, unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		let itemTypeId = itemType;
		let itemData = taro.game.cloneAsset('itemTypes', itemTypeId);
		if (itemData && unit && unit._category == 'unit') {
			itemData.itemTypeId = itemTypeId;
			itemData.defaultData = {
				translate: unit._translate,
				rotate: unit._rotate.z,
			};
			unit.pickUpItem(itemData);
		}
	},

	/**
	 * Give New Item With Quantity To Unit
	 * @param {ItemTypeId} itemTypeId
	 * @param {Unit} unit
	 * @param {(number | undefined)} quantity - -1 means infinite quantity, undefined means default max quantity
	 */
	giveNewItemWithQuantityToUnit: function (itemType, unit, quantity) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		let itemTypeId = itemType;
		let itemData = taro.game.cloneAsset('itemTypes', itemTypeId);
		if (itemData) {
			// -1 means infinite quantity
			if (quantity == -1) {
				quantity = null;
			}
			if (quantity === undefined) {
				quantity = itemData.quantity;
			}
			if (unit && unit._category == 'unit') {
				itemData.itemTypeId = itemTypeId;
				itemData.quantity = quantity;
				itemData.defaultData = {
					translate: unit._translate,
					rotate: unit._rotate.z,
				};
				unit.pickUpItem(itemData);
			}
		}
	},

	/**
	 * Make Unit Select Item At Slot
	 * @param {Unit} unit
	 * @param {number} slotIndex
	 */
	makeUnitSelectItemAtSlot: function (unit, slotIndex) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		slotIndex = slotIndex - 1;
		if (unit) {
			unit.changeItem(slotIndex);
		} // error log
		// else {
		// 	if (unit == undefined || unit._category != 'unit') // throw new Error("unit doesn't exist");
		// }
	},

	/**
	 * Set Owner Unit Of Projectile
	 * @param {Unit} unit - The unit to set as owner
	 * @param {Projectile} projectile - The projectile to update
	 */
	setSourceUnitOfProjectile: function (unit, projectile) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (projectile && typeof projectile.id === 'function') projectile = taro.$(projectile.id());
		if (projectile && unit) {
			projectile.setSourceUnit(unit);
		}
	},

	/**
	 * Set Source Item Of Projectile
	 * @param {Item} item
	 * @param {Projectile} projectile
	 */
	setSourceItemOfProjectile: function (item, projectile) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (projectile && typeof projectile.id === 'function') projectile = taro.$(projectile.id());
		if (projectile && item) {
			projectile.setSourceItem(item);
		}
	},

	/**
	 * Play Ad For Everyone
	 */
	playAdForEveryone: function () {
		if (taro.tierFeaturesToggle[taro.game.data.defaultData.tier || '1'].ads) {
			if (!taro.ad.lastPlayedAd || Date.now() - taro.ad.lastPlayedAd >= 60000) {
				taro.ad.play({ type: 'preroll' });
				taro.ad.lastPlayedAd = Date.now();
			} else {
				taro.ad.prerollEventHandler('video-ad-action-limit-reached');
			}
		}
	},

	/**
	 * Play Ad For Player
	 * @param {Player} player
	 */
	playAdForPlayer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && taro.tierFeaturesToggle[taro.game.data.defaultData.tier || '1'].ads) {
			if (player && player._stats && player._stats.clientId) {
				if (!taro.ad.lastPlayedAd || Date.now() - taro.ad.lastPlayedAd >= 60000) {
					taro.ad.play({ type: 'preroll' }, player._stats.clientId);
				} else {
					taro.ad.prerollEventHandler('video-ad-action-limit-reached', player._stats.clientId);
				}
			}
		}
	},

	/**
	 * Make Unit Pickup Item
	 * @param {Item} item
	 * @param {Unit} unit
	 */
	makeUnitPickUpItem: function (item, unit) {
		if (item && typeof item.id === 'function') item = taro.$(item.id());
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		// pickup ownerLess items
		if (unit && unit._category == 'unit' && item && item._category === 'item' && !item.getOwnerUnit()) {
			unit.pickUpItem(item);
		} // error log
		// else {
		// 	if (unit == undefined || unit._category != 'unit') // throw new Error("unit doesn't exist");
		// }
	},

	/**
	 * Play Sound At Position
	 * @param {{x:number, y:number, z:number}} position
	 * @param {string} sound
	 */
	playSound: function (position, sound) {
		// if csp enable dont stream sound
		if (sound && position) {
			if (taro.isServer) {
				taro.network.send('sound', { id: sound, position: position });
			} else {
				taro.sound.run({ id: sound, position: position });
			}
		}
	},

	/**
	 * Play Sound For Player
	 * @param {Player} player
	 * @param {string} sound
	 */
	playSoundForPlayer: function (player, sound) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (sound && player && player._stats.clientId) {
			if (taro.isServer) {
				taro.network.send(
					'sound',
					{
						cmd: 'playSoundForPlayer',
						sound,
					},
					player._stats.clientId
				);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.sound.run({ cmd: 'playSoundForPlayer', sound });
			}
		}
	},

	/**
	 * Stop Sound For Player
	 * @param {Player} player
	 * @param {string} sound
	 */
	stopSoundForPlayer: function (player, sound) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (sound && player && player._stats.clientId) {
			if (taro.isServer) {
				taro.network.send(
					'sound',
					{
						cmd: 'stopSoundForPlayer',
						sound,
					},
					player._stats.clientId
				);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.sound.run({ cmd: 'stopSoundForPlayer', sound });
			}
		}
	},

	/**
	 * Play Music
	 * @param {string} music
	 */
	playMusic: function (music) {
		// if csp enable don't stream music
		if (music) {
			if (taro.isServer) {
				taro.network.send('sound', { cmd: 'playMusic', id: music });
			} else {
				taro.sound.run({ cmd: 'playMusic', id: music });
			}
		}
	},

	/**
	 * Stop Music
	 */
	stopMusic: function () {
		if (taro.isServer) {
			taro.network.send('sound', { cmd: 'stopMusic' });
		} else {
			taro.sound.run({ cmd: 'stopMusic' });
		}
	},

	/**
	 * Play Music For Player
	 * @param {Player} player
	 * @param {string} music
	 */
	playMusicForPlayer: function (player, music) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (music && player && player._stats.clientId) {
			if (taro.isServer) {
				taro.network.send(
					'sound',
					{
						cmd: 'playMusicForPlayer',
						music,
					},
					player._stats.clientId
				);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.sound.run({ cmd: 'playMusicForPlayer', music });
			}
		}
	},

	/**
	 * Stop Music For Player
	 * @param {Player} player
	 */
	stopMusicForPlayer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._category === 'player' && player._stats.clientId) {
			if (taro.isServer) {
				taro.network.send(
					'sound',
					{
						cmd: 'stopMusicForPlayer',
					},
					player._stats.clientId
				);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.sound.run({ cmd: 'stopMusicForPlayer' });
			}
		}
	},

	/**
	 * Play Music For Player At Time
	 * @param {number} time
	 * @param {Player} player
	 * @param {string} music
	 */
	playMusicForPlayerAtTime: function (time, player, music) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (music && player && time && player._stats.clientId) {
			if (taro.isServer) {
				taro.network.send(
					'sound',
					{
						cmd: 'playMusicForPlayerAtTime',
						music,
						time,
					},
					player._stats.clientId
				);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.sound.run({ cmd: 'playMusicForPlayerAtTime', music, time });
			}
		}
	},

	/**
	 * Play Music For Player Repeatedly
	 * @param {Player} player
	 * @param {string} music
	 */
	playMusicForPlayerRepeatedly: function (player, music) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (music && player && player._category == 'player' && player._stats.clientId) {
			if (taro.isServer) {
				taro.network.send(
					'sound',
					{
						cmd: 'playMusicForPlayerRepeatedly',
						music,
					},
					player._stats.clientId
				);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.sound.run({ cmd: 'playMusicForPlayerRepeatedly', music });
			}
		}
	},

	/**
	 * Show Menu And Select Current Server
	 * @param {Player} player
	 */
	showMenuAndSelectCurrentServer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._category == 'player' && player._stats.clientId) {
			taro.network.send(
				'ui',
				{
					command: 'showMenuAndSelectCurrentServer',
				},
				player._stats.clientId
			);
		}
	},

	/**
	 * Show Menu And Select Best Server
	 * @param {Player} player
	 */
	showMenuAndSelectBestServer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._category == 'player' && player._stats.clientId) {
			taro.network.send(
				'ui',
				{
					command: 'showMenuAndSelectBestServer',
				},
				player._stats.clientId
			);
		}
	},

	/**
	 * Flip Entity Sprite
	 * @param {Entity} entity
	 * @param {string} flip
	 */
	flipSprite: function (entity, flip) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		// console.log('flipUnitSprite:',action);
		let flipCode = 0;
		if (flip == 'horizontal') flipCode = 1;
		if (flip == 'vertical') flipCode = 2;
		if (flip == 'both') flipCode = 3;
		if (entity && this.entityCategories.indexOf(entity._category) > -1) {
			entity.streamUpdateData([{ flip: flipCode }]);
		}
	},

	/**
	 * Apply Impulse On Entity X Y
	 * @param {Entity} entity
	 * @param {number} impulse
	 * @param {{x:number, y:number, z:number}} direction
	 */
	applyImpulseOnAxises: function (entity, impulse, direction) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && this.entityCategories.indexOf(entity._category) > -1) {
			if (
				entity &&
				this.entityCategories.indexOf(entity._category) > -1 &&
				!isNaN(direction.x) &&
				!isNaN(direction.y) &&
				!isNaN(direction.z)
			) {
				const magnitude = Math.hypot(direction.x, direction.y, direction.z);
				direction.x /= magnitude;
				direction.y /= magnitude;
				direction.z /= magnitude;
				entity.applyImpulse(direction.x * impulse, direction.y * impulse, direction.z * impulse);
			}
		} else {
			// throw new Error('invalid entity');
		}
	},

	/**
	 * Apply Impulse At Angle
	 * @param {Entity} entity
	 * @param {number} impulse
	 * @param {number | {pitch: number, yaw: number}} angle
	 */
	applyImpulse: function (entity, impulse, angle) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && this.entityCategories.indexOf(entity._category) > -1) {
			if (typeof angle === 'number') {
				let radians = angle - Math.radians(90); // entity's facing angle
				if (!isNaN(radians) && !isNaN(impulse)) {
					let impulseX = Math.cos(radians) * impulse;
					let impulseY = Math.sin(radians) * impulse;
					entity.applyImpulse(impulseX, impulseY);
				}
			} else if (angle && !isNaN(angle.yaw) && !isNaN(angle.pitch)) {
				let yawRadians = Math.radians(angle.yaw) - Math.radians(90);
				let impulseX = Math.cos(yawRadians) * impulse * Math.cos(Math.radians(angle.pitch));
				let impulseY = Math.sin(yawRadians) * impulse * Math.cos(Math.radians(angle.pitch));
				let impulseZ = Math.sin(Math.radians(angle.pitch)) * impulse;
				entity.applyImpulse(impulseX, impulseY, impulseZ);
			}
		} else {
			// throw new Error('invalid entity');
		}
	},

	/**
	 * Apply Force On Entity X Y Z
	 * @param {Entity} entity - The entity to apply force to
	 * @param {{x:number, y:number, z:number} | {x:number, y:number}} force - The force vector to apply
	 * @param {boolean} [relative=false] - Whether the force is relative to entity's orientation
	 * @param {number} [angle=0] - The angle in degrees to apply the force at
	 */
	applyForceOnAxises: function (entity, force, relative = false, angle = 0) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		// action.forceX
		if (entity && this.entityCategories.indexOf(entity._category) > -1) {
			let radians = (relative ? entity._rotate.z : 0) + angle + Math.radians(-90); // entity's facing angle
			let forceX = force.x;
			if (forceX == undefined || isNaN(forceX)) {
				forceX = 0;
			}
			let forceY = force.y;
			if (forceY == undefined || isNaN(forceY)) {
				forceY = 0;
			}
			let forceZ = force.z;
			if (forceZ == undefined || isNaN(forceZ)) {
				forceZ = 0;
			}

			if (relative || angle !== 0) {
				let force = {
					x: Math.cos(radians) * forceY + Math.cos(radians) * forceX,
					y: Math.sin(radians) * forceY + Math.sin(radians) * forceX,
					z: forceZ,
				};
			}

			entity.applyForce(force.x, force.y, forceZ);
		} else {
			// throw new Error('invalid entity');
		}
	},

	/**
	 * Apply Force On Entity
	 * @param {Entity} entity - The entity to apply force to
	 * @param {number} force - The magnitude of the force to apply
	 * @param {boolean} [relative=false] - Whether the force is relative to entity's orientation
	 * @param {{pitch: number, yaw: number} | number} [angle={ pitch: 0, yaw: 0 } | 0] - The angle in degrees to apply the force at
	 */
	applyForce: function (entity, force, relative = false, angle = taro.is3DServerPhysics() ? { pitch: 0, yaw: 0 } : 0) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && this.entityCategories.indexOf(entity._category) > -1) {
			let radians =
				(relative ? entity._rotate.z : 0) +
				Math.radians(typeof angle === 'object' ? angle.yaw || 0 : angle) +
				Math.radians(-90); // entity's facing angle
			let forceX = Math.cos(radians) * force;
			let forceY = Math.sin(radians) * force;
			let forceZ = Math.sin(Math.radians(angle.pitch || 0)) * force;
			entity.applyForce(forceX, forceY, forceZ);
		} else {
			// throw new Error('invalid entity');
		}
	},

	/**
	 * Creates a new entity in the game world with specified properties.
	 * The entity can be a unit, projectile, prop or item based on the entityType parameter.
	 *
	 * @param {EntityTypeId} entityTypeId - The type of entity to create
	 * @param {{x:number, y:number, z:number}} position - The spawn position coordinates
	 * @param {Player} [player] - The player object that will own the entity. Required when creating units.
	 * @param {{x:number, y:number, z:number}} [rotation] - The rotation values in degrees
	 * @param {{x:number, y:number, z:number}} [scale] - Scale multipliers for entity dimensions
	 * @param {number} [angle=0] - Alternative rotation angle in degrees (deprecated, use rotation.y instead)
	 *
	 * @returns {(Unit|Projectile|Prop|Item|null)} The created entity instance, or null if creation failed
	 *
	 * @throws {Error} When creating a unit without providing a player object
	 * @throws {Error} When required entityType or position parameters are missing
	 *
	 * @example
	 * // Create a unit
	 * const player = param.getTriggeringPlayer();
	 * const soldier = action.createEntity(UnitTypes["soldier"], {x: 0, y: 0, z: 0}, player);
	 *
	 * // Create a prop with rotation
	 * const tree = action.createEntity(PropTypes["tree"], {x: 0, y: 0, z: 0}, null, {x: 0, y: 45, z: 0});
	 *
	 * // Create a scaled item
	 * const sword = action.createEntity(ItemTypes["sword"], {x: 0, y: 0, z: 0}, null, undefined, {x: 2, y: 2, z: 2});
	 */
	createEntity: function (
		entityTypeId,
		position,
		player,
		rotation = { x: 0, y: 0, z: 0 },
		scale = { x: 1, y: 1, z: 1 },
		angle = 0
	) {
		let entityTypeData;
		let entityCategory;
		if (player && typeof player.id === 'function') player = taro.$(player.id());

		for (let type of ['unitTypes', 'projectileTypes', 'propTypes', 'itemTypes']) {
			if (taro.game.data[type][entityTypeId]) {
				entityCategory = type;
				entityTypeData = taro.game.data[type][entityTypeId];
				break;
			}
		}

		if (entityTypeId && position) {
			let data = Object.assign({}, entityTypeData);

			position.x = parseFloat(position.x);
			position.y = parseFloat(position.y);

			if (!isNaN(rotation?.y)) {
				angle = parseFloat(rotation.y % 360);
			} else {
				angle = parseFloat(angle % 360);
			}

			let angleInRadians = Math.radians(angle);

			let createdEntity = null;

			if (entityCategory === 'itemTypes') {
				if (taro.game.isWorldMap && !this.varsFromTrigger.isWorldScript) {
					let itemAttributes = [];
					itemAttributes = itemAttributes.concat(Object.keys(data?.bonus?.consume?.unitAttribute || {}) || []);
					itemAttributes = itemAttributes.concat(Object.keys(data?.bonus?.consume?.playerAttribute || {}) || []);
					itemAttributes = itemAttributes.concat(Object.keys(data?.bonus?.passive?.unitAttribute || {}) || []);
					itemAttributes = itemAttributes.concat(Object.keys(data?.bonus?.passive?.playerAttribute || {}) || []);
				}

				data.itemTypeId = entityTypeId;
				data.isHidden = false;
				data.stateId = 'dropped';
				data.defaultData = {
					translate: position,
					rotate: angleInRadians,
				};
				data.scale = scale;
				data.scaleBody = { x: Math.abs(scale.x), y: Math.abs(scale.y), z: Math.abs(scale.z) };
				data.rotation = rotation;
				createdEntity = new Item(rfdc()(data));
				taro.game.lastCreatedItemId = createdEntity._id;
			} else if (entityCategory === 'projectileTypes') {
				data = Object.assign(data, {
					type: entityTypeId,
					//FIXME: handle the init data
					// bulletForce: force,
					sourceItemId: undefined,
					// sourceUnitId: unitId,
					defaultData: {
						translate: position,
						rotate: angleInRadians,
					},
					streamMode: 1,
				});
				data.scale = scale;
				data.scaleBody = { x: Math.abs(scale.x), y: Math.abs(scale.y), z: Math.abs(scale.z) };
				data.rotation = rotation;
				createdEntity = new Projectile(rfdc()(data));
				taro.game.lastCreatedProjectileId = createdEntity._id;
			} else if (entityCategory === 'unitTypes') {
				data = Object.assign(data, {
					type: entityTypeId,
					defaultData: {
						translate: position,
						rotate: angleInRadians,
					},
				});
				data.scale = scale;
				data.scaleBody = { x: Math.abs(scale.x), y: Math.abs(scale.y), z: Math.abs(scale.z) };
				data.rotation = rotation;

				if (player) {
					createdEntity = player.createUnit(rfdc()(data));
				} else {
					// throw new Error("failed to create new unit because player doesn't exist");
				}

				taro.game.lastCreatedUnitId = createdEntity._id;
			} else if (entityCategory === 'propTypes') {
				data = Object.assign(data, {
					type: entityTypeId,
					defaultData: {
						translate: position,
						rotate: data.rotation ? Math.radians(data.rotation.y) : angleInRadians,
					},
					scale: scale,
					scaleBody: { x: Math.abs(scale.x), y: Math.abs(scale.y), z: Math.abs(scale.z) },
				});
				data.rotation = rotation;
				createdEntity = new Prop(rfdc()(data));
				taro.game.lastCreatedPropId = createdEntity._id;
			}

			taro.script.trigger('entityCreatedGlobal', { entityId: createdEntity.id() });
			createdEntity.script?.trigger('entityCreated', { thisEntityId: createdEntity.id() });
		}
	},

	/**
	 * Set Entity Z Offset
	 * @param {Entity} entity
	 * @param {number} zOffset
	 */
	setZOffset: function (entity, zOffset) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && this.entityCategories.indexOf(entity._category) > -1 && typeof zOffset === 'number') {
			const isWorldEntity = entity._stats.isWorld;
			if (taro.game.isWorldMap && !this.varsFromTrigger.isWorldScript && isWorldEntity) {
				this._script.errorLog(`can not update world entity from map (entity: ${entity._stats.name})`);
				console.log(`can not update world entity from map (entity: ${entity._stats.name})`, path);
				return;
			}

			entity.streamUpdateData([{ zOffset: zOffset }]);
		}
	},

	/**
	 * Renders a line between two positions in the game world
	 * @param {{x:number, y:number, z:number}} position1 - Starting position coordinates
	 * @param {{x:number, y:number, z:number}} position2 - Ending position coordinates
	 * @param {string} [color='white'] - Color of the line (CSS color string)
	 * @param {number} [seconds=1] - Duration in seconds to display the line
	 */
	renderLineBetweenPositions: function (p1, p2, color = 'white', seconds = 1) {
		if (p1 && p2) {
			// taro.client?.emit('renderLineBetweenPositions', { start: p1, end: p2, color, lifetime: seconds });
			taro.network.send('renderLineBetweenPositions', { start: p1, end: p2, color, lifetime: seconds });
		}
	},

	/**
	 * Set Entity Opacity
	 * @param {Entity} entity
	 * @param {number} opacity
	 */
	setOpacity: function (entity, opacity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && typeof opacity === 'number') {
			if (opacity < 0) {
				opacity = 0;
			} else if (opacity > 1) {
				opacity = 1;
			}
			entity.opacity(opacity);
			if (taro.isServer) {
				entity.streamUpdateData([{ opacity: opacity }]);
			}
		}
	},

	/**
	 * Set  Gravity
	 * @param {{x:number, y:number, z:number}} gravity
	 */
	setGravity: function (gravity) {
		taro.physics.gravity(gravity.x, gravity.y, gravity.z);
		taro.network.send('setGravity', gravity);
	},

	/**
	 * Set Skybox Opacity
	 * @param {number} opacity
	 */
	setSkyboxOpacity: function (opacity) {
		if (typeof opacity === 'number') {
			opacity = Math.max(0, Math.min(1, opacity));
			taro.network.send('setSkyboxOpacity', opacity);
		}
	},

	/**
	 * Set Ambient Light Intensity
	 * @param {number} intensity
	 */
	setAmbientLightIntensity: function (intensity) {
		if (typeof intensity === 'number') {
			intensity = Math.max(0, intensity);
			taro.network.send('setAmbientLightIntensity', intensity);
		}
	},

	/**
	 * Set Ambient Light Color
	 * @param {string} color
	 */
	setAmbientLightColor: function (color) {
		if (typeof color === 'string') {
			taro.network.send('setAmbientLightColor', color);
		}
	},

	/**
	 * Set Directional Light Intensity
	 * @param {number} intensity
	 */
	setDirectionalLightIntensity: function (intensity) {
		if (typeof intensity === 'number') {
			intensity = Math.max(0, intensity);
			taro.network.send('setDirectionalLightIntensity', intensity);
		}
	},

	/**
	 * Set Directional Light Color
	 * @param {string} color
	 */
	setDirectionalLightColor: function (color) {
		if (typeof color === 'string') {
			taro.network.send('setDirectionalLightColor', color);
		}
	},

	/**
	 * Set Directional Light Position
	 * @param {Entity} position
	 */
	setDirectionalLightPosition: function (position) {
		if (typeof position.x === 'number' && typeof position.y === 'number' && typeof position.z === 'number') {
			taro.network.send('setDirectionalLightPosition', position);
		}
	},

	/**
	 * Set Fog Enabled
	 * @param {boolean} enabled
	 */
	setFogEnabled: function (enabled) {
		if (typeof enabled === 'boolean') {
			taro.network.send('setFogEnabled', enabled);
		}
	},

	/**
	 * Set Fog Color
	 * @param {string} color
	 */
	setFogColor: function (color) {
		if (typeof color === 'string') {
			taro.network.send('setFogColor', color);
		}
	},

	/**
	 * Set Fog Near
	 * @param {number} near
	 */
	setFogNear: function (near) {
		if (typeof near === 'number') {
			taro.network.send('setFogNear', near);
		}
	},

	/**
	 * Set Fog Far
	 * @param {number} far
	 */
	setFogFar: function (far) {
		if (typeof far === 'number') {
			taro.network.send('setFogFar', far);
		}
	},

	/**
	 * Set Fog Density
	 * @param {number} density
	 */
	setFogDensity: function (density) {
		if (typeof density === 'number') {
			taro.network.send('setFogDensity', density);
		}
	},

	/**
	 * Set Entity Life Span
	 * @param {Entity} entity
	 * @param {number} lifespan
	 */
	setLifeSpan: function (entity, lifespan) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && lifespan != undefined && !isNaN(parseFloat(lifespan))) {
			const isWorldEntity = entity._stats.isWorld;
			if (taro.game.isWorldMap && !this.varsFromTrigger.isWorldScript && isWorldEntity) {
				this._script.errorLog(`can not update world entity from map (entity: ${entity._stats.name})`);
				console.log(`can not update world entity from map (entity: ${entity._stats.name})`, path);
				return;
			}

			entity.lifeSpan(lifespan);
		}
	},

	_setAttribute: function (entity, attributeName, value, min, max, regenerationValue) {
		if (!entity) {
			return;
		}
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let attributeId;
		if (this.cachedAttributeIdLut[attributeName]) {
			attributeId = this.cachedAttributeIdLut[attributeName];
		} else {
			for (let [attrId, attr] of Object.entries(entity._stats.attributes)) {
				if (attr.name === attributeName) {
					this.cachedAttributeIdLut[attributeName] = attrId;
					attributeId = attrId;
				}
			}
		}

		if (!entity) {
			// throw new Error('entity is not exist');
		}

		if (!entity._stats.attributes[attributeId]) {
			// throw new Error(`attribute: ${attributeName} is not exist`);
		}

		if (value !== undefined && value !== null && isNaN(value)) {
			// throw new Error('value is not a number');
		}
		if (min !== undefined && min !== null && isNaN(min)) {
			// throw new Error('min is not a number');
		}
		if (max !== undefined && max !== null && isNaN(max)) {
			// throw new Error('max is not a number');
		}
		if (regenerationValue !== undefined && regenerationValue !== null && isNaN(regenerationValue)) {
			// throw new Error('regenerationRate is not a number');
		}

		if (
			entity &&
			this.entityCategories.indexOf(entity._category) > -1 &&
			entity._stats.attributes &&
			entity._stats.attributes[attributeId] != undefined
		) {
			let attribute = entity._stats.attributes[attributeId];

			const isWorldEntity =
				entity._category == 'player'
					? taro.game.getAsset('playerTypes', entity._stats.playerTypeId)?.isWorld
					: entity._stats.isWorld;
			const canBeUpdatedByMap = attribute.canBeUpdatedByMap;
			if (taro.game.isWorldMap && !this.varsFromTrigger.isWorldScript && isWorldEntity && !canBeUpdatedByMap) {
				this._script.errorLog(
					`can not update world entity's attribute from map (entity: ${entity._stats.name}, attribute: ${attribute.name})`
				);
				console.log(
					`can not update world entity's attribute from map (entity: ${entity._stats.name}, attribute: ${attribute.name})`,
					path,
					attributeId
				);
				return;
			}
			if (regenerationValue !== undefined && regenerationValue !== null) {
				let regenerationSpeed = {};
				regenerationSpeed[attributeId] = regenerationValue;
				entity.streamUpdateData([{ attributesRegenerateRate: regenerationSpeed }]);
			} else {
				entity.attribute.update(attributeId, value ?? null, min ?? null, max ?? null); // update attribute, and check for attribute becoming 0
			}
		}
	},

	/**
	 * Sets the current value of an entity's attribute
	 * @param {Entity} entity - The entity whose attribute should be modified
	 * @param {string} attributeName - Name of the attribute to modify
	 * @param {number} value - New value to set for the attribute
	 */
	setAttributeValue: function (entity, attributeName, value) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		this._setAttribute(entity, attributeName, value);
	},

	/**
	 * Sets the minimum value of an entity's attribute
	 * @param {Entity} entity - The entity whose attribute should be modified
	 * @param {string} attributeName - Name of the attribute to modify
	 * @param {number} min - New minimum value to set for the attribute
	 */
	setAttributeMin: function (entity, attributeName, min) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		this._setAttribute(entity, attributeName, undefined, min);
	},

	/**
	 * Sets the maximum value of an entity's attribute
	 * @param {Entity} entity - The entity whose attribute should be modified
	 * @param {string} attributeName - Name of the attribute to modify
	 * @param {number} max - New maximum value to set for the attribute
	 */
	setAttributeMax: function (entity, attributeName, max) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		this._setAttribute(entity, attributeName, undefined, undefined, max);
	},

	/**
	 * Sets the regeneration rate of an entity's attribute
	 * @param {Entity} entity - The entity whose attribute should be modified
	 * @param {string} attributeName - Name of the attribute to modify
	 * @param {number} regenerationRate - New regeneration rate to set for the attribute
	 */
	setAttributeRegen: function (entity, attributeName, regenerationRate) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		this._setAttribute(entity, attributeName, undefined, undefined, undefined, regenerationRate);
	},

	/**
	 * Add Attribute Buff To Unit
	 * @param {string} attribute
	 * @param {number} value
	 * @param {Entity} entity
	 * @param {number} time
	 */
	addAttributeBuffToUnit: function (attribute, value, entity, time) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let attrId = attribute;
		if (
			entity &&
			this.entityCategories.indexOf(entity._category) > -1 &&
			entity._stats.attributes &&
			entity._stats.attributes[attrId] != undefined &&
			value != undefined &&
			entity._stats.buffs
		) {
			let isAttributeVisible = false;
			/* if (entity._category === 'player') {
				isAttributeVisible = !!attribute.isVisible;
				}
				else {
				isAttributeVisible = attribute.isVisible instanceof Array && attribute.isVisible.length > 0;
				} */
			entity.addAttributeBuff(attrId, value, time, false); // update attribute, and check for attribute becoming 0
		}
	},

	/**
	 * Add Percentage Attribute Buff To Unit
	 * @param {string} attribute
	 * @param {number} value
	 * @param {Entity} entity
	 * @param {number} time
	 */
	addPercentageAttributeBuffToUnit: function (attribute, value, entity, time) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let attrId = attribute;
		if (
			entity &&
			this.entityCategories.indexOf(entity._category) > -1 &&
			entity._stats.attributes &&
			entity._stats.attributes[attrId] != undefined &&
			value != undefined &&
			entity._stats.buffs
		) {
			let isAttributeVisible = false;
			/* if (entity._category === 'player') {
				isAttributeVisible = !!attribute.isVisible;
				}
				else {
				isAttributeVisible = attribute.isVisible instanceof Array && attribute.isVisible.length > 0;
				} */
			entity.addAttributeBuff(attrId, value, time, true); // update attribute, and check for attribute becoming 0
		}
	},

	/**
	 * Remove All Attribute Buffs
	 * @param {Entity} unit
	 */
	removeAllAttributeBuffs: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit._stats && unit._stats.buffs) {
			for (let i = 0; i < unit._stats.buffs.length; i++) {
				unit._stats.buffs[i].timeLimit = 0;
			}
		}
	},

	/**
	 * Move Entity
	 * @param {Entity} entity
	 * @param {{x: number, y: number, z: number}} position
	 */
	move: function (entity, position) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (position && entity && ['unit', 'item', 'projectile', 'prop'].includes(entity._category)) {
			entity.teleportTo(position.x, position.y, taro.is3DServerPhysics() ? position.z ?? 0 : 0, entity._rotate.z);
		}
		// if we ever decide to allow region to be moved using moveEntity, this is how you do it
		// else if (entity._category == 'region' && !isNaN(position.x) && !isNaN(position.y)) {
		// 	entity.streamUpdateData([{ x: position.x }, { y: position.y }]);
		// }
	},

	/**
	 * Teleport Entity
	 * @param {Entity} entity
	 * @param {{x: number, y: number, z: number}} position
	 */
	teleport: function (entity, position) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (position && entity && ['unit', 'item', 'projectile', 'prop'].includes(entity._category)) {
			entity.teleportTo(position.x, position.y, taro.is3DServerPhysics() ? position.z ?? 0 : 0, entity._rotate.z, true);
		}
	},

	/**
	 * Destroy Entity
	 * @param {Entity} entity
	 */
	destroy: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		let _entity = entity;
		if (_entity && this.entityCategories.indexOf(_entity._category) > -1) {
			_entity.remove();
		} else {
			taro.script.errorLog(`invalid unit, ${JSON.stringify(_entity)}`);
			// throw new Error('invalid unit');
		}
	},

	/**
	 * Reset Entity
	 * @param {Entity} entity
	 */
	reset: function (entity) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && ['unit', 'item', 'projectile'].includes(entity._category)) {
			if (entity._category === 'unit') entity.resetUnitType();
			else if (entity._category === 'item') entity.resetItemType();
			else if (entity._category === 'projectile') entity.resetProjectileType();
		} else {
			taro.script.errorLog(`invalid unit, ${JSON.stringify(entity)}`);
			// throw new Error('invalid unit');
		}
	},

	/**
	 * Set Entity Variable
	 * @param {Entity} entity - The entity to set the variable for
	 * @param {string} variableId - The ID of the variable to set
	 * @param {*} value - The new value to set for the variable
	 */
	setEntityVariable: function (entity, variableId, value) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (value && typeof value.id === 'function') value = taro.$(value.id());
		if (variableId && entity?.variables) {
			const isWorldEntityVariable = entity._stats.isWorld;
			const canBeUpdatedByMap = entity?.variables?.[variableId]?.canBeUpdatedByMap;

			if (taro.game.isWorldMap && !this.varsFromTrigger.isWorldScript && isWorldEntityVariable && !canBeUpdatedByMap) {
				this._script.errorLog(
					`can not update world entity variable from map (entity: ${entity._stats.name}, variable: ${variableId.key})`
				);
				console.log(
					`can not update world entity variable from map (entity: ${entity._stats.name}, variable: ${variableId.key})`,
					path,
					variableId
				);
				return;
			}
			entity.variable.update(variableId, value);
		}
	},

	/**
	 * Rotate Entity To Radians
	 * @param {Entity} entity
	 * @param {number} radians
	 */
	rotateToRadians: function (entity, radians) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && this.entityCategories.indexOf(entity._category) > -1 && radians !== undefined && !isNaN(radians)) {
			// hack to rotate entity properly
			if (taro.isClient) {
				entity.rotateTo(0, 0, radians);
				entity.nextKeyFrame[1][3] = radians;
				entity.isTransforming = true;
			} else {
				entity.streamUpdateData([{ rotate: radians }]);
			}
		}
	},

	/**
	 * Rotate Entity To 3D Rotation
	 * @param {Entity} entity
	 * @param {{x: number, y: number, z: number}} rotation
	 */
	rotate3d: function (entity, rotation) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (
			entity &&
			self.entityCategories.indexOf(entity._category) > -1 &&
			rotation?.x != undefined &&
			rotation?.y != undefined &&
			rotation?.z != undefined &&
			!isNaN(rotation.x) &&
			!isNaN(rotation.y) &&
			!isNaN(rotation.z)
		) {
			if (taro.isClient) {
				entity.rotateTo(rotation.x, rotation.y, rotation.z);
				entity.nextKeyFrame[1][3] = rotation.z;
				entity.hasMoved = true;
			} else {
				entity.streamUpdateData([{ rotate: rotation }]);
			}
		}
	},

	/**
	 * Rotate Entity To Face Position
	 * @param {Entity} entity
	 * @param {{x: number, y: number, z: number}} position
	 */
	rotateToFacePosition: function (entity, position) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (!position || !entity) return;

		if (
			entity._category === 'item' &&
			entity._stats.currentBody &&
			entity._stats.currentBody.jointType === 'weldJoint'
		) {
			return;
		}
		let pos = {
			// displacement between entity and given position (e.g. mouse cursor)
			x: entity._translate.x - position.x,
			y: entity._translate.y - position.y,
		};
		let offset = (Math.PI * 3) / 2;

		let newFacingAngle = Math.atan2(pos.y, pos.x) + offset;

		if (this.entityCategories.indexOf(entity._category) > -1 && position.x != undefined && position.y != undefined) {
			if (taro.isServer) {
				let oldFacingAngle = entity._rotate.z;
				entity.streamUpdateData([{ rotate: newFacingAngle }]);
			}
			// &&
			else if (
				taro.isClient &&
				taro.client?.myPlayer &&
				(entity == taro.client.selectedUnit || entity.getOwner() == taro.client.selectedUnit)
			) {
				if (entity._category === 'item') {
					console.log(newFacingAngle);
				}
				entity.rotateTo(0, 0, newFacingAngle);
			}
		}
	},

	/**
	 * Rotate Entity To Face Position Using Rotation Speed
	 * @param {Entity} entity
	 * @param {{x: number, y: number, z: number}} position
	 */
	rotateToFacePositionUsingRotationSpeed: function (entity, position) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && this.entityCategories.indexOf(entity._category) > -1) {
			if (position && position.x != undefined && position.y != undefined) {
				pos = {
					x: entity._translate.x - position.x,
					y: entity._translate.y - position.y,
				};
				let rotationSpeed = entity._stats.currentBody.rotationSpeed;
				let ninetyDegreesInRadians = (90 * Math.PI) / 180;
				let newFacingAngle = Math.atan2(pos.y, pos.x) - ninetyDegreesInRadians;
				let oldFacingAngle = entity._rotate.z;
				// Prevents the rotation bug that caused units to counter rotate it looked to left
				rotateDiff = (newFacingAngle - (oldFacingAngle % (Math.PI * 2))) % (Math.PI * 2);
				if (rotateDiff > Math.PI) {
					rotateDiff = -(2 * Math.PI) % rotateDiff;
				} else if (rotateDiff < -Math.PI) {
					rotateDiff = (2 * Math.PI) % rotateDiff;
				}
				let degDiff = rotateDiff / 0.05; // 0.0174533 is degree to radian conversion
				let torque = degDiff > 0 ? Math.min(degDiff, rotationSpeed) : Math.max(degDiff, rotationSpeed * -1);
				entity.applyTorque(torque);
			} else {
				// throw new Error(`${entity} - invalid position`);
			}
		} else {
			taro.script.errorLog(`invalid unit, ${entity}`, path);
			// throw new Error(`${entity} - invalid unit`);
		}
	},

	/**
	 * Add Bot Player
	 * @param {string} name - Name of the bot player
	 */
	addBotPlayer: function (name) {
		// bot players meant to be indistinguishable from 'human' players. hence we're not tempering with controlledBy variable
		let player = taro.game.createPlayer({
			controlledBy: 'human',
			name: name,
			clientId: -1, // -1 means the player is a bot
		});
		player._stats.isBot = true;
		player.joinGame();
	},

	/**
	 * Enable A I
	 * @param {Unit} unit
	 */
	enableAI: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit.ai) {
			unit.ai.enable();
		}
	},

	/**
	 * Disable A I
	 * @param {Unit} unit
	 */
	disableAI: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit.ai) {
			unit.ai.disable();
		}
	},

	/**
	 * Set Unit Target Position
	 * @param {Unit} unit
	 * @param {{x: number, y: number, z: number}} position
	 */
	setUnitTargetPosition: function (unit, position) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		// deprecated
		if (unit && unit.ai && position) {
			unit.ai.moveToTargetPosition(position.x, position.y);
		}
	},

	/**
	 * Set Unit Target Unit
	 * @param {Unit} unit
	 * @param {Unit} targetUnit
	 */
	setUnitTargetUnit: function (unit, targetUnit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (targetUnit && typeof targetUnit.id === 'function') targetUnit = taro.$(targetUnit.id());
		// deprecated
		if (unit && unit.ai && targetUnit) {
			unit.ai.attackUnit(targetUnit);
		}
	},

	/**
	 * Change Unit Path Finding Method
	 * @param {Unit} unit
	 * @param {'simple' | 'a*'} method
	 */
	aiChangePathFindingMethod: function (unit, method) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if ((unit && unit.ai && method && method === 'simple') || method === 'a*') {
			unit.ai.changePathFindingMethod(method);
		}
	},

	/**
	 * Ai Move To Position
	 * @param {Unit} unit
	 * @param {{x: number, y: number, z: number}} position
	 */
	aiMoveToPosition: function (unit, position) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit.ai && position) {
			unit.ai.moveToTargetPosition(position.x, position.y);
		}
	},

	/**
	 * Ai Attack Unit
	 * @param {Unit} unit
	 * @param {Unit} targetUnit
	 */
	aiAttackUnit: function (unit, targetUnit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (targetUnit && typeof targetUnit.id === 'function') targetUnit = taro.$(targetUnit.id());
		if (unit && unit.ai && targetUnit) {
			unit.ai.attackUnit(targetUnit);
		}
	},

	/**
	 * Ai Go Idle
	 * @param {Unit} unit
	 */
	aiGoIdle: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (unit && unit.ai) {
			unit.ai.goIdle();
		}
	},

	/**
	 * Make Player Trade With Player
	 * @param {Player} playerA
	 * @param {Player} playerB
	 */
	makePlayerTradeWithPlayer: function (playerA, playerB) {
		if (playerA && typeof playerA.id === 'function') playerA = taro.$(playerA.id());
		if (playerB && typeof playerB.id === 'function') playerB = taro.$(playerB.id());
		if (playerA && playerB && playerA._category === 'player' && playerB._category === 'player') {
			if (!playerA.isTrading && playerA.id() !== playerB.id()) {
				if (!playerB.isTrading) {
					taro.network.send('trade', { type: 'init', from: playerA.id() }, playerB._stats.clientId);
				} else {
					let message = `${playerB._stats.name}is busy`;
					taro.chat.sendToRoom('1', message, playerA._stats.clientId, undefined);
				}
			}
		}
	},

	/**
	 * Apply Torque On Entity
	 * @param {Entity} entity
	 * @param {{x: number, y: number, z: number}} torque
	 */
	applyTorque: function (entity, torque) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && torque) {
			entity.applyTorque(torque);
		}
	},

	/**
	 * Change Scale Of Entity Sprite
	 * @param {Entity} entity
	 * @param {number | {x: number, y: number, z: number}} scale
	 */
	scaleRenderingBody: function (entity, scale) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (
			entity &&
			this.entityCategories.indexOf(entity._category) > -1 &&
			(!isNaN(scale) || !isNaN(scale.x) || !isNaN(scale.y) || !isNaN(scale.z))
		) {
			if (typeof scale === 'number') {
				entity.streamUpdateData([{ scale: parseFloat(scale).toFixed(2) }]);
			} else {
				entity.streamUpdateData([
					{
						scale: {
							x: parseFloat(scale.x).toFixed(2),
							y: parseFloat(scale.y).toFixed(2),
							z: parseFloat(scale.z).toFixed(2),
						},
					},
				]);
			}
		}
	},

	/**
	 * Change Scale Of Entity Body
	 * @param {Entity} entity
	 * @param {number | {x: number, y: number, z: number}} scale
	 */
	scalePhysicsBody: function (entity, scale) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (
			entity &&
			this.entityCategories.indexOf(entity._category) > -1 &&
			(!isNaN(scale) || !isNaN(scale.x) || !isNaN(scale.y) || !isNaN(scale.z))
		) {
			if (typeof scale === 'number') {
				entity.streamUpdateData([{ scaleBody: parseFloat(scale).toFixed(2) }]);
			} else {
				entity.streamUpdateData([
					{
						scaleBody: {
							x: parseFloat(scale.x).toFixed(2),
							y: parseFloat(scale.y).toFixed(2),
							z: parseFloat(scale.z).toFixed(2),
						},
					},
				]);
			}
		}
	},

	/**
	 * Set Entity State
	 * @param {Entity} entity
	 */
	setState: function (entity, stateId) {
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (entity && this.entityCategories.indexOf(entity._category) > -1) {
			entity.setState(stateId);
		}
	},

	/**
	 * Increase Variable By Number
	 * @param {String} variable
	 * @param {number} number
	 */
	increaseVariableByNumber: function (variable, number) {
		let newValue = number;
		if (taro.game.data.variables.hasOwnProperty(variable) && !_.isNaN(newValue) && !_.isNil(newValue)) {
			let variable = taro.game.data.variables[variable];
			if (variable.value === undefined || isNaN(variable.value)) {
				variable = variable.default || 0;
			}
			variable.value += newValue;
		}
	},

	/**
	 * Decrease Variable By Number
	 * @param {String} variable
	 * @param {number} number
	 */
	decreaseVariableByNumber: function (variable, number) {
		let newValue = number;
		if (taro.game.data.variables.hasOwnProperty(variable) && !_.isNaN(newValue) && !_.isNil(newValue)) {
			let variable = taro.game.data.variables[variable];
			if (variable.value === undefined || isNaN(variable.value)) {
				variable = variable.default || 0;
			}
			variable.value -= newValue;
		}
	},

	/**
	 * Load Player Data And Apply It
	 * @param {Player} player
	 * @param {Unit} unit
	 */
	loadPlayerDataAndApplyIt: function (player, unit) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		if (player) {
			if (player.persistedData) {
				player.loadPersistentData();
				if (unit) {
					unit.loadPersistentData();
				}
			}
		}
	},

	/**
	 * Load Unit Data
	 * @param {Unit} unit
	 */
	loadUnitData: function (unit) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		let owner = unit.getOwner();
		if (unit && owner && owner.persistedData) {
			unit.loadPersistentData();
		}
	},

	/**
	 * Load Unit Data From String
	 * @param {Unit} unit
	 * @param {String} string
	 */
	loadUnitDataFromString: function (unit, string) {
		if (unit && typeof unit.id === 'function') unit = taro.$(unit.id());
		let data = JSON.parse(string);
		if (unit && data) {
			unit.loadDataFromString(data);
		}
	},

	/**
	 * Load Player Data From String
	 * @param {Player} player
	 * @param {String} string
	 */
	loadPlayerDataFromString: function (player, string) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		let data = JSON.parse(string);
		if (player && data) {
			player.loadDataFromString(data);
		}
	},

	/**
	 * Load Player Data
	 * @param {Player} player
	 */
	loadPlayerData: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player.persistedData) {
			player.loadPersistentData();
		}
	},

	/**
	 * Change Layer Opacity
	 * @param {number} tileLayer
	 * @param {number} opacity
	 */
	setLayerOpacity: function (tileLayer, opacity) {
		if (taro.game.data.map.layers[tileLayer].type !== 'tilelayer') {
			return;
		} else if (tileLayer > taro.game.data.map.layers.length || tileLayer < 0) {
			return;
		} else {
			taro.developerMode.changeLayerOpacity(
				{
					layer: tileLayer,
					opacity: opacity,
				},
				'server'
			);
		}
	},

	/**
	 * Edit Map Tile
	 * @param {number} tileGid
	 * @param {number} tileLayer
	 * @param {number} tileX
	 * @param {number} tileY
	 * @param {number} width
	 * @param {number} height
	 */
	editMapTiles: function (tileGid, tileLayer, tileX, tileY, width, height) {
		if (
			Number.isInteger(tileGid) &&
			Number.isInteger(tileLayer) &&
			Number.isInteger(tileX) &&
			Number.isInteger(tileY) &&
			Number.isInteger(width) &&
			Number.isInteger(height)
		) {
			if (tileGid < 0 || tileGid > taro.game.data.map.tilesets[0].tilecount) {
				return;
			} else if (taro.game.data.map.layers[tileLayer].type !== 'tilelayer') {
				return;
			} else if (tileLayer > taro.game.data.map.layers.length || tileLayer < 0) {
				return;
			} else if (tileX < 0 || tileX >= taro.game.data.map.width) {
				return;
			} else if (tileY < 0 || tileY >= taro.game.data.map.height) {
				return;
			} else {
				taro.developerMode.editTile(
					{
						edit: {
							selectedTiles: [{ 0: { 0: tileGid } }],
							size: { x: width, y: height },
							shape: 'rectangle',
							layer: [tileLayer],
							x: tileX,
							y: tileY,
						},
					},
					'server'
				);
			}
		}
	},

	/**
	 * Edit Map Tiles
	 * @param {number} tileGid
	 * @param {number} tileLayer
	 * @param {number} tileX
	 * @param {number} tileY
	 */
	editMapTile: function (tileGid, tileLayer, tileX, tileY) {
		if (
			Number.isInteger(tileGid) &&
			Number.isInteger(tileLayer) &&
			Number.isInteger(tileX) &&
			Number.isInteger(tileY)
		) {
			if (tileGid < 0 || tileGid > taro.game.data.map.tilesets[0].tilecount) {
				return;
			} else if (taro.game.data.map.layers[tileLayer].type !== 'tilelayer') {
				return;
			} else if (tileLayer > taro.game.data.map.layers.length || tileLayer < 0) {
				return;
			} else if (tileX < 0 || tileX >= taro.game.data.map.width) {
				return;
			} else if (tileY < 0 || tileY >= taro.game.data.map.height) {
				return;
			} else {
				const obj = {};
				obj[tileX] = {};
				obj[tileX][tileY] = tileGid;
				taro.developerMode.editTile(
					{
						edit: {
							selectedTiles: [obj],
							size: 'fitContent',
							shape: 'rectangle',
							layer: [tileLayer],
							x: tileX,
							y: tileY,
						},
					},
					'server'
				);
			}
		}
	},

	/**
	 * Load Map From String
	 * @param {string} data
	 */
	loadMapFromString: function (data) {
		let players = taro.$$('player').filter((player) => {
			return player._stats.playerTypeId !== undefined;
		});
		try {
			JSON.parse(data);
		} catch (e) {
			return;
		}
		if (data && players.length <= 0) {
			taro.map.data = JSON.parse(data);
			taro.game.data.map = JSON.parse(data);
			let gameMap = taro.game.data.map;
			gameMap.wasEdited = true;

			taro.physics.destroyWalls();
			let map = taro.scaleMap(rfdc()(gameMap));
			taro.tiled.loadJson(map, function (layerArray, layersById) {
				taro.physics.staticsFromMap(layersById.walls);
			});
		}
	},

	/**
		 * Save Current Map State

		 */
	saveCurrentMapState: function () {
		const mapData = taro.game.data.map;
		if (mapData) {
			taro.workerComponent?.saveCurrentMapState(mapData);
		}
	},

	/**
	 * Open Backpack For Player
	 * @param {Player} player
	 */
	openBackpackForPlayer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._stats.clientId) {
			const data = {
				command: 'updateBackpack',
				action: 'open',
			};
			if (taro.isServer) {
				taro.network.send('ui', data, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.playerUi.updateBackpack(data);
			}
		}
	},

	/**
	 * Close Backpack For Player
	 * @param {Player} player
	 */
	closeBackpackForPlayer: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._stats.clientId) {
			const data = {
				command: 'updateBackpack',
				action: 'close',
			};
			if (taro.isServer) {
				taro.network.send('ui', data, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.playerUi.updateBackpack(data);
			}
		}
	},

	/**
	 * Show Ui Element For Player
	 * @param {Player} player
	 * @param {string} elementId
	 */
	showUiElementForPlayer: function (player, elementId) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._stats.clientId && elementId) {
			const data = {
				command: 'updateUiElement',
				elementId: elementId,
				action: 'show',
			};
			if (taro.isServer) {
				taro.network.send('ui', data, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.playerUi.updateUiElement(data);
			}
		}
	},
	/**
	 * Hide Ui Element For Player
	 * @param {Player} player
	 * @param {string} elementId
	 */
	hideUiElementForPlayer: function (player, elementId) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && player._stats && player._stats.clientId && elementId) {
			const data = {
				command: 'updateUiElement',
				elementId: elementId,
				action: 'hide',
			};
			if (taro.isServer) {
				taro.network.send('ui', data, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.playerUi.updateUiElement(data);
			}
		}
	},

	/**
	 * Set U I Element Html
	 * @param {string} elementId
	 * @param {string} htmlStr
	 * @param {Player} player
	 */
	setUIElementHtml: function (elementId, htmlStr, player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		const sanitizerFunction = taro.isClient ? taro.clientSanitizer : taro.sanitizer;
		let anitizedHtmlStr = sanitizerFunction(htmlStr);
		if (elementId && player && player._stats && player._stats.clientId) {
			const data = {
				command: 'updateUiElement',
				elementId: elementId,
				action: 'setHtml',
				htmlStr: anitizedHtmlStr || '',
			};
			if (taro.isServer) {
				taro.network.send('ui', data, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.playerUi.updateUiElement(data);
			}
		}
	},

	/**
	 * Add Class To U I Element
	 * @param {string} elementId
	 * @param {string} className
	 * @param {Player} player
	 */
	addClassToUIElement: function (elementId, className, player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (elementId && player && player._stats && player._stats.clientId) {
			const data = {
				command: 'updateUiElement',
				elementId: elementId,
				action: 'addClass',
				className: className || '',
			};
			if (taro.isServer) {
				taro.network.send('ui', data, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.playerUi.updateUiElement(data);
			}
		}
	},

	/**
	 * Remove Class From U I Element
	 * @param {string} elementId
	 * @param {string} className
	 * @param {Player} player
	 */
	removeClassFromUIElement: function (elementId, className, player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (elementId && player && player._stats && player._stats.clientId) {
			const data = {
				command: 'updateUiElement',
				elementId: elementId,
				action: 'removeClass',
				className: className || '',
			};
			if (taro.isServer) {
				taro.network.send('ui', data, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.playerUi.updateUiElement(data);
			}
		}
	},

	/**
	 * Purchase Item From Shop
	 * @param {Player} player
	 * @param {string} shopId
	 * @param {Entity} entity
	 */
	purchaseItemFromShop: function (player, shopId, entity) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (entity && typeof entity.id === 'function') entity = taro.$(entity.id());
		if (
			entity &&
			player &&
			shop &&
			taro.tierFeaturesToggle[taro.game.data?.defaultData?.tier || '1'].coinItemPurchase
		) {
			player._stats.lastOpenedShop = shop;
			taro.network.send(
				'ui',
				{
					command: 'shopPurchase',
					shopId,
					entityId,
					action: 'openPurchaseModal',
				},
				player._stats.clientId
			);
		}
	},

	/**
	 * Open Skin Shop
	 * @param {Player} player
	 */
	openSkinShop: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && taro.tierFeaturesToggle[taro.game.data.defaultData.tier || '1'].skinShop) {
			taro.network.send(
				'ui',
				{
					command: 'skinShop',
					action: 'openSkinShop',
				},
				player._stats.clientId
			);
		}
	},

	/**
	 * Open Skin Submission Page
	 * @param {Player} player
	 */
	openSkinSubmissionPage: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && taro.tierFeaturesToggle[taro.game.data.defaultData.tier || '1'].skinShop) {
			taro.network.send(
				'ui',
				{
					command: 'skinShop',
					action: 'openSkinSubmissionPage',
				},
				player._stats.clientId
			);
		}
	},

	/**
	 * Set U I Element Property
	 * @param {Player} player
	 * @param {string} elementId
	 * @param {string} value
	 * @param {string} key
	 */
	setUIElementProperty: function (player, elementId, value, key) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		const sanitizerFunction = taro.isClient ? taro.clientSanitizer : taro.sanitizer;
		if (typeof key === 'string') {
			const data = {
				command: 'updateUiElement',
				elementId,
				action: 'setUIElementProperty',
				value: typeof value === 'string' ? sanitizerFunction(value) : '',
				key,
			};
			if (taro.isServer) {
				taro.network.send('ui', data, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.playerUi.updateUiElement(data);
			}
		}
	},

	/**
	 * Send Data From Server To Client
	 * @param {Player} player
	 * @param {any} data
	 */
	sendDataFromServerToClient: function (player, data) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (taro.isServer) {
			if (player && player._stats.clientId) {
				const clientId = player._stats.clientId;
				taro.network.send(
					'sendDataFromServer',
					{
						data,
					},
					clientId
				);
			}
		}
	},

	/**
	 * Start Accepting For Competition
	 * @param {number} duration
	 * @param {number} maxParticipantsNumber
	 * @param {number} minCost
	 * @param {number} maxCost
	 */
	startAcceptingForCompetition: function (duration, maxParticipantsNumber, minCost, maxCost) {
		if (taro.isServer && taro.isUtilityTokenEnabledForCurrentGame()) {
			if (!duration && !maxParticipantsNumber) {
				console.error('duration and maxParticipantsNumber are required');
				this._script.errorLog('either competition duration or maxParticipantsNumber is required');
				return;
			}

			if (duration && (typeof duration !== 'number' || duration < 60)) {
				console.error('duration must be a number greater than 60 or undefined');
				this._script.errorLog('duration must be a number greater than 60 or undefined');
				return;
			}

			if (maxParticipantsNumber && (typeof maxParticipantsNumber !== 'number' || maxParticipantsNumber <= 1)) {
				console.error('maxParticipantsNumber must be a number greater than 1 or undefined');
				this._script.errorLog('maxParticipantsNumber must be a number greater than 1 or undefined');
				return;
			}

			try {
				taro.competition.startCompetition(duration, maxParticipantsNumber, minCost, maxCost);
			} catch (e) {
				if (e.message) {
					this._script.errorLog(e.message);
				}
				return;
			}
		}
	},

	/**
	 * End Competition And Distribute Rewards
	 * @param {number} attrId
	 */
	endCompetitionAndDistributeRewards: function (attrId) {
		if (taro.isServer && taro.isUtilityTokenEnabledForCurrentGame()) {
			try {
				if (attrId) {
					taro.competition.endCompetitionAndDistributeRewards(attrId);
				}
			} catch (e) {
				if (e.message) {
					this._script.errorLog(e.message);
				}
				return;
			}
		}
	},

	/**
	 * Ask Player To Join Competition
	 * @param {Player} player
	 */
	askPlayerToJoinCompetition: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (taro.isServer && taro.isUtilityTokenEnabledForCurrentGame()) {
			try {
				taro.competition.askPlayerToJoinCompetition(player);
			} catch (e) {
				if (e.message) {
					this._script.errorLog(e.message);
				}
				return;
			}
		}
	},

	/**
	 * Open Wallet Connect
	 * @param {Player} player
	 */
	openWalletConnect: function (player) {
		if (player && typeof player.id === 'function') player = taro.$(player.id());
		if (player && taro.game.data.defaultData.web3?.enabled) {
			const data = {
				command: 'wallet',
				action: 'openWalletConnect',
			};
			if (taro.isServer) {
				taro.network.send('ui', data, player._stats.clientId);
			} else if (player._stats.clientId === taro.network.id()) {
				taro.playerUi.wallet(data);
			}
		}
	},
};
