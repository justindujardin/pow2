///<reference path="../../fixtures/powTest.ts"/>
module pow2.tests {
   describe("pow2.SceneObject",()=>{
      BasicClassSanityChecks("pow2.SceneObject");
      it("scene should be accessible to components through host object",()=>{
         var scene:pow2.Scene = new pow2.Scene();
         var entity = new pow2.SceneObject();
         var component = new pow2.SceneComponent();
         entity.addComponent(component);
         expect(entity.findComponent(pow2.SceneComponent)).not.toBeNull();
         scene.addObject(entity);
         expect(component.host.scene).toBeDefined();
         entity.destroy();
         scene.destroy();
      });
   });
}
