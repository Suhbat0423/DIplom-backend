# Load Tests

These `k6` scripts test the heaviest write flows in this backend:

- `orders.k6.js`: authenticated order creation
- `payments.k6.js`: order creation + payment creation + payment confirmation
- `orders-stress.k6.js`: no-sleep staged stress test for order creation
- `payments-stress.k6.js`: no-sleep staged stress test for the full payment flow

## Requirements

- all backend services are running
- MongoDB is running
- API gateway is reachable, usually at `http://localhost:8080`
- a buyer test account already exists in `user-service`

## Required environment variables

```bash
export TEST_EMAIL="buyer@example.com"
export TEST_PASSWORD="password123"
```

Optional:

```bash
export BASE_URL="http://localhost:8080"
export VUS="20"
export DURATION="1m"
export STORE_ID="load-store-1"
export ITEM_PRICE="25000"
export ITEM_QUANTITY="1"
export DELIVERY_FEE="5000"
export TAX="0"
```

## Run order load test

```bash
k6 run load-tests/orders.k6.js
```

## Run payment load test

```bash
k6 run load-tests/payments.k6.js
```

## Run harder stress tests

```bash
k6 run load-tests/orders-stress.k6.js
k6 run load-tests/payments-stress.k6.js
```

You can also override stage targets:

```bash
STAGE_1_TARGET=20 STAGE_2_TARGET=50 STAGE_3_TARGET=100 STAGE_4_TARGET=150 \
k6 run load-tests/orders-stress.k6.js
```

## What to watch during the test

- k6 output: `http_req_duration`, `http_req_failed`, iteration rate
- app containers: `docker stats`
- MongoDB: CPU, memory, connections, slow queries

Recommended progression:

1. `VUS=10 DURATION=30s`
2. `VUS=30 DURATION=1m`
3. `VUS=50 DURATION=1m`
4. `VUS=100 DURATION=1m`

When latency rises sharply or errors begin increasing, you are close to the
single-database limit of the current setup.
