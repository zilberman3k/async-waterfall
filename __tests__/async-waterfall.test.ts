import {IStepIteration, Waterfall} from '../src';

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

    it('test forEach fn, should run 4 times on each iteration', (done) => {
        const cbForEach = jest.fn();
        const w = new Waterfall(arr);
        w.forEach(cbForEach);
        setTimeout(() => {
            expect(cbForEach).toBeCalledTimes(4);
            expect(cbForEach.mock.calls[0]).toMatchObject([10, 0]);
            expect(cbForEach.mock.calls[1]).toMatchObject([11, 1]);
            expect(cbForEach.mock.calls[2]).toMatchObject([12, 2]);
            expect(cbForEach.mock.calls[3]).toMatchObject([13, 3]);
            done();
        }, 300);

    });

    it('test each fn, should run 4 times on each iteration', (done) => {
        const cb = jest.fn();
        const w = new Waterfall(arr);
        w.each(cb);
        setTimeout(() => {
            expect(cb.mock.calls[0]).toMatchObject([10, 0]);
            expect(cb.mock.calls[1]).toMatchObject([11, 1]);
            expect(cb.mock.calls[2]).toMatchObject([12, 2]);
            expect(cb.mock.calls[3]).toMatchObject([13, 3]);
            expect(cb).toBeCalledTimes(4);
            done();
        }, 400);
    });

    // todo - complete
    it('should test iterator function', async (done) => {
        const w = new Waterfall(arr);
        for await (const item of w.iterator) {
            console.log(item);
        }

        return done();
    });

    // todo - complete
    it('should test steps iterator', async (done) => {
        const w = new Waterfall(arr);
        for await (const item of w.steps) {
            const {prev, current, isFirst, isLast}: IStepIteration = item;
            console.log(prev, current, isFirst, isLast);
        }

        done();
    });

});