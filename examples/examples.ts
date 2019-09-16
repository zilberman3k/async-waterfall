// todo : convert to test cases

import {Waterfall,IStepActionIteration, IStepIteration} from "../src";

let timerFn = (id, p = 0) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('Done...');
            resolve(id + p);
        }, 2000);
    });
};

let arr = [() => timerFn(10), () => timerFn(15), () => timerFn(15), () => timerFn(18)];

const w = new Waterfall(arr);

w.forEach(function (item,idx) {
   console.log(item,idx);
}).each((it,id)=>{console.log(id,it)}).run((a,b,c)=>{console.log(a,b,c)});

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