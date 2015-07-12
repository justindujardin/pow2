/// <reference path="../types/angularjs/angular.d.ts" />
/// <reference path="pow2.d.ts" />
declare module pow2.ui {
    var app: ng.IModule;
}
declare module pow2.ui.directives {
    class IconRenderController {
        $compile: ng.ICompileService;
        $scope: any;
        static WORLD_NAME: string;
        private _renderCanvas;
        private _canvasAcquired;
        renderer: pow2.SpriteRender;
        world: pow2.World;
        static $inject: string[];
        constructor($compile: ng.ICompileService, $scope: any);
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
    }
}
declare module pow2.ui.services {
    class DamageValueService {
        $compile: ng.ICompileService;
        $rootScope: any;
        $animate: any;
        constructor($compile: ng.ICompileService, $rootScope: any, $animate: any);
        applyDamage(to: pow2.scene.SceneObject, value: number, view: pow2.scene.SceneView, then?: () => void): void;
    }
}
