# Stress Test Suite Report

Date: 2026-05-18
Target: `http://localhost:8080`
Test account: `k6user@example.com`

## Executed Tests

- `payments-stress.k6.js`
- `cart-stress.k6.js`
- `gateway-stress.k6.js`
- `db-saturation-stress.k6.js`

## Summary Table

| Test | Max VUs | Iterations | HTTP Reqs | Avg Latency | P95 Latency | Max Latency | Error Rate | Result |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `payments-stress.k6.js` | 75 | 23848 | 71543 | 61.22 ms | 172.27 ms | 320.29 ms | 0.0014% | Mostly stable, but business-key collision observed |
| `cart-stress.k6.js` | 150 | 27668 | 83005 | 106.33 ms | 270.00 ms | 524.31 ms | 29.94% | Failed under stress |
| `gateway-stress.k6.js` | 175 | 10955 | 10956 | 1058.21 ms | 6258.53 ms | 8785.73 ms | 0.00% | High latency under stress |
| `db-saturation-stress.k6.js` | 200 | 1845 | 7381 | 1725.37 ms | 10003.19 ms | 10244.85 ms | 12.21% | DB saturation symptoms observed |

## Key Findings

### 1. Payment Flow

- The full payment flow stayed relatively fast even at `75` VUs.
- A duplicate key failure was observed during stress execution:
  - `E11000 duplicate key error collection: db_orders.orders index: orderNumber_1`
- This indicates a concurrency issue in `orderNumber` generation, not just raw performance slowdown.

### 2. Cart Stress

- Cart writes scaled to a high request count, but the test crossed the stress threshold.
- Error rate rose to about `29.94%`, which is too high for a stable production workload.
- This suggests the cart flow, gateway, or backing database begins to fail under sustained heavy write pressure.

### 3. Gateway Stress

- Error rate remained `0%`, so requests still completed.
- However, latency became very high:
  - average about `1058 ms`
  - p95 about `6259 ms`
  - max about `8786 ms`
- This means the gateway path stays available, but becomes slow under mixed high traffic.

### 4. DB Saturation Stress

- This test produced the strongest saturation signal.
- p95 latency exceeded `10 seconds`.
- Error rate reached about `12.21%`.
- During execution, repeated `EOF` request failures were observed on `POST /api/cart/items`.
- This strongly suggests the current single-database setup becomes a bottleneck under combined write-heavy traffic.

## Interpretation

- `payments-stress.k6.js` shows the application logic is mostly fast, but concurrency-safe ID generation still needs fixing.
- `cart-stress.k6.js` shows cart write operations are one of the first areas to degrade under heavy load.
- `gateway-stress.k6.js` shows the API gateway remains reachable, but latency rises sharply when many proxied routes are mixed together.
- `db-saturation-stress.k6.js` shows the clearest evidence that the current MongoDB setup is the main scalability limit.

## Recommended Improvements

- Fix `orderNumber` generation so it is unique under concurrency.
- Add or review MongoDB indexes for hot write and lookup paths.
- Investigate cart write patterns and reduce unnecessary writes where possible.
- Consider separating databases per service if you want stronger isolation.
- Use autoscaling for `api-gateway`, `cart-service`, `order-service`, and `payment-service`, but note that autoscaling alone will not solve database saturation.
- If production-level scale is required, move from a single MongoDB deployment to a more scalable database setup.

## Saved Artifacts

- `payments-stress.log`
- `payments-stress-summary.json`
- `cart-stress.log`
- `cart-stress-summary.json`
- `gateway-stress.log`
- `gateway-stress-summary.json`
- `db-saturation-stress.log`
- `db-saturation-stress-summary.json`
