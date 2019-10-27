# for-await-waterfall

let async function be of type (args)=>Promise.

let arr be of type [asyncFn1,asyncFn2...]

waterfall object would run async functions ordered one after another.

create waterfall as follows:

for typescript:
````
import {Waterfall,IStepActionIteration, IStepIteration} from 'for-await-waterfall';
````
for javascript:
````
import {Waterfall} from 'for-await-waterfall'; 
````
init object:
````
const w = new Waterfall(arr);
````
where "for await" loop is available:

#### w.iterator :
    
    (async function() {
        for await (const item of w.iterator) {
            // ... your logic
        }
    })();

#### w.steps : 
````
     (async function() {
        for await (const item of w.steps) {
            const {prev,current,isFirst,isLast}:IStepIteration = item;
            // current - iteration resolved value
            // prev - previous iteration value
            // isFirst - is first iteration - boolean
            // isLast - is last iteration - boolean
     
            // ... your logic
        }
     })();
````

#### w.stepAction :
````
    (async function() {
        for await (const item of w.stepAction) {
            const {step,action} : IStepActionIteration= item;
            // step - your current iteration result
            // action - optional object contains 3 functions:
                 * action.next(props) - pass props object to next iteration
                 * action.skipNext() - skips next iteration
                 * action.abort() - terminate loop
        }
    })();
 ````   
   
    
## es5 functions / async invoker

#### w.forEach
````
 w.forEach(function(item,index, nextWith /* optional */)){
    // invoked on each iteration resolved
    // invoke e.g. nextWith('arguments to next iteration')
});
````
#### w.run
````
  w.run(function(res1,res2,...res[n]){
    // invoked once when all functions were resolved
});    