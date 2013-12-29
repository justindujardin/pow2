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

/// <reference path="../resource.ts"/>

module pow2 {
   /**
    * Use html image element to load an image resource.
    */
   export class ImageResource extends Resource {
      load() {
         var reference:HTMLImageElement = document.createElement('img');
         reference.onload = () => {
            this.data = reference;
            this.ready();
         };
         reference.onerror = (err:any) => {
            this.failed(err);
         };
         reference.src = this.url;
      }
   }
}