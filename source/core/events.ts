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

/// <reference path="../../types/underscore/underscore.d.ts" />
/// <reference path="../../types/backbone/backbone.d.ts" />

module pow2 {

   export interface IEvents {
      on?(eventName: any, callback?: Function, context?: any): any;
      off?(eventName?: string, callback?: Function, context?: any): any;
      trigger?(eventName: string, ...args: any[]): any;
      bind?(eventName: string, callback: Function, context?: any): any;
      unbind?(eventName?: string, callback?: Function, context?: any): any;

      once?(events: string, callback: Function, context?: any): any;
      listenTo?(object: any, events: string, callback: Function): any;
      listenToOnce?(object: any, events: string, callback: Function): any;
      stopListening?(object?: any, events?: string, callback?: Function): any;
   }


   // Backbone.Events does not work with extend in Typescript, so use this
   // base class to all extends to work with proper type information.
   // TODO: This is kind of bad for different versions of Backbone.
   export class Events implements IEvents {
      constructor() {}
      on(eventName: any, callback?: Function, context?: any): any {}
      off(eventName?: string, callback?: Function, context?: any): any {}
      trigger(eventName: string, ...args: any[]): any {}
      bind(eventName: string, callback: Function, context?: any): any {}
      unbind(eventName?: string, callback?: Function, context?: any): any {}
      once(events: string, callback: Function, context?: any): any {}
      listenTo(object: any, events: string, callback: Function): any {}
      listenToOnce(object: any, events: string, callback: Function): any {}
      stopListening(object?: any, events?: string, callback?: Function): any {}
   }
   _.extend(Events.prototype,Backbone.Events);
}