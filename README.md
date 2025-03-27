# TokenHive
A token-based platform for incentivized reviews built on Stacks blockchain.

## Features
- Review submission with token rewards
- Upvoting/downvoting reviews 
- Reviewer reputation tracking
- Token distribution for quality reviews
- Review moderation by platform admins

## Setup and Installation
1. Clone the repository
2. Install Clarinet (if not already installed)
3. Run `clarinet check` to verify the contract
4. Run `clarinet test` to run the test suite

## Usage Examples
```clarity
;; Submit a review (returns review ID)
(contract-call? .token-hive submit-review "Great product!" "product-123" "image-url")

;; Upvote a review
(contract-call? .token-hive vote-review u1 true)

;; Reward tokens for quality review
(contract-call? .token-hive reward-review u1 u100)

;; Get reviewer reputation
(contract-call? .token-hive get-reputation 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
