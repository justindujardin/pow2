///<reference path="../../fixtures/powTest.ts"/>
module pow2.tests {
   describe("pow2.GameEntityObject",()=>{
      BasicClassSanityChecks("pow2.GameEntityObject");
      it("should allow scene component creation",()=>{
         var model:pow2.EntityModel = new pow2.EntityModel({
            name:"test",
            icon:"null.png"
         });
         var sprite = new pow2.GameEntityObject({
            name: model.attributes.name,
            icon: model.attributes.icon,
            model:model
         });
         //this.world.scene.addObject(this.sprite);
         sprite.addComponent(new PlayerRenderComponent());
         sprite.addComponent(new CollisionComponent());
         sprite.addComponent(new pow2.game.components.PlayerComponent());
         sprite.addComponent(new PlayerCameraComponent());
         sprite.addComponent(new PlayerTouchComponent());
         expect(sprite._components.length).toBe(5);
         sprite.destroy();
         expect(sprite._components.length).toBe(0);
      });
   });
}
