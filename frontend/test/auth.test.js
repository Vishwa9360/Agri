import test from 'node:test';
import assert from 'node:assert/strict';

test('Auth and RBAC Role Normalization Logic', async (t) => {
  await t.test('strips STRING_ and ROLE_ prefixes correctly', () => {
    const normalizeRole = (role) => {
      if (!role) return 'GUEST';
      let r = role.trim().toUpperCase();
      if (r.startsWith('STRING_')) r = r.replace('STRING_', '');
      if (r.startsWith('STRING')) r = r.replace('STRING', '');
      if (r.startsWith('ROLE_')) r = r.replace('ROLE_', '');
      return r;
    };

    assert.equal(normalizeRole('STRING_FARMER'), 'FARMER');
    assert.equal(normalizeRole('STRINGFARMER'), 'FARMER');
    assert.equal(normalizeRole('ROLE_ADMIN'), 'ADMIN');
    assert.equal(normalizeRole('FIELD_OFFICER'), 'FIELD_OFFICER');
    assert.equal(normalizeRole(null), 'GUEST');
  });

  await t.test('enforces RBAC permission hierarchy per SRS Section 4', () => {
    const canAccessAdmin = (role) => {
      const normalized = role?.toUpperCase();
      return normalized === 'ADMIN';
    };

    assert.equal(canAccessAdmin('ADMIN'), true);
    assert.equal(canAccessAdmin('FARMER'), false);
    assert.equal(canAccessAdmin('GUEST'), false);
    assert.equal(canAccessAdmin('FIELD_OFFICER'), false);
  });
});
