# Order Load Test Report

Date: 2026-05-18
Target: `http://localhost:8080/api/orders`
Script: `load-tests/orders.k6.js`
Test account: `k6user@example.com`

## Test Setup

- Backend entry point: `api-gateway` on `localhost:8080`
- Test flow: login once in `setup()`, then authenticated order creation
- Threshold targets:
  - `http_req_failed < 5%`
  - `p(95) < 1500ms`

## Results Summary

| Scenario | Iterations | HTTP Reqs | Avg Latency | P95 Latency | Max Latency | Error Rate | Throughput |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `VUS=10 DURATION=30s` | 300 | 301 | 22.48 ms | 38.32 ms | 91.48 ms | 0.00% | 9.77 req/s |
| `VUS=30 DURATION=1m` | 1770 | 1771 | 18.42 ms | 44.42 ms | 91.93 ms | 0.00% | 29.39 req/s |
| `VUS=50 DURATION=1m` | 2951 | 2952 | 22.18 ms | 51.50 ms | 135.40 ms | 0.00% | 48.46 req/s |

## Interpretation

- All three runs completed without HTTP failures.
- The `p95` latency stayed far below the `1500ms` threshold in every run.
- The system remained stable up to `50` concurrent virtual users in this local environment.
- Throughput increased nearly linearly as VUS increased from `10` to `50`.
- No immediate bottleneck was visible in the tested `order creation` flow.

## Saved Artifacts

- `load-tests/results/orders-10vus-30s.log`
- `load-tests/results/orders-10vus-30s-summary.json`
- `load-tests/results/orders-30vus-1m.log`
- `load-tests/results/orders-30vus-1m-summary.json`
- `load-tests/results/orders-50vus-1m.log`
- `load-tests/results/orders-50vus-1m-summary.json`

## Notes

- The running Docker containers currently use the already-built runtime image. If application code changes were made after the containers were started, rerun the containers with rebuild before treating these numbers as final.
- `store-service` was reported as unhealthy in `docker compose ps`, but the `order` load test still completed because the tested flow went through `api-gateway`, `user-service`, `order-service`, and MongoDB successfully.
