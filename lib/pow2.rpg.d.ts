/// <reference path="../types/backbone/backbone.d.ts" />
/// <reference path="../types/angularjs/angular.d.ts" />
/// <reference path="pow2.d.ts" />
/// <reference path="pow2.ui.d.ts" />
declare module rpg {
    var app: ng.IModule;
    interface IGameItem {
        name: string;
        cost: number;
        icon: string;
        usedby?: any[];
    }
    interface IGameWeapon extends IGameItem {
        attack: number;
        hit: number;
    }
    interface IGameArmor extends IGameItem {
        defense: number;
        evade: number;
    }
}
declare module rpg {
    var COMBAT_ENCOUNTERS: {
        FIXED: string;
        RANDOM: string;
    };
    interface IGameEncounter {
        type: string;
        id: string;
        zones: string[];
        enemies: string[];
    }
    interface IGameEncounterCallback {
        (victory: boolean): void;
    }
}
declare module rpg.models {
    interface EntityModelOptions {
        name: string;
        icon: string;
        level?: number;
        hp?: number;
        maxHP?: number;
        exp?: number;
        strength?: number;
        vitality?: number;
        intelligence?: number;
        agility?: number;
        dead?: boolean;
        evade: number;
        hitpercent: number;
    }
    class EntityModel extends Backbone.Model {
        static BASE_CHANCE_TO_HIT: number;
        static BASE_EVASION: number;
        static DEFAULTS: EntityModelOptions;
        defaults(): any;
        rollHit(defender: EntityModel): boolean;
        damage(amount: number): number;
        getEvasion(): number;
        isDefeated(): boolean;
        attack(defender: EntityModel): number;
    }
}
declare module rpg.objects {
    class GameEntityObject extends pow2.tile.TileObject {
        model: rpg.models.EntityModel;
        type: string;
        groups: any;
        world: GameWorld;
        constructor(options: any);
        isDefeated(): boolean;
        getSpells(): any[];
    }
}
declare module rpg.components.combat {
    class CombatActionComponent extends pow2.scene.SceneComponent implements rpg.states.IPlayerAction {
        combat: rpg.states.GameCombatState;
        name: string;
        from: rpg.objects.GameEntityObject;
        to: rpg.objects.GameEntityObject;
        spell: any;
        constructor(combat: rpg.states.GameCombatState);
        getActionName(): string;
        isCurrentTurn(): boolean;
        canTarget(): boolean;
        canTargetMultiple(): boolean;
        /**
         * Method used to determine if this action is usable by a given
         * [GameEntityObject].  This may be subclassed in an action to
         * select the types of entities that may use the action.
         * @param entity The object that would use the action.
         * @returns {boolean} True if the entity may use this action.
         */
        canBeUsedBy(entity: rpg.objects.GameEntityObject): boolean;
        /**
         * Base class invokes the then callback and returns true.
         * @returns {boolean} Whether the act was successful or not.
         */
        act(then?: rpg.states.IPlayerActionCallback): boolean;
        /**
         * The action has been selected for the current turn.
         */
        select(): void;
    }
}
declare module rpg.components.combat.actions {
    /**
     * Attack another entity in combat.
     */
    class CombatAttackComponent extends CombatActionComponent {
        name: string;
        canBeUsedBy(entity: rpg.objects.GameEntityObject): boolean;
        act(then?: rpg.states.IPlayerActionCallback): boolean;
    }
}
declare module rpg.components.combat.actions {
    class CombatGuardComponent extends CombatActionComponent {
        name: string;
        canTarget(): boolean;
        act(then?: rpg.states.IPlayerActionCallback): boolean;
        /**
         * Until the end of the next turn, or combat end, increase the
         * current players defense.
         */
        select(): void;
        enterState(newState: rpg.states.CombatState, oldState: rpg.states.CombatState): void;
    }
}
declare module rpg.components.combat.actions {
    /**
     * Use magic in combat.
     */
    class CombatMagicComponent extends CombatActionComponent {
        name: string;
        canBeUsedBy(entity: rpg.objects.GameEntityObject): boolean;
        act(then?: rpg.states.IPlayerActionCallback): boolean;
        healSpell(done?: (error?: any) => any): boolean;
        hurtSpell(done?: (error?: any) => any): boolean;
    }
}
declare module rpg.components.combat.actions {
    /**
     * Describe the result of a combat run action.
     */
    interface CombatRunSummary {
        success: boolean;
        player: rpg.objects.GameEntityObject;
    }
    class CombatRunComponent extends CombatActionComponent {
        name: string;
        canTarget(): boolean;
        act(then?: rpg.states.IPlayerActionCallback): boolean;
        /**
         * Determine if a run action results in a successful escape from
         * combat.
         *
         * TODO: This should really consider character attributes.
         *
         * @returns {boolean} If the escape will succeed.
         * @private
         */
        private _rollEscape();
    }
}
declare module rpg {
    class GameWorld extends pow2.scene.SceneWorld {
        state: rpg.states.GameStateMachine;
        model: rpg.models.GameStateModel;
        combatScene: pow2.scene.Scene;
        scene: pow2.scene.Scene;
        /**
         * Access to the game's Google Doc spreadsheet configuration.  For more
         * information, see [GameDataResource].
         */
        spreadsheet: pow2.GameDataResource;
        constructor(services?: any);
        static get(): rpg.GameWorld;
        private _encounterCallback;
        reportEncounterResult(victory: boolean): void;
        randomEncounter(zone: IZoneMatch, then?: IGameEncounterCallback): void;
        fixedEncounter(zone: IZoneMatch, encounterId: string, then?: IGameEncounterCallback): void;
        private _encounter(zoneInfo, encounter, then?);
    }
}
declare module rpg {
    /**
     * Describe a set of combat zones for a given point on a map.
     */
    interface IZoneMatch {
        /**
         * The zone name for the current map
         */
        map: string;
        /**
         * The zone name for the target location on the map
         */
        target: string;
        /**
         * The point that target refers to.
         */
        targetPoint: pow2.Point;
    }
    /**
     * A tile map that supports game feature objects and components.
     */
    class GameTileMap extends pow2.tile.TileMap {
        world: GameWorld;
        loaded(): void;
        destroy(): void;
        unloaded(): void;
        getFeature(name: string): any;
        addFeaturesToScene(): void;
        removeFeaturesFromScene(): void;
        buildFeatures(): boolean;
        createFeatureObject(tiledObject: pow2.tiled.ITiledObject): pow2.tile.TileObject;
        /**
         * Enumerate the map and target combat zones for a given position on this map.
         * @param at The position to check for a sub-zone in the map
         * @returns {IZoneMatch} The map and target zones that are null if they don't exist
         */
        getCombatZones(at: pow2.Point): IZoneMatch;
    }
}
declare module rpg.components.combat {
    class CombatCameraComponent extends pow2.scene.components.CameraComponent {
        host: GameTileMap;
        connectComponent(): boolean;
        process(view: pow2.scene.SceneView): void;
    }
}
declare module rpg.components.combat {
    /**
     * A component that when added to a GameTileMap listens
     * to the player moves and after a random number of them forces
     * an encounter with a group of creatures from the current combat
     * zone.
     */
    class CombatEncounterComponent extends pow2.scene.SceneComponent {
        host: GameTileMap;
        battleCounter: number;
        combatFlag: boolean;
        combatZone: string;
        isDangerous: boolean;
        enabled: boolean;
        world: GameWorld;
        connectComponent(): boolean;
        disconnectComponent(): boolean;
        player: rpg.objects.GameEntityObject;
        syncComponent(): boolean;
        listenMoves(): void;
        stopListening(): void;
        moveProcess(player: pow2.scene.components.PlayerComponent, from: pow2.Point, to: pow2.Point): boolean;
        resetBattleCounter(): void;
        triggerCombat(at: pow2.Point): void;
        private _setCounter(value);
    }
}
declare module rpg.components {
    class GameComponent extends pow2.tile.TileComponent {
        host: pow2.tile.TileObject;
        syncComponent(): boolean;
    }
}
declare module rpg.components {
    class DamageComponent extends pow2.scene.SceneComponent {
        host: rpg.objects.GameEntityObject;
        animation: pow2.tile.components.AnimatedSpriteComponent;
        sprite: pow2.tile.components.SpriteComponent;
        sound: pow2.scene.components.SoundComponent;
        started: boolean;
        syncComponent(): boolean;
    }
}
declare module rpg.components {
    /**
     * Basic Dorkapon player that can navigate around the map
     * using the paths defined within.
     */
    class PlayerComponent extends pow2.scene.components.PlayerComponent {
        host: rpg.objects.GameEntityObject;
        map: pow2.tile.TileMap;
        /**
         * Collide with the rpg tile map features and obstacles.
         */
        collideMove(x: number, y: number, results?: pow2.scene.SceneObject[]): boolean;
    }
}
declare module rpg.components {
    /**
     * A component that defines the functionality of a map feature.
     */
    class GameFeatureComponent extends pow2.tile.TileComponent {
        host: rpg.objects.GameFeatureObject;
        connectComponent(): boolean;
        syncComponent(): boolean;
        /**
         * Hide and disable a feature object in a persistent manner.
         * @param hidden Whether to hide or unhide the object.
         */
        setDataHidden(hidden?: boolean): void;
        /**
         * Determine if a feature has been persistently hidden by a call
         * to `hideFeature`.
         */
        getDataHidden(): boolean;
    }
}
declare module rpg.components.features {
    /**
     * A map feature that represents a fixed combat encounter.
     *
     * When a player enters the tile of a feature with this component
     * it will trigger a combat encounter that must be defeated before
     * the tile may be passed.
     */
    class CombatFeatureComponent extends GameFeatureComponent {
        party: pow2.scene.components.PlayerComponent;
        connectComponent(): boolean;
        enter(object: rpg.objects.GameEntityObject): boolean;
    }
}
declare module rpg.components.features {
    class DialogFeatureComponent extends GameFeatureComponent {
        title: string;
        text: string;
        icon: string;
        syncComponent(): boolean;
        enter(object: pow2.tile.TileObject): boolean;
        exit(object: pow2.tile.TileObject): boolean;
    }
}
declare module rpg.components.features {
    class PortalFeatureComponent extends GameFeatureComponent {
        map: string;
        target: pow2.Point;
        syncComponent(): boolean;
        entered(object: pow2.tile.TileObject): boolean;
    }
}
declare module rpg.components.features {
    class ShipFeatureComponent extends GameFeatureComponent {
        party: pow2.scene.components.PlayerComponent;
        partyObject: pow2.tile.TileObject;
        partySprite: string;
        private _tickInterval;
        syncComponent(): boolean;
        enter(object: rpg.objects.GameFeatureObject): boolean;
        entered(object: rpg.objects.GameFeatureObject): boolean;
        /**
         * Board an object onto the ship component.  This will modify the
         * @param object
         */
        board(object: rpg.objects.GameFeatureObject): boolean;
        disembark(from: pow2.Point, to: pow2.Point, heading: pow2.Point): void;
    }
}
declare module rpg.components.features {
    class StoreFeatureComponent extends GameFeatureComponent {
        name: string;
        inventory: any[];
        syncComponent(): boolean;
        disconnectComponent(): boolean;
        enter(object: pow2.tile.TileObject): boolean;
        exit(object: pow2.tile.TileObject): boolean;
    }
}
declare module rpg.components.features {
    class TempleFeatureComponent extends GameFeatureComponent {
        cost: string;
        icon: string;
        syncComponent(): boolean;
        enter(object: pow2.tile.TileObject): boolean;
        exit(object: pow2.tile.TileObject): boolean;
    }
}
declare module rpg.components.features {
    class TreasureFeatureComponent extends GameFeatureComponent {
        gold: number;
        item: string;
        icon: string;
        connectComponent(): boolean;
        syncComponent(): boolean;
        enter(object: pow2.tile.TileObject): boolean;
    }
}
declare module rpg.objects {
    class GameFeatureObject extends pow2.tile.TileObject {
        tileMap: GameTileMap;
        world: GameWorld;
        feature: any;
        type: string;
        passable: boolean;
        groups: any[];
        category: any;
        frame: number;
        constructor(options: any);
    }
}
declare module rpg.components {
    class GameFeatureInputComponent extends pow2.scene.components.TickedComponent {
        hitBox: pow2.Rect;
        hits: pow2.tile.TileObject[];
        mouse: pow2.NamedMouseElement;
        syncComponent(): boolean;
        tick(elapsed: number): void;
    }
}
declare module rpg.components {
    /**
     * A Component that collides with features that are directly in front
     * of a player, that the player is 'touching' by facing them.
     */
    class PlayerTouchComponent extends pow2.scene.components.TickedComponent {
        host: pow2.tile.TileObject;
        collider: pow2.scene.components.CollisionComponent;
        player: pow2.scene.components.PlayerComponent;
        touch: rpg.objects.GameFeatureObject;
        touchedComponent: rpg.components.GameFeatureComponent;
        syncComponent(): boolean;
        tick(elapsed: number): void;
    }
}
declare module rpg.services {
    class PowGameService {
        compile: ng.ICompileService;
        scope: ng.IRootScopeService;
        loader: pow2.ResourceLoader;
        world: GameWorld;
        tileMap: rpg.GameTileMap;
        sprite: rpg.objects.GameEntityObject;
        machine: rpg.states.GameStateMachine;
        currentScene: pow2.scene.Scene;
        entities: pow2.EntityContainerResource;
        private _renderCanvas;
        private _canvasAcquired;
        private _stateKey;
        constructor(compile: ng.ICompileService, scope: ng.IRootScopeService);
        getSaveData(): any;
        resetGame(): void;
        saveGame(data: any): void;
        createPlayer(from: rpg.models.HeroModel, at?: pow2.Point): void;
        loadMap(mapName: string, then?: () => any, player?: rpg.models.HeroModel, at?: pow2.Point): void;
        newGame(then?: () => any): void;
        loadGame(data: any, then?: () => any): void;
        /**
         * Returns a canvas rendering context that may be drawn to.  A corresponding
         * call to releaseRenderContext will return the drawn content of the context.
         */
        getRenderContext(width: number, height: number): CanvasRenderingContext2D;
        /**
         * Call this after getRenderContext to finish rendering and have the source
         * of the canvas content returned as a data url string.
         */
        releaseRenderContext(): string;
        /**
         * Extract the browser location query params
         * http://stackoverflow.com/questions/9241789/how-to-get-url-params-with-javascript
         */
        qs(): any;
    }
}
declare module rpg.services {
    interface IPowAlertObject {
        message: string;
        duration?: number;
        elapsed?: number;
        dismissed?: boolean;
        busy?: boolean;
        done?(message: IPowAlertObject): any;
    }
    interface IAlertScopeService extends ng.IRootScopeService {
        powAlert: IPowAlertObject;
    }
    interface IPowAlertService {
        show(message: string): IPowAlertObject;
        queue(config: IPowAlertObject): any;
    }
    /**
     * Provide a basic service for queuing and showing messages to the user.
     */
    class PowAlertService extends pow2.Events implements pow2.IWorldObject, pow2.IProcessObject, IPowAlertService {
        element: JQuery;
        document: any;
        scope: IAlertScopeService;
        timeout: ng.ITimeoutService;
        game: PowGameService;
        animate: any;
        world: rpg.GameWorld;
        _uid: string;
        paused: boolean;
        containerSearch: string;
        container: ng.IAugmentedJQuery;
        private _current;
        private _queue;
        private _dismissBinding;
        constructor(element: JQuery, document: any, scope: IAlertScopeService, timeout: ng.ITimeoutService, game: PowGameService, animate: any);
        onAddToWorld(world: pow2.IWorld): void;
        onRemoveFromWorld(world: pow2.IWorld): void;
        tick(elapsed: number): void;
        destroy(): void;
        show(message: string, done?: () => void, duration?: number): IPowAlertObject;
        queue(config: IPowAlertObject): IPowAlertObject;
        processFrame(elapsed: number): void;
        dismiss(): void;
    }
}
declare module rpg.controllers {
}
declare module rpg.directives.bits {
}
declare module rpg.directives.combat {
    /**
     * Attach an HTML element to the position of a game object.
     */
    interface UIAttachment {
        object: rpg.objects.GameEntityObject;
        offset: pow2.Point;
        element: HTMLElement;
    }
    /**
     * A state machine to represent the various UI states involved in
     * choosing a combat action.
     *
     * ```
     *
     *     +------+   +--------+   +--------+
     *     | type |-->| target |-->| submit |
     *     +------+   +--------+   +--------+
     *
     * ```
     *
     * When the user properly selects an action type (Attack, Magic, Item)
     * and a target to apply the action to (Hero, All Enemies, etc.) the
     * submit state will apply the selection to the state machine at which
     * point the implementation may do whatever it wants.
     */
    class ChooseActionStateMachine extends pow2.StateMachine {
        controller: CombatViewController;
        data: rpg.states.combat.IChooseActionEvent;
        current: rpg.objects.GameEntityObject;
        target: rpg.objects.GameEntityObject;
        scene: pow2.scene.Scene;
        player: pow2.game.components.PlayerCombatRenderComponent;
        action: rpg.components.combat.CombatActionComponent;
        spell: any;
        scope: any;
        world: rpg.GameWorld;
        constructor(controller: CombatViewController, data: rpg.states.combat.IChooseActionEvent, submit: (action: rpg.components.combat.CombatActionComponent) => any);
    }
    /**
     * Choose a specific action type to apply in combat.
     */
    class ChooseActionType extends pow2.State {
        static NAME: string;
        name: string;
        enter(machine: ChooseActionStateMachine): void;
        exit(machine: ChooseActionStateMachine): void;
    }
    /**
     * Choose a magic spell to cast in combat.
     */
    class ChooseMagicSpell extends pow2.State {
        static NAME: string;
        name: string;
        enter(machine: ChooseActionStateMachine): void;
        exit(machine: ChooseActionStateMachine): void;
    }
    /**
     * Choose a target to apply a combat action to
     */
    class ChooseActionTarget extends pow2.State {
        static NAME: string;
        name: string;
        enter(machine: ChooseActionStateMachine): void;
        exit(machine: ChooseActionStateMachine): void;
    }
    /**
     * Submit a selected action type and action target to the submit handler
     * implementation.
     */
    class ChooseActionSubmit extends pow2.State {
        submit: (action: rpg.components.combat.CombatActionComponent) => any;
        static NAME: string;
        name: string;
        constructor(submit: (action: rpg.components.combat.CombatActionComponent) => any);
        enter(machine: ChooseActionStateMachine): void;
    }
}
declare module rpg.directives {
}
declare module rpg.directives {
    class CombatViewController implements pow2.IProcessObject {
        game: rpg.services.PowGameService;
        $scope: any;
        static $inject: string[];
        constructor(game: rpg.services.PowGameService, $scope: any);
        pointer: rpg.directives.combat.UIAttachment;
        combatView: GameCombatView;
        combatData: rpg.states.combat.IChooseActionEvent;
        stateMachine: rpg.directives.combat.ChooseActionStateMachine;
        choosing: rpg.objects.GameEntityObject;
        choosingSpell: pow2.game.components.PlayerCombatRenderComponent;
        targeting: boolean;
        tick(elapsed: number): void;
        setPointerTarget(object: rpg.objects.GameEntityObject, directionClass?: string, offset?: pow2.Point): void;
        addPointerClass(clazz: string): void;
        removePointerClass(clazz: string): void;
        destroy(): void;
        getMemberClass(member: any, focused: any): string;
        getActions(): rpg.components.combat.CombatActionComponent[];
        getSpells(): any;
        getTargets(): rpg.objects.GameEntityObject[];
    }
}
declare module rpg.directives {
}
declare module rpg.directives {
}
declare module rpg.directives {
}
declare module rpg.directives {
}
declare module rpg.directives.pages {
    class MainMenuController {
        $scope: any;
        static $inject: string[];
        constructor($scope: any);
        getClassIcon(classData: any): any;
        getItemClass(classData: any): string;
        previousClass(): void;
        nextClass(): void;
    }
}
declare module rpg.directives {
    class StoreViewController implements pow2.IProcessObject {
        game: rpg.services.PowGameService;
        powAlert: rpg.services.PowAlertService;
        $scope: any;
        static $inject: string[];
        constructor(game: rpg.services.PowGameService, powAlert: rpg.services.PowAlertService, $scope: any);
        /**
         * The game state model to modify.
         */
        gameModel: rpg.models.GameStateModel;
        /**
         * The selected item to purchase/sell.
         */
        selected: rpg.models.ItemModel;
        /**
         * Determine if the UI is in a selling state.
         */
        selling: boolean;
        destroy(): void;
        actionItem(item: any): void;
        getActionVerb(): string;
        isBuying(): boolean;
        isSelling(): boolean;
        toggleAction(): void;
        selectItem(item: any): void;
        initStoreFromFeature(feature: rpg.components.features.StoreFeatureComponent): void;
    }
}
declare module rpg.directives {
}
declare module rpg {
    class GameCombatView extends pow2.tile.TileMapView {
        world: rpg.GameWorld;
        objectRenderer: pow2.tile.render.TileObjectRenderer;
        mouse: pow2.NamedMouseElement;
        constructor(canvas: HTMLCanvasElement, loader: any);
        onAddToScene(scene: pow2.scene.Scene): void;
        onRemoveFromScene(scene: pow2.scene.Scene): void;
        mouseClick(e: any): boolean;
        processCamera(): void;
        renderFrame(elapsed: number): GameCombatView;
    }
}
declare module rpg.models {
    class ItemModel extends Backbone.Model {
        static DEFAULTS: IGameItem;
        defaults(): any;
    }
}
declare module rpg.models {
    class ArmorModel extends ItemModel {
        static DEFAULTS: rpg.IGameArmor;
        defaults(): any;
    }
}
declare module rpg.models {
    class GameStateModel extends pow2.Events {
        party: HeroModel[];
        inventory: ItemModel[];
        loader: pow2.ResourceLoader;
        keyData: {
            [key: string]: any;
        };
        gold: number;
        combatZone: string;
        constructor(options?: any);
        initData(then?: (data: pow2.GameDataResource) => any): void;
        /**
         * Get the game data sheets from google and callback when they're loaded.
         * @param then The function to call when spreadsheet data has been fetched
         */
        static getDataSource(then?: (data: pow2.GameDataResource) => any): pow2.GameDataResource;
        setKeyData(key: string, data: any): void;
        getKeyData(key: string): any;
        addInventory(item: ItemModel): ItemModel;
        removeInventory(item: ItemModel): boolean;
        addHero(model: HeroModel): void;
        addGold(amount: number): void;
        parse(data: any, options?: any): void;
        toJSON(): any;
    }
}
declare module rpg.models {
    class WeaponModel extends ItemModel {
        static DEFAULTS: IGameWeapon;
        defaults(): any;
        isNoWeapon(): boolean;
    }
}
declare module rpg.models {
    var HeroTypes: any;
    interface HeroModelOptions extends EntityModelOptions {
        type: string;
        description: string;
        combatSprite: string;
        baseStrength: number;
        baseAgility: number;
        baseIntelligence: number;
        baseVitality: number;
        hitPercentPerLevel: number;
        nextLevelExp: number;
        prevLevelExp: number;
    }
    class HeroModel extends EntityModel {
        static MAX_LEVEL: number;
        static MAX_ATTR: number;
        static ARMOR_TYPES: string[];
        weapon: WeaponModel;
        head: ArmorModel;
        body: ArmorModel;
        arms: ArmorModel;
        feet: ArmorModel;
        accessory: ArmorModel;
        game: GameStateModel;
        /**
         * A constant buffer to add to defense of a player.
         *
         * TODO: This is probably a terrible way of buffing a character.
         *
         * Instead use a chain of modifiers?  e.g. PosionModifier, GuardingModifier,
         * ParalyzedModifier, etc.
         */
        defenseBuff: number;
        static DEFAULTS: HeroModelOptions;
        defaults(): any;
        equipArmor(item: ArmorModel): ArmorModel;
        unequipArmor(item: ArmorModel): boolean;
        getEvasion(): number;
        attack(defender: EntityModel): number;
        getXPForLevel(level?: any): number;
        getDefense(base?: boolean): number;
        getDamage(): number;
        awardExperience(exp: number): boolean;
        awardLevelUp(): void;
        parse(data: any, options?: any): any;
        toJSON(): any;
        getHPForLevel(level?: number): number;
        getStrengthForLevel(level?: number): number;
        getAgilityForLevel(level?: number): number;
        getVitalityForLevel(level?: number): number;
        getIntelligenceForLevel(level?: number): number;
        static create(type: string, name: string): HeroModel;
    }
}
declare module rpg.models {
    interface CreatureModelOptions extends EntityModelOptions {
        name: string;
        icon: string;
        groups: string[];
        level: number;
        hp: number;
        strength: number;
        numAttacks: number;
        armorClass: number;
        description: string;
    }
    class CreatureModel extends EntityModel {
        static DEFAULTS: CreatureModelOptions;
        defaults(): any;
        initialize(attributes?: any): void;
        attack(defender: EntityModel): number;
    }
}
declare module rpg {
    class RPGMapView extends pow2.game.GameMapView {
        tileMap: rpg.GameTileMap;
        private _features;
        protected clearCache(): void;
        renderFrame(elapsed: number): RPGMapView;
    }
}
declare module rpg.states {
    /**
     * CombatState is set when the player transitions in to a combat
     * encounter.  This can be any type of triggered encounter, from
     * the map or a feature interaction, or anything else.
     */
    class CombatState extends pow2.State {
    }
}
declare module rpg.states.combat {
    interface CombatAttackSummary {
        damage: number;
        attacker: rpg.objects.GameEntityObject;
        defender: rpg.objects.GameEntityObject;
    }
    class CombatBeginTurnState extends CombatState {
        static NAME: string;
        name: string;
        current: rpg.objects.GameEntityObject;
        machine: CombatStateMachine;
        enter(machine: CombatStateMachine): void;
        exit(machine: CombatStateMachine): void;
    }
}
declare module rpg.states {
    /**
     * Completion callback for a player action.
     */
    interface IPlayerActionCallback {
        (action: IPlayerAction, error?: any): void;
    }
    /**
     * A Player action during combat
     */
    interface IPlayerAction {
        name: string;
        from: rpg.objects.GameEntityObject;
        to: rpg.objects.GameEntityObject;
        act(then?: IPlayerActionCallback): boolean;
    }
    class CombatStateMachine extends pow2.StateMachine {
        parent: GameStateMachine;
        defaultState: string;
        states: pow2.IState[];
        party: rpg.objects.GameEntityObject[];
        enemies: rpg.objects.GameEntityObject[];
        turnList: rpg.objects.GameEntityObject[];
        playerChoices: {
            [id: string]: IPlayerAction;
        };
        focus: rpg.objects.GameEntityObject;
        current: rpg.objects.GameEntityObject;
        currentDone: boolean;
        isFriendlyTurn(): boolean;
        getLiveParty(): rpg.objects.GameEntityObject[];
        getLiveEnemies(): rpg.objects.GameEntityObject[];
        getRandomPartyMember(): rpg.objects.GameEntityObject;
        getRandomEnemy(): rpg.objects.GameEntityObject;
        partyDefeated(): boolean;
        enemiesDefeated(): boolean;
        constructor(parent: GameStateMachine);
    }
    /**
     * Construct a combat scene with appropriate GameEntityObjects for the players
     * and enemies.
     */
    class GameCombatState extends pow2.State {
        static NAME: string;
        name: string;
        machine: CombatStateMachine;
        parent: GameStateMachine;
        tileMap: GameTileMap;
        finished: boolean;
        factory: pow2.EntityContainerResource;
        spreadsheet: pow2.GameDataResource;
        constructor();
        enter(machine: GameStateMachine): void;
        exit(machine: GameStateMachine): void;
    }
}
declare module rpg.states.combat {
    interface IChooseActionEvent {
        players: rpg.objects.GameEntityObject[];
        enemies: rpg.objects.GameEntityObject[];
        choose: (action: rpg.components.combat.CombatActionComponent) => any;
    }
    /**
     * Choose actions for all characters in the party.
     */
    class CombatChooseActionState extends CombatState {
        static NAME: string;
        name: string;
        pending: rpg.objects.GameEntityObject[];
        enter(machine: CombatStateMachine): void;
    }
}
declare module rpg.states.combat {
    interface CombatDefeatSummary {
        party: rpg.objects.GameEntityObject[];
        enemies: rpg.objects.GameEntityObject[];
    }
    class CombatDefeatState extends CombatState {
        static NAME: string;
        name: string;
        enter(machine: CombatStateMachine): void;
    }
}
declare module rpg.states.combat {
    class CombatEndTurnState extends CombatState {
        static NAME: string;
        name: string;
        enter(machine: CombatStateMachine): void;
    }
}
declare module rpg.states.combat {
    class CombatEscapeState extends CombatState {
        static NAME: string;
        name: string;
        enter(machine: CombatStateMachine): void;
    }
}
declare module rpg.states.combat {
    class CombatStartState extends CombatState {
        static NAME: string;
        name: string;
        enter(machine: CombatStateMachine): void;
    }
}
declare module rpg.states.combat {
    interface CombatVictorySummary {
        party: rpg.objects.GameEntityObject[];
        enemies: rpg.objects.GameEntityObject[];
        levels: rpg.models.HeroModel[];
        gold: number;
        exp: number;
        state: CombatVictoryState;
    }
    class CombatVictoryState extends CombatState {
        static NAME: string;
        name: string;
        enter(machine: CombatStateMachine): void;
    }
}
declare module rpg.states {
    class GameDefaultState extends pow2.State {
        static NAME: string;
        name: string;
    }
    class GameStateMachine extends pow2.StateMachine {
        world: rpg.GameWorld;
        model: rpg.models.GameStateModel;
        defaultState: string;
        player: pow2.tile.TileObject;
        encounterInfo: IZoneMatch;
        encounter: IGameEncounter;
        states: pow2.IState[];
        onAddToWorld(world: any): void;
        setCurrentState(newState: any): boolean;
    }
}
declare module rpg.states {
    class GameMapState extends pow2.State {
        static NAME: string;
        name: string;
        mapPoint: pow2.Point;
        map: rpg.GameTileMap;
        enter(machine: GameStateMachine): void;
        exit(machine: GameStateMachine): void;
    }
}
