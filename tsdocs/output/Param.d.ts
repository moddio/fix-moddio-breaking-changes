/**
* Round a number to specified precision
* @param {number} num - Number to round
* @param {number} precision - Number of decimal places
* @returns {number} Rounded number
*/
function roundOff(num: number, precision: number): number;
/**
* Returns the entire map region
* @returns {Region} The entire map region
*/
function entireMapRegion(): Region;
/**
* Get a random entity type from a type group based on probability weights
* @param {string} groupName - Name of the type group variable to select from
* @returns {string|undefined} Selected entity type name, or undefined if group not found
*/
function randomTypeFromTypeGroup(groupName: string): string | undefined;
/**
* Get a random position within a region
* @param {Object} region - The region to get position from
* @returns {Object} Position with x,y coordinates
*/
function randomPositionInRegion(region: any): any;
/**
* Get a random 3D position within a region
* @param {Object} region - The region to get position from
* @returns {Object} Position with x,y,z coordinates
*/
function randomPositionInRegion3d(region: any): any;
/**
* Check if a position is inside a wall
* @param {Object} position - Position to check
* @returns {boolean} True if position is in wall
*/
function isPositionInWall(position: any): boolean;
/**
* Get width of a unit type
* @param {string} entityTypeId - Unit type ID to check
* @returns {width: number, height: number, depth: number} size of the unit type
*/
function entityTypePhysicsSize(entityTypeId: string): width;
/**
* Get entity opacity
* @param {Object} entity - Entity to check opacity for
* @returns {number} Entity opacity value
*/
function opacity(entity: any): number;
/**
* Get entity physics size
* @param {Object} entity - Entity to get physics size for
* @returns {Object} Entity physics size value
*/
function physicsSize(entity: any): any;
/**
* Get map height
* @returns {number} Map height
*/
function mapHeight(): number;
/**
* Get map width
* @returns {number} Map width
*/
function mapWidth(): number;
/**
* Get map data as JSON string
* @returns {string} Map data as JSON
*/
function mapJson(): string;
/**
* Get tile ID at specified coordinates and layer
* @param {number} x - X coordinate
* @param {number} y - Y coordinate
* @param {number} layer - Layer index
* @returns {number} Tile ID at position
*/
function mapTileId(x: number, y: number, layer: number): number;
/**
* Check if two players are hostile to each other
* @param {Player} playerA - First player to check
* @param {Player} playerB - Second player to check
* @returns {boolean} True if players are hostile
* @throws {Error} If either player is undefined
*/
function playersAreHostile(playerA: Player, playerB: Player): boolean;
/**
* Check if two players are friendly to each other
* @param {Player} playerA - First player to check
* @param {Player} playerB - Second player to check
* @returns {boolean} True if players are friendly
* @throws {Error} If either player is undefined
*/
function playersAreFriendly(playerA: Player, playerB: Player): boolean;
/**
* Check if two players are neutral to each other
* @param {Player} playerA - First player to check
* @param {Player} playerB - Second player to check
* @returns {boolean} True if players are neutral
* @throws {Error} If either player is undefined
*/
function playersAreNeutral(playerA: Player, playerB: Player): boolean;
/**
*
* @param {Player} player
* @returns {string} username
*/
function username(player: Player): string;
/**
*
* @param {Player} player
* @returns {boolean} whether player is creator
*/
function isCreator(player: Player): boolean;
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
function getAttribute(entity: any, attributeName: string): any | undefined;
/**
*
* @param {*} position
* @param {*} distance
* @param {*} angle
*/
function positionInFrontOfPosition(position: any, distance: any, angle: any): {
        x: any;
/**
* Calculates the center position of a given region.
*
* @param {Object} region - The region to calculate the center position for.
* @returns {Object} An object containing the x, y, and z coordinates of the region's center.
*/
function centerOfRegion(region: any): any;
/**
* Get the current mouse position for a player
* @param {Player} player - The player to get mouse position for
* @returns {Object|undefined} Mouse position with x,y coordinates or undefined if invalid
*/
function mousePosition(player: Player): any | undefined;
/**
* Get the current camera pitch for a player
* @param {Player} player - The player to get camera pitch for
* @returns {number|undefined} Camera pitch value or undefined if invalid
*/
function cameraPitch(player: Player): number | undefined;
/**
* Get the current camera yaw for a player
* @param {Player} player - The player to get camera yaw for
* @returns {number|undefined} Camera yaw value or undefined if invalid
*/
function cameraYaw(player: Player): number | undefined;
/**
*
* @returns last touched unit
*/
function lastTouchedUnit(): any;
/**
*
* @returns last touching unit
*/
function lastTouchingUnit(): any;
/**
*
* @param {*} entity
* @returns entity facing angle
*/
function facingAngle(entity: any): any;
/**
*
* @param {*} entity
* @returns {x: number, y: number, z: number} entity rotation
*/
function rotation3d(entity: any): x;
/**
* @returns this entity
*/
function thisEntity(): {
        _id: any;
/**
* get entities between two positions
* @param {*} posA
* @param {*} posB
* @param {*} entitiesToIgnore
* @returns entities between two positions
*/
function entitiesBetweenTwoPositions(posA: any, posB: any, possibleEntitiesToIgnore: any): any;
/**
* Get the category of an entity
* @param {Object} entity - The entity to get the category of
* @returns {string} The entity's category, defaults to 'wall' if not found
*/
function entityCategory(entity: any): string;
/**
* Get entities within a region that match allowed categories
* @param {Object} region - The region to check, either a TaroRegion instance or region data
* @returns {Array} Array of entities in the region matching allowed categories
*/
function entitiesInRegion(region: any): any[];
/**
*
* @param {Object} entity
* @returns {x: number, y:number, z:number} position of entity
*/
function position(entity: any): x;
/**
* Gets the name of an entity type from its ID
* @param {string} entityTypeId - The ID of the entity type to look up
* @returns {string|undefined} The name of the entity type if found, undefined otherwise
* @description Looks up an entity type by ID and returns its name. Works for units, items, projectiles, etc.
* Uses _getEntityCategoryAndAsset internally to determine the correct asset category.
*/
function typeName(entityTypeId: string): string | undefined;
/**
*
* @param {Object} entity
* @returns {string} player name
*/
function name(entity: any): string;
/**
* Check if a position overlaps with an entity
* @param {Object} position - Position to check
* @returns {boolean} True if position overlaps an entity
*/
function isPositionInEntity(position: any): boolean;
/**
* Check if a rectangle area is occupied
* @param {{x: number, y:number, z: number}} size - Size of the rectangle
* @param {{x: number, y:number, z: number}} position - Position to check
* @param {{x: number, y:number, z: number}} rotation - Rotation angle
* @returns {boolean} True if area is occupied
*/
function isRectangleOccupied(size: {
        x: number;
/**
* Check if a circular area is occupied
* @param {number} radius - Radius of the circle
* @param {{x: number, y:number, z: number}} position - Position to check
* @returns {boolean} True if area is occupied
*/
function isCircleOccupied(radius: number, position: {
        x: number;
/**
* Check if a quest is currently active
* @param {Player} player - Player to check
* @param {string} questId - ID of the quest
* @returns {boolean} True if quest is active
*/
function isQuestActive(player: Player, questId: string): boolean;
/**
* Get all entities of a specific type
* @param {string} entityTypeId - The type ID to filter by (e.g. unit type, item type, projectile type)
* @returns {Array} Array of entities matching the type
* @throws {Error} If entityTypeId parameter is missing
*/
function allEntitiesOfType(entityTypeId: string): any[];
/**
* Get rotation speed of a unit type
* @param {string} unitType - The unit type to get rotation speed from
* @returns {number} The rotation speed
*/
function rotateSpeed(unitType: string): number;
/**
* Get persistent data for a unit
* @param {Unit} unit - The unit to get data from
* @returns {string} JSON stringified unit data
*/
function unitData(unit: Unit): string;
/**
* Get persistent data for a player
* @param {Player} player - The player to get data from
* @returns {string} JSON stringified player data
*/
function playerData(player: Player): string;
/**
* Get ID of an entity
* @param {Entity} entity - The entity to get ID from
* @returns {string} The entity's ID
*/
function id(entity: Entity): string;
/**
* Get player by user ID
* @param {string} userId - The user ID to look up
* @returns {Object} The player object
*/
function playerByUserId(userId: string): any;
/**
* Get high score of a player
* @param {Player} player - The player to get high score from
* @returns {number} The player's high score
*/
function highScore(player: Player): number;
/**
* Filter a string using chat filter
* @param {string} string - String to filter
* @returns {string} Filtered string
*/
function filterString(string: string): string;
/**
* Get all units owned by a player
* @param {Player} player - The player to get units for
* @returns {Array} Array of unit objects
*/
function allOwnedUnits(player: Player): any[];
/**
* Get all human players
* @returns {Array} Array of human player objects
*/
function humanPlayers(): any[];
/**
* Get all computer players
* @returns {Array} Array of computer player objects
*/
function computerPlayers(): any[];
/**
* Get all bot players
* @returns {Array} Array of bot player objects
*/
function botPlayers(): any[];
/**
* Get players of a specific player type
* @param {string} playerType - The player type to filter by
* @returns {Array} Array of matching player objects
*/
function playersOfPlayerType(playerType: string): any[];
/**
* Get entities in a region in front of an entity at a distance
* @param {Object} entity - The reference entity
* @param {number} distance - Distance in front of entity
* @param {number} width - Width of region
* @param {number} height - Height of region
* @returns {Array} Array of entities in the region
*/
function entitiesInRegionInFrontOfEntityAtDistance(entity: any, distance: number, width: number, height: number): any[];
/**
* Get region in front of an entity at a distance
* @param {Object} entity - The reference entity
* @param {number} distance - Distance in front of entity
* @param {number} width - Width of region
* @param {number} height - Height of region
* @param {number} [depth=0] - Depth of region (for 3D physics)
* @returns {Object|undefined} Region object or undefined if entity is invalid
*/
function regionInFrontOfEntityAtDistance(entity: any, distance: number, width: number, height: number, depth?: number): any | undefined;
/**
* Get currently playing animations for an entity
* @param {Object} entity - The entity to check animations for
* @returns {string} JSON stringified array of animation names
*/
function animationsPlaying(entity: any): string;
/**
* Get the state of an entity
* @param {Object} entity - Entity to get state from
* @returns {string} Entity state ID
*/
function state(entity: any): string;
/**
* Get the default data for a region
* @param {Object} region - The region entity to get default data from
* @returns {Object} The default stats data for the region
*/
function defaultRegionData(region: any): any;
/**
* Get the description of an item
* @param {Object} item - Item to get description from
* @returns {string} Item description
*/
function description(item: any): string;
/**
* Get the damage value of an item type
* @param {string} itemTypeId - ID of item type
* @returns {number} Damage value
*/
function itemTypeDamage(itemTypeId: string): number;
/**
* Get the particle type for an item
* @param {Object} item - Item entity
* @param {string} particleTypeId - ID of particle type
* @returns {string|undefined} Particle type ID if exists
*/
function itemParticle(item: any, particleTypeId: string): string | undefined;
/**
* Get angle between mouse and window center for a player
* @param {Player} player - Player to check angle for
* @returns {number} Angle in radians
*/
function angleBetweenMouseAndWindowCenter(player: Player): number;
/**
* Get entities colliding with last raycast
* @returns {Array} Array of colliding entities
*/
function entitiesCollidingWithLastRaycast(): any[];
/**
* Get start position of entity's last raycast
* @param {Object} entity - Entity to check
* @returns {Object} Start position of raycast
*/
function lastRaycastStartPosition(entity: any): any;
/**
* Get collision position of entity's last raycast
* @param {Object} entity - Entity to check
* @returns {Object} Collision position of raycast
*/
function lastRaycastCollisionPosition(entity: any): any;
/**
* Calculate displacement vector between two positions
* @param {Object} positionA - Starting position
* @param {Object} positionB - Ending position
* @returns {Object} Displacement vector with x,y,z components
*/
function displacementVector(positionA: any, positionB: any): any;
/**
* Get interpolated position between two 3D points
* @param {Object} positionA - Starting position with x,y,z coordinates
* @param {Object} positionB - Ending position with x,y,z coordinates
* @param {number} alpha - Interpolation factor between 0 and 1
* @returns {Object} Interpolated position with x,y,z coordinates
*/
function lerpPosition(positionA: any, positionB: any, alpha: number): any;
/**
* Get a random playable position within a region
* @param {Object} region - Region to check
* @returns {Object} Random playable position {x, y} or undefined if no position found
*/
function randomPlayablePositionInRegion(region: any): any;
/**
* Get the age of the server in milliseconds
* @returns {number} Server age in milliseconds
*/
function serverAge(): number;
/**
* Get the server start time
* @returns {Date} Server start time
*/
function serverStartTime(): Date;
/**
* Linear interpolation between two values
* @param {number} valueA - First value
* @param {number} valueB - Second value
* @param {number} alpha - Interpolation factor between 0 and 1
* @returns {number} Interpolated value
*/
function lerp(valueA: number, valueB: number, alpha: number): number;
/**
* Get default quantity of an item type
* @param {string} itemTypeId - ID of the item type
* @returns {number} Default quantity
*/
function defaultQuantityOfItemType(itemTypeId: string): number;
/**
* Get maximum quantity of an item type
* @param {string} itemTypeId - ID of the item type
* @returns {number} Maximum quantity
*/
function maxQuantityOfItemType(itemTypeId: string): number;
/**
* Get all item types in the game
* @returns {Object} Object containing all item types
*/
function allItemTypesInGame(): any;
/**
* Get all unit types in the game
* @returns {Object} Object containing all unit types
*/
function allUnitTypesInGame(): any;
/**
* Get last played time of a player
* @param {Player} player - Player object
* @returns {number} Last played timestamp
*/
function lastPlayedTimeOfPlayer(player: Player): number;
/**
* Get unit sensor radius
* @param {Object} unit - Unit object
* @returns {number} Sensor radius
*/
function sensorRadius(unit: any): number;
/**
* Get unit type model sprite URL
* @param {EntityTypeId} entityTypeId - The unit type ID
* @returns {string} The sprite URL
*/
function entityTypeModelOrSprite(entityTypeId: EntityTypeId): string;
/**
* Get the last created projectile
* @returns {Object} The last created projectile
*/
function lastCreatedProjectile(): any;
/**
* Get the last player selecting dialogue option
* @returns {Object} The last player selecting dialogue option
*/
function lastPlayerSelectingDialogueOption(): any;
/**
* Get the last triggering quest ID
* @returns {string} The last triggering quest ID
*/
function lastTriggeringQuestId(): string;
/**
* Get the last casting unit
* @returns {Object} The last casting unit
*/
function lastCastingUnit(): any;
/**
* Get all items dropped on ground
* @returns {Array} Array of items dropped on ground
*/
function allItemsDroppedOnGround(): any[];
/**
* Check if AI is enabled for a unit
* @param {Object} unit - The unit to check
* @returns {boolean} Whether AI is enabled
*/
function isAIEnabled(unit: any): boolean;
/**
* Get the original position of a unit
* @param {Object} unit - The unit to get original position for
* @returns {Object} The original position
*/
function aiOriginalPosition(unit: any): any;
/**
* Get item at specified inventory slot for a unit
* @param {Object} unit - The unit to check inventory
* @param {number} slotIndex - The inventory slot index
* @returns {Object} The item in the slot
* @throws {Error} If required parameters are missing
*/
function itemAtSlot(unit: any, slotIndex: number): any;
/**
* Get selected inventory slot number for a unit
* @param {Object} unit - The unit to check
* @returns {number} The selected slot number
* @throws {Error} If unit parameter is missing
*/
function selectedSlot(unit: any): number;
/**
* Get the last created item
* @returns {Object} The last created item
*/
function lastCreatedItem(): any;
/**
* Returns the last touched item
* @returns {Object} The last touched item
*/
function lastTouchedItem(): any;
/**
* Returns the last attacking item
* @returns {Object} The last attacking item
*/
function lastAttackingItem(): any;
/**
* Returns the last used item
* @returns {Object} The last used item
*/
function lastUsedItem(): any;
/**
* Get the last purchased unit
* @returns {Object} The last purchased unit
*/
function lastPurchasedUnit(): any;
/**
* Get the last attacking unit
* @returns {Object} The last attacking unit
*/
function lastAttackingUnit(): any;
/**
* Get the last attacked unit
* @returns {Object} The last attacked unit
*/
function lastAttackedUnit(): any;
/**
* Get the last touched prop
* @returns {Object} The last touched prop
*/
function lastTouchedProp(): any;
/**
* Get the target unit of a unit
* @param {Object} unit - The unit to get target for
* @returns {Object} The target unit
* @throws {Error} If unit parameter is missing
*/
function targetUnit(unit: any): any;
/**
* Get the velocity vector of an entity
* @param {Object} entity - The entity to check velocity for
* @returns {{x: number, y: number, z: number} | undefined} The velocity vector containing x, y and z components
* @throws {Error} If entity parameter is missing
*/
function velocity(entity: any): {
        x: number;
/**
* Convert a number to a shortened notation with suffix (e.g. 1000 -> 1K)
* @param {number} value - The number to convert
* @returns {string} The formatted number with suffix
* @throws {Error} If value parameter is missing
*/
function convertNumberToLargeNotation(value: number): string;
/**
* Check if a unit is currently moving
* @param {Object} unit - The unit to check
* @returns {boolean} True if unit is moving
* @throws {Error} If unit parameter is missing
*/
function isMoving(unit: any): boolean;
/**
* Get quantity of item type in an item type group
* @param {Object} groupName - The item type group to check
* @param {string} entityType - The item type to get quantity for
* @returns {number} The quantity of the item type in the group
* @throws {Error} If required parameters are missing
*/
function quantityOfTypeInTypeGroup(groupName: any, entityType: string): number;
/**
* Get the quantity of an item
* @param {Object} item - The item to check
* @returns {number} The item quantity
* @throws {Error} If item parameter is missing
*/
function itemQuantity(item: any): number;
/**
* Get the maximum quantity of an item
* @param {Object} item - The item to check
* @returns {number} The item's maximum quantity
* @throws {Error} If item parameter is missing
*/
function itemMaxQuantity(item: any): number;
/**
* Get default attribute value for a unit type
* @param {string} attributeTypeId - The attribute type ID
* @param {string} entityTypeId - The entity type ID
* @returns {number} The default attribute value
* @throws {Error} If required parameters are missing
*/
function defaultAttributeValue(attributeName: any, entityTypeId: string): number;
/**
* Get the last clicked UI element ID for a player
* @param {Player} player - Player to get UI element for
* @returns {string} ID of last clicked UI element
* @throws {Error} If player parameter is missing
*/
function lastClickedUiElementId(player: Player): string;
/**
* Get the last message sent by a player
* @param {Player} player - Player to get message for
* @returns {string} Last message sent
* @throws {Error} If player parameter is missing
*/
function lastPlayerMessage(player: Player): string;
/**
* Get the realtime CSS for a player
* @param {Player} player - Player to get CSS for
* @returns {Object} Realtime CSS object
* @throws {Error} If player parameter is missing
*/
function realtimeCSSOfPlayer(player: Player): any;
/**
* Get the last custom input for a player
* @param {Player} player - Player to get input for
* @returns {*} The last custom input value
* @throws {Error} If player parameter is missing
*/
function customInput(player: Player): any;
/**
*
* @param {*} player
* @returns {string} The current dialogue id of the player
* @throws {Error} If player parameter is missing
*/
function currentDialogue(player: any): string;
/**
* Get quest object for a player and quest ID
* @param {Player} player - Player to get quest for
* @param {string} questId - ID of quest to get
* @returns {Object} Quest object
* @throws {Error} If required parameters are missing
*/
function questObject(player: Player, questId: string): any;
/**
* Get all active quests in current map for a player
* @param {Player} player - Player to get quests for
* @returns {Object} Active quests in current map
* @throws {Error} If player parameter is missing
*/
function activeQuestObjectsInThisMap(player: Player): any;
/**
* Get all active quests for a player
* @param {Player} player - Player to get quests for
* @returns {Object} All active quests
* @throws {Error} If player parameter is missing
*/
function activeQuestObjects(player: Player): any;
/**
* Get progress for a specific quest
* @param {Player} player - Player to get quest progress for
* @param {string} questId - ID of quest to get progress for
* @returns {number} Quest progress
* @throws {Error} If required parameters are missing
*/
function questProgress(player: Player, questId: string): number;
/**
* Check if a quest's progress is completed
* @param {Player} player - Player to check quest for
* @param {string} questId - ID of quest to check
* @returns {boolean} True if quest progress equals goal
* @throws {Error} If required parameters are missing
*/
function isQuestProgressCompleted(player: Player, questId: string): boolean;
/**
* Check if a quest is completed
* @param {Player} player - Player to check quest for
* @param {string} questId - ID of quest to check
* @returns {boolean} True if quest is completed
* @throws {Error} If required parameters are missing
*/
function isQuestCompleted(player: Player, questId: string): boolean;
/**
* Check if two entities are touching each other
* @param {Object} sourceEntity - First entity to check
* @param {Object} targetEntity - Second entity to check
* @returns {boolean} True if entities are touching
* @throws {Error} If either entity parameter is not provided
*/
function areEntitiesTouching(sourceEntity: any, targetEntity: any): boolean;
/**
* Check if a player is logged in
* @param {Player} player - Player to check
* @returns {boolean} True if player is logged in
* @throws {Error} If player parameter is not provided
*/
function isPlayerLoggedIn(player: Player): boolean;
/**
* Check if a player has adblock enabled
* @param {Player} player - Player to check
* @returns {boolean} True if player has adblock enabled
* @throws {Error} If player parameter is not provided
*/
function adblockEnabled(player: Player): boolean;
/**
* Check if an item fires projectiles
* @param {Object} item - Item to check
* @returns {boolean} True if item fires projectiles
* @throws {Error} If item parameter is not provided
*/
function itemFiresProjectiles(item: any): boolean;
/**
* Check if a unit is carrying an item type
* @param {Object} unit - Unit to check
* @param {string} itemType - Item type to check for
* @returns {boolean} True if unit is carrying the item type
*/
function isCarryingItemType(unit: any, itemType: string): boolean;
/**
* Check if a unit is inside a region
* @param {Object} region - Region to check
* @param {Object} entity - Entity to check
* @returns {boolean} True if entity is in region
*/
function entityIsInRegion(region: any, entity: any): boolean;
/**
* Retrieve a variable object by its name, optionally considering an entity's context.
* @param {string} variableName - The name of the variable to retrieve.
* @param {Entity} [entity] - Optional entity to consider for entity-specific variables.
* @returns {dataType: string, value: any, default?:any} The variable object.
*/
function getVariableObject(variableName: string, entity?: Entity): dataType;
/**
* Get the value of a variable
* @param {string} variableName - Name of variable to get value for
* @param {Entity} [entity] - Optional entity to check for entity-specific variables
* @returns {*} The current value of the variable
*/
function getVariable(variableName: string, entity?: Entity): any;
/**
* Get the data type of a variable
* @param {string} variableName - Name of variable to get type for
* @param {Entity} [entity] - Optional entity to check for entity-specific variables
* @returns {string} The data type of the variable ('player', 'unit', 'region', etc)
*/
function getVariableType(variableName: string, entity?: Entity): string;
/**
* Get all variables of specified types
* @param {string[]} selectedTypes - Types of variables to get
* @returns {Object} Object containing all matching variables
*/
function allVariables(selectedTypes: string[]): any;
/**
* Get a random number between min and max values
* @param {number} min
* @param {number} max
* @returns {number} Random number between min and max
*/
function randomNumberBetween(min: number, max: number): number;
/**
* Get the current game ID
* @returns {string} The game ID
*/
function gameId(): string;
/**
* Get the last received POST response
* @returns {*} The last POST response
*/
function lastReceivedPostResponse(): any;
/**
* Get the last received treasury balance
* @returns {number} The last received treasury balance
*/
function lastReceivedTreasuryBalance(): number;
/**
* Get name of last updated variable
* @returns {string} Name of last updated variable
*/
function lastUpdatedVariableName(): string;
/**
* Get the player that triggered the current action
* @returns {Object|undefined} The triggering player entity
*/
function triggeringPlayer(): any | undefined;
/**
* Get details of the item that was purchased
* @returns {Object|undefined} The purchased item details object, only available when "player purchases an item" trigger is fired
*/
function purchasedItemDetails(): any | undefined;
/**
* Get player type of a player
* @param {Player} player - The player
* @returns {string|undefined} The player type ID
*/
function playerTypeOfPlayer(player: Player): string | undefined;
/**
* Get the owner of an entity
* @param {Entity} entity - The entity
* @returns {Player|Unit} player or unit
*/
function owner(entity: Entity): Player | Unit;
/**
* Check if player is controlled by a human or a bot
* @param {Player} player - The player
* @returns {boolean} True if player is human controlled
*/
function isControlledByHumanOrBot(player: Player): boolean;
/**
* Check if player is on mobile device
* @param {Player} player - The player
* @returns {boolean} True if player is on mobile
*/
function isOnMobile(player: Player): boolean;
/**
* Get entity bounds
* @param {Entity} entity
* @returns {Object|undefined} The entity bounds
*/
function bounds(entity: Entity): any | undefined;
/**
* Get computer player by number
* @param {number} number
* @returns {Player|undefined} The computer player entity
*/
function computerPlayer(number: number): Player | undefined;
/**
* Get the entity that triggered the current action
* @returns {Entity|undefined} The triggering entity
*/
function triggeringEntity(): Entity | undefined;
/**
* Get the unit that triggered the current action
* @returns {Unit|undefined} The triggering unit
*/
function triggeringUnit(): Unit | undefined;
/**
* Get the prop that triggered the current action
* @returns {Prop|undefined} The triggering prop
*/
function triggeringProp(): Prop | undefined;
/**
* Get the last created unit
* @returns {Unit|undefined} The last created unit
*/
function lastCreatedUnit(): Unit | undefined;
/**
*
* @returns {number} player count
*/
function playerCount(): number;
/**
* Get the last created prop
* @returns {Prop|undefined} The last created prop
*/
function lastCreatedProp(): Prop | undefined;
/**
* Checks if a role exists for a given player.
*
* @param {Player} player - The player to check the role for.
* @param {string} name - The name of the role to check.
* @returns {boolean} True if the role exists for the player, false otherwise.
*/
function roleExistsForPlayer(player: Player, name: string): boolean;
/**
* Returns the last chat message sent by a player.
*
* @returns {string} The last chat message sent by a player.
*/
function lastChatMessageSentByPlayer(): string;
/**
* Returns the selected unit for a given player.
*
* @param {Player} player - The player to get the selected unit for.
* @returns {Unit|undefined} The selected unit or undefined if not found.
*/
function selectedUnit(player: Player): Unit | undefined;
/**
* Get source unit of a projectile
* @param {Projectile} projectile
* @returns {(Unit|undefined)} The source unit
*/
function sourceUnit(projectile: Projectile): (Unit | undefined);
/**
* Get all units in a region
* @param {Region} region
* @returns {Entity[]} Array of units in the region
*/
function allUnitsInRegion(region: Region): Entity[];
/**
* Returns all units of a given unit type.
*
* @param {UnitTypeId} unitTypeId - The ID of the unit type to get units for.
* @returns {Unit[]} Array of units of the specified type.
*/
function allUnitsOfUnitTypeId(unitTypeId: UnitTypeId): Unit[];
/**
* get number of players of playerType
* @param {PlayerTypeId} playerTypeId
* @returns
*/
function numberOfPlayersOfPlayerTypeId(playerTypeId: PlayerTypeId): any;
/**
* Returns an object from the engine's object register by
* the object's id. If the item passed is not a string id
* then the item is returned as is. If no item is passed
* the engine itself is returned.
* @param {String || Object} id The id of the item to return,
* @returns {AllEntity | undefined} entity
* or if an object, returns the object as-is.
*/
function getEntityById(id: any): AllEntity | undefined;
/**
* Returns an array of all objects that have been assigned
* the passed category name.
* @param {String} categoryName The name of the category to return
* all objects for.
*/
function getEntitiesByCategory(categoryName: string): any;
/**
* Returns an array of all objects that have been assigned
* the passed group name.
* @param {String} groupName The name of the group to return
* all objects for.
*/
function getEntitiesByGroup(groupName: string): any;
/**
* Get number of units of a specific unit type
* @param {UnitTypeId} unitTypeId - The unitType
* @returns {number} Number of units of that type
*/
function numberOfUnitsOfUnitType(unitTypeId: UnitTypeId): number;
/**
* Get the item that triggered the current action
* @returns {Item|undefined} The triggering item
*/
function triggeringItem(): Item | undefined;
/**
* Get source item of a projectile
* @param {Object} projectile
* @returns {Object|undefined} The source item
*/
function sourceItem(projectile: any): any | undefined;
/**
* Get item currently held by a unit
* @param {Object} unit
* @returns {Object|undefined} The held item
*/
function currentlyHeldItem(unit: any): any | undefined;
/**
* Get all items owned by a unit
* @param {Unit} unit
* @returns {Item[]} Array of items owned by the unit
*/
function allOwnedItems(unit: Unit): Item[];
/**
* Get the last touched projectile
* @returns {Projectile|undefined} The last touched projectile
*/
function lastTouchedProjectile(): Projectile | undefined;
/**
* Get type of entity/attribute
* @param {Player|Item|Unit|Prop|Attribute} entity
* @returns {string|undefined} The projectile type
*/
function typeId(entity: Player | Item | Unit | Prop | Attribute): string | undefined;
/**
* Get the sensor that triggered the current action
* @returns {Object|undefined} The triggering sensor
*/
function triggeringSensor(): any | undefined;
/**
* Get the sensor of a unit
* @param {Object} unit
* @returns {Object|undefined} The sensor
*/
function sensor(unit: any): any | undefined;
/**
* Get the projectile that triggered the current action
* @returns {Object|undefined} The triggering projectile
*/
function triggeringProjectile(): any | undefined;
/**
* Get the region that triggered the current action
* @returns {Object|undefined} The triggering region
*/
function triggeringRegion(): any | undefined;
/**
* Get region by name
* @param {Object} name
* @returns {Object|undefined} The region
*/
function getRegionByName(regionName: any): any | undefined;
/**
* Calculate the angle between two positions
* @param {Object} positionA - The first position
* @param {Object} positionB - The second position
* @returns {number|undefined} The angle in radians, or undefined if positions are not valid
*/
function angleBetweenPositions(positionA: any, positionB: any): number | undefined;
/**
* Check if two regions overlap
* @param {Object} regionA
* @param {Object} regionB
* @returns {boolean} True if regions overlap
*/
function regionOverlapsWithRegion(regionA: any, regionB: any): boolean;
/**
* Get name of triggering variable
* @returns {string|undefined} The variable name
*/
function triggeringVariableName(): string | undefined;
/**
* Get triggering attribute
* @returns {*} The attribute
*/
function triggeringAttribute(): any;
/**
* Check if a player is controlled by computer AI
* @param {Player} player - The player to check
* @returns {boolean} True if player is computer controlled
*/
function isComputerPlayer(player: Player): boolean;
/**
* Check if a player is a bot
* @param {Player} player - The player to check
* @returns {boolean} True if player is a bot
*/
function isBot(player: Player): boolean;
/**
* Get client received data
* @param {Player} player - The player
* @returns {Object} The client received data
*/
function clientReceivedData(player: Player): any;
/**
* Get item type inventory URL
* @param {Object} itemTypeId - The itemTypeId
* @returns {string} The inventory image URL
*/
function itemTypeInventoryUrl(itemTypeId: any): string;
/**
* Get number of invites by player
* @param {Player} player - The player
* @returns {number} Number of invites
*/
function numberOfInvites(player: Player): number;
/**
* Get wallet address
* @param {Player} player - The player
* @returns {string} The wallet address
*/
function walletAddress(player: Player): string;
/**
* Get token swap info
* @param {Player} player - The player
* @returns {Object} The token swap info
*/
function tokenSwapInfo(player: Player): any;
/**
* Get last requested competition details
* @returns {Object} The competition details
*/
function lastRequestedCompetitionDetails(): any;
/**
* Get last requested competition participants
* @returns {Array} The competition participants
*/
function lastRequestedCompetitionParticipants(): any[];
/**
* Get competing players
* @returns {Array} The competing players
*/
function competingPlayers(): any[];
/**
* Calculate direction vector between two positions
* @param {Object} positionA - First position with x,y,z coordinates
* @param {Object} positionB - Second position with x,y,z coordinates
* @returns {Object} Normalized direction vector with x,y,z components
*/
function directionVectorBetweenPositions(positionA: any, positionB: any): any;
/**
* Calculate 2D distance between two positions
* @param {Object} positionA - First position with x,y coordinates
* @param {Object} positionB - Second position with x,y coordinates
* @returns {number} Distance between the two positions
*/
function distanceBetweenPositions(positionA: any, positionB: any): number;
/**
* Get player's play time
* @param {Player} player - The player
* @returns {number} Time difference between join game and current time
*/
function playTime(player: Player): number;
/**
* Get last competition participation cost
* @param {Player} player - The player
* @returns {number} The last competition participation cost
*/
function lastCompetitionParticipationCost(player: Player): number;
/**
* Get last competition reward amount
* @param {Player} player - The player
* @returns {number} The last competition reward amount
*/
function lastCompetitionRewardAmount(player: Player): number;
/**
* Check if player is an AI agent
* @param {Player} player - The player
* @returns {boolean} True if player is an AI agent
*/
function isAiAgent(player: Player): boolean;
/**
* Get player agent ID
* @param {Player} player - The player
* @returns {string} The player agent ID
*/
function agentId(player: Player): string;
/**
* Get this request data
* @returns {Object} The this request data
*/
function thisRequestData(): any;
