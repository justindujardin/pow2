/// <reference path="../types/pow-core/pow-core.d.ts" />
/// <reference path="../types/jquery/jquery.d.ts" />
declare module pow2 {
    /**
     * The Google Spreadsheet ID to load game data from.  This must be a published
     * google spreadsheet key.
     * @type {string} The google spreadsheet ID
     */
    var SPREADSHEET_ID: string;
    var NAME: string;
    /**
     * Specified root path.  Used when loading game asset files, to support cross-domain usage.
     */
    var GAME_ROOT: string;
    interface ISpriteMeta {
        width: number;
        height: number;
        cellWidth?: number;
        cellHeight?: number;
        frames: number;
        source: string;
        x: number;
        y: number;
    }
    var data: {
        maps: {};
        sprites: {};
        items: {};
        creatures: any[];
        weapons: any[];
        armor: any[];
    };
    /**
     * Register data on the pow2 module.
     * @param {String} key The key to store the value under
     * @param {*} value The value
     */
    function registerData(key: string, value: any): void;
    function getData(key: string): any;
    function registerMap(name: string, value: Object): void;
    /**
     * Describe a dictionary of sprites.  This can be use to
     */
    function describeSprites(value: Object): void;
    /**
     * Resolve a map name to a valid url in the expected location.
     */
    function getMapUrl(name: string): string;
    /**
     * Register a dictionary of sprite meta data.  This is for automatically
     * generated sprite sheets, and only defaults to setting information if
     * it has not already been set by a call to describeSprites.
     */
    function registerSprites(name: string, value: Object): void;
    function getSpriteMeta(name: string): ISpriteMeta;
    function registerCreatures(level: any, creatures: any): void;
    function getMap(name: string): any;
    function getMaps(): {};
}
declare module pow2 {
    /**
     * Really Janky class to play animations associated with a pow2 sprite.
     *
     * Give it a sprite name `setAnimationSource('ninja-female.png')` and
     * if it has `animations` associated with it from meta data, e.g. `ninja-female.json`
     * those animations will be available to play through this interface.
     *
     * The user has to call `updateTime` on the instance whenever time is
     * incremented.
     *
     * TODO: It's so ugly now.  Make it better.
     */
    class Animator {
        interpFrame: number;
        animElapsed: number;
        animDuration: number;
        frames: number[];
        sourceMeta: any;
        sourceAnims: any;
        setAnimationSource(spriteName: string): void;
        setAnimation(name: string): void;
        updateTime(elapsedMs: number): void;
        interpolate(from: number, to: number, factor: number): number;
        getFrame(): number;
    }
}
declare module pow2 {
    interface IState {
        name: string;
        enter(machine: IStateMachine): any;
        exit(machine: IStateMachine): any;
        update(machine: IStateMachine): any;
    }
    interface IStateTransition {
        targetState: string;
        evaluate(machine: IStateMachine): boolean;
    }
    class State implements IState {
        name: string;
        transitions: IStateTransition[];
        enter(machine: IStateMachine): void;
        exit(machine: IStateMachine): void;
        update(machine: IStateMachine): void;
    }
    class StateTransition implements IStateTransition {
        targetState: string;
        evaluate(machine: IStateMachine): boolean;
    }
}
declare module pow2 {
    interface IStateMachine extends IEvents {
        update(data: any): any;
        addState(state: IState): any;
        addStates(states: IState[]): any;
        getCurrentState(): IState;
        getCurrentName(): string;
        setCurrentState(name: string): boolean;
        setCurrentState(state: IState): boolean;
        setCurrentState(newState: any): boolean;
        getPreviousState(): IState;
        getState(name: string): IState;
    }
    interface IResumeCallback {
        (): void;
    }
    class StateMachine extends Events implements IStateMachine, IWorldObject {
        static DEBUG_STATES: boolean;
        static Events: any;
        defaultState: string;
        states: IState[];
        private _currentState;
        private _previousState;
        private _newState;
        private _pendingState;
        world: IWorld;
        onAddToWorld(world: any): void;
        onRemoveFromWorld(world: any): void;
        update(data?: any): void;
        addState(state: IState): void;
        addStates(states: IState[]): void;
        getCurrentState(): IState;
        getCurrentName(): string;
        /**
         * Set the current state after the callstack unwinds.
         * @param state {string|pow2.IState} Either a state object or the name of one.
         */
        setCurrentState(state: IState): boolean;
        setCurrentState(state: string): boolean;
        private _setCurrentState(state);
        getPreviousState(): IState;
        getState(name: string): IState;
        private _asyncProcessing;
        private _asyncCurrentCallback;
        /**
         * Notify the game UI of an event, and wait for it to be handled,
         * if there is a handler.
         */
        notify(msg: string, data: any, callback?: () => any): void;
        notifyWait(): IResumeCallback;
    }
    /**
     * A state machine that updates with every game tick.
     */
    class TickedStateMachine extends StateMachine {
        paused: boolean;
        world: IWorld;
        onAddToWorld(world: any): void;
        onRemoveFromWorld(world: any): void;
        tick(elapsed: number): void;
    }
}
declare module pow2 {
    class SpriteRender implements IWorldObject {
        static SIZE: number;
        static getSpriteSheetUrl(name: string): string;
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        world: IWorld;
        onAddToWorld(world: IWorld): void;
        onRemoveFromWorld(world: IWorld): void;
        constructor();
        sizeCanvas(width: number, height: number): void;
        getSpriteSheet(name: string, done?: (res?: IResource) => any): ImageResource;
        getSingleSprite(spriteName: string, frame?: number, done?: Function): ImageResource;
        getSpriteRect(name: string, frame?: number): Rect;
        getSpriteMeta(name: string): ISpriteMeta;
    }
}
declare module pow2.scene {
    class SceneWorld extends World {
        input: Input;
        sprites: SpriteRender;
        scene: IScene;
        constructor(services?: any);
    }
}
declare module pow2 {
    interface IObject {
        id: string;
        name: string;
    }
    /**
     * Basic component interface.  Supports component host lifetime implementations, and
     * hot-swapping components.
     */
    interface ISceneComponent extends IObject, IEvents {
        /**
         * The host object that this component belongs to.
         */
        host: ISceneObject;
        /**
         * Connect this component to its host.  Initialization logic goes here.
         */
        connectComponent(): boolean;
        /**
         * Disconnect this component from its host.  Destruction logic goes here.
         */
        disconnectComponent(): boolean;
        /**
         * Components on the host have changed.  If this component depends on other
         * host object components, the references to them should be looked up and
         * stored here.
         */
        syncComponent(): boolean;
    }
    /**
     * Basic component host object interface.  Exposes methods for adding/removing/searching
     * components that a host owns.
     */
    interface ISceneComponentHost extends IObject {
        addComponent(component: ISceneComponent, silent?: boolean): boolean;
        addComponentDictionary(components: any, silent?: boolean): boolean;
        removeComponent(component: ISceneComponent, silent?: boolean): boolean;
        removeComponentDictionary(components: any, silent?: boolean): boolean;
        syncComponents(): any;
        findComponent(type: Function): ISceneComponent;
        findComponents(type: Function): ISceneComponent[];
        findComponentByName(name: string): ISceneComponent;
    }
    /**
     * SceneObject interface
     */
    interface ISceneObject extends IObject, IProcessObject, ISceneComponentHost {
        scene: IScene;
        enabled: boolean;
        point: Point;
        size: Point;
        onAddToScene?(scene: IScene): any;
    }
    interface IScene extends IEvents {
        name: string;
        world: IWorld;
        fps: number;
        time: number;
        addView(view: ISceneView): boolean;
        removeView(view: ISceneView): boolean;
        findView(view: ISceneView): boolean;
        addObject(object: ISceneObject): boolean;
        removeObject(object: ISceneObject, destroy: boolean): boolean;
        findObject(object: any): boolean;
        componentByType(type: any): ISceneComponent;
        componentsByType(type: any): ISceneComponent[];
        objectsByName(name: string): ISceneObject[];
        objectByName(name: string): ISceneObject;
        objectsByType(type: any): ISceneObject[];
        objectByType(type: any): ISceneObject;
        objectsByComponent(type: any): ISceneObject[];
        objectByComponent(type: any): ISceneObject;
    }
    /**
     * A renderer object interface that is recognized by the
     * scene view.  [[SceneViewComponent]] is an implementation
     * of this interface that can be added to a [[SceneView]] and
     * will be invoked during the scene render.
     */
    interface ISceneViewRenderer {
        beforeFrame(view: pow2.ISceneView, elapsed: number): any;
        renderFrame(view: pow2.ISceneView, elapsed: number): any;
        afterFrame(view: pow2.ISceneView, elapsed: number): any;
    }
    /**
     * Renders a scene to a particular HTML5 Canvas object.
     *
     */
    interface ISceneView {
        $el: any;
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        camera: Rect;
        cameraComponent: any;
        cameraScale: number;
        unitSize: number;
        scene: IScene;
        loader: ResourceLoader;
        setScene(scene: IScene): any;
        renderToCanvas(width: any, height: any, renderFunction: any): any;
        renderFrame(elapsed: number): any;
        renderPost(): any;
        setRenderState(): any;
        restoreRenderState(): boolean;
        render(elapsed?: number): any;
        processCamera(): any;
        /**
         * Clear the view.
         */
        clearRect(): any;
        worldToScreen(value: Point, scale?: any): Point;
        worldToScreen(value: Rect, scale?: any): Rect;
        worldToScreen(value: number, scale?: any): number;
        worldToScreen(value: any, scale: number): any;
        screenToWorld(value: Point, scale?: any): Point;
        screenToWorld(value: Rect, scale?: any): Rect;
        screenToWorld(value: number, scale?: any): number;
        screenToWorld(value: any, scale: number): any;
        fastWorldToScreenPoint(value: Point, to: Point, scale: number): Point;
        fastWorldToScreenRect(value: Rect, to: Rect, scale: number): Rect;
        fastWorldToScreenNumber(value: number, scale: number): number;
        fastScreenToWorldPoint(value: Point, to: Point, scale: number): Point;
        fastScreenToWorldRect(value: Rect, to: Rect, scale: number): Rect;
        fastScreenToWorldNumber(value: number, scale: number): number;
    }
}
declare module pow2.scene {
    class SceneSpatialDatabase {
        private _objects;
        private _pointRect;
        constructor();
        addSpatialObject(obj: pow2.ISceneObject): void;
        removeSpatialObject(obj: pow2.ISceneObject): void;
        queryPoint(point: pow2.Point, type: any, results: ISceneObject[]): boolean;
        queryRect(rect: pow2.Rect, type: any, results: ISceneObject[]): boolean;
    }
}
declare module pow2.scene {
    class Scene extends Events implements IScene, IProcessObject, IWorldObject {
        id: string;
        name: string;
        db: SceneSpatialDatabase;
        options: any;
        private _objects;
        private _views;
        world: SceneWorld;
        fps: number;
        time: number;
        paused: boolean;
        constructor(options?: any);
        destroy(): void;
        onAddToWorld(world: IWorld): void;
        onRemoveFromWorld(world: IWorld): void;
        tick(elapsed: number): void;
        processFrame(elapsed: number): void;
        removeIt(property: string, object: any): boolean;
        addIt(property: string, object: any): boolean;
        findIt(property: string, object: any): any;
        addView(view: ISceneView): boolean;
        removeView(view: ISceneView): boolean;
        findView(view: any): boolean;
        getViewOfType<T>(type: any): T;
        addObject(object: ISceneObject): boolean;
        removeObject(object: ISceneObject, destroy?: boolean): boolean;
        findObject(object: ISceneObject): boolean;
        componentByType(type: any): ISceneComponent;
        componentsByType(type: any): ISceneComponent[];
        objectsByName(name: string): ISceneObject[];
        objectByName(name: string): ISceneObject;
        objectsByType(type: any): ISceneObject[];
        objectByType(type: any): ISceneObject;
        objectsByComponent(type: any): ISceneObject[];
        objectByComponent(type: any): ISceneObject;
    }
}
declare module pow2.scene {
    class SceneObject extends Events implements ISceneObject, ISceneComponentHost, IWorldObject {
        id: string;
        _uid: string;
        name: string;
        scene: Scene;
        world: IWorld;
        enabled: boolean;
        point: Point;
        size: Point;
        renderPoint: Point;
        _components: ISceneComponent[];
        constructor(options?: any);
        tick(elapsed: number): void;
        interpolateTick(elapsed: number): void;
        destroy(): void;
        onAddToScene(scene: Scene): void;
        findComponent(type: Function): ISceneComponent;
        findComponents(type: Function): ISceneComponent[];
        findComponentByName(name: string): ISceneComponent;
        syncComponents(): void;
        addComponent(component: ISceneComponent, silent?: boolean): boolean;
        addComponentDictionary(components: any, silent?: boolean): boolean;
        removeComponentDictionary(components: any, silent?: boolean): boolean;
        removeComponentByType(componentType: any, silent?: boolean): boolean;
        removeComponent(component: ISceneComponent, silent?: boolean): boolean;
        toString(): string;
    }
}
declare module pow2.scene {
    /**
     * A view that renders a `Scene`.
     *
     * You should probably only have one of these per Canvas that you render to.
     */
    class SceneView extends SceneObject implements IWorldObject, ISceneView {
        static UNIT: number;
        animations: any[];
        $el: JQuery;
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        camera: Rect;
        cameraComponent: any;
        cameraScale: number;
        unitSize: number;
        _sheets: any;
        scene: Scene;
        loader: ResourceLoader;
        constructor(canvas: HTMLCanvasElement, loader: any);
        onAddToWorld(world: IWorld): void;
        onRemoveFromWorld(world: IWorld): void;
        setScene(scene: Scene): void;
        renderToCanvas(width: any, height: any, renderFunction: any): HTMLCanvasElement;
        renderFrame(elapsed: number): void;
        renderPost(): void;
        setRenderState(): void;
        restoreRenderState(): boolean;
        render(): void;
        _render(elapsed: number): void;
        processCamera(): void;
        clearRect(): void;
        worldToScreen(value: Point, scale?: any): Point;
        worldToScreen(value: Rect, scale?: any): Rect;
        worldToScreen(value: number, scale?: any): number;
        screenToWorld(value: Point, scale?: any): Point;
        screenToWorld(value: Rect, scale?: any): Rect;
        screenToWorld(value: number, scale?: any): number;
        fastWorldToScreenPoint(value: Point, to: Point, scale?: number): Point;
        fastWorldToScreenRect(value: Rect, to: Rect, scale?: number): Rect;
        fastWorldToScreenNumber(value: number, scale?: number): number;
        fastScreenToWorldPoint(value: Point, to: Point, scale?: number): Point;
        fastScreenToWorldRect(value: Rect, to: Rect, scale?: number): Rect;
        fastScreenToWorldNumber(value: number, scale?: number): number;
        renderAnimations(): any[];
    }
}
declare module pow2 {
    enum KeyCode {
        UP = 38,
        DOWN = 40,
        LEFT = 37,
        RIGHT = 39,
        BACKSPACE = 8,
        COMMA = 188,
        DELETE = 46,
        END = 35,
        ENTER = 13,
        ESCAPE = 27,
        HOME = 36,
        SPACE = 32,
        TAB = 9,
    }
    interface CanvasMouseCoords {
        point: Point;
        world: Point;
    }
    interface NamedMouseElement extends CanvasMouseCoords {
        name: string;
        view: pow2.scene.SceneView;
    }
    class Input implements IWorldObject {
        world: pow2.IWorld;
        _keysDown: Object;
        _mouseElements: NamedMouseElement[];
        static mouseOnView(ev: MouseEvent, view: pow2.scene.SceneView, coords?: CanvasMouseCoords): CanvasMouseCoords;
        constructor();
        mouseHook(view: pow2.scene.SceneView, name: string): NamedMouseElement;
        mouseUnhook(name: string): any;
        mouseUnhook(view: pow2.scene.SceneView): any;
        getMouseHook(name: string): NamedMouseElement;
        getMouseHook(view: pow2.scene.SceneView): NamedMouseElement;
        keyDown(key: number): boolean;
    }
}
declare module pow2.scene {
    /**
     * Simplest ISceneComponent implementation.  Because Typescript interfaces are compile
     * time constructs, we have to have an actual implementation to instanceof.  For that
     * reason, all SceneComponents should derive this class.
     */
    class SceneComponent extends Events implements ISceneComponent {
        id: string;
        host: SceneObject;
        name: string;
        connectComponent(): boolean;
        disconnectComponent(): boolean;
        syncComponent(): boolean;
        toString(): string;
    }
}
declare module pow2.scene {
    class SceneObjectRenderer {
        render(object: pow2.scene.SceneObject, data: any, view: pow2.scene.SceneView): void;
    }
}
declare module pow2.scene {
    /**
     * A component that can be added to a [[SceneView]] to add additional
     * rendering to it.
     */
    class SceneViewComponent extends SceneComponent implements ISceneViewRenderer {
        beforeFrame(view: pow2.ISceneView, elapsed: number): void;
        renderFrame(view: pow2.ISceneView, elapsed: number): void;
        afterFrame(view: pow2.ISceneView, elapsed: number): void;
    }
}
declare module pow2.scene.components {
    class CameraComponent extends SceneComponent {
        process(view: SceneView): void;
    }
}
declare module pow2.scene.components {
    class CollisionComponent extends SceneComponent {
        collideBox: pow2.Rect;
        resultsArray: any[];
        collide(x: number, y: number, type?: Function, results?: any[]): boolean;
        collideFirst(x: number, y: number, type?: Function): SceneObject;
    }
}
declare module pow2.scene.components {
    /**
     * A component that supports tick/interpolateTick
     */
    class TickedComponent extends SceneComponent {
        tickRateMS: number;
        /**
         * Update the component at a tick interval.
         */
        tick(elapsed: number): void;
        /**
         * Interpolate component state between ticks.
         */
        interpolateTick(elapsed: number): void;
    }
}
declare module pow2.scene.components {
    /**
     * Describe a move from one point to another.
     */
    interface IMoveDescription {
        from: Point;
        to: Point;
    }
    class MovableComponent extends TickedComponent {
        _elapsed: number;
        targetPoint: pow2.Point;
        path: Point[];
        tickRateMS: number;
        velocity: pow2.Point;
        workPoint: Point;
        host: SceneObject;
        collider: CollisionComponent;
        currentMove: IMoveDescription;
        connectComponent(): boolean;
        syncComponent(): boolean;
        /**
         * Called when a new tick of movement begins.
         * @param move The move that is beginning
         */
        beginMove(move: IMoveDescription): void;
        /**
         * Called when a complete tick of movement occurs.
         * @param move The move that is now completed.
         */
        completeMove(move: IMoveDescription): void;
        collideMove(x: number, y: number, results?: SceneObject[]): boolean;
        updateVelocity(): void;
        interpolateTick(elapsed: number): void;
        tick(elapsed: number): void;
    }
}
declare module pow2.scene.components {
    interface SoundComponentOptions {
        url: string;
        loop?: boolean;
        volume?: number;
    }
    class SoundComponent extends SceneComponent implements SoundComponentOptions {
        url: string;
        volume: number;
        loop: boolean;
        audio: AudioResource;
        constructor(options?: SoundComponentOptions);
        disconnectComponent(): boolean;
        connectComponent(): boolean;
    }
}
declare module pow2.scene.components {
    class StateMachineComponent extends TickedComponent {
        machine: IStateMachine;
        paused: boolean;
        tick(elapsed: number): void;
    }
}
declare module pow2.tile {
    class TileMap extends pow2.scene.SceneObject {
        map: TiledTMXResource;
        tiles: any;
        scene: pow2.scene.Scene;
        features: any;
        zones: any;
        bounds: pow2.Rect;
        dirtyLayers: boolean;
        private _loaded;
        static Events: any;
        constructor(map: pow2.TiledTMXResource);
        isLoaded(): boolean;
        loaded(): void;
        unloaded(): void;
        setMap(map: TiledTMXResource): boolean;
        getLayers(): tiled.ITiledLayer[];
        getLayer(name: string): tiled.ITiledLayer;
        getTerrain(layer: string, x: number, y: number): any;
        getTileData(layer: tiled.ITiledLayer, x: number, y: number): any;
        getTileGid(layer: string, x: number, y: number): number;
        getTileMeta(gid: number): pow2.tiled.ITileInstanceMeta;
    }
}
declare module pow2.tile {
    interface TileObjectOptions {
        point?: pow2.Point;
        renderPoint?: pow2.Point;
        image?: HTMLImageElement;
        scale?: number;
        visible?: boolean;
        enabled?: boolean;
        tileMap: pow2.tile.TileMap;
        icon?: string;
        meta?: any;
        frame?: number;
    }
    class TileObject extends pow2.scene.SceneObject implements TileObjectOptions {
        point: pow2.Point;
        renderPoint: pow2.Point;
        image: HTMLImageElement;
        visible: boolean;
        enabled: boolean;
        tileMap: pow2.tile.TileMap;
        scale: number;
        icon: string;
        meta: any;
        frame: number;
        world: pow2.scene.SceneWorld;
        constructor(options?: TileObjectOptions);
        setPoint(point: Point): void;
        /**
         * When added to a scene, resolve a feature icon to a renderable sprite.
         */
        onAddToScene(scene: pow2.scene.Scene): void;
        /**
         * Set the current sprite name.  Returns the previous sprite name.
         */
        setSprite(name: string, frame?: number): string;
        getIcon(): string;
    }
}
declare module pow2.tile {
    class TileComponent extends pow2.scene.SceneComponent {
        host: TileObject;
        isEntered: boolean;
        /**
         * Events triggered on host object for enter/exit of
         * tiles.
         */
        static Events: any;
        syncComponent(): boolean;
        disconnectComponent(): boolean;
        enter(object: TileObject): boolean;
        entered(object: TileObject): boolean;
        exit(object: TileObject): boolean;
        exited(object: TileObject): boolean;
    }
}
declare module pow2 {
    class TileMapCameraComponent extends pow2.scene.components.CameraComponent {
        host: pow2.tile.TileMap;
        connectComponent(): boolean;
        process(view: pow2.scene.SceneView): void;
    }
}
declare module pow2.tile.render {
    class TileObjectRenderer extends pow2.scene.SceneObjectRenderer {
        private _renderPoint;
        render(object: any, data: any, view: pow2.scene.SceneView): void;
    }
}
declare module pow2.tile.render {
    class TileMapRenderer extends pow2.scene.SceneObjectRenderer {
        buffer: HTMLCanvasElement[][];
        bufferMapName: string;
        bufferComplete: boolean;
        private _clipRect;
        private _renderRect;
        render(object: TileMap, view: TileMapView): void;
    }
}
declare module pow2.tile {
    class TileMapView extends pow2.scene.SceneView {
        objectRenderer: pow2.tile.render.TileObjectRenderer;
        mapRenderer: pow2.tile.render.TileMapRenderer;
        tileMap: TileMap;
        world: pow2.scene.SceneWorld;
        setTileMap(tileMap: TileMap): void;
        setScene(scene: pow2.scene.Scene): void;
        getCameraClip(): Rect;
        processCamera(): void;
        setRenderState(): void;
        renderFrame(elapsed: number): TileMapView;
        renderPost(): void;
    }
}
declare module pow2.tile.components {
    interface SpriteComponentOptions {
        icon: string;
        name?: string;
        frame?: number;
    }
    class SpriteComponent extends pow2.scene.SceneComponent {
        host: TileObject;
        image: HTMLImageElement;
        visible: boolean;
        enabled: boolean;
        icon: string;
        meta: any;
        frame: number;
        constructor(options?: SpriteComponentOptions);
        syncComponent(): boolean;
        /**
         * Set the current sprite name.  Returns the previous sprite name.
         */
        setSprite(name: string, frame?: number): string;
    }
}
declare module pow2.tile.components {
    interface AnimatedSpriteComponentOptions {
        lengthMS?: number;
        spriteName: string;
    }
    class AnimatedSpriteComponent extends pow2.scene.components.TickedComponent {
        host: TileObject;
        _elapsed: number;
        private _renderFrame;
        lengthMS: number;
        spriteComponent: SpriteComponent;
        spriteName: string;
        constructor(options?: AnimatedSpriteComponentOptions);
        connectComponent(): boolean;
        syncComponent(): boolean;
        tick(elapsed: number): void;
        interpolateTick(elapsed: number): void;
    }
}
declare module pow2.tile.components {
    /**
     * A component that can calculate A-star paths.
     */
    class PathComponent extends pow2.tile.TileComponent {
        tileMap: pow2.tile.TileMap;
        _graph: any;
        constructor(tileMap: pow2.tile.TileMap);
        connectComponent(): boolean;
        syncComponent(): boolean;
        disconnectComponent(): boolean;
        private _updateGraph();
        /**
         * Build a two-dimensional graph of numbers that represent the map
         * to find paths on.  The higher the value at an index, the more
         * difficult it is to traverse.
         *
         * A grid might look like this:
         *
         *     [5,5,1,5]
         *     [1,1,1,5]
         *     [5,5,5,5]
         *
         */
        buildWeightedGraph(): number[][];
        /**
         * Calculate the best path from one point to another in the current
         * A* graph.
         */
        calculatePath(from: Point, to: Point): Point[];
    }
}
declare module pow2.game {
    class GameMapView extends pow2.tile.TileMapView {
        objectRenderer: pow2.tile.render.TileObjectRenderer;
        mouse: NamedMouseElement;
        scene: pow2.scene.Scene;
        /**
         * The fill color to use when rendering a path target.
         */
        targetFill: string;
        /**
         * The stroke to use when outlining path target.
         */
        targetStroke: string;
        /**
         * Line width for the path target stroke.
         */
        targetStrokeWidth: number;
        constructor(canvas: HTMLCanvasElement, loader: any);
        onAddToScene(scene: pow2.scene.Scene): void;
        onRemoveFromScene(scene: pow2.scene.Scene): void;
        mouseClick(e: any): boolean;
        private _players;
        private _playerRenders;
        private _sprites;
        private _movers;
        syncComponents(): void;
        protected _renderables: any[];
        protected clearCache(): void;
        renderFrame(elapsed: any): GameMapView;
    }
}
declare module pow2.game.components {
    interface IAnimationConfig {
        name: string;
        duration: number;
        repeats?: number;
        frames?: any[];
        move?: Point;
        callback?: (config: IAnimationConfig) => void;
    }
    interface IAnimationTask extends IAnimationConfig {
        elapsed?: number;
        start?: any;
        target?: any;
        value: any;
        complete?: boolean;
        startFrame: number;
        done?: (config: IAnimationConfig) => void;
    }
    class AnimatedComponent extends pow2.scene.components.TickedComponent {
        host: pow2.tile.TileObject;
        static EVENTS: {
            Started: string;
            Stopped: string;
            Repeated: string;
        };
        private _tasks;
        private _animationKeys;
        private _currentAnim;
        play(config: IAnimationConfig): void;
        stop(config: IAnimationConfig): void;
        removeCompleteTasks(): void;
        interpolateTick(elapsed: number): void;
        update(elapsed: number): void;
        interpolate(from: number, to: number, factor: number): number;
        playChain(animations: IAnimationConfig[], cb: () => void): void;
        private _animateNext();
    }
}
declare module pow2.game.components {
    /**
     * Build Astar paths with GameFeatureObject tilemaps.
     */
    class GameMapPathComponent extends pow2.tile.components.PathComponent {
        buildWeightedGraph(): number[][];
    }
}
declare module pow2.game.components {
    enum MoveFrames {
        LEFT = 10,
        RIGHT = 4,
        DOWN = 7,
        UP = 1,
        LEFTALT = 11,
        RIGHTALT = 5,
        DOWNALT = 8,
        UPALT = 2,
    }
    enum Headings {
        WEST = 0,
        EAST = 1,
        SOUTH = 2,
        NORTH = 3,
    }
    class PlayerRenderComponent extends pow2.scene.components.TickedComponent {
        host: pow2.tile.TileObject;
        private _animator;
        heading: Headings;
        animating: boolean;
        setHeading(direction: Headings, animating: boolean): void;
        setMoving(moving: boolean): void;
        interpolateTick(elapsed: number): void;
    }
}
declare module pow2.scene.components {
    class PlayerComponent extends pow2.scene.components.MovableComponent {
        host: pow2.tile.TileObject;
        passableKeys: string[];
        static COLLIDE_TYPES: string[];
        private _lastFrame;
        private _renderFrame;
        heading: Point;
        sprite: pow2.game.components.PlayerRenderComponent;
        collideComponentType: any;
        static Events: any;
        syncComponent(): boolean;
        tick(elapsed: number): void;
        interpolateTick(elapsed: number): void;
        /**
         * Determine if a point on the map collides with a given terrain
         * attribute.  If the attribute is set to false, a collision occurs.
         *
         * @param at {pow2.Point} The point to check.
         * @param passableAttribute {string} The attribute to check.
         * @returns {boolean} True if the passable attribute was found and set to false.
         */
        collideWithMap(at: pow2.Point, passableAttribute: string): boolean;
        collideMove(x: number, y: number, results?: pow2.scene.SceneObject[]): boolean;
        beginMove(move: pow2.scene.components.IMoveDescription): void;
        completeMove(move: pow2.scene.components.IMoveDescription): void;
    }
}
declare module pow2.game.components {
    class PlayerCameraComponent extends pow2.scene.components.CameraComponent {
        host: pow2.tile.TileObject;
        process(view: pow2.scene.SceneView): void;
    }
}
declare module pow2.game.components {
    enum StateFrames {
        DEFAULT = 10,
        SWING = 1,
        INJURED = 2,
        WALK = 3,
        STRIKE = 3,
        CELEBRATE = 4,
        DEAD = 5,
    }
    class PlayerCombatRenderComponent extends pow2.scene.components.TickedComponent {
        host: pow2.tile.TileObject;
        _elapsed: number;
        private _renderFrame;
        state: string;
        animating: boolean;
        animator: AnimatedComponent;
        attackDirection: pow2.game.components.Headings;
        syncComponent(): boolean;
        setState(name?: string): void;
        attack(attackCb: () => any, cb?: () => void): void;
        magic(attackCb: () => any, cb?: () => void): void;
        getForwardDirection(): number;
        getBackwardDirection(): number;
        getForwardFrames(): number[];
        getBackwardFrames(): number[];
        getAttackFrames(): number[];
        getMagicAnimation(strikeCb: () => any): {
            name: string;
            callback: () => void;
        }[];
        getAttackAnimation(strikeCb: () => any): ({
            name: string;
            repeats: number;
            duration: number;
            frames: number[];
            callback: () => void;
        } | {
            name: string;
            duration: number;
            repeats: number;
            frames: number[];
            move: Point;
        })[];
        moveForward(then?: () => any): void;
        moveBackward(then?: () => any): void;
        _playAnimation(animation: IAnimationConfig[], then: () => any): void;
        _attack(cb: () => void, attackAnimation: any): void;
        interpolateTick(elapsed: number): void;
    }
}
declare module pow2 {
    enum EntityError {
        NONE = 0,
        ENTITY_TYPE = 1,
        COMPONENT_TYPE = 2,
        COMPONENT_NAME_DUPLICATE = 4,
        COMPONENT_REGISTER = 8,
        COMPONENT_INPUT = 16,
        INPUT_NAME = 32,
        INPUT_TYPE = 64,
    }
    interface IEntityComponentDescription {
    }
    class EntityContainerResource extends pow2.JSONResource {
        static getClassType(fullTypeName: string): any;
        /**
         * Do a case-insensitive typeof compare to allow generally simpler
         * type specifications in entity files.
         * @param type The type
         * @param expected The expected typeof result
         * @returns {boolean} True if the expected type matches the type
         */
        typeofCompare(type: any, expected: string): boolean;
        /**
         * Validate a template object's correctness, returning a string
         * error if incorrect, or null if correct.
         *
         * @param templateData The template to verify
         */
        validateTemplate(templateData: any, inputs?: any): EntityError;
        getTemplate(templateName: string): any;
        constructObject(constructor: any, argArray: any): any;
        /**
         * Instantiate an object and set of components from a given template.
         * @param templateName The name of the template in the resource.
         * @param inputs An object of input values to use when instantiating objects and components.
         * @returns {*} The resulting object or null
         */
        createObject(templateName: string, inputs?: any): any;
    }
}
declare module pow2 {
    /**
     * Use TableTop to load a published google spreadsheet.
     */
    class GameDataResource extends Resource {
        static DATA_KEY: string;
        load(): void;
        getCache(key: string): any;
        static clearCache(key: string): void;
        setCache(key: string, data: any): void;
        static NUMBER_MATCHER: RegExp;
        transformTypes(data: any): any;
        getSheetData(name: string): any;
    }
}
