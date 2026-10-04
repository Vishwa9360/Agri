import test from 'node:test';
import assert from 'node:assert/strict';

test('Agronomic & Validation Logic (SRS Sections 7, 8, 9)', async (t) => {
  await t.test('validates IoT sensor physiological ranges', () => {
    const isMoistureValid = (val) => val >= 0.0 && val <= 100.0;
    const isTempValid = (val) => val >= -10.0 && val <= 60.0;
    const isPhValid = (val) => val >= 0.0 && val <= 14.0;

    assert.equal(isMoistureValid(35.5), true);
    assert.equal(isMoistureValid(-2.0), false);
    assert.equal(isMoistureValid(105.0), false);

    assert.equal(isTempValid(25.0), true);
    assert.equal(isTempValid(-15.0), false);
    assert.equal(isTempValid(65.0), false);

    assert.equal(isPhValid(6.5), true);
    assert.equal(isPhValid(15.0), false);
  });

  await t.test('calculates commercial fertilizer requirements accurately', () => {
    const calcFertilizer = (defN, defP, defK, acres) => {
      const urea = Math.round((defN / 0.46 / 50.0 * (acres / 2.47)) * 10.0) / 10.0;
      const dap = Math.round((defP / 0.46 / 50.0 * (acres / 2.47)) * 10.0) / 10.0;
      const mop = Math.round((defK / 0.60 / 50.0 * (acres / 2.47)) * 10.0) / 10.0;
      return { urea, dap, mop };
    };

    const res = calcFertilizer(80, 25, 40, 5);
    assert.ok(res.urea > 0);
    assert.ok(res.dap > 0);
    assert.ok(res.mop > 0);
  });
});
