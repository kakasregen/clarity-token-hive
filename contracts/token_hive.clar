;; TokenHive Contract
(define-fungible-token hive-token)

;; Constants 
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-review (err u101))
(define-constant err-already-voted (err u102))
(define-constant err-not-found (err u103))
(define-constant base-reward u10)

;; Data Variables
(define-data-var review-count uint u0)
(define-map reviews 
  uint 
  {
    author: principal,
    content: (string-utf8 500),
    product-id: (string-ascii 50),
    image-url: (string-ascii 200),
    upvotes: uint,
    downvotes: uint,
    rewarded: bool
  }
)

(define-map user-reputation
  principal
  uint
)

(define-map user-votes
  { user: principal, review-id: uint }
  bool
)

;; Public Functions
(define-public (submit-review (content (string-utf8 500)) (product-id (string-ascii 50)) (image-url (string-ascii 200)))
  (let ((review-id (+ (var-get review-count) u1)))
    (map-set reviews review-id {
      author: tx-sender,
      content: content,
      product-id: product-id,
      image-url: image-url,
      upvotes: u0,
      downvotes: u0,
      rewarded: false
    })
    (var-set review-count review-id)
    (ok review-id)
  )
)

(define-public (vote-review (review-id uint) (is-upvote bool))
  (let (
    (review (unwrap! (map-get? reviews review-id) err-not-found))
    (vote-key { user: tx-sender, review-id: review-id })
  )
    (asserts! (is-none (map-get? user-votes vote-key)) err-already-voted)
    (map-set user-votes vote-key true)
    (if is-upvote
      (map-set reviews review-id (merge review { upvotes: (+ (get upvotes review) u1) }))
      (map-set reviews review-id (merge review { downvotes: (+ (get downvotes review) u1) }))
    )
    (ok true)
  )
)

(define-public (reward-review (review-id uint) (amount uint))
  (let (
    (review (unwrap! (map-get? reviews review-id) err-not-found))
  )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (get rewarded review)) err-invalid-review)
    (try! (ft-mint? hive-token amount (get author review)))
    (map-set reviews review-id (merge review { rewarded: true }))
    (increase-reputation (get author review))
    (ok true)
  )
)

;; Private Functions
(define-private (increase-reputation (user principal))
  (let ((current-rep (default-to u0 (map-get? user-reputation user))))
    (map-set user-reputation user (+ current-rep u1))
    (ok true)
  )
)

;; Read Only Functions  
(define-read-only (get-review (review-id uint))
  (ok (map-get? reviews review-id))
)

(define-read-only (get-reputation (user principal))
  (ok (default-to u0 (map-get? user-reputation user)))
)

(define-read-only (get-review-count)
  (ok (var-get review-count))
)
