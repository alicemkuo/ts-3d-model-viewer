
import { Interval, IntervalWithPoints } from '../../src/commands/curve/Interval';
import '../matchers';

describe(Interval, () => {
    describe('trim open', () => {
        const i = new Interval(5, 10, false);

        test('when the trim is bigger than the interval', () => {
            expect(i.trim(5, 10)).toEqual([]);
            expect(i.trim(0, 20)).toEqual([]);
        })

        test('when the trim is left of the interval', () => {
            expect(i.trim(4, 6)).toEqual([new Interval(6, 10)]);
        })

        test('when the trim is right of the interval', () => {
            expect(i.trim(9, 11)).toEqual([new Interval(5, 9)]);
        })

        test('when the trim is inside of the interval', () => {
            expect(i.trim(6, 9)).toEqual([new Interval(5, 6), new Interval(9, 10)]);
        })

        test('when the trim is outside of the interval', () => {
            expect(i.trim(11, 12)).toEqual([new Interval(5, 10)]);
            expect(i.trim(1, 2)).toEqual([new Interval(5, 10)]);
        })

        test('when the trim is hits a border of the interval', () => {
            expect(i.trim(9, 10)).toEqual([new Interval(5, 9)]);
            expect(i.trim(5, 6)).toEqual([new Interval(6, 10)]);
        })
    })

    describe('trim cyclic', () => {
        const i = new Interval(5, 10, true);

        test('when the trim is bigger than the interval', () => {
            expect(i.trim(5, 10)).toEqual([]);
            expect(i.trim(0, 20)).toEqual([]);
        })

        test('when the trim is left of the interval', () => {
            expect(i.trim(4, 6)).toEqual([new Interval(6, 9)]);
        })

        test('when the trim is right of the interval', () => {
            expect(i.trim(9, 11)).toEqual([new Interval(6, 9)]);
        })

        test('when the trim is inside of the interval', () => {
            expect(i.trim(6, 9)).toEqual([new Interval(9, 6)]);
        })
    })

    describe('trim backward', () => {
        const i = new Interval(2.2, 2);

        test('when the trim hits a border of the interval', () => {
            expect(i.trim(1.8, 2)).toEqual([new Interval(2.2, 1.8)]);
            expect(i.trim(2.2, 3)).toEqual([new Interval(3, 2)]);
            expect(i.trim(2, 3)).toEqual([new Interval(3, 2)]);
            expect(i.trim(2.1, 2.2)).toEqual([new Interval(2.2, 2)]);
            expect(i.trim(2, 2.1)).toEqual([new Interval(2.2, 2)]);

            expect(i.trim(2.2, 2.3)).toEqual([new Interval(2.3, 2)]);
        })
    })

    describe('multitrim', () => {
        const i = new Interval(5, 10);

        test('when the trim is bigger than the interval', () => {
            expect(i.multitrim([[6, 7]])).toEqual([new Interval(5, 6), new Interval(7, 10)]);
            expect(i.multitrim([[6, 7], [8, 9]])).toEqual([new Interval(7, 8), new Interval(9, 10), new Interval(5, 6)]);
            expect(i.multitrim([[6, 7], [7, 8]])).toEqual([new Interval(8, 10), new Interval(5, 6)]);
            expect(i.multitrim([[6, 7], [1, 20]])).toEqual([]);
            expect(i.multitrim([[6, 7], [7, 20]])).toEqual([new Interval(5, 6)]);
        })
    })
})

describe(IntervalWithPoints, () => {
    describe('trim open', () => {
        const i = new IntervalWithPoints(5, 10, [6, 7, 8], false);

        test('when the trim is bigger than the interval', () => {
            expect(i.trim(5, 10)).toEqual([]);
            expect(i.trim(0, 20)).toEqual([]);
        })

        test('when the trim is left of the interval', () => {
            expect(i.trim(4, 6)).toEqual([new IntervalWithPoints(6, 10, [7, 8])]);
        })

        test('when the trim is right of the interval', () => {
            expect(i.trim(9, 11)).toEqual([new IntervalWithPoints(5, 9, [6, 7, 8])]);
        })

        test('when the trim is inside of the interval', () => {
            expect(i.trim(6, 9)).toEqual([new IntervalWithPoints(5, 6, []), new IntervalWithPoints(9, 10, [])]);
        })

        test('when the trim is outside of the interval', () => {
            expect(i.trim(11, 12)).toEqual([new IntervalWithPoints(5, 10, [6, 7, 8])]);
            expect(i.trim(1, 2)).toEqual([new IntervalWithPoints(5, 10, [6, 7, 8])]);
        })

        test('when the trim is hits a border of the interval', () => {
            expect(i.trim(9, 10)).toEqual([new IntervalWithPoints(5, 9, [6, 7, 8])]);
            expect(i.trim(5, 6)).toEqual([new IntervalWithPoints(6, 10, [7, 8])]);
        })
    });

    describe('trim cyclic', () => {
        const i = new IntervalWithPoints(5, 10, [6, 7, 8], true);

        test('when the trim is bigger than the interval', () => {
            expect(i.trim(5, 10)).toEqual([]);
            expect(i.trim(0, 20)).toEqual([]);
        })

        test('when the trim is left of the interval', () => {
            expect(i.trim(4, 6)).toEqual([new IntervalWithPoints(6, 9, [7, 8])]);
        })

        test('when the trim is right of the interval', () => {
            expect(i.trim(9, 11)).toEqual([new IntervalWithPoints(6, 9, [7, 8])]);
        })

        test('when the trim is inside of the interval', () => {
            expect(i.trim(7, 8)).toEqual([new IntervalWithPoints(8, 7, [10, 6])]);
        })

        test('edge cases - square', () => {
            const i = new IntervalWithPoints(0, 4, [1, 2, 3], true);
            expect(i.trim(3, 0)).toEqual([new IntervalWithPoints(0, 3, [1, 2])]);
            expect(i.trim(1, 2)).toEqual([new IntervalWithPoints(2, 1, [3, 4])]);
        })

        test('edge cases - triangle', () => {
            const i = new IntervalWithPoints(0, 3, [1, 2], true);
            expect(i.trim(2, 2.2)).toEqual([new IntervalWithPoints(2.2, 2, [3, 1])]);
            expect(i.trim(2, 3)).toEqual([new IntervalWithPoints(0, 2, [1])]);
            expect(i.trim(2.2, 3)).toEqual([new IntervalWithPoints(0, 2.2, [1, 2])]);
            
            const j = new IntervalWithPoints(2.2, 2, [3, 1]);
            expect(j.trim(1.8, 2)).toEqual([new IntervalWithPoints(2.2, 1.8, [3, 1])]);
        })
    })
});
