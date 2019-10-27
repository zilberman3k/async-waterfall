
// this files execute examples of the async waterfall package.

import {Waterfall,IStepActionIteration, IStepIteration} from "../src";

const timerFn = (id, p = 0) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(id + p);
        }, 2000);
    });
};

let arr = [() => timerFn(10), () => timerFn(15), () => timerFn(15), () => timerFn(18)];
let arrNext = [() => timerFn(30),timerFn,timerFn,timerFn];

const w = new Waterfall(arr);
const wNext = new Waterfall(arrNext);

w.forEach(function (item,idx) {
   console.log(item,idx);
}).each((it,id)=>{console.log(id,it)}).run((a,b,c)=>{console.log(a,b,c)});

wNext.each((item,idx,nextWith)=>{
    console.log(item+idx*3);
    nextWith(item*4);
});


(async function() {
    for await (const item of w.iterator) {
        console.log(item);
    }
})();

(async function() {
    for await (const item of w.steps) {
        const { prev, current, isFirst, isLast }: IStepIteration = item;
        console.log(prev, current, isFirst, isLast);
    }
})();

(async function() {
    for await (const item of w.stepAction) {
        const { step, action }: IStepActionIteration = item;
        action.next(step + 95, 43);
        console.log(step);
    }
})();