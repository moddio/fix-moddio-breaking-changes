/**
* Sends a Player to a Map
* @param {Player} player - The Player to send
* @param {string} gameId - ID of the destination map
*/
function sendPlayerToMap(player: Player, gameId: string): void;
/**
* Sends a player to a game
* @param {Player} player - The player to send
* @param {string} gameId - ID of the destination game
*/
function sendPlayerToGame(player: Player, gameId: string): void;
/**
* Sends a group of players to a map
* @param {string} gameId - ID of the destination map
* @param {Array<Object>} players - Array of players to send
*/
function sendPlayerGroupToMap(gameId: string, players: Array<any>): void;
/**
* Sends a player to their last spawning map
* @param {Player} player - The player to send
*/
function sendPlayerToSpawningMap(player: Player): void;
/**
* Add Entity To Entity Group
* @param {Entity} entity - The entity to add to the group
* @param {String} groupName - Name of the entity group variable
*/
function addEntityToGroup(entity: Entity, groupName: string): void;
/**
* Remove Entity From Entity Group
* @param {Entity} entity - The entity to remove from the group
* @param {String} groupName - Name of the entity group variable
*/
function removeEntityFromGroup(entity: Entity, groupName: string): void;
/**
* Set Variable
* @param {String} variableName - Name of variable to set
* @param {*} newValue - New value to set
*/
function setVariable(variableName: string, newValue: any): void;
/**
* Runs a script with given parameters
* @param {ScriptIds[keyof ScriptIds]} scriptId - Id of the script to run
*/
function runScript(scriptId: ScriptIds[keyof ScriptIds]): void;
/**
* Runs a script on an entity
* @param {Entity} entity - Entity to run the script on
* @param {string} ScriptId - Id of the script to run
*/
function runEntityScript(entity: Entity, ScriptId: string): void;
/**
* Runs a script on a client
* @param {Player} localPlayer - Player whose client will run the script
* @param {string} scriptId - Id of the script to run
*/
function runScriptOnClient(localPlayer: Player, scriptId: string): void;
/**
* Runs an entity script on a client
* @param {Entity} entity - Entity to run the script on
* @param {Player} localPlayer - Player whose client will run the script
* @param {string} scriptId - Id of the script to run
*/
function runEntityScriptOnClient(entity: Entity, localPlayer: Player, scriptId: string): void;
/**
* Transforms a region's dimensions
* @param {Region} region - The region to transform
* @param {number} x - New x position
* @param {number} y - New y position
* @param {number} width - New width
* @param {number} height - New height
*/
function transformRegionDimensions(region: Region, x: number, y: number, width: number, height: number): void;
/**
* Changes a region's color
* @param {Region} region - The region to modify
* @param {string} insideColor - Color for region interior
* @param {number} alpha - Opacity value between 0 and 1
*/
function setRegionColor(region: Region, insideColor: string, alpha: number): void;
/**
* Sets the last attacking unit
* @param {Unit} unit - The unit that performed the attack
*/
function setLastAttackingUnit(unit: Unit): void;
/**
* Sets the last attacked unit
* @param {Unit} unit - The unit that was attacked
*/
function setLastAttackedUnit(unit: Unit): void;
/**
* Sets the last attacking item
* @param {Item} item - The item used in the attack
*/
function setLastAttackingItem(item: Item): void;
/**
* Kicks a player from the game
* @param {Player} player - The player to kick
* @param {string} message - Message to show the kicked player
*/
function kickPlayer(player: Player, message: string): void;
/**
* Plays an animation on an entity
* @param {string} animationTypeId - ID of the animation to play
* @param {Entity} entity - Entity to animate
*/
function playAnimation(animationTypeId: string, entity: Entity): void;
/**
* Stops playing an animation on an entity
* @param {string} animationTypeId - ID of the animation to stop
* @param {Entity} entity - Entity to stop animating
*/
function stopPlayAnimation(animationTypeId: string, entity: Entity): void;
/**
* Stops all animations currently playing on an entity
* @param {Entity} entity - The entity to stop animations for
*/
function stopAllAnimations(entity: Entity): void;
/**
* Updates a Player's display name
* @param {string} name - The new name to set
* @param {Player} player - The Player whose name to update
*/
function setPlayerName(name: string, player: Player): void;
/**
* Assigns a new player type to a Player
* @param {Player} player - The Player to update
* @param {PlayerTypeId} playerTypeId - ID of the new player type to assign
*/
function assignPlayerType(player: Player, playerTypeId: PlayerTypeId): void;
/**
* Updates a Player's variable value
* @param {Player} player - The Player whose variable to update
* @param {string} variableId - The variable ID
* @param {*} value - The new value to set for the variable
*/
function setPlayerVariable(player: Player, variableId: string, value: any): void;
/**
* Updates an item's description text
* @param {Item} item - The item to update
* @param {string} description - The new description text
*/
function setDescriptionOfItem(item: Item, description: string): void;
/**
* Updates an item's inventory image
* @param {Item} item - The item to update
* @param {string} url - URL of the new inventory image
*/
function setItemInventoryImage(item: Item, url: string): void;
/**
* Enables accepting new players into the game
*/
function startAcceptingPlayers(): void;
/**
* Disables accepting new players into the game
*/
function stopAcceptingPlayers(): void;
/**
* Saves a unit's persistent data
* @param {Unit} unit - The unit whose data to save
*/
function saveUnitData(unit: Unit): void;
/**
* Saves a player's persistent data and their selected unit's data
* @param {Player} player - The player whose data to save
*/
function savePlayerData(player: Player): void;
/**
* Makes a player select a specific unit
* @param {Player} player - The player who will select the unit
* @param {Unit} unit - The unit to be selected
*/
function makePlayerSelectUnit(player: Player, unit: Unit): void;
/**
* Sends coins to a player's account
* @param {number} coins - Amount of coins to send
* @param {Player} player - The player to receive the coins
*/
function sendCoinsToPlayer(coins: number, player: Player): void;
/**
* Sends utility tokens to a player's account
* @param {Player} player - The player to receive the tokens
* @param {number} rewardAmount - Amount of utility tokens to send
* @param {string} rewardReason - Reason for sending the tokens
* @returns {void}
*/
function sendUtilityTokenToPlayer(player: Player, rewardAmount: number, rewardReason: string): void;
/**
* Sends coins to a player's account with a 10/9 multiplier
* @param {number} coins - Base amount of coins to send
* @param {Player} player - The player to receive the coins
*/
function sendCoinsToPlayer2(coins: number, player: Player): void;
/**
* Shows UI text for a specific player
* @param {Player} player - The player who will see the text
* @param {string} target - The target UI element ID
*/
function showUiTextForPlayer(player: Player, target: string): void;
/**
* Shows UI text for all players
* @param {string} target - The target UI element ID
*/
function showUiTextForEveryone(target: string): void;
/**
* Hides UI text for a specific player
* @param {Player} player - The player for whom to hide the text
* @param {string} target - The target UI element ID
*/
function hideUiTextForPlayer(player: Player, target: string): void;
/**
* Hides UI text for all players
* @param {string} target - The target UI element ID
*/
function hideUiTextForEveryone(target: string): void;
/**
* Updates UI text for a specific player for a limited time
* @param {string} text - The text content to display
* @param {number} time - Duration in milliseconds to show the text
* @param {string} target - The target UI element ID
* @param {Player} [player] - Optional player to show text to, if undefined shows to all
*/
function updateUiTextForTimeForPlayer(text: string, time: number, target: string, player?: Player): void;
/**
* Updates UI text for a specific player
* @param {string} text - The text content to display
* @param {string} target - The target UI element ID
* @param {Player} player - The player who will see the text
*/
function updateUiTextForPlayer(text: string, target: string, player: Player): void;
/**
* Appends realtime CSS for a player
* @param {Player} player - The player to append CSS for
* @param {string} value - The CSS text to append
*/
function appendRealtimeCSSForPlayer(player: Player, value: string): void;
/**
* Updates realtime CSS for a player
* @param {Player} player - The player to update CSS for
* @param {string} value - The CSS text to set
*/
function updateRealtimeCSSForPlayer(player: Player, value: string): void;
/**
* Shows game suggestions UI for a player
* @param {Player} player - The player to show suggestions to
*/
function showGameSuggestionsForPlayer(player: Player): void;
/**
* Hides game suggestions UI for a player
* @param {Player} player - The player to hide suggestions from
*/
function hideGameSuggestionsForPlayer(player: Player): void;
/**
* Updates UI text for all players
* @param {string} text - The text content to display
* @param {string} target - The target UI element ID
*/
function updateUiTextForEveryone(text: string, target: string): void;
/**
* Shows an input modal dialog for a player
* @param {Player} player - The player to show the modal to
* @param {string} inputLabel - Label text for the input field
*/
function showInputModalToPlayer(player: Player, inputLabel: string): void;
/**
* Shows a dismissible input modal dialog for a player
* @param {Player} player - The player to show the modal to
* @param {string} inputLabel - Label text for the input field
*/
function showDismissibleInputModalToPlayer(player: Player, inputLabel: string): void;
/**
* Shows a custom modal dialog with HTML content for a player
* @param {Player} player - The player to show the modal to
* @param {string} htmlContent - HTML content to display in the modal
* @param {string} title - Title text for the modal
*/
function showCustomModalToPlayer(player: Player, htmlContent: string, title: string): void;
/**
* Shows a modal containing a website for a player
* @param {Player} player - The player to show the modal to
* @param {string} url - URL of the website to display
*/
function showWebsiteModalToPlayer(player: Player, string: any): void;
/**
* Shows a social share modal dialog for a player
* @param {Player} player - The player to show the modal to
*/
function showSocialShareModalToPlayer(player: Player): void;
/**
* Opens a website in a new window/tab for a player
* @param {Player} player - The player to open the website for
* @param {string} url - URL of the website to open
*/
function openWebsiteForPlayer(player: Player, url: string): void;
/**
* Shows the invite friends modal for a player
* @param {Player} player - The player to show the modal to
*/
function showInviteFriendsModal(player: Player): void;
/**
* Shows the game menu for a player
* @param {Player} player - The player to show the menu to
*/
function showMenu(player: Player): void;
/**
* Shows the login prompt for a player
* @param {Player} player - The player to show the login prompt to
*/
function promptLogin(player: Player): void;
/**
* Makes a player send a chat message
* @param {Player} player - The player who will send the message
* @param {string} message - The message content to send
*/
function makePlayerSendChatMessage(player: Player, message: string): void;
/**
* Sends a chat message to all players
* @param {string} message - The message content to send
*/
function sendChatMessage(message: string): void;
/**
* Sets an entity's active state
* @param {Entity} entity - The entity to modify
* @param {boolean} active - Whether to set the entity as active or inactive
*/
function setActive(entity: Entity, active: boolean): void;
/**
* Removes a quest from a player
* @param {Player} player - The player to remove the quest from
* @param {string} questId - ID of the quest to remove
*/
function removeQuestForPlayer(player: Player, questId: string): void;
/**
* Adds a new quest for a player
* @param {Player} player - The player to add the quest for
* @param {string} questId - Unique ID for the quest
* @param {string} name - Display name of the quest
* @param {string} goal - Description of the quest goal
* @param {string} description - Detailed description of the quest
*/
function addQuestToPlayer(player: Player, questId: string, name: string, goal: string, description: string): void;
/**
* Completes a quest for a player
* @param {Player} player - The player to complete the quest for
* @param {string} questId - Unique ID of the quest to complete
*/
function completeQuest(player: Player, questId: string): void;
/**
* Updates the progress of a quest for a player
* @param {Player} player - The player whose quest to update
* @param {string} questId - ID of the quest to update
* @param {number} progress - New progress value to set
*/
function setQuestProgress(player: Player, questId: string, progress: number): void;
/**
* Sends a chat message to a specific player
* @param {Player} player - The player to send the message to
* @param {string} message - The message content to send
*/
function sendChatMessageToPlayer(player: Player, message: string): void;
/**
* Adds words to the chat filter
* @param {string} words - Comma-separated list of words to filter
*/
function addChatFilter(words: string): void;
/**
* Ban Player From Chat
* @param {Player} player
*/
function mutePlayerFromChat(player: Player): void;
/**
* Unban Player From Chat
* @param {Player} player
*/
function unmutePlayerFromChat(player: Player): void;
/**
* Ends the current game session by killing the server
*/
function endGame(): void;
/**
* Makes the specified unit start moving upward
* @param {Unit} unit - The unit to move
*/
function startMovingUnitUp(unit: Unit): void;
/**
* Makes the specified unit start moving downward
* @param {Unit} unit - The unit to move
*/
function startMovingUnitDown(unit: Unit): void;
/**
* Makes the specified unit start moving left
* @param {Unit} unit - The unit to move
*/
function startMovingUnitLeft(unit: Unit): void;
/**
* Makes the specified unit start moving right
* @param {Unit} unit - The unit to move
*/
function startMovingUnitRight(unit: Unit): void;
/**
* Stops the specified unit's horizontal movement
* @param {Unit} unit - The unit to stop moving
*/
function stopMovingUnitX(unit: Unit): void;
/**
* Stops the specified unit's vertical movement
* @param {Unit} unit - The unit to stop moving
*/
function stopMovingUnitY(unit: Unit): void;
/**
* Stops all movement of the specified unit
* @param {Unit} unit - The unit to stop moving
*/
function stopMovingUnit(unit: Unit): void;
/**
* Create Unit At Position
* @param {UnitTypeId} unitTypeId - The ID of the unit type to create
* @param {Player} player - The player creating the unit
* @param {{x: number, y: number, z: number}} position - The position where the unit will be created
* @param {number} angle - The angle at which the unit will be facing
*/
function createUnit(unitTypeId: UnitTypeId, player: Player, position: {
        x: number;
/**
* Change Unit Type
* @param {Unit} unit
* @param {UnitTypeId} unitType
*/
function changeUnitType(unit: Unit, unitType: UnitTypeId): void;
/**
* Change Entity Model Sprite
* @param {Entity} entity
* @param {string} url
*/
function setModelOrSprite(entity: Entity, url: string): void;
/**
* Change Unit Speed
* @param {Unit} unit
* @param {number} unitSpeed
*/
function setUnitSpeed(unit: Unit, unitSpeed: number): void;
/**
* Change Sensor Radius
* @param {Sensor} sensor
* @param {number} radius
*/
function setSensorRadius(sensor: Sensor, radius: number): void;
/**
* Set Max Attack Range
* @param {Unit} unit
* @param {number} maxAttackRange
*/
function setMaxAttackRange(unit: Unit, number: any): void;
/**
* Set Let Go Distance
* @param {Unit} unit
* @param {number} number
*/
function setLetGoDistance(unit: Unit, number: number): void;
/**
* Set Max Travel Distance
* @param {Unit} unit
* @param {number} number
*/
function setMaxTravelDistance(unit: Unit, number: number): void;
/**
* Set Entity Velocity Direction
* @param {Entity} entity
* @param {number} speed
* @param {(number|{x: number, y: number, z: number})} direction - If number, it's treated as a direction in degrees. If object, expected format is {x: number, y: number, z: number}.
*/
function setVelocity(entity: Entity, speed: number, direction: (number | {
        x: number;
/**
* Set Unit Owner
* @param {Unit} unit
* @param {Player} player
*/
function setUnitOwner(unit: Unit, player: Player): void;
/**
* Set Unit Name Label
* @param {Unit} unit
* @param {string} name
*/
function setUnitNameLabel(unit: Unit, name: string): void;
/**
* Set Unit Name Label Color For Player
* @param {Unit} unit
* @param {string} color
* @param {Player} player
*/
function setUnitNameLabelColorForPlayer(unit: Unit, color: string, player: Player): void;
/**
* Set Item Name
* @param {Item} item
* @param {string} name
*/
function setItemName(item: Item, name: string): void;
/**
* Set Fading Text Of Unit
* @param {Unit} unit
* @param {string} text
* @param {string} color
*/
function setFadingTextOfUnit(unit: Unit, text: string, color: string): void;
/**
* Create Floating Text
* @param {{x:number, y:number, z:number}} position
* @param {string} text
* @param {string} color
*/
function createFloatingText(position: {
        x: number;
/**
* Create Dynamic Floating Text
* @param {{x:number, y:number, z:number}} position
* @param {string} text
* @param {string} color
* @param {number} duration
*/
function createDynamicFloatingText(position: {
        x: number;
/**
* Starts the active usage of an item
* @param {Entity} item - The item entity to start using
* @description Begins using an item if it is not already in use. Only works on entities with category 'item'.
*/
function startUsingItem(item: Entity): void;
/**
* Use Item Once
* @param {Item} item
*/
function useItemOnce(item: Item): void;
/**
* Stop the current usage of an item
* @param {Item} item - The item entity to stop using
* @description Stops the active usage of an item if it is currently being used. Only works on entities with category 'item'.
*/
function stopUsingItem(item: Item): void;
/**
* Update Item Quantity
* @param {Entity} entity
* @param {number} quantity
*/
function updateItemQuantity(entity: Entity, quantity: number): void;
/**
* Set Item Fire Rate
* @param {Entity} item
* @param {number} number
*/
function setItemFireRate(item: Entity, number: number): void;
/**
* Change Inventory Slot Color
* @param {Entity} item
* @param {string} color
*/
function setSlotColor(item: Entity, color: string): void;
/**
* Set Item Ammo
* @param {Item} item
* @param {number} ammo
*/
function setItemAmmo(item: Item, ammo: number): void;
/**
* Drop Item
* @param {Unit} unit
*/
function dropItem(unit: Unit): void;
/**
* Drop Item At Position
* @param {Item} item
* @param {{x: number, y: number, z: number}} position
*/
function dropItemAtPosition(item: Item, position: {
        x: number;
/**
* Enable Rotate To Face Mouse Cursor
* @param {Item} item
*/
function enableRotateToFaceMouseCursor(item: Item): void;
/**
* Disable Rotate To Face Mouse Cursor
* @param {Item} item
*/
function disableRotateToFaceMouseCursor(item: Item): void;
/**
* Makes a unit cast an ability
* @param {Unit} unit - The unit that will cast the ability
* @param {string} abilityName - Name of the ability to cast
*/
function castAbility(unit: Unit, abilityName: string): void;
/**
* Start Casting Ability
* @param {Entity} entity
* @param {string} ability
*/
function startCastingAbility(entity: Entity, ability: string): void;
/**
* Stop Casting Ability
* @param {Entity} entity
* @param {string} ability
*/
function stopCastingAbility(entity: Entity, ability: string): void;
/**
* drop all items
* @param {Unit} unit
*/
function dropAllItems(unit: Unit): void;
/**
* Open Shop For Player
* @param {ShopTypeId} shopTypeId
* @param {Player} player
*/
function openShopForPlayer(shopTypeId: ShopTypeId, player: Player): void;
/**
* Close Shop For Player
* @param {Player} player
*/
function closeShopForPlayer(player: Player): void;
/**
* Open Dialogue For Player
* @param {Player} player
* @param {String} dialogue
*/
function openDialogueForPlayer(player: Player, dialogue: string): void;
/**
* Close Dialogue For Player
* @param {Player} player
*/
function closeDialogueForPlayer(player: Player): void;
/**
* Refills ammunition for an item that has ammo capacity
* @param {Item} item - The item entity whose ammo should be refilled
*/
function refillAmmo(item: Item): void;
/**
* Drop Item In Inventory Slot
* @param {number} slotIndex
* @param {Unit} unit
*/
function dropItemInSlot(slotIndex: number, unit: Unit): void;
/**
* Make Unit To Always Face Position
* @param {Entity} entity
* @param {Position} position
*/
function makeUnitToAlwaysFacePosition(entity: Entity, position: Position): void;
/**
* Makes a unit continuously rotate to face the mouse cursor position
* @param {Unit} unit - The unit entity that should track the mouse
*/
function makeUnitToAlwaysFaceMouseCursor(unit: Unit): void;
/**
* Makes a unit completely invisible, including its name label
* @param {Unit} unit - The unit entity to make invisible
*/
function makeUnitInvisible(unit: Unit): void;
/**
* Makes a previously invisible unit visible again, including its name label
* @param {Unit} unit - The unit entity to make visible
*/
function makeUnitVisible(unit: Unit): void;
/**
* Makes a unit invisible only to players on the same team
* @param {Unit} unit - The unit entity to hide from friendly players
*/
function makeUnitInvisibleToFriendlyPlayers(unit: Unit): void;
/**
* Makes a previously hidden unit visible again to players on the same team
* @param {Unit} unit - The unit entity to show to friendly players
*/
function makeUnitVisibleToFriendlyPlayers(unit: Unit): void;
/**
* Hide Unit Name Label From Player
* @param {Entity} entity
* @param {Player} player
*/
function hideUnitNameLabelFromPlayer(entity: Entity, player: Player): void;
/**
* Show Unit Name Label To Player
* @param {Entity} entity
* @param {Player} player
*/
function showUnitNameLabelToPlayer(entity: Entity, player: Player): void;
/**
* Hide Unit From Player
* @param {Entity} entity
* @param {Player} player
*/
function hideUnitFromPlayer(entity: Entity, player: Player): void;
/**
* Show Unit To Player
* @param {Entity} entity
* @param {Player} player
*/
function showUnitToPlayer(entity: Entity, player: Player): void;
/**
* Hide Entity
* @param {Entity} entity
*/
function hide(entity: Entity): void;
/**
* Show Entity
* @param {Entity} entity
*/
function show(entity: Entity): void;
/**
* Makes a unit invisible to neutral players by setting both visibility and name label flags
* @param {Unit} unit - The unit entity to make invisible
* @description When called, this function will hide both the unit model and its name label from neutral players,
* while keeping it visible to allied and enemy players. The unit must have the 'unit' category.
*/
function makeUnitInvisibleToNeutralPlayers(unit: Unit): void;
/**
* Makes a unit visible to neutral players by clearing both visibility and name label flags
* @param {Unit} unit - The unit entity to make visible
* @description When called, this function will show both the unit model and its name label to neutral players.
* The unit must have the 'unit' category.
*/
function makeUnitVisibleToNeutralPlayers(unit: Unit): void;
/**
* Hides the name label displayed above a unit
* @param {Unit} unit - The unit entity whose name label should be hidden
* @description When called, this function will hide the name label that appears above the unit.
* The entity must have the 'unit' category for this to work.
*/
function hideUnitNameLabel(unit: Unit): void;
/**
* Shows the name label displayed above a unit
* @param {Unit} unit - The unit entity whose name label should be shown
* @description When called, this function will show the name label that appears above the unit.
* The entity must have the 'unit' category for this to work.
*/
function showUnitNameLabel(unit: Unit): void;
/**
* Create Projectile At Position
* @param {ProjectileTypeId} projectileTypeId
* @param {{x:number, y:number, z:number}} position
* @param {number} force
* @param {Unit} unit
* @param {number} angle
*/
function createProjectile(projectileTypeId: ProjectileTypeId, position: {
        x: number;
/**
* Create Prop At Position
* @param {propTypeId} propTypeId
* @param {{x:number, y:number, z:number}} position
* @param {number} angle
*/
function createProp(propTypeId: any, position: {
        x: number;
/**
* Player Camera Track Unit
* @param {Unit} unit
* @param {Player} player
*/
function cameraTrackUnit(unit: Unit, player: Player): void;
/**
* Player Camera Set Zoom
* @param {Player} player
* @param {number} zoom
*/
function setCameraZoom(player: Player, zoom: number): void;
/**
* Player Camera Set Pitch
* @param {Player} player
* @param {number} angle
*/
function setCameraPitch(player: Player, angle: number): void;
/**
* Player Camera Set Yaw
* @param {Player} player
* @param {number} angle
*/
function setCameraYaw(player: Player, angle: number): void;
/**
* Player Camera Stop Tracking
* @param {Player} player
*/
function stopCameraTracking(player: Player): void;
/**
* Change Player Camera Pan Speed
* @param {number} panSpeed
* @param {Player} player
*/
function setCameraPanSpeed(panSpeed: number, player: Player): void;
/**
* Position Camera
* @param {{x:number, y:number, z:number}} position
* @param {Player} player
*/
function setCameraPosition(position: {
        x: number;
/**
* Player Camera Unlock
* @param {Player} player
*/
function cameraUnlock(player: Player): void;
/**
* Create Item At Position With Quantity
* @param {ItemTypeId} itemTypeId - The unique identifier for the item type
* @param {{x:number, y:number, z:number}} position - The position coordinates where the item should be created
* @param {number} quantity - The quantity of the item to be created
*/
function createItem(itemTypeId: ItemTypeId, position: {
        x: number;
/**
* Creates an item with maximum allowed quantity at the specified position
* @param {ItemTypeId} itemTypeId - The unique identifier for the item type
* @param {{x:number, y:number, z:number}} position - The position coordinates where the item should be created
*/
function createItemWithMaxQuantity(itemTypeId: ItemTypeId, position: {
        x: number;
/**
* Give New Item To Unit
* @param {ItemTypeId} itemTypeId
* @param {Unit} unit
*/
function giveNewItemToUnit(itemType: any, unit: Unit): void;
/**
* Give New Item With Quantity To Unit
* @param {ItemTypeId} itemTypeId
* @param {Unit} unit
* @param {(number | undefined)} quantity - -1 means infinite quantity, undefined means default max quantity
*/
function giveNewItemWithQuantityToUnit(itemType: any, unit: Unit, quantity: (number | undefined)): void;
/**
* Make Unit Select Item At Slot
* @param {Unit} unit
* @param {number} slotIndex
*/
function makeUnitSelectItemAtSlot(unit: Unit, slotIndex: number): void;
/**
* Set Owner Unit Of Projectile
* @param {Unit} unit - The unit to set as owner
* @param {Projectile} projectile - The projectile to update
*/
function setSourceUnitOfProjectile(unit: Unit, projectile: Projectile): void;
/**
* Set Source Item Of Projectile
* @param {Item} item
* @param {Projectile} projectile
*/
function setSourceItemOfProjectile(item: Item, projectile: Projectile): void;
/**
* Play Ad For Everyone
*/
function playAdForEveryone(): void;
/**
* Play Ad For Player
* @param {Player} player
*/
function playAdForPlayer(player: Player): void;
/**
* Make Unit Pickup Item
* @param {Item} item
* @param {Unit} unit
*/
function makeUnitPickUpItem(item: Item, unit: Unit): void;
/**
* Play Sound At Position
* @param {{x:number, y:number, z:number}} position
* @param {string} sound
*/
function playSound(position: {
        x: number;
/**
* Play Sound For Player
* @param {Player} player
* @param {string} sound
*/
function playSoundForPlayer(player: Player, sound: string): void;
/**
* Stop Sound For Player
* @param {Player} player
* @param {string} sound
*/
function stopSoundForPlayer(player: Player, sound: string): void;
/**
* Play Music
* @param {string} music
*/
function playMusic(music: string): void;
/**
* Stop Music
*/
function stopMusic(): void;
/**
* Play Music For Player
* @param {Player} player
* @param {string} music
*/
function playMusicForPlayer(player: Player, music: string): void;
/**
* Stop Music For Player
* @param {Player} player
*/
function stopMusicForPlayer(player: Player): void;
/**
* Play Music For Player At Time
* @param {number} time
* @param {Player} player
* @param {string} music
*/
function playMusicForPlayerAtTime(time: number, player: Player, music: string): void;
/**
* Play Music For Player Repeatedly
* @param {Player} player
* @param {string} music
*/
function playMusicForPlayerRepeatedly(player: Player, music: string): void;
/**
* Show Menu And Select Current Server
* @param {Player} player
*/
function showMenuAndSelectCurrentServer(player: Player): void;
/**
* Show Menu And Select Best Server
* @param {Player} player
*/
function showMenuAndSelectBestServer(player: Player): void;
/**
* Flip Entity Sprite
* @param {Entity} entity
* @param {string} flip
*/
function flipSprite(entity: Entity, flip: string): void;
/**
* Apply Impulse On Entity X Y
* @param {Entity} entity
* @param {number} impulse
* @param {{x:number, y:number, z:number}} direction
*/
function applyImpulseOnAxises(entity: Entity, impulse: number, direction: {
        x: number;
/**
* Apply Impulse At Angle
* @param {Entity} entity
* @param {number} impulse
* @param {number | {pitch: number, yaw: number}} angle
*/
function applyImpulse(entity: Entity, impulse: number, angle: number | {
        pitch: number;
/**
* Apply Force On Entity X Y Z
* @param {Entity} entity - The entity to apply force to
* @param {{x:number, y:number, z:number} | {x:number, y:number}} force - The force vector to apply
* @param {boolean} [relative=false] - Whether the force is relative to entity's orientation
* @param {number} [angle=0] - The angle in degrees to apply the force at
*/
function applyForceOnAxises(entity: Entity, force: {
        x: number;
/**
* Apply Force On Entity
* @param {Entity} entity - The entity to apply force to
* @param {number} force - The magnitude of the force to apply
* @param {boolean} [relative=false] - Whether the force is relative to entity's orientation
* @param {{pitch: number, yaw: number} | number} [angle={ pitch: 0, yaw: 0 } | 0] - The angle in degrees to apply the force at
*/
function applyForce(entity: Entity, force: number, relative?: boolean, angle?: {
        pitch: number;
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
function createEntity(entityTypeId: EntityTypeId, position: {
        x: number;
/**
* Set Entity Z Offset
* @param {Entity} entity
* @param {number} zOffset
*/
function setZOffset(entity: Entity, zOffset: number): void;
/**
* Renders a line between two positions in the game world
* @param {{x:number, y:number, z:number}} position1 - Starting position coordinates
* @param {{x:number, y:number, z:number}} position2 - Ending position coordinates
* @param {string} [color='white'] - Color of the line (CSS color string)
* @param {number} [seconds=1] - Duration in seconds to display the line
*/
function renderLineBetweenPositions(p1: any, p2: any, color?: string, seconds?: number): void;
/**
* Set Entity Opacity
* @param {Entity} entity
* @param {number} opacity
*/
function setOpacity(entity: Entity, opacity: number): void;
/**
* Set  Gravity
* @param {{x:number, y:number, z:number}} gravity
*/
function setGravity(gravity: {
        x: number;
/**
* Set Skybox Opacity
* @param {number} opacity
*/
function setSkyboxOpacity(opacity: number): void;
/**
* Set Ambient Light Intensity
* @param {number} intensity
*/
function setAmbientLightIntensity(intensity: number): void;
/**
* Set Ambient Light Color
* @param {string} color
*/
function setAmbientLightColor(color: string): void;
/**
* Set Directional Light Intensity
* @param {number} intensity
*/
function setDirectionalLightIntensity(intensity: number): void;
/**
* Set Directional Light Color
* @param {string} color
*/
function setDirectionalLightColor(color: string): void;
/**
* Set Directional Light Position
* @param {Entity} position
*/
function setDirectionalLightPosition(position: Entity): void;
/**
* Set Fog Enabled
* @param {boolean} enabled
*/
function setFogEnabled(enabled: boolean): void;
/**
* Set Fog Color
* @param {string} color
*/
function setFogColor(color: string): void;
/**
* Set Fog Near
* @param {number} near
*/
function setFogNear(near: number): void;
/**
* Set Fog Far
* @param {number} far
*/
function setFogFar(far: number): void;
/**
* Set Fog Density
* @param {number} density
*/
function setFogDensity(density: number): void;
/**
* Set Entity Life Span
* @param {Entity} entity
* @param {number} lifespan
*/
function setLifeSpan(entity: Entity, lifespan: number): void;
/**
* Sets the current value of an entity's attribute
* @param {Entity} entity - The entity whose attribute should be modified
* @param {string} attributeName - Name of the attribute to modify
* @param {number} value - New value to set for the attribute
*/
function setAttributeValue(entity: Entity, attributeName: string, value: number): void;
/**
* Sets the minimum value of an entity's attribute
* @param {Entity} entity - The entity whose attribute should be modified
* @param {string} attributeName - Name of the attribute to modify
* @param {number} min - New minimum value to set for the attribute
*/
function setAttributeMin(entity: Entity, attributeName: string, min: number): void;
/**
* Sets the maximum value of an entity's attribute
* @param {Entity} entity - The entity whose attribute should be modified
* @param {string} attributeName - Name of the attribute to modify
* @param {number} max - New maximum value to set for the attribute
*/
function setAttributeMax(entity: Entity, attributeName: string, max: number): void;
/**
* Sets the regeneration rate of an entity's attribute
* @param {Entity} entity - The entity whose attribute should be modified
* @param {string} attributeName - Name of the attribute to modify
* @param {number} regenerationRate - New regeneration rate to set for the attribute
*/
function setAttributeRegen(entity: Entity, attributeName: string, regenerationRate: number): void;
/**
* Add Attribute Buff To Unit
* @param {string} attribute
* @param {number} value
* @param {Entity} entity
* @param {number} time
*/
function addAttributeBuffToUnit(attribute: string, value: number, entity: Entity, time: number): void;
/**
* Add Percentage Attribute Buff To Unit
* @param {string} attribute
* @param {number} value
* @param {Entity} entity
* @param {number} time
*/
function addPercentageAttributeBuffToUnit(attribute: string, value: number, entity: Entity, time: number): void;
/**
* Remove All Attribute Buffs
* @param {Entity} unit
*/
function removeAllAttributeBuffs(unit: Entity): void;
/**
* Move Entity
* @param {Entity} entity
* @param {{x: number, y: number, z: number}} position
*/
function move(entity: Entity, position: {
        x: number;
/**
* Teleport Entity
* @param {Entity} entity
* @param {{x: number, y: number, z: number}} position
*/
function teleport(entity: Entity, position: {
        x: number;
/**
* Destroy Entity
* @param {Entity} entity
*/
function destroy(entity: Entity): void;
/**
* Reset Entity
* @param {Entity} entity
*/
function reset(entity: Entity): void;
/**
* Set Entity Variable
* @param {Entity} entity - The entity to set the variable for
* @param {string} variableId - The ID of the variable to set
* @param {*} value - The new value to set for the variable
*/
function setEntityVariable(entity: Entity, variableId: string, value: any): void;
/**
* Rotate Entity To Radians
* @param {Entity} entity
* @param {number} radians
*/
function rotateToRadians(entity: Entity, radians: number): void;
/**
* Rotate Entity To 3D Rotation
* @param {Entity} entity
* @param {{x: number, y: number, z: number}} rotation
*/
function rotate3d(entity: Entity, rotation: {
        x: number;
/**
* Rotate Entity To Face Position
* @param {Entity} entity
* @param {{x: number, y: number, z: number}} position
*/
function rotateToFacePosition(entity: Entity, position: {
        x: number;
/**
* Rotate Entity To Face Position Using Rotation Speed
* @param {Entity} entity
* @param {{x: number, y: number, z: number}} position
*/
function rotateToFacePositionUsingRotationSpeed(entity: Entity, position: {
        x: number;
/**
* Add Bot Player
* @param {string} name - Name of the bot player
*/
function addBotPlayer(name: string): void;
/**
* Enable A I
* @param {Unit} unit
*/
function enableAI(unit: Unit): void;
/**
* Disable A I
* @param {Unit} unit
*/
function disableAI(unit: Unit): void;
/**
* Set Unit Target Position
* @param {Unit} unit
* @param {{x: number, y: number, z: number}} position
*/
function setUnitTargetPosition(unit: Unit, position: {
        x: number;
/**
* Set Unit Target Unit
* @param {Unit} unit
* @param {Unit} targetUnit
*/
function setUnitTargetUnit(unit: Unit, targetUnit: Unit): void;
/**
* Change Unit Path Finding Method
* @param {Unit} unit
* @param {'simple' | 'a*'} method
*/
function aiChangePathFindingMethod(unit: Unit, method: "simple" | "a*"): void;
/**
* Ai Move To Position
* @param {Unit} unit
* @param {{x: number, y: number, z: number}} position
*/
function aiMoveToPosition(unit: Unit, position: {
        x: number;
/**
* Ai Attack Unit
* @param {Unit} unit
* @param {Unit} targetUnit
*/
function aiAttackUnit(unit: Unit, targetUnit: Unit): void;
/**
* Ai Go Idle
* @param {Unit} unit
*/
function aiGoIdle(unit: Unit): void;
/**
* Make Player Trade With Player
* @param {Player} playerA
* @param {Player} playerB
*/
function makePlayerTradeWithPlayer(playerA: Player, playerB: Player): void;
/**
* Apply Torque On Entity
* @param {Entity} entity
* @param {{x: number, y: number, z: number}} torque
*/
function applyTorque(entity: Entity, torque: {
        x: number;
/**
* Change Scale Of Entity Sprite
* @param {Entity} entity
* @param {number | {x: number, y: number, z: number}} scale
*/
function scaleRenderingBody(entity: Entity, scale: number | {
        x: number;
/**
* Change Scale Of Entity Body
* @param {Entity} entity
* @param {number | {x: number, y: number, z: number}} scale
*/
function scalePhysicsBody(entity: Entity, scale: number | {
        x: number;
/**
* Set Entity State
* @param {Entity} entity
*/
function setState(entity: Entity, stateId: any): void;
/**
* Increase Variable By Number
* @param {String} variable
* @param {number} number
*/
function increaseVariableByNumber(variable: string, number: number): void;
/**
* Decrease Variable By Number
* @param {String} variable
* @param {number} number
*/
function decreaseVariableByNumber(variable: string, number: number): void;
/**
* Load Player Data And Apply It
* @param {Player} player
* @param {Unit} unit
*/
function loadPlayerDataAndApplyIt(player: Player, unit: Unit): void;
/**
* Load Unit Data
* @param {Unit} unit
*/
function loadUnitData(unit: Unit): void;
/**
* Load Unit Data From String
* @param {Unit} unit
* @param {String} string
*/
function loadUnitDataFromString(unit: Unit, string: string): void;
/**
* Load Player Data From String
* @param {Player} player
* @param {String} string
*/
function loadPlayerDataFromString(player: Player, string: string): void;
/**
* Load Player Data
* @param {Player} player
*/
function loadPlayerData(player: Player): void;
/**
* Change Layer Opacity
* @param {number} tileLayer
* @param {number} opacity
*/
function setLayerOpacity(tileLayer: number, opacity: number): void;
/**
* Edit Map Tile
* @param {number} tileGid
* @param {number} tileLayer
* @param {number} tileX
* @param {number} tileY
* @param {number} width
* @param {number} height
*/
function editMapTiles(tileGid: number, tileLayer: number, tileX: number, tileY: number, width: number, height: number): void;
/**
* Edit Map Tiles
* @param {number} tileGid
* @param {number} tileLayer
* @param {number} tileX
* @param {number} tileY
*/
function editMapTile(tileGid: number, tileLayer: number, tileX: number, tileY: number): void;
/**
* Load Map From String
* @param {string} data
*/
function loadMapFromString(data: string): void;
/**
* Save Current Map State

*/
function saveCurrentMapState(): void;
/**
* Open Backpack For Player
* @param {Player} player
*/
function openBackpackForPlayer(player: Player): void;
/**
* Close Backpack For Player
* @param {Player} player
*/
function closeBackpackForPlayer(player: Player): void;
/**
* Show Ui Element For Player
* @param {Player} player
* @param {string} elementId
*/
function showUiElementForPlayer(player: Player, elementId: string): void;
/**
* Hide Ui Element For Player
* @param {Player} player
* @param {string} elementId
*/
function hideUiElementForPlayer(player: Player, elementId: string): void;
/**
* Set U I Element Html
* @param {string} elementId
* @param {string} htmlStr
* @param {Player} player
*/
function setUIElementHtml(elementId: string, htmlStr: string, player: Player): void;
/**
* Add Class To U I Element
* @param {string} elementId
* @param {string} className
* @param {Player} player
*/
function addClassToUIElement(elementId: string, className: string, player: Player): void;
/**
* Remove Class From U I Element
* @param {string} elementId
* @param {string} className
* @param {Player} player
*/
function removeClassFromUIElement(elementId: string, className: string, player: Player): void;
/**
* Purchase Item From Shop
* @param {Player} player
* @param {string} shopId
* @param {Entity} entity
*/
function purchaseItemFromShop(player: Player, shopId: string, entity: Entity): void;
/**
* Open Skin Shop
* @param {Player} player
*/
function openSkinShop(player: Player): void;
/**
* Open Skin Submission Page
* @param {Player} player
*/
function openSkinSubmissionPage(player: Player): void;
/**
* Set U I Element Property
* @param {Player} player
* @param {string} elementId
* @param {string} value
* @param {string} key
*/
function setUIElementProperty(player: Player, elementId: string, value: string, key: string): void;
/**
* Send Data From Server To Client
* @param {Player} player
* @param {any} data
*/
function sendDataFromServerToClient(player: Player, data: any): void;
/**
* Start Accepting For Competition
* @param {number} duration
* @param {number} maxParticipantsNumber
* @param {number} minCost
* @param {number} maxCost
*/
function startAcceptingForCompetition(duration: number, maxParticipantsNumber: number, minCost: number, maxCost: number): void;
/**
* End Competition And Distribute Rewards
* @param {number} attrId
*/
function endCompetitionAndDistributeRewards(attrId: number): void;
/**
* Ask Player To Join Competition
* @param {Player} player
*/
function askPlayerToJoinCompetition(player: Player): void;
/**
* Open Wallet Connect
* @param {Player} player
*/
function openWalletConnect(player: Player): void;
