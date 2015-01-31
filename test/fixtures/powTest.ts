///<reference path="../../types/jasmine/jasmine.d.ts"/>
///<reference path="../../lib/pow2.d.ts"/>
module pow2.tests {

   export function NamespaceClassToType(fullTypeName:string):any {
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

   export function BasicClassSanityChecks(fullTypeName:string){
      it("should be defined",()=>{
         expect(NamespaceClassToType(fullTypeName)).not.toBeNull();
      });
   }
}
