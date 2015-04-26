///<reference path="../../fixtures/powTest.ts"/>
module pow2.tests {

   // TODO: Consider a refactor to produce metadata output JSON for components
   // and their registered ports. Requires walking known component hierarchies
   // and enumerating components, instantiating and then serializing.
   //
   // This will reduce duplication in output template files by omitting all but
   // the type name. The ports would be looked up in metadata that was exported
   // from the game.


   export class BooleanConstructComponent extends pow2.scene.SceneComponent {
      constructor(public arg:boolean){
         super();
      }
   }
   export class BooleanConstructObject extends pow2.scene.SceneObject {
      constructor(public arg:boolean){
         super();
      }
   }

   describe("pow2.EntityContainerResource",()=>{
      BasicClassSanityChecks("pow2.EntityContainerResource");

      var loader:pow2.ResourceLoader = new pow2.ResourceLoader();
      var factory:pow2.EntityContainerResource = null;
      beforeEach((done)=>{
         loader.loadAsType('base/test/fixtures/basic.powEntities',pow2.EntityContainerResource,(resource:pow2.EntityContainerResource) => {
            factory = resource;
            done();
         });
      });
      afterEach(()=>{
         factory = null;
      });

      describe("createObject",()=> {
         describe("should validate input names and types",()=>{
            it("works with exact input type match",()=>{
               expect(factory.createObject('SceneObjectWithComponentInput',{
                  component:new pow2.scene.SceneComponent()
               })).not.toBeNull();
            });
            it("works with more specific instance type given common ancestor",()=>{
               expect(factory.createObject('SceneObjectWithComponentInput',{
                  component:new pow2.tile.TileComponent()
               })).not.toBeNull();
            });
            it("fails with invalid instance of model input",()=>{
               expect(factory.createObject('SceneObjectWithComponentInput',{
                  component:null
               })).toBeNull();
            });
            it("fails without proper input",()=>{
               expect(factory.createObject('SceneObjectWithComponentInput')).toBeNull();
               expect(factory.createObject('SceneObjectWithComponentInput',{
                  other:null
               })).toBeNull();
            });
         });
         it('should instantiate entity object with constructor arguments',()=>{
            var entity:BooleanConstructObject = <any>factory.createObject('SceneObjectWithParams',{
               arg:true
            });
            expect(entity.arg).toBe(true);
            entity.destroy();
            entity = <any>factory.createObject('SceneObjectWithParams',{
               arg:false
            });
            expect(entity.arg).toBe(false);
            entity.destroy();
         });
         it('should instantiate components with correct names',()=>{
            var entity:pow2.scene.SceneObject = factory.createObject('SceneObjectWithComponents');
            expect(entity._components.length).toBe(2);
            expect(entity.findComponentByName('one')).not.toBeNull();
            expect(entity.findComponentByName('two')).not.toBeNull();
            entity.destroy();
         });
         it('should instantiate components with constructor arguments',()=>{
            var entity:pow2.scene.SceneObject = factory.createObject('ComponentWithParams',{
               arg:true
            });
            var boolComponent = <BooleanConstructComponent>entity.findComponent(BooleanConstructComponent);
            expect(boolComponent).not.toBeNull();
            expect(boolComponent.arg).toBe(true);

            entity.destroy();
            entity = factory.createObject('ComponentWithParams',{
               arg:false
            });
            boolComponent = <BooleanConstructComponent>entity.findComponent(BooleanConstructComponent);
            expect(boolComponent).not.toBeNull();
            expect(boolComponent.arg).toBe(false);
            entity.destroy();
         });
         it("should instantiate components",()=>{
            var object:pow2.scene.SceneObject = factory.createObject('SceneObjectWithComponents');

            var tpl:any = factory.getTemplate('SceneObjectWithComponents');
            expect(tpl).not.toBeNull();

            // Check that we can find instantiated components of the type specified in the template.
            _.each(tpl.components,(comp:any)=>{
               expect(object.findComponent(NamespaceClassToType(comp.type))).not.toBeNull();
            });
         });

      });

      describe('validateTemplate',()=>{
         describe("should validate input names and types",()=> {
            it("works with exact input type match",()=>{
               var tpl:any = factory.getTemplate('SceneObjectWithComponentInput');
               expect(factory.validateTemplate(tpl,{
                  component:new pow2.scene.SceneComponent()
               })).toBe(pow2.EntityError.NONE);
            });
            it("works with more specific instance type given common ancestor",()=>{
               var tpl:any = factory.getTemplate('SceneObjectWithComponentInput');
               expect(factory.validateTemplate(tpl,{
                  component:new pow2.tile.TileComponent()
               })).toBe(EntityError.NONE);

            });
            it("fail with invalid instance of model input",()=>{
               var tpl:any = factory.getTemplate('SceneObjectWithComponentInput');
               expect(factory.validateTemplate(tpl,{
                  component:null
               })).toBe(EntityError.INPUT_TYPE);

            });
            it("fail without proper input",()=>{
               var tpl:any = factory.getTemplate('SceneObjectWithComponentInput');
               expect(factory.validateTemplate(tpl)).toBe(EntityError.INPUT_NAME);
               expect(factory.validateTemplate(tpl,{
                  other:null
               })).toBe(EntityError.INPUT_NAME);
            });
         });

      });
   });

}
