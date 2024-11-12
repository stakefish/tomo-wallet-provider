import { expect, test } from 'vitest'
import { parseUnits } from '../../src/utils/parseUnits'

test('parseUnits', async () => {
  expect(parseUnits('420', 9)).toBe(420000000000n)
})
