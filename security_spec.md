# Security Spec

## Data Invariants
1. A user profile (`users/{userId}`) can only be created or modified by the owner whose UID exactly matches `userId`.
2. An order (`orders/{orderId}`) must have a `userId` matching the request auth UID, and can only be accessed/created by its owner.
3. Order arrays (`items`) must have a strict size limit to prevent Denial of Wallet.
4. Timestamps (`createdAt`, `updatedAt`) must strictly match `request.time`.

## The "Dirty Dozen" Payloads
1. User profile creation with wrong UID
2. Order creation with missing branchId
3. Order creation with wrong userId
4. Shadow field in profile updates
5. Order items array exceeding limit
6. Modifying order terminal state
7. Spoofed timestamp in order creation
8. Unauthorized user querying another user's order
9. Modifying someone else's order
10. Unverified email user placing an order
11. Missing signature fields in payload
12. Attempting to inject massive string into branchId
