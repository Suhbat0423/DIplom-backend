# AWS Autoscaling Validation Attempt

Date: 2026-05-19  
Target URL: `http://16.16.122.162:8080`
Test script: `load-tests/orders-stress.k6.js`

## Result

The stress test has not yet completed successfully.

Three attempts were made:

### Attempt 1

The failure happened during the `setup()` login step:

```text
Post "http://16.16.122.162:8080/api/auth/login": dial: i/o timeout
```

This was caused by missing inbound access to port `8080`.

### Attempt 2

After opening inbound `TCP 8080`, the gateway became reachable, but the login step still failed:

```text
Login failed: 503 no healthy upstream
```

### Attempt 3

After fixing Atlas network access and redeploying services, the gateway and upstream became reachable, but the AWS environment did not contain the expected test account:

```text
Login failed: 500 {"message":"User not found"}
```

## What this means

- The public API gateway IP is now reachable.
- The API gateway can now reach its upstream service.
- The current blocker is no longer networking or service discovery.
- The AWS environment is missing the `k6user@example.com` user needed by the `k6` setup login step.
- Because login failed in `setup()`, no load traffic was generated.
- Autoscaling behavior still could not be validated from this run.

## Most likely causes

1. The AWS database does not contain the required test user.
2. The test email/password used by `k6` does not match a real account in the AWS environment.

## Required checks before retry

1. Confirm `user-service` is `1/1 Running`.
2. Confirm `api-gateway` still shows `1/1 Running`.
3. Create a real AWS test user through the public auth endpoint.
4. Call the gateway health endpoint manually:

```bash
curl -i http://16.16.122.162:8080/health
```

Expected result:

```json
{"status":"OK","service":"api-gateway"}
```

5. Then call login through gateway manually:

```bash
curl -i -X POST http://16.16.122.162:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"k6user@example.com","password":"password123"}'
```

If this returns `500 {"message":"User not found"}`, create the user first and rerun the test.

If it returns `503 no healthy upstream`, the next place to check is:

- `api-gateway` service logs
- `user-service` service status and logs
- Service Connect mapping for `user-service`

## Output reference

The failed run output was captured in:

- `load-tests/results/aws-autoscaling-validation-2026-05-19/orders-stress.log`
