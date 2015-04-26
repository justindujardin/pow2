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


module pow2 {
  export enum EntityError {
    NONE = 0,
    ENTITY_TYPE = 1,
    COMPONENT_TYPE = 2,
    COMPONENT_NAME_DUPLICATE = 4,
    COMPONENT_REGISTER = 8,
    COMPONENT_INPUT = 16,
    INPUT_NAME = 32,
    INPUT_TYPE = 64
  }

  export interface IEntityComponentDescription {

  }

  export class EntityContainerResource extends pow2.JSONResource {

    static getClassType(fullTypeName:string):any {
      if (!fullTypeName) {
        return null;
      }
      var parts = fullTypeName.split(".");
      for (var i = 0, len = parts.length, obj = window; i < len; ++i) {
        obj = obj[parts[i]];
        if (!obj) {
          return null;
        }
      }
      // Determine if this resolves to a native browser function.
      // e.g. if given a typename of "alert" this would return that
      // function, which is not a valid type constructor.
      //
      // Ignore all native methods until there's a compelling reason
      // not to.
      if (Function.prototype.toString.call(obj).indexOf('[native code]') !== -1) {
        return null;
      }
      return obj;
    }

    /**
     * Do a case-insensitive typeof compare to allow generally simpler
     * type specifications in entity files.
     * @param type The type
     * @param expected The expected typeof result
     * @returns {boolean} True if the expected type matches the type
     */
    typeofCompare(type:any, expected:string):boolean {
      var typeString:string = typeof type;
      var expected:string = '' + expected;
      return typeString.toUpperCase() === expected.toUpperCase();
    }

    /**
     * Validate a template object's correctness, returning a string
     * error if incorrect, or null if correct.
     *
     * @param templateData The template to verify
     */
    validateTemplate(templateData:any, inputs?:any):EntityError {
      // Valid entity class type
      var type:any = EntityContainerResource.getClassType(templateData.type);
      if (!type) {
        return EntityError.ENTITY_TYPE;
      }

      var unsatisfied:EntityError = EntityError.NONE;
      // Verify user supplied required input values
      if (templateData.inputs) {
        var tplInputs:string[] = _.keys(templateData.inputs);

        if (tplInputs) {
          if (typeof inputs === 'undefined') {
            console.error("EntityContainer: missing inputs for template that requires: " + tplInputs.join(', '));
            return EntityError.INPUT_NAME;
          }
          _.each(templateData.inputs, (type:string, name:string)=> {
            // Attempt to validate inputs with two type specifications:
            var inputType:any = EntityContainerResource.getClassType(type);
            if (typeof inputs[name] === 'undefined') {
              console.error("EntityContainer: missing input with name: " + name);
              unsatisfied |= EntityError.INPUT_NAME;
            }
            // Match using instanceof if the inputType was found
            else if (inputType && !(inputs[name] instanceof inputType)) {
              console.error("EntityContainer: bad input type for input: " + name);
              unsatisfied |= EntityError.INPUT_TYPE;
            }
            // Match using typeof as a last resort
            else if (!inputType && !this.typeofCompare(inputs[name], type)) {
              console.error("EntityContainer: bad input type for input (" + name + ") expected (" + type + ") but got (" + typeof inputs[name] + ")");
              unsatisfied |= EntityError.INPUT_TYPE;
            }
          });
        }
        if (unsatisfied !== EntityError.NONE) {
          return unsatisfied;
        }
      }

      if (templateData.components) {
        var keys:string[] = _.map(templateData.components, (c:any)=> {
          return c.name;
        });
        var unique:boolean = _.uniq(keys).length === keys.length;
        if (!unique) {
          console.error("EntityContainer: duplicate name in template components: " + keys.join(', '));
          return EntityError.COMPONENT_NAME_DUPLICATE;
        }
      }

      // Verify component types are known
      unsatisfied = EntityError.NONE;
      _.each(templateData.components, (comp:any)=> {
        var compType:any = EntityContainerResource.getClassType(comp.type);
        if (!compType) {
          console.error("EntityContainer: unknown component type: " + comp.type);
          unsatisfied |= EntityError.COMPONENT_TYPE;
        }
        else if (comp.params) {
          _.each(comp.params, (i:string)=> {
            if (typeof inputs[i] === 'undefined') {
              console.error("EntityContainer: missing component param: " + i);
              unsatisfied |= EntityError.COMPONENT_INPUT;
            }
          });
        }
      });
      return unsatisfied;
    }

    getTemplate(templateName:string):any {
      if (!this.isReady()) {
        return null;
      }
      // Valid template name.
      var tpl:any = _.where(this.data, {name: templateName})[0];
      if (!tpl) {
        return null;
      }
      return tpl;
    }


    constructObject(constructor, argArray):any {
      var args = [null].concat(argArray);
      var factoryFunction = constructor.bind.apply(constructor, args);
      return new factoryFunction();
    }


    /**
     * Instantiate an object and set of components from a given template.
     * @param templateName The name of the template in the resource.
     * @param inputs An object of input values to use when instantiating objects and components.
     * @returns {*} The resulting object or null
     */
    createObject(templateName:string, inputs?:any):any {
      // Valid template name.
      var tpl:any = this.getTemplate(templateName);
      if (!tpl) {
        return null;
      }

      // Validate entity configuration
      if (this.validateTemplate(tpl, inputs) !== EntityError.NONE) {
        console.log("failed to validate template: " + tpl.name + ":" + tpl.type);
        return null;
      }
      var type:any = EntityContainerResource.getClassType(tpl.type);

      // Create entity object
      //
      // If inputs.params are specified use them explicitly, otherwise pass the inputs
      // dire
      var inputValues:any[] = tpl.params ? _.map(tpl.params, (n:string)=> {
        return inputs[n];
      }) : [inputs];


      var object:pow2.scene.SceneObject = this.constructObject(type, inputValues);

      // Create components.
      //
      // Because we called validateTemplate above the input params
      // and component types should already be resolved.  Be optimistic
      // here and don't check for errors surrounding types and input names.
      var unsatisfied:EntityError = EntityError.NONE;
      _.each(tpl.components, (comp:any)=> {
        var inputValues:any[] = _.map(comp.params || [], (n:string)=> {
          return inputs[n];
        });
        var ctor:any = EntityContainerResource.getClassType(comp.type);
        var compObject = this.constructObject(ctor, inputValues);
        compObject.name = comp.name;
        if (!object.addComponent(compObject)) {
          unsatisfied |= EntityError.COMPONENT_REGISTER;
        }
      });
      if (unsatisfied !== EntityError.NONE) {
        return null;
      }
      return object;
    }
  }
}