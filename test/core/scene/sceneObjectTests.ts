///<reference path="../../fixtures/powTest.ts"/>
module pow2.tests {
   describe("pow2.scene.SceneObject",()=>{
      BasicClassSanityChecks("pow2.scene.SceneObject");
      it("scene should be accessible to components through host object",()=>{
         var scene:pow2.scene.Scene = new pow2.scene.Scene();
         var entity = new pow2.scene.SceneObject();
         var component = new pow2.scene.SceneComponent();
         entity.addComponent(component);
         expect(entity.findComponent(pow2.scene.SceneComponent)).not.toBeNull();
         scene.addObject(entity);
         expect(component.host.scene).toBeDefined();
         entity.destroy();
         scene.destroy();
      });
   });
}
