#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AWS_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATE_DIR="${AWS_DIR}/task-definitions"

if [[ -f "${AWS_DIR}/services.env" ]]; then
  set -a
  source "${AWS_DIR}/services.env"
  set +a
fi

: "${AWS_REGION:?AWS_REGION is required}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${ECS_EXECUTION_ROLE_ARN:?ECS_EXECUTION_ROLE_ARN is required}"
: "${ECS_TASK_ROLE_ARN:?ECS_TASK_ROLE_ARN is required}"
: "${MONGODB_URI:?MONGODB_URI is required}"
: "${JWT_SECRET:?JWT_SECRET is required}"
: "${INTERNAL_API_KEY:?INTERNAL_API_KEY is required}"
: "${IMAGE_TAG:=latest}"
: "${USER_SERVICE_URL:=http://user-service:3001}"
: "${PRODUCT_SERVICE_URL:=http://product-service:3002}"
: "${STORE_SERVICE_URL:=http://store-service:3003}"
: "${CART_SERVICE_URL:=http://cart-service:3004}"
: "${ORDER_SERVICE_URL:=http://order-service:3005}"
: "${PAYMENT_SERVICE_URL:=http://payment-service:3006}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

for template in "${TEMPLATE_DIR}"/*.json; do
  output="${TMP_DIR}/$(basename "${template}")"

  sed \
    -e "s|__AWS_ACCOUNT_ID__|${AWS_ACCOUNT_ID}|g" \
    -e "s|__AWS_REGION__|${AWS_REGION}|g" \
    -e "s|__IMAGE_TAG__|${IMAGE_TAG}|g" \
    -e "s|__ECS_EXECUTION_ROLE_ARN__|${ECS_EXECUTION_ROLE_ARN}|g" \
    -e "s|__ECS_TASK_ROLE_ARN__|${ECS_TASK_ROLE_ARN}|g" \
    -e "s|__MONGODB_URI__|${MONGODB_URI}|g" \
    -e "s|__JWT_SECRET__|${JWT_SECRET}|g" \
    -e "s|__INTERNAL_API_KEY__|${INTERNAL_API_KEY}|g" \
    -e "s|__USER_SERVICE_URL__|${USER_SERVICE_URL}|g" \
    -e "s|__PRODUCT_SERVICE_URL__|${PRODUCT_SERVICE_URL}|g" \
    -e "s|__STORE_SERVICE_URL__|${STORE_SERVICE_URL}|g" \
    -e "s|__CART_SERVICE_URL__|${CART_SERVICE_URL}|g" \
    -e "s|__ORDER_SERVICE_URL__|${ORDER_SERVICE_URL}|g" \
    -e "s|__PAYMENT_SERVICE_URL__|${PAYMENT_SERVICE_URL}|g" \
    "${template}" > "${output}"

  echo "Registering task definition: $(basename "${template}")"
  aws ecs register-task-definition \
    --cli-input-json "file://${output}" \
    --region "${AWS_REGION}" >/dev/null
done

echo "All task definitions registered."
