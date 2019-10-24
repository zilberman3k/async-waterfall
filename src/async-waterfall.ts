type PromiseResult = any;
type FunctionParam = (item?: any, index?: number) => PromiseResult;
type FunctionParamArray = FunctionParam[];
type FunctionWithArgs = (...args) => void;
const NOOP = () => {
    /**/
};

export enum StepActionEnum {
    Abort,
    Next,
    SkipNext,
}

interface IWaterfall {
    run(fn: FunctionWithArgs, isEach?: boolean): IWaterfall;

    each(fn: (item, idx, nextWith) => void): IWaterfall;

    forEach(fn: (item, idx, nextWith) => void): IWaterfall;

    // forEach(fn: FunctionParam): IWaterfall;
}

export interface IStepIteration {
    prev?: PromiseResult;
    current: PromiseResult;
    isFirst: PromiseResult;
    isLast: PromiseResult;
}

interface IActionOperation {
    next: (...data: any) => void;
    skipNext: () => void;
    abort: () => void;
}

export interface IStepActionIteration {
    step: PromiseResult;
    action: IActionOperation;
}

export class Waterfall implements IWaterfall {
    public iterator: any = {};
    public steps: any = {};
    public stepAction: any = {};

    public forEach = this.each;

    constructor(private promisesFunctions: FunctionParamArray = []) {
        this.iterator[Symbol.asyncIterator] = this.iteratorFn.bind(this);
        this.steps[Symbol.asyncIterator] = this.stepsFn.bind(this);
        this.stepAction[Symbol.asyncIterator] = this.stepActionFn.bind(this);
    }

    public run(fn: FunctionWithArgs = NOOP, isEach = false): IWaterfall {
        const self = this;
        (async () => {
            const results: PromiseResult[] = [];
            let nextIterationData: any = null;

            const nextWith: (...data: any) => void = (...data) => {
                nextIterationData = data;
            };
            let idx = 0;

            for await (const f of self.promisesFunctions) {
                const ans = await f(...nextIterationData);
                results.push(ans);

                if (isEach) {
                    fn.call(self, ans, idx++, nextWith);
                }
            }

            if (!isEach) {
                fn.apply(self, results);
            }
        })();

        return this;
    }

    public each(fn: (item, idx, nextWith) => void): IWaterfall {
        return this.run(fn, true);
    }

    private iteratorFn = async function* (this: Waterfall): AsyncIterableIterator<Waterfall> {
        for (const f of this.promisesFunctions) {
            yield f();
        }
        return this;
    };

    private stepsFn = async function* (this: Waterfall): AsyncIterableIterator<Waterfall | IStepIteration> {
        const results: PromiseResult[] = [];
        for (let i = 0; i < this.promisesFunctions.length; i++) {
            const res = await this.promisesFunctions[i]();
            const isFirst = i === 0;
            const isLast = i === this.promisesFunctions.length - 1;
            results.push(res);
            if (i === 0) {
                yield {current: res, isFirst, isLast} as IStepIteration;
            } else {
                yield {
                    current: results[i],
                    isFirst,
                    isLast,
                    prev: results[i - 1],
                } as IStepIteration;
            }
        }
        return this;
    };
    private stepActionFn = async function* (
        this: Waterfall,
    ): any | AsyncIterableIterator<Waterfall | IStepActionIteration> {
        const sa = StepActionEnum;
        let nextStepSkip = false;
        let nextIterationData: any = null;
        for (const f of this.promisesFunctions) {
            if (nextStepSkip) {
                nextStepSkip = false;
                nextIterationData = null;
                continue;
            }
            const step = await f(...nextIterationData);
            nextIterationData = null;
            let actionResult: StepActionEnum = sa.Next;
            const action = {
                abort: () => (actionResult = StepActionEnum.Abort),
                next: (...data) => {
                    actionResult = StepActionEnum.Next;
                    nextIterationData = data;
                },
                skipNext: () => (actionResult = StepActionEnum.SkipNext),
            };

            yield {step, action};
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
