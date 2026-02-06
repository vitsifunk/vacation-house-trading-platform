# Development Changelog

## 2026-02-06

### Security and Correctness
- Fixed registration validation bug in `src/modules/auth/auth.schemas.js` by correcting password confirmation comparison (`confirmPassword`).
- Added `corsOrigins` environment support and removed debug env logging in `src/config/env.js`.
- Fixed cookie clearing consistency in `src/modules/users/user.controller.js` by reusing `accessCookieOptions`.
- Reduced personally identifiable information (PII) exposure by removing email fields from selected `populate(...)` responses:
  - `src/modules/houses/house.service.js`
  - `src/modules/swaps/swap.service.js`
  - `src/modules/messages/message.service.js`

### Swap Workflow Hardening
- Added business validation in `src/modules/swaps/swap.service.js`:
  - requester house must be published
  - target house must be published
  - requester house must cover requested date range
- Refactored swap acceptance to use MongoDB transaction/session in `src/modules/swaps/swap.service.js` to reduce race-condition and consistency risks.
- Exported internal swap date-range helpers for focused unit testing.

### Reviews Module (Implemented from Empty Files)
- Implemented full reviews feature:
  - `src/modules/reviews/review.model.js`
  - `src/modules/reviews/review.service.js`
  - `src/modules/reviews/review.controller.js`
  - `src/modules/reviews/review.schemas.js`
  - `src/modules/reviews/review.routes.js`
- Added routing integration in `src/routes/index.js` under `/reviews`.

### Test Infrastructure and Coverage
- Added Jest configuration in `jest.config.js`.
- Added test environment setup in `src/tests/setup.js`.
- Added/expanded tests:
  - `src/tests/auth.test.js` (schema validation tests)
  - `src/tests/swap.logic.test.js` (date-range logic tests)
  - `src/tests/routes.integration.test.js` (route-level integration tests for login, swap creation, swap acceptance)
- Current status after changes: **3 test suites passing, 10 tests passing**.

### Environment Template Hardening
- Updated `.env.example` to be safe and aligned with current app behavior:
  - documented `CORS_ORIGINS`
  - safer `JWT_SECRET` placeholder
  - `JWT_EXPIRES_IN=15m`
  - sample DB name aligned to `property_swap`

## Notes for Dissertation Appendix
- This changelog captures post-review hardening and completion work.
- High-risk areas addressed: authentication validation, transactional consistency, authorization/business rules, and data minimization.
