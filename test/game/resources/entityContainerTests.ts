///<reference path="../../fixtures/powTest.ts"/>
module pow2.tests {
   describe("pow2.EntityContainerResource",()=>{
      BasicClassSanityChecks("pow2.EntityContainerResource");

      var loader:pow2.ResourceLoader = new pow2.ResourceLoader();

      // TODO: Refactor to produce metadata output JSON for components and their registered ports.   Requires walking known component
      // hierarchies and enumerating components, instantiating and then serializing.
      //
      // This will reduce duplication in output template files by omitting all but the type name.  The ports would
      // be looked up in the loaded metadata about component ports that was exported from the game.
      it("should validate input names and types",(done)=>{
         loader.loadAsType('base/test/fixtures/basic.powEntities',pow2.EntityContainerResource,(resource:pow2.EntityContainerResource) => {

            // works with exact input type match
            expect(resource.createObject('ValidEntityWithModelInput',{
               model:new pow2.EntityModel()
            })).not.toBeNull();

            // works with more specific instance type given common ancestor
            expect(resource.createObject('ValidEntityWithModelInput',{
               model:new pow2.CreatureModel()
            })).not.toBeNull();

            // fail with invalid instance of model input
            expect(resource.createObject('ValidEntityWithModelInput',{
               model:null
            })).toBeNull();

            // fail without proper input
            expect(resource.createObject('ValidEntityWithModelInput')).toBeNull();
            expect(resource.createObject('ValidEntityWithModelInput',{
               other:null
            })).toBeNull();
            done();
         });
      });
      it("should instantiate components",(done)=>{
         loader.loadAsType('base/test/fixtures/basic.powEntities',pow2.EntityContainerResource,(resource:pow2.EntityContainerResource) => {
            var object:pow2.GameEntityObject = resource.createObject('ValidEntityWithComponentDependency');

            var tpl:any = _.where(resource.data,{name:'ValidEntityWithComponentDependency'})[0];
            expect(tpl).not.toBeNull();

            // Check that we can find instantiated components of the type specified in the template.
            _.each(tpl.components,(comp:any,name:string)=>{
               expect(object.findComponent(NamespaceClassToType(comp.type))).not.toBeNull();
            });
            done();
         });
      });

      describe('createObject',()=>{
         it('should instantiate components with constructor arguments',(done)=>{
            loader.loadAsType('base/test/fixtures/basic.powEntities',pow2.EntityContainerResource,(resource:pow2.EntityContainerResource) => {
               var entity:pow2.SceneObject = resource.createObject('ConstructComponentBooleanArg',{
                  arg:true
               });
               var boolComponent = <BooleanConstructComponent>entity.findComponent(BooleanConstructComponent);
               expect(boolComponent).not.toBeNull();
               expect(boolComponent.arg).toBe(true);

               entity.destroy();
               entity = resource.createObject('ConstructComponentBooleanArg',{
                  arg:false
               });
               boolComponent = <BooleanConstructComponent>entity.findComponent(BooleanConstructComponent);
               expect(boolComponent).not.toBeNull();
               expect(boolComponent.arg).toBe(false);
               entity.destroy();
               done();
            });

         });
      });

      describe('validateTemplate',()=>{
         it("should validate input names and types",(done)=>{
            loader.loadAsType('base/test/fixtures/basic.powEntities',pow2.EntityContainerResource,(resource:pow2.EntityContainerResource) => {
               var tpl:any = resource.getTemplate('ValidEntityWithModelInput');
               // works with exact input type match
               expect(resource.validateTemplate(tpl,{
                  model:new pow2.EntityModel()
               })).toBe(pow2.EntityError.NONE);

               // works with more specific instance type given common ancestor
               expect(resource.validateTemplate(tpl,{
                  model:new pow2.CreatureModel()
               })).toBe(EntityError.NONE);

               // fail with invalid instance of model input
               expect(resource.validateTemplate(tpl,{
                  model:null
               })).toBe(EntityError.INPUT_TYPE);

               // fail without proper input
               expect(resource.validateTemplate(tpl)).toBe(EntityError.INPUT_NAME);
               expect(resource.validateTemplate(tpl,{
                  other:null
               })).toBe(EntityError.INPUT_NAME);
               done();
            });
         });

      });
   });

}
