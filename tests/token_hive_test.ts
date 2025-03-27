import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test review submission and retrieval",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('token-hive', 'submit-review', 
        [types.utf8("Great product!"), types.ascii("prod-123"), types.ascii("img-url")],
        user1.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectUint(1);
    
    let response = chain.callReadOnlyFn(
      'token-hive',
      'get-review',
      [types.uint(1)],
      deployer.address
    );
    
    let review = response.result.expectOk().expectSome();
    assertEquals(review.author, user1.address);
  }
});

Clarinet.test({
  name: "Test voting on reviews",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    
    // Submit review
    let block = chain.mineBlock([
      Tx.contractCall('token-hive', 'submit-review',
        [types.utf8("Test review"), types.ascii("prod-123"), types.ascii("img-url")],
        user1.address
      )
    ]);
    
    // Vote on review
    block = chain.mineBlock([
      Tx.contractCall('token-hive', 'vote-review',
        [types.uint(1), types.bool(true)],
        user2.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Try voting again (should fail)
    block = chain.mineBlock([
      Tx.contractCall('token-hive', 'vote-review',
        [types.uint(1), types.bool(true)],
        user2.address
      )
    ]);
    
    block.receipts[0].result.expectErr().expectUint(102);
  }
});

Clarinet.test({
  name: "Test review rewards and reputation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    
    // Submit review
    let block = chain.mineBlock([
      Tx.contractCall('token-hive', 'submit-review',
        [types.utf8("Quality review"), types.ascii("prod-123"), types.ascii("img-url")],
        user1.address
      )
    ]);
    
    // Reward review
    block = chain.mineBlock([
      Tx.contractCall('token-hive', 'reward-review',
        [types.uint(1), types.uint(100)],
        deployer.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Check reputation
    let response = chain.callReadOnlyFn(
      'token-hive',
      'get-reputation',
      [types.principal(user1.address)],
      deployer.address
    );
    
    response.result.expectOk().expectUint(1);
  }
});
