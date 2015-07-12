/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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

///<reference path="../../types/pow-core/pow-core.d.ts"/>

module pow2 {

  export interface IObject {
    id:string;
    name:string;
  }

  /**
   * Basic component interface.  Supports component host lifetime implementations, and
   * hot-swapping components.
   */
  export interface ISceneComponent extends IObject, IEvents {

    /**
     * The host object that this component belongs to.
     */
    host:ISceneObject;

    /**
     * Connect this component to its host.  Initialization logic goes here.
     */
    connectComponent():boolean;
    /**
     * Disconnect this component from its host.  Destruction logic goes here.
     */
    disconnectComponent():boolean;

    /**
     * Components on the host have changed.  If this component depends on other
     * host object components, the references to them should be looked up and
     * stored here.
     */
    syncComponent():boolean;
  }

  /**
   * Basic component host object interface.  Exposes methods for adding/removing/searching
   * components that a host owns.
   */
  export interface ISceneComponentHost extends IObject {
    addComponent(component:ISceneComponent, silent?:boolean):boolean;
    addComponentDictionary(components:any, silent?:boolean):boolean;
    removeComponent(component:ISceneComponent, silent?:boolean):boolean;
    removeComponentDictionary(components:any, silent?:boolean):boolean;

    syncComponents();

    findComponent(type:Function):ISceneComponent;
    findComponents(type:Function):ISceneComponent[];

    findComponentByName(name:string):ISceneComponent;
  }

  /**
   * SceneObject interface
   */
  export interface ISceneObject extends IObject, IProcessObject, ISceneComponentHost {
    scene: IScene;
    enabled:boolean;
    point:Point;
    size:Point;
    onAddToScene?(scene:IScene);
  }

  export interface IScene extends IEvents {
    name:string;
    world:IWorld;
    fps:number;
    time:number;

    // View management
    // -----------------------------------------------------------------------------
    addView(view:ISceneView):boolean;
    removeView(view:ISceneView):boolean;
    findView(view:ISceneView):boolean;

    // SceneObject management
    // -----------------------------------------------------------------------------
    addObject(object:ISceneObject):boolean;
    removeObject(object:ISceneObject, destroy:boolean):boolean;
    findObject(object):boolean;

    // Component and object lookups
    componentByType(type):ISceneComponent;
    componentsByType(type):ISceneComponent[];
    objectsByName(name:string):ISceneObject[];
    objectByName(name:string):ISceneObject;
    objectsByType(type):ISceneObject[];
    objectByType(type):ISceneObject;
    objectsByComponent(type):ISceneObject[];
    objectByComponent(type):ISceneObject;
  }

  /**
   * A renderer object interface that is recognized by the
   * scene view.  [[SceneViewComponent]] is an implementation
   * of this interface that can be added to a [[SceneView]] and
   * will be invoked during the scene render.
   */
  export interface ISceneViewRenderer {
    beforeFrame(view:pow2.ISceneView, elapsed:number);
    renderFrame(view:pow2.ISceneView, elapsed:number);
    afterFrame(view:pow2.ISceneView, elapsed:number);
  }


  /**
   * Renders a scene to a particular HTML5 Canvas object.
   *
   */
  export interface ISceneView {
    $el: any;
    canvas:HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    camera: Rect;
    cameraComponent:any; // TODO: ICameraComponent
    cameraScale: number;
    unitSize: number;
    scene: IScene;
    loader: ResourceLoader;

    setScene(scene:IScene);

    // Scene rendering interfaces
    // -----------------------------------------------------------------------------
    renderToCanvas(width, height, renderFunction);

    // Render a frame. Subclass this to do your specific rendering.
    renderFrame(elapsed:number);
    // Render post effects
    renderPost();

    // Set the render state for this scene view.
    setRenderState();

    // Restore the render state to what it was before a call to setRenderState.
    restoreRenderState(): boolean;

    // Public render invocation.
    render(elapsed?:number);

    // Scene Camera updates
    // -----------------------------------------------------------------------------
    processCamera();

    // Scene rendering utilities
    // -----------------------------------------------------------------------------

    /**
     * Clear the view.
     */
    clearRect();

    // Coordinate Conversions (World/Screen)
    // -----------------------------------------------------------------------------

    // Convert a Rect/Point/Number from world coordinates (game units) to
    // screen coordinates (pixels)
    worldToScreen(value:Point, scale?): Point;
    worldToScreen(value:Rect, scale?): Rect;
    worldToScreen(value:number, scale?): number;
    worldToScreen(value:any, scale:number): any;

    // Convert a Rect/Point/Number from screen coordinates (pixels) to
    // game world coordinates (game unit sizes)
    screenToWorld(value:Point, scale?): Point;
    screenToWorld(value:Rect, scale?): Rect;
    screenToWorld(value:number, scale?): number;
    screenToWorld(value:any, scale:number): any;

    // Fast world to screen conversion, for high-volume usage situations.
    // avoid memory allocations.
    fastWorldToScreenPoint(value:Point, to:Point, scale:number): Point;
    fastWorldToScreenRect(value:Rect, to:Rect, scale:number): Rect;
    fastWorldToScreenNumber(value:number, scale:number): number;

    // Fast screen to world conversion, for high-volume usage situations.
    // avoid memory allocations.
    fastScreenToWorldPoint(value:Point, to:Point, scale:number): Point;
    fastScreenToWorldRect(value:Rect, to:Rect, scale:number): Rect;
    fastScreenToWorldNumber(value:number, scale:number): number;
  }
}