import {IStepActionIteration, IStepIteration, Waterfall} from '../src';

const asyncFn = (data) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(data);
        }, 40);
    });
};

const arr = [() => asyncFn(10), () => asyncFn(11), () => asyncFn(12), () => asyncFn(13)];
describe("test async-waterfall", () => {

    it('test instance with no param', () => {
        const w = new Waterfall();
        expect(w.run()).toMatchObject(w);
    });

    it('test run fn, should return 10,11,12,13', (done) => {
        const cb = (a, b, c, d) => {
            expect(a).toBe(10);
            expect(b).toBe(11);
            expect(c).toBe(12);
            expect(d).toBe(13);
            done();
        };
        const w = new Waterfall(arr);
        w.run(cb);

    });

    it('test each fn, should run 4 times on each iteration', (done) => {
        const cb = jest.fn();
        const w = new Waterfall(arr);
        w.each(cb);
        setTimeout(() => {
            expect(cb).toBeCalledTimes(4);
            for (let i = 0; i < 4; i++) {
                expect(cb.mock.calls[i][0]).toBe(10 + i);
                expect(cb.mock.calls[i][1]).toBe(i);
                expect(cb.mock.calls[i][2]).toBeInstanceOf(Function)
            }
            done();
        }, 400);
    });

    it('test each fn with nextWith to pass arg to next, should return 10,20,40,80', (done) => {
        const arrForNext = [() => asyncFn(10), asyncFn, asyncFn, asyncFn];
        const w = new Waterfall(arrForNext);
        const testFn = jest.fn((item, idx, nextWith) => nextWith(item * 2));
        w.each(testFn);
        setTimeout(() => {
            expect(testFn).toBeCalledTimes(4);
            expect(testFn.mock.calls[0][0]).toBe(10);
            expect(testFn.mock.calls[1][0]).toBe(20);
            expect(testFn.mock.calls[2][0]).toBe(40);
            expect(testFn.mock.calls[3][0]).toBe(80);

            done();
        }, 400);
    });

    it('should test iterator function', async () => {
        const helperArr: any[] = [];

        const w = new Waterfall(arr);
        for await (const item of w.iterator) {
            helperArr.push(item)
        }

        expect(helperArr).toMatchObject([10, 11, 12, 13]);
    });

    it('should test steps iterator', async () => {

        const cb = jest.fn((i: IStepIteration) => i);
        const w = new Waterfall(arr);
        for await (const item of w.steps) {
            cb(item);
        }
        const first: IStepIteration = {
            current: 10, isFirst: true, isLast: false
        };
        const last: IStepIteration = {
            current: 13, isFirst: false, isLast: true, prev: 12
        };

        expect(cb).toBeCalledTimes(4);
        expect(cb.mock.results[0].value).toMatchObject(first);
        expect(cb.mock.results[3].value).toMatchObject(last);

    });

    it('should test stepAction iterator - no action - expect 10 to 13', async (done) => {
        const w = new Waterfall(arr);

        const cbNormal = jest.fn();

        for await (const item of w.stepAction) {
            const {step}: IStepActionIteration = item;
            cbNormal(step);
        }
        expect(cbNormal).toHaveBeenNthCalledWith(1, 10);
        expect(cbNormal).toHaveBeenNthCalledWith(2, 11);
        expect(cbNormal).toHaveBeenNthCalledWith(3, 12);
        expect(cbNormal).toHaveBeenNthCalledWith(4, 13);
        expect(cbNormal).toBeCalledTimes(4);

        done();
    });

    it('should test stepAction iterator - skip action - expect 10,11,13', async () => {
        const w = new Waterfall(arr);
        const cbSkip = jest.fn();

        for await (const item of w.stepAction) {
            const {step, action}: IStepActionIteration = item;
            cbSkip(step);

            if (step === 11) {
                action.skipNext();
            }
        }

        expect(cbSkip).toHaveBeenNthCalledWith(1, 10);
        expect(cbSkip).toHaveBeenNthCalledWith(2, 11);
        expect(cbSkip).toHaveBeenNthCalledWith(3, 13);
        expect(cbSkip).toBeCalledTimes(3);

    });

    it('should test stepAction abort action - expect 10,11', async () => {
        const w = new Waterfall(arr);
        const cbAbort = jest.fn();

        for await (const item of w.stepAction) {
            const {step, action}: IStepActionIteration = item;
            cbAbort(step);

            if (step === 11) {
                action.abort();
            }
        }

        expect(cbAbort).toHaveBeenNthCalledWith(1, 10);
        expect(cbAbort).toHaveBeenNthCalledWith(2, 11);
        expect(cbAbort).toBeCalledTimes(2);

    });

    it('should test stepAction iterator next action - expect 101,102,103,104', async () => {
        const arrForNext = [() => asyncFn(100), asyncFn, asyncFn, asyncFn];
        const wNext = new Waterfall(arrForNext);
        const cbNext = jest.fn();

        for await (const item of wNext.stepAction) {
            const {step, action}: IStepActionIteration = item;
            cbNext(step);
            action.next(step + 1);
        }

        expect(cbNext).toHaveBeenNthCalledWith(1, 100);
        expect(cbNext).toHaveBeenNthCalledWith(2, 101);
        expect(cbNext).toHaveBeenNthCalledWith(3, 102);
        expect(cbNext).toHaveBeenNthCalledWith(4, 103);
        expect(cbNext).toBeCalledTimes(4);

    });

});