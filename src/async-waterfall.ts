type PromiseResult = any;
type FunctionParam = (item?: any, index?: number) => PromiseResult;
type FunctionParamArray = FunctionParam[];
const NOOP = () => {
	/**/
};
export enum StepActionEnum {
	Next,
	SkipNext,
	Abort,
}

interface IWaterfall {
	run(fn: FunctionParam, isEach?: boolean): IWaterfall;
	each(fn: FunctionParam): IWaterfall;
	forEach(fn: FunctionParam): IWaterfall;
}

interface IStepIteration {
	prev?: PromiseResult;
	current: PromiseResult;
	isFirst: PromiseResult;
	isLast: PromiseResult;
}

interface IStepActionIteration {
	step: PromiseResult;
	action: (predicate: StepActionEnum) => void;
}

export class Waterfall implements IWaterfall {
	public iterator: any = {};
	public steps: any = {};
	public stepAction: any = {};

	constructor(private promisesFunctions: FunctionParamArray = []) {
		this.iterator[Symbol.asyncIterator] = this.iteratorFn.bind(this);
		this.steps[Symbol.asyncIterator] = this.stepsFn.bind(this);
		this.stepAction[Symbol.asyncIterator] = this.stepActionFn.bind(this);
	}

	public run(fn: FunctionParam = NOOP, isEach = false): IWaterfall {
		const self = this;
		(async () => {
			const results: PromiseResult[] = [];
			let idx = 0;
			for await (const f of self.promisesFunctions) {
				const ans = await f();
				results.push(ans);

				if (isEach) {
					// @ts-ignore
					fn.call(self, ans, idx++);
				}
			}

			if (!isEach) {
				// @ts-ignore
				fn.apply(self, results);
			}
		})();

		return this;
	}
	public each(fn: FunctionParam): IWaterfall {
		return this.run(fn, true);
	}
	public forEach = this.each;

	private iteratorFn = async function*(this: Waterfall): AsyncIterableIterator<Waterfall> {
		for (const f of this.promisesFunctions) {
			yield f();
		}
		return this;
	};
	private stepsFn = async function*(this: Waterfall): AsyncIterableIterator<Waterfall | IStepIteration> {
		const results: PromiseResult[] = [];
		for (let i = 0; i < this.promisesFunctions.length; i++) {
			const res = await this.promisesFunctions[i]();
			const isFirst = i === 0;
			const isLast = i === this.promisesFunctions.length - 1;
			results.push(res);
			if (i === 0) {
				yield { current: res, isFirst, isLast } as IStepIteration;
			} else {
				yield { prev: results[i - 1], current: results[i], isFirst, isLast } as IStepIteration;
			}
		}
		return this;
	};
	private stepActionFn = async function*(this: Waterfall): AsyncIterableIterator<Waterfall | IStepActionIteration> {
		const sa = StepActionEnum;
		let nextStepSkip = false;
		for (const f of this.promisesFunctions) {
			if (nextStepSkip) {
				nextStepSkip = false;
				continue;
			}
			const step = await f();
			let actionResult: StepActionEnum = sa.Next;
			const action = (predicate: StepActionEnum) => {
				actionResult = predicate;
			};

			yield { step, action };
			nextStepSkip = false;
			// @ts-ignore
			if (actionResult === sa.Abort) {
				break;
			}
			// @ts-ignore
			if (actionResult === sa.SkipNext) {
				nextStepSkip = true;
			}
		}
		return this;
	};
}
