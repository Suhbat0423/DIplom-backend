# Performance And Resilience Validation Report

Date: 2026-05-19  
Environment used for re-test: local API gateway at `http://localhost:8080`  
Validation scope: performance comparison, monitoring evidence review, code audit for retry/rate-limit/cache/pool tuning

## 1. Summary

This validation produced a mixed result:

- Functional stability remained good in the local re-test: all checks passed in both order and payment flows.
- The new local re-test did **not** show a small-load latency improvement versus the previously saved baseline.
- Monitoring is **partially validated**: health endpoint works and ECS/CloudWatch integration was used during deployment, but alarm-driven monitoring was not experimentally verified in this report.
- Retry, rate-limit, cache, and connection-pool tuning are **not fully implemented in the codebase**, so they cannot be honestly marked as experimentally proven improvements.

## 2. Method

### Existing baseline files

- `load-tests/results/orders-small-summary.json`
- `load-tests/results/payments-small-summary.json`

### New re-test files

- `load-tests/results/validation-2026-05-19/orders-current-summary.json`
- `load-tests/results/validation-2026-05-19/orders-current.log`
- `load-tests/results/validation-2026-05-19/payments-current-summary.json`
- `load-tests/results/validation-2026-05-19/payments-current.log`

### Test profile used for re-test

- `VUS=5`
- `DURATION=15s`
- `BASE_URL=http://localhost:8080`
- Test account: `k6user@example.com`

## 3. Performance Comparison

### Order flow

| Metric | Baseline | Current | Result |
|---|---:|---:|---|
| Avg latency | 14.65 ms | 39.03 ms | Worse |
| p95 latency | 24.36 ms | 263.67 ms | Worse |
| Request rate | 4.97 req/s | 4.80 req/s | Slightly worse |
| Error rate | 0.00% | 0.00% | Same |
| Functional checks | 100% pass | 100% pass | Same |

Interpretation:

- The order flow stayed functionally correct.
- Under this small local test, measurable latency improvement was not observed.
- The current result suggests either local runtime variability, background load, or that the tested improvements were aimed more at concurrency safety and deployment scaling than at small-load single-node latency.

### Payment flow

| Metric | Baseline | Current | Result |
|---|---:|---:|---|
| Avg latency | 13.80 ms | 26.33 ms | Worse |
| p95 latency | 21.67 ms | 43.02 ms | Worse |
| Request rate | 14.39 req/s | 13.87 req/s | Slightly worse |
| Error rate | 0.00% | 0.00% | Same |
| Functional checks | 100% pass | 100% pass | Same |

Interpretation:

- Payment creation and confirmation remained functionally stable.
- The local re-test again did not demonstrate a raw latency improvement.
- This does not disprove autoscaling value on AWS; it only shows that a short local test did not capture improvement.

## 4. Monitoring Validation

### Verified

- Local health endpoint responds successfully:
  - `GET /health` on API gateway returned `{"status":"OK","service":"api-gateway"}`.
- During AWS deployment, ECS service events and CloudWatch log groups were actively used to diagnose:
  - IAM role issues
  - ECR connectivity issues
  - log group naming issues
  - image platform mismatch

### Not fully validated in this report

- CloudWatch alarms triggering
- dashboard-based monitoring review
- autoscaling event screenshots/metrics export
- alert-to-action workflow

Conclusion:

- Monitoring exists at the operational level.
- Full monitoring effectiveness is **partially validated**, not fully proven.

## 5. Code Audit: Retry

Reviewed files:

- `services/payment-service/src/services/payment.service.js`
- `services/order-service/src/services/order.service.js`

Findings:

- Inter-service calls use `axios` with `timeout: 5000`.
- No retry loop, no exponential backoff, and no circuit-breaker logic was found.

Conclusion:

- Retry optimization is **not implemented**.
- Therefore it cannot be experimentally claimed as a proven improvement.

## 6. Code Audit: Rate Limit

Reviewed gateway and services:

- `services/api-gateway/src/app.js`
- service `app.js` files

Findings:

- `helmet`, `cors`, and `morgan` are present.
- No `express-rate-limit`, throttling middleware, or explicit HTTP `429` protection was found.

Conclusion:

- Rate limiting is **not implemented**.
- Therefore no valid rate-limit improvement test can be claimed.

## 7. Code Audit: Cache

Findings:

- No Redis integration, in-memory response cache, or route-level caching layer was found.
- `lru-cache` appears only in dependency trees inside `package-lock.json`, not as an application feature in runtime code.

Conclusion:

- Cache optimization is **not implemented**.
- Therefore cache improvement is **not experimentally validated**.

## 8. Code Audit: Connection Pool Tuning

Reviewed database config:

- `services/*/src/config/database.js`

Findings:

- `mongoose.connect()` is called with only:
  - `serverSelectionTimeoutMS: 10000`
- No explicit pool tuning options were found:
  - `maxPoolSize`
  - `minPoolSize`
  - `maxIdleTimeMS`
  - `waitQueueTimeoutMS`

Conclusion:

- Connection pool tuning is **not implemented** beyond basic connectivity timeout.
- Therefore pool-tuning improvement is **not experimentally validated**.

## 9. What Is Actually Proven

Proven by this report:

- Local order and payment flows are still functionally correct under repeated `k6` load.
- No errors were observed in the re-test.
- Operational monitoring primitives exist and were useful in AWS deployment troubleshooting.

Not proven by this report:

- Local latency improvement
- Retry improvement
- Rate-limit improvement
- Cache improvement
- Pool-tuning improvement
- Full monitoring/alerting workflow validation

## 10. Recommended Next Validation Plan

To fully prove the missing claims, run these as separate controlled experiments:

1. Retry validation:
   - add retry/backoff in inter-service HTTP calls
   - simulate temporary dependency failure
   - compare before/after error rate and recovery time

2. Rate-limit validation:
   - add gateway rate-limit middleware
   - drive burst traffic until protection starts
   - verify `429` behavior and system survival

3. Cache validation:
   - add cache to read-heavy endpoints
   - compare p95 latency and DB load before/after

4. Pool tuning validation:
   - add `maxPoolSize` / `minPoolSize`
   - rerun DB-heavy stress tests
   - compare timeout rate and p95 latency

5. Autoscaling validation on AWS:
   - run 3-5 minute high-load tests against public API gateway URL
   - capture ECS task count changes and CPU graphs
   - compare throughput and error rate against fixed 1-task behavior

## Final assessment

This codebase currently supports a valid claim for:

- functional load stability
- AWS deployment and ECS autoscaling setup
- basic operational monitoring

It does **not yet support a defensible claim** that retry, rate-limiting, cache, or connection-pool tuning improvements were fully implemented and experimentally proven.
