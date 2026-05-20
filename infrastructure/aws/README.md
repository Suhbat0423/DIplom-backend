# AWS ECS/ECR Scaffold

This folder provides a practical starting point for deploying the backend
microservices to AWS with:

- Amazon ECR
- Amazon ECS
- ECS Service Auto Scaling

It is designed for the current backend structure in this repository:

- `api-gateway`
- `user-service`
- `product-service`
- `store-service`
- `cart-service`
- `order-service`
- `payment-service`

## Scope

These files help you set up:

1. ECR repositories
2. Docker image build and push
3. ECS task definition registration
4. ECS Service Auto Scaling for the busiest services

These files do not create your VPC, subnets, load balancer, security groups,
or MongoDB instance. Those remain AWS environment prerequisites.

## Assumptions

- You use AWS CLI v2 and Docker locally.
- You already have:
  - an ECS cluster
  - ECS execution role
  - ECS task role
  - subnets and security groups
  - a reachable MongoDB connection string
- Services communicate over service DNS names inside ECS service discovery or
  other internal networking you define.

## Recommended service names

- `api-gateway`
- `user-service`
- `product-service`
- `store-service`
- `cart-service`
- `order-service`
- `payment-service`

## Files

- `services.env.example`
  - environment variables you should copy and fill in before running scripts
- `scripts/build-and-push.sh`
  - creates ECR repos if needed, then builds and pushes images
- `scripts/register-task-definitions.sh`
  - registers ECS task definitions from the JSON templates
- `scripts/configure-autoscaling.sh`
  - enables ECS Service Auto Scaling for selected services
- `task-definitions/*.json`
  - ECS task definition templates for each backend service

## Suggested order

1. Copy `services.env.example` to `services.env`
2. Fill in your AWS account, region, cluster, MongoDB URI, roles, and subnet data
3. Build and push images
4. Register task definitions
5. Create ECS services in AWS Console or AWS CLI using the registered task definitions
6. Run the autoscaling script

## Example

```bash
cd ecom-back-end/infrastructure/aws
cp services.env.example services.env

# edit services.env first

set -a
source services.env
set +a

./scripts/build-and-push.sh
./scripts/register-task-definitions.sh
./scripts/configure-autoscaling.sh
```

## Notes for this project

- `api-gateway` should usually be the public-facing ECS service.
- `api-gateway` should point to internal service URLs such as:
  - `http://user-service:3001`
  - `http://product-service:3002`
  - `http://store-service:3003`
  - `http://cart-service:3004`
  - `http://order-service:3005`
  - `http://payment-service:3006`
- All services already expose `/health`, so those routes can be used by ECS or
  load balancer health checks.
- Each backend service can use its own MongoDB connection string through:
  - `USER_MONGODB_URI`
  - `PRODUCT_MONGODB_URI`
  - `STORE_MONGODB_URI`
  - `CART_MONGODB_URI`
  - `ORDER_MONGODB_URI`
  - `PAYMENT_MONGODB_URI`
- This allows either separate databases inside one cluster or fully separate
  MongoDB clusters per service.

## Autoscaling defaults

The autoscaling script targets the services that are most likely to receive
traffic spikes:

- `api-gateway`
- `product-service`
- `cart-service`
- `order-service`
- `payment-service`

Default settings in the script:

- minimum tasks: `1`
- maximum tasks: `4`
- target CPU utilization: `60%`

Adjust these for your budget and workload.
