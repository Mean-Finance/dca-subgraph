import { Address, BigInt } from '@graphprotocol/graph-ts';
import { clearStore, test, assert, describe } from 'matchstick-as/assembly/index';
import { Token } from '../../generated/schema';
import { handleSetAllowedTokens } from '../../src/mappings/hub';
import { createTokensAllowedUpdatedEvent } from '../test-utils/event-utils';
import { mockTokenContract } from '../test-utils/token';
import { MockTransformerRegistry } from '../test-utils/transformer-registry';
import { ADDRESS_ZERO } from '../../src/utils/constants';

const TOKEN_ENTITY_TYPE = 'Token';
const token1 = '0x0000000000000000000000000000000000000001';

test('First time tokens are updated', () => {
  mockTokenContract(token1, 'Token 1', 'T1', 15);
  MockTransformerRegistry.transformers([Address.fromString(token1)], [ADDRESS_ZERO]);
  assert.entityCount(TOKEN_ENTITY_TYPE, 0);
  handleSetAllowedTokens(createTokensAllowedUpdatedEvent([Address.fromString(token1)], [true]));
  assert.entityCount(TOKEN_ENTITY_TYPE, 1);
  const token = Token.load(token1)!;
  assert.assertNotNull(token);
  assert.stringEquals(token.name, 'Token 1');
  assert.stringEquals(token.symbol, 'T1');
  assert.assertTrue(token.allowed);
  assert.i32Equals(token.decimals, 15);
  assert.bigIntEquals(token.magnitude, BigInt.fromI32(10).pow(15));
});

test('Token was already allowed and its updated to not allowed', () => {
  handleSetAllowedTokens(createTokensAllowedUpdatedEvent([Address.fromString(token1)], [false]));
  const token = Token.load(token1)!;
  assert.assertNotNull(token);
  assert.assertTrue(!token.allowed);
  clearStore();
});
