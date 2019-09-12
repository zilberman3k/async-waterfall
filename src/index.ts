import { Waterfall, StepActionEnum } from './async-waterfall';

var timerFn = id => {
	return new Promise(resolve => {
		setTimeout(() => {
			console.log('Done...');
			resolve(id);
		}, 2000);
	});
};

var arr = [() => timerFn(10), () => timerFn(11), () => timerFn(15), () => timerFn(18)];

const w = new Waterfall(arr);
// w.test(7).test(3);
//w.xx().next();

w.forEach(function(a, b) {
	console.log(a, b);
}).run(console.log);
(async function() {
	for await (const item of w.iterator) {
		console.log(item);
	}
})();
export { Waterfall };
