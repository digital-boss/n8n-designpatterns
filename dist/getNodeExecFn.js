var c=r=>async function(){let o=this.getInputData().length,e=[];for(let n=0;n<o;n++)try{let t=await r(n);t.constructor===Array?e.push.apply(e,t):e.push(t)}catch(t){if(this.continueOnFail()){e.push({error:t.message});continue}throw t}return[this.helpers.returnJsonArray(e)]};export{c as getNodeExecFn};
//# sourceMappingURL=getNodeExecFn.js.map
