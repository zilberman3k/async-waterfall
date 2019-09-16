import {Waterfall} from '../src';
describe("should", () => {
    beforeEach(() => {
       console.log(121);
    });

    test('a1', () => {
        const w = new Waterfall();
        expect(typeof w).toBe('object');
    });

    test('b1', () => {
        const w = new Waterfall();
        expect(typeof w.run).toBe('function');
    });
});