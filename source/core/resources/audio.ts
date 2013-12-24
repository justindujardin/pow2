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
/// <reference path="../../../types/underscore/underscore.d.ts"/>

module eburp {
    /**
     * Use jQuery to load an Audio resource.
     */
    export class AudioResource extends Resource {
        static types:Object = {
            'mp3' : 'audio/mpeg',
            'ogg' : 'audio/ogg',
            'wav' : 'audio/wav'
        };
        load() {
            var sources:number = _.keys(AudioResource.types).length;
            var invalid:Array<string> = [];
            var incrementFailure:Function = (path:string) => {
                sources--;
                invalid.push(path);
                if(sources <= 0){
                    this.failed("No valid sources at the following URLs\n   " + invalid.join('\n   '));
                }
            };

            var reference:HTMLAudioElement = document.createElement('audio');

            // Try all supported types, and accept the first valid one.
            _.each(<any>AudioResource.types,(mime:string,extension:string) => {
                if(!reference.canPlayType(mime + ";")){
                    return;
                }
                var source:HTMLSourceElement = document.createElement('source');
                source.type = mime;
                source.src = this.url + '.' + extension;
                source.addEventListener('error',function(e:Event){
                    incrementFailure(source.src);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                });
                reference.appendChild(source);
            });
            reference.addEventListener('canplaythrough',() => {
                this.data = reference;
                this.ready();
            });
        }
    }
}