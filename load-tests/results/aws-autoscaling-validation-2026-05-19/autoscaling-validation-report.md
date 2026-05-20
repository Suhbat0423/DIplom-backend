# AWS Autoscaling Validation Report

Date: 2026-05-19  
Target gateway: `http://16.16.122.162:8080`  
Script: `load-tests/orders-stress.k6.js`

## Test profile

- `STAGE_1_TARGET=30`
- `STAGE_2_TARGET=60`
- `STAGE_3_TARGET=100`
- `STAGE_4_TARGET=150`
- Total runtime: about `2m20s`

## Preconditions resolved before successful run

Before the successful run, the following blockers were fixed:

- inbound `TCP 8080` access was opened on the ECS security group
- MongoDB Atlas network access was opened for ECS traffic
- the AWS test user `k6user@example.com` was created
- broken MongoDB URI substitution in ECS task definitions was fixed
- `linux/amd64` images were rebuilt and pushed for ECS

## Successful result

The stress test completed successfully and passed its configured thresholds.

### Thresholds

- `http_req_duration p(95)<3000` -> **PASS**
- `http_req_failed rate<0.10` -> **PASS**

### Main metrics

- Total HTTP requests: `6071`
- Iterations: `6070`
- Average throughput: `43.03 req/s`
- Average latency: `1.57s`
- Median latency: `1.47s`
- `p90`: `2.42s`
- `p95`: `2.77s`
- Max latency: `10.5s`
- HTTP failure rate: `0.37%` (`23 / 6071`)
- Max virtual users reached: `150`

### Functional checks

- `login status is 200` -> pass
- `login returned token` -> pass
- `order create status is 201` -> `6047` pass, `23` fail
- `order create returned id` -> `6047` pass, `23` fail
- Total checks passed: `12096 / 12142` (`99.62%`)

## Interpretation

This run proves the following:

- The AWS deployment is externally reachable through the public API gateway.
- The user, gateway, and order flow can handle staged concurrent load up to `150` virtual users.
- The system remained mostly stable under stress.
- The configured stress thresholds were met.

This run suggests autoscaling readiness, but does **not by itself fully prove scale-out events** unless you also captured ECS task-count or CloudWatch CPU screenshots during the run.

## What can be honestly claimed from this run

You can claim:

- staged AWS stress testing was completed successfully
- the deployed system sustained `150` VUs with low error rate
- the system passed the configured latency and failure thresholds
- the AWS environment is now operational end-to-end for the tested order flow

You should be careful not to overclaim:

- this file alone does not prove the exact number of scale-out events
- proving autoscaling visually still requires:
  - ECS service task-count screenshots, or
  - CloudWatch CPU + scaling activity screenshots

## Suggested evidence to capture next

For a complete autoscaling claim, capture these during a rerun:

1. ECS service showing task count before the test
2. ECS service showing increased running task count during the test
3. ECS service auto scaling activity panel
4. CloudWatch CPU graph for one scaled service such as `order-service`

## Files

- `load-tests/results/aws-autoscaling-validation-2026-05-19/orders-stress-summary.json`
- `load-tests/results/aws-autoscaling-validation-2026-05-19/orders-stress.log`
- `load-tests/results/aws-autoscaling-validation-2026-05-19/orders-stress-attempt-report.md`
