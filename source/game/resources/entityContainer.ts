/*
 Copyright (C) 2014 by Justin DuJardin and Contributors

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
/// <reference path="../../../lib/pow2.d.ts" />

module pow2 {
   export enum EntityError {
      NONE = 0,
      ENTITY_TYPE = 1,
      COMPONENT_TYPE = 2,
      COMPONENT_REGISTER = 4,
      COMPONENT_INPUT = 8,
      INPUT_NAME = 16,
      INPUT_TYPE = 32
   }

   export interface IEntityComponentDescription {

   }

   export class EntityContainerResource extends pow2.JSONResource {

      getClassType(fullTypeName:string):any {
         if(!fullTypeName){
            return null;
         }
         var parts = fullTypeName.split(".");
         for (var i = 0, len = parts.length, obj = window; i < len; ++i) {
            obj = obj[parts[i]];
            if(!obj){
               return null;
            }
         }
         return obj;
      }

      /**
       * Validate a template object's correctness, returning a string
       * error if incorrect, or null if correct.
       *
       * @param templateData The template to verify
       */
      validateTemplate(templateData:any,inputs?:any):EntityError {
         // Valid entity class type
         var type:any = this.getClassType(templateData.type);
         if(!type){
            return EntityError.ENTITY_TYPE;
         }

         var unsatisfied:EntityError = EntityError.NONE;
         // Verify user supplied required input values
         if(templateData.inputs){
            var tplInputs:string[] = _.keys(templateData.inputs);

            if(tplInputs){
               if(typeof inputs === 'undefined'){
                  console.error("missing inputs for template that requires: " + tplInputs.join(', '));
                  return EntityError.INPUT_NAME;
               }
               _.each(templateData.inputs,(type:string,name:string)=>{
                  // Attempt to validate inputs with two type specifications:
                  var inputType:any = this.getClassType(type);
                  if(typeof inputs[name] === 'undefined'){
                     console.info("missing input with name: " + name);
                     unsatisfied |= EntityError.INPUT_NAME;
                  }
                  // Match using instanceof if the inputType was found
                  else if(inputType && !(inputs[name] instanceof inputType)){
                     console.info("bad input type for input: " + name);
                     unsatisfied |= EntityError.INPUT_TYPE;
                  }
                  // Match using typeof as a last resort
                  else if(!inputType && typeof inputs[name] !== type){
                     console.info("bad input type for input: " + name);
                     unsatisfied |= EntityError.INPUT_TYPE;
                  }
               });
            }
            if(unsatisfied !== EntityError.NONE){
               return unsatisfied;
            }
         }

         // Verify component types are known
         unsatisfied = EntityError.NONE;
         _.each(templateData.components,(comp:any,name:string)=>{
            var compType:any = this.getClassType(comp.type);
            if(!compType){
               unsatisfied |= EntityError.COMPONENT_TYPE;
            }
            else if(comp.inputs){
               _.each(comp.inputs,(i:string)=>{
                  if(typeof inputs[i] === 'undefined'){
                     unsatisfied |= EntityError.COMPONENT_INPUT;
                  }
               });
            }
         });
         return unsatisfied;
      }

      getTemplate(templateName:string):any {
         if(!this.isReady()){
            return null;
         }
         // Valid template name.
         var tpl:any = _.where(this.data,{name:templateName})[0];
         if(!tpl){
            return null;
         }
         return tpl;
      }


      constructObject(constructor, argArray):any {
         var args = [null].concat(argArray);
         var factoryFunction = constructor.bind.apply(constructor, args);
         return new factoryFunction();
      }


      createObject(templateName:string, inputs?:any):GameEntityObject {
         // Valid template name.
         var tpl:any = this.getTemplate(templateName);
         if(!tpl){
            return null;
         }

         // Validate entity configuration
         if(this.validateTemplate(tpl,inputs) !== EntityError.NONE){
            console.log("failed to validate template: " + tpl.name + ":" + tpl.type );
            return null;
         }
         var type:any = this.getClassType(tpl.type);

         // Create entity object
         var object:GameEntityObject = new type(inputs);

         // Create components.
         //
         // Because we called validateTemplate above the input params
         // and component types should already be resolved.  Be optimistic
         // here and don't check for errors surrounding types and input names.
         var unsatisfied:EntityError = EntityError.NONE;
         _.each(tpl.components,(comp:any,name:string)=>{
            var inputNames:string[] = comp.inputs || [];
            var inputValues:any[] = _.map(inputNames,(n:string)=>{
               return inputs[n];
            });
            var ctor:any = this.getClassType(comp.type);
            var compObject = this.constructObject(ctor,inputValues);
            if(!object.addComponent(compObject)){
               unsatisfied |= EntityError.COMPONENT_REGISTER;
            }
         });
         if(unsatisfied !== EntityError.NONE){
            return null;
         }
         //console.log(JSON.stringify(this.data,null,2));
         return <GameEntityObject>object;
      }
   }
}