/// <reference path="../underscore/underscore.d.ts" />
/**
 * Constant strings for use in throwing Error with messages.  Used to
 * make checking thrown errors doable without an explosion of Error subclasses.
 */
declare module pow2.errors {
    /**
     * An invalid combination of arguments was given to a function
     */
    var INVALID_ARGUMENTS: string;
    /**
     * A division by zero would have occurred
     */
    var DIVIDE_ZERO: string;
    /**
     * Something called on a base class that doesn't implement the desired functionality
     */
    var CLASS_NOT_IMPLEMENTED: string;
    var REQUIRED_ARGUMENT: string;
    var ALREADY_EXISTS: string;
    /**
     * A specified index is out of the valid range for an array it applies to.
     */
    var INDEX_OUT_OF_RANGE: string;
    /**
     * An item is not of the expected type or value.
     */
    var INVALID_ITEM: string;
}
declare module pow2 {
    /**
     * Module level world accessor.
     */
    function getWorld<T>(name: string): T;
    /**
     * Module level world setter.
     */
    function registerWorld(name: string, instance: any): any;
    /**
     * Module level world remover.
     */
    function unregisterWorld(name: string): any;
}
declare module pow2 {
    interface IEvents {
        on(name: any, callback?: Function, context?: any): IEvents;
        off(name?: string, callback?: Function, context?: any): IEvents;
        once(events: string, callback: Function, context?: any): IEvents;
        trigger(name: string, ...args: any[]): IEvents;
    }
    class Events implements IEvents {
        private _events;
        on(name: any, callback?: Function, context?: any): IEvents;
        once(name: any, callback?: Function, context?: any): IEvents;
        off(name?: any, callback?: Function, context?: any): IEvents;
        trigger(name: string, ...args: any[]): IEvents;
    }
}
declare module pow2 {
    interface IResource {
        url: string;
        data: any;
        extension: string;
        load(): any;
        isReady(): boolean;
        ready(): any;
        failed(error: any): any;
    }
    /**
     * Basic asynchronous resource class.
     *
     * Supports loading and success/error handling. A resource is immediately
     * available, and you can get at its internal data when `isReady` returns true.
     *
     * pow2.Resource objects trigger 'ready' and 'failed' events during their initial loading.
     */
    class Resource extends pow2.Events implements IResource {
        static READY: string;
        static FAILED: string;
        url: string;
        data: any;
        extension: string;
        loader: ResourceLoader;
        private _ready;
        constructor(url: string, data?: any);
        load(): void;
        setLoader(loader: ResourceLoader): void;
        isReady(): boolean;
        ready(): void;
        failed(error: any): void;
    }
}
declare module pow2 {
    /**
     * An Entity object is a container for groups of components.
     *
     * Basic composite object that has a set of dynamic behaviors added to it through the
     * addition and removal of component objects.  Components may be looked up by type, and
     * may depend on siblings components for parts of their own behavior.
     */
    class Entity extends Events implements IComponentHost {
        id: string;
        name: string;
        _components: IComponent[];
        destroy(): void;
        findComponent(type: Function): IComponent;
        findComponents(type: Function): IComponent[];
        findComponentByName(name: string): IComponent;
        syncComponents(): void;
        addComponent(component: pow2.IComponent, silent?: boolean): boolean;
        removeComponentByType(componentType: any, silent?: boolean): boolean;
        removeComponent(component: IComponent, silent?: boolean): boolean;
    }
}
declare module pow2 {
    /**
     * Most basic object.  Has an id and a name.
     */
    interface IObject {
        id: string;
        name: string;
    }
    /**
     * Basic component interface.  Supports component host lifetime implementations, and
     * hot-swapping components.
     */
    interface IComponent extends IObject, IEvents {
        /**
         * The host object that this component belongs to.
         */
        host: IObject;
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
    interface IComponentHost extends IObject {
        addComponent(component: IComponent, silent?: boolean): boolean;
        removeComponent(component: IComponent, silent?: boolean): boolean;
        syncComponents(): any;
        findComponent(type: Function): IComponent;
        findComponents(type: Function): IComponent[];
        findComponentByName(name: string): IComponent;
    }
    /**
     * Simplest ISceneComponent implementation.  Because Typescript interfaces are compile
     * time constructs, we have to have an actual implementation to instanceof.  For that
     * reason, all SceneComponents should derive this class.
     */
    class Component extends Events implements IComponent {
        id: string;
        host: Entity;
        name: string;
        connectComponent(): boolean;
        disconnectComponent(): boolean;
        syncComponent(): boolean;
        toString(): string;
    }
}
declare module pow2 {
    interface IPoint {
        x: number;
        y: number;
    }
    class Point {
        x: number;
        y: number;
        constructor();
        constructor(point: Point);
        constructor(x: number, y: number);
        constructor(x: string, y: string);
        toString(): string;
        set(point: Point): Point;
        set(x: number, y: number): Point;
        clone(): Point;
        floor(): Point;
        round(): Point;
        add(x: number, y: number): Point;
        add(value: number): Point;
        add(point: Point): Point;
        subtract(x: number, y: number): Point;
        subtract(value: number): Point;
        subtract(point: Point): Point;
        multiply(x: number, y: number): Point;
        multiply(value: number): Point;
        multiply(point: Point): Point;
        divide(x: number, y: number): Point;
        divide(value: number): Point;
        divide(point: Point): Point;
        inverse(): Point;
        equal(point: Point): boolean;
        isZero(): boolean;
        zero(): Point;
        interpolate(from: Point, to: Point, factor: number): Point;
    }
}
declare module pow2 {
    interface IRect {
        point: Point;
        extent: Point;
    }
    class Rect implements IRect {
        point: Point;
        extent: Point;
        constructor();
        constructor(rect: IRect);
        constructor(point: Point, extent: Point);
        constructor(x: number, y: number, width: number, height: number);
        toString(): string;
        set(rect: IRect): Rect;
        set(point: Point, extent: Point): Rect;
        set(x: number, y: number, width: number, height: number): any;
        clone(): Rect;
        clip(clipRect: IRect): Rect;
        isValid(): boolean;
        intersect(clipRect: IRect): boolean;
        pointInRect(point: Point): boolean;
        pointInRect(x: number, y: number): boolean;
        getCenter(): Point;
        setCenter(point: Point): Rect;
        setCenter(x: number, y: number): Rect;
        getLeft(): number;
        getTop(): number;
        getRight(): number;
        getBottom(): number;
        getHalfSize(): Point;
        /**
         * Add a point to the rect.  This will ensure that the rect
         * contains the given point.
         * @param {pow2.Point} value The point to add.
         */
        addPoint(value: Point): void;
        inflate(x?: number, y?: number): Rect;
    }
}
declare module pow2 {
    /**
     * Use jQuery to load an Audio resource.
     */
    class AudioResource extends Resource {
        data: HTMLAudioElement;
        static types: Object;
        load(): void;
    }
}
declare module pow2 {
    /**
     * Use html image element to load an image resource.
     */
    class ImageResource extends Resource {
        data: HTMLImageElement;
        load(): void;
    }
}
declare module pow2 {
    /**
     * Use jQuery to load a JSON file from a URL.
     */
    class JSONResource extends Resource {
        load(): void;
    }
}
declare module pow2 {
    /**
     * Use jQuery to load a Javascript file from a URL.
     */
    class ScriptResource extends Resource {
        load(): void;
    }
}
declare module pow2 {
    /**
     * Use jQuery to load an XML file from a URL.
     */
    class XMLResource extends Resource {
        data: any;
        load(): void;
        prepare(data: any): void;
        getRootNode(tag: string): any;
        getChildren<T>(el: any, tag: string): T[];
        getChild<T>(el: any, tag: string): T;
        getElAttribute(el: any, name: string): any;
    }
}
declare module pow2 {
    interface IProcessObject {
        _uid?: string;
        tick?(elapsed: number): any;
        processFrame?(elapsed: number): any;
    }
    class Time {
        tickRateMS: number;
        mspf: number;
        world: any;
        lastTime: number;
        time: number;
        running: boolean;
        objects: Array<IProcessObject>;
        constructor();
        static get(): pow2.Time;
        start(): void;
        stop(): void;
        removeObject(object: IProcessObject): void;
        addObject(object: IProcessObject): void;
        tickObjects(elapsedMS: number): void;
        processFrame(elapsedMS: number): void;
        polyFillAnimationFrames(): void;
    }
}
declare module pow2 {
    interface IWorld {
        loader: ResourceLoader;
        time: Time;
        mark(object?: IWorldObject): any;
        erase(object?: IWorldObject): any;
        setService(name: string, value: IWorldObject): IWorldObject;
    }
    interface IWorldObject {
        world: IWorld;
        onAddToWorld?(world: IWorld): any;
        onRemoveFromWorld?(world: IWorld): any;
    }
    class World implements IWorld {
        loader: ResourceLoader;
        time: Time;
        constructor(services?: any);
        setService(name: string, value: IWorldObject): IWorldObject;
        mark(object?: IWorldObject): void;
        erase(object?: IWorldObject): void;
    }
}
declare module pow2 {
    /**
     * A basic resource loading manager.  Supports a basic api for requesting
     * resources by file name, and uses registered types and file extension
     * matching to create and load a resource.
     */
    class ResourceLoader implements IWorldObject, IProcessObject {
        private _cache;
        private _types;
        private _doneQueue;
        _uid: string;
        world: IWorld;
        constructor();
        static get(): pow2.ResourceLoader;
        onAddToWorld(world: any): void;
        onRemoveFromWorld(world: any): void;
        tick(elapsed: number): void;
        processFrame(elapsed: number): void;
        registerType(extension: string, type: Function): void;
        getResourceExtension(url: string): string;
        create<T extends IResource>(typeConstructor: any, data: any): T;
        loadAsType(source: string, resourceType: any, done?: (res?: IResource) => any): IResource;
        load(sources: Array<string>, done?: (res?: IResource) => any): Array<Resource>;
        load(source: string, done?: (res?: IResource) => any): Resource;
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
    /**
     * Dictionary of name -> type inputs that are used to create various
     * composite entity objects.
     */
    interface IEntityInputsMap {
        [name: string]: string;
    }
    /**
     * The basic description of an object that may be instantiated with custom constructor
     * arguments.
     */
    interface IEntityObject {
        /**
         * The name of the entity to use when creating.
         */
        name: string;
        /**
         * The object type to use for the entity.  Assumed to be an [[ISceneObjectComponentHost]] type.
         */
        type: string;
        /**
         * An array of inputs for the constructor call to the output object of `type`.
         */
        params: string[];
    }
    /**
     * A composite entity template that describes the inputs and outputs of
     * an entity that may be instantiated.
     */
    interface IEntityTemplate extends IEntityObject {
        /**
         * A map of named inputs and their types.
         */
        inputs: IEntityInputsMap;
        /**
         * An array of components to instantiate and add to the output container.
         */
        components: IEntityObject[];
    }
    /**
     * JSON resource describing an array of [[IEntityTemplate]]s that can be used for composite
     * object creation with validated input types.
     */
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
declare module pow2.tiled {
    interface ITileInstanceMeta {
        image: HTMLImageElement;
        url: string;
        x: number;
        y: number;
        width: number;
        height: number;
        data?: any;
    }
    interface ITiledBase {
        name: string;
        x: number;
        y: number;
        width: number;
        height: number;
        visible: boolean;
    }
    interface ITiledLayerBase extends ITiledBase {
        opacity: number;
        properties?: any;
    }
    interface ITiledLayer extends ITiledLayerBase {
        data?: any;
        color?: string;
        objects?: ITiledObject[];
    }
    interface ITiledObject extends ITiledBase {
        properties?: any;
        rotation?: number;
        type?: string;
        gid?: number;
        color?: string;
    }
    interface ITileSetDependency {
        source?: string;
        data?: any;
        firstgid: number;
        literal?: string;
    }
    function readITiledBase(el: any): ITiledBase;
    function writeITiledBase(el: any, data: ITiledObject): void;
    function writeITiledObjectBase(el: any, data: ITiledObject): void;
    function readITiledObject(el: any): ITiledObject;
    function readITiledLayerBase(el: any): ITiledLayerBase;
    function compactUrl(base: string, relative: string): string;
    function xml2Str(xmlNode: any): any;
    function writeITiledLayerBase(el: any, data: ITiledLayerBase): void;
    function readTiledProperties(el: any): {};
    function writeTiledProperties(el: any, data: any): void;
    function getChildren(el: any, tag: string): any[];
    function getChild(el: any, tag: string): any;
    function setElAttribute(el: any, name: string, value: any): void;
    function getElAttribute(el: any, name: string): string;
}
declare module pow2 {
    class TilesetTile {
        id: number;
        properties: any;
        constructor(id: number);
    }
    /**
     * A Tiled TSX tileset resource
     */
    class TiledTSXResource extends XMLResource {
        name: string;
        tilewidth: number;
        tileheight: number;
        imageWidth: number;
        imageHeight: number;
        image: ImageResource;
        url: string;
        firstgid: number;
        tiles: any[];
        relativeTo: string;
        imageUrl: string;
        literal: string;
        prepare(data: any): void;
        hasGid(gid: number): boolean;
        getTileMeta(gidOrIndex: number): pow2.tiled.ITileInstanceMeta;
    }
}
declare module pow2 {
    /**
     * Use jQuery to load a TMX $map file from a URL.
     */
    class TiledTMXResource extends XMLResource {
        $map: any;
        width: number;
        height: number;
        orientation: string;
        tileheight: number;
        tilewidth: number;
        version: number;
        properties: any;
        tilesets: any;
        layers: pow2.tiled.ITiledLayer[];
        xmlHeader: string;
        write(): any;
        prepare(data: any): void;
    }
}
