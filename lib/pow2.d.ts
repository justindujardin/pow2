/// <reference path="../web/bower/pow-core/lib/pow-core.d.ts" />
/// <reference path="../types/jquery/jquery.d.ts" />
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
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
    }
    /**
     * SceneObject interface
     */
    interface ISceneObject extends IObject, IProcessObject, ISceneComponentHost {
        scene: IScene;
        enabled: boolean;
        point: Point;
        size: Point;
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
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
    /**
     * The Google Spreadsheet ID to load game data from.  This must be a published
     * google spreadsheet key.
     * @type {string} The google spreadsheet ID
     */
    var SPREADSHEET_ID: string;
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
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
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
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
    class SceneObject extends Events implements ISceneObject, ISceneComponentHost, IWorldObject {
        id: string;
        _uid: string;
        name: string;
        scene: IScene;
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
        findComponent(type: Function): ISceneComponent;
        findComponents(type: Function): ISceneComponent[];
        syncComponents(): void;
        addComponent(component: ISceneComponent, silent?: boolean): boolean;
        addComponentDictionary(components: any, silent?: boolean): boolean;
        removeComponentDictionary(components: any, silent?: boolean): boolean;
        removeComponentByType(componentType: any, silent?: boolean): boolean;
        removeComponent(component: ISceneComponent, silent?: boolean): boolean;
        toString(): string;
    }
}
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
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
        scene: IScene;
        loader: ResourceLoader;
        constructor(canvas: HTMLCanvasElement, loader: any);
        onAddToWorld(world: IWorld): void;
        onRemoveFromWorld(world: IWorld): void;
        setScene(scene: IScene): void;
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
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
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
        view: SceneView;
    }
    class Input implements IWorldObject {
        world: IWorld;
        _keysDown: Object;
        _mouseElements: NamedMouseElement[];
        static mouseOnView(ev: MouseEvent, view: SceneView, coords?: CanvasMouseCoords): CanvasMouseCoords;
        constructor();
        mouseHook(view: SceneView, name: string): NamedMouseElement;
        mouseUnhook(name: string): any;
        mouseUnhook(view: SceneView): any;
        getMouseHook(name: string): NamedMouseElement;
        getMouseHook(view: SceneView): NamedMouseElement;
        keyDown(key: number): boolean;
    }
}
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
    class SpriteRender implements IWorldObject {
        static SIZE: number;
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        world: IWorld;
        onAddToWorld(world: IWorld): void;
        onRemoveFromWorld(world: IWorld): void;
        constructor();
        sizeCanvas(width: number, height: number): void;
        getSpriteSheet(name: string, done: (res?: IResource) => any): ImageResource;
        getSingleSprite(spriteName: string, frame?: number, done?: Function): ImageResource;
        getSpriteRect(name: string, frame?: number): Rect;
        getSpriteMeta(name: string): ISpriteMeta;
    }
}
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
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
    class StateMachine extends Events implements IStateMachine, IWorldObject {
        defaultState: string;
        states: IState[];
        private _currentState;
        private _previousState;
        private _newState;
        world: IWorld;
        onAddToWorld(world: any): void;
        onRemoveFromWorld(world: any): void;
        update(data?: any): void;
        addState(state: IState): void;
        addStates(states: IState[]): void;
        getCurrentState(): IState;
        getCurrentName(): string;
        setCurrentState(state: IState): boolean;
        setCurrentState(state: string): boolean;
        getPreviousState(): IState;
        getState(name: string): IState;
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
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
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
/**
 Copyright (C) 2014 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
    class SceneWorld extends World {
        input: Input;
        sprites: SpriteRender;
        state: IStateMachine;
        scene: IScene;
        constructor(services?: any);
    }
}
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
    class SceneSpatialDatabase {
        private _objects;
        private _pointRect;
        constructor();
        addSpatialObject(obj: ISceneObject): void;
        removeSpatialObject(obj: ISceneObject): void;
        queryPoint(point: Point, type: any, results: ISceneObject[]): boolean;
        queryRect(rect: Rect, type: any, results: ISceneObject[]): boolean;
    }
}
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
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
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
    /**
     * Simplest ISceneComponent implementation.  Because Typescript interfaces are compile
     * time constructs, we have to have an actual implementation to instanceof.  For that
     * reason, all SceneComponents should derive this class.
     */
    class SceneComponent extends Events implements ISceneComponent {
        name: string;
        id: string;
        scene: Scene;
        host: ISceneObject;
        constructor(name?: string);
        connectComponent(): boolean;
        disconnectComponent(): boolean;
        syncComponent(): boolean;
        toString(): string;
    }
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
declare module pow2 {
    class SceneObjectRenderer {
        render(object: SceneObject, data: any, view: SceneView): void;
    }
}
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
    class CameraComponent extends SceneComponent {
        process(view: SceneView): void;
    }
}
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
    class CollisionComponent extends SceneComponent {
        collideBox: Rect;
        resultsArray: any[];
        collide(x: number, y: number, type?: Function, results?: any[]): boolean;
        collideFirst(x: number, y: number, type?: Function): SceneObject;
    }
}
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
    class MovableComponent extends TickedComponent {
        _elapsed: number;
        targetPoint: Point;
        path: Point[];
        tickRateMS: number;
        velocity: Point;
        workPoint: Point;
        host: SceneObject;
        collider: CollisionComponent;
        moveFilter: (from: Point, to: Point) => void;
        connectComponent(): boolean;
        syncComponent(): boolean;
        /**
         * Move from one point to another.  Do any custom processing of moves here.
         */
        beginMove(from: Point, to: Point): void;
        endMove(from: Point, to: Point): void;
        collideMove(x: number, y: number, results?: SceneObject[]): boolean;
        /**
         * Support for simple movement filtering by other sources.  For example a sibling
         * component may have a different set of actions that should be evaluated when a
         * move happens.  It can use set/clearMoveFilter to accomplish this.
         *
         * TODO: Is there a better pattern I'm missing for component communication?
         */
        setMoveFilter(filter: (from: Point, to: Point) => void): void;
        clearMoveFilter(): void;
        updateVelocity(): void;
        interpolateTick(elapsed: number): void;
        tick(elapsed: number): void;
    }
}
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
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
/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
declare module pow2 {
    class StateMachineComponent extends TickedComponent {
        machine: IStateMachine;
        paused: boolean;
        tick(elapsed: number): void;
    }
}
