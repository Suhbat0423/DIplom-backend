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
: "${USER_MONGODB_URI:?USER_MONGODB_URI is required}"
: "${PRODUCT_MONGODB_URI:?PRODUCT_MONGODB_URI is required}"
: "${STORE_MONGODB_URI:?STORE_MONGODB_URI is required}"
: "${CART_MONGODB_URI:?CART_MONGODB_URI is required}"
: "${ORDER_MONGODB_URI:?ORDER_MONGODB_URI is required}"
: "${PAYMENT_MONGODB_URI:?PAYMENT_MONGODB_URI is required}"
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

escape_sed_replacement() {
  printf '%s' "$1" | sed -e 's/[&|]/\\&/g'
}

AWS_ACCOUNT_ID_ESCAPED="$(escape_sed_replacement "${AWS_ACCOUNT_ID}")"
AWS_REGION_ESCAPED="$(escape_sed_replacement "${AWS_REGION}")"
IMAGE_TAG_ESCAPED="$(escape_sed_replacement "${IMAGE_TAG}")"
ECS_EXECUTION_ROLE_ARN_ESCAPED="$(escape_sed_replacement "${ECS_EXECUTION_ROLE_ARN}")"
ECS_TASK_ROLE_ARN_ESCAPED="$(escape_sed_replacement "${ECS_TASK_ROLE_ARN}")"
USER_MONGODB_URI_ESCAPED="$(escape_sed_replacement "${USER_MONGODB_URI}")"
PRODUCT_MONGODB_URI_ESCAPED="$(escape_sed_replacement "${PRODUCT_MONGODB_URI}")"
STORE_MONGODB_URI_ESCAPED="$(escape_sed_replacement "${STORE_MONGODB_URI}")"
CART_MONGODB_URI_ESCAPED="$(escape_sed_replacement "${CART_MONGODB_URI}")"
ORDER_MONGODB_URI_ESCAPED="$(escape_sed_replacement "${ORDER_MONGODB_URI}")"
PAYMENT_MONGODB_URI_ESCAPED="$(escape_sed_replacement "${PAYMENT_MONGODB_URI}")"
JWT_SECRET_ESCAPED="$(escape_sed_replacement "${JWT_SECRET}")"
INTERNAL_API_KEY_ESCAPED="$(escape_sed_replacement "${INTERNAL_API_KEY}")"
USER_SERVICE_URL_ESCAPED="$(escape_sed_replacement "${USER_SERVICE_URL}")"
PRODUCT_SERVICE_URL_ESCAPED="$(escape_sed_replacement "${PRODUCT_SERVICE_URL}")"
STORE_SERVICE_URL_ESCAPED="$(escape_sed_replacement "${STORE_SERVICE_URL}")"
CART_SERVICE_URL_ESCAPED="$(escape_sed_replacement "${CART_SERVICE_URL}")"
ORDER_SERVICE_URL_ESCAPED="$(escape_sed_replacement "${ORDER_SERVICE_URL}")"
PAYMENT_SERVICE_URL_ESCAPED="$(escape_sed_replacement "${PAYMENT_SERVICE_URL}")"

for template in "${TEMPLATE_DIR}"/*.json; do
  output="${TMP_DIR}/$(basename "${template}")"

  sed \
    -e "s|__AWS_ACCOUNT_ID__|${AWS_ACCOUNT_ID_ESCAPED}|g" \
    -e "s|__AWS_REGION__|${AWS_REGION_ESCAPED}|g" \
    -e "s|__IMAGE_TAG__|${IMAGE_TAG_ESCAPED}|g" \
    -e "s|__ECS_EXECUTION_ROLE_ARN__|${ECS_EXECUTION_ROLE_ARN_ESCAPED}|g" \
    -e "s|__ECS_TASK_ROLE_ARN__|${ECS_TASK_ROLE_ARN_ESCAPED}|g" \
    -e "s|__USER_MONGODB_URI__|${USER_MONGODB_URI_ESCAPED}|g" \
    -e "s|__PRODUCT_MONGODB_URI__|${PRODUCT_MONGODB_URI_ESCAPED}|g" \
    -e "s|__STORE_MONGODB_URI__|${STORE_MONGODB_URI_ESCAPED}|g" \
    -e "s|__CART_MONGODB_URI__|${CART_MONGODB_URI_ESCAPED}|g" \
    -e "s|__ORDER_MONGODB_URI__|${ORDER_MONGODB_URI_ESCAPED}|g" \
    -e "s|__PAYMENT_MONGODB_URI__|${PAYMENT_MONGODB_URI_ESCAPED}|g" \
    -e "s|__JWT_SECRET__|${JWT_SECRET_ESCAPED}|g" \
    -e "s|__INTERNAL_API_KEY__|${INTERNAL_API_KEY_ESCAPED}|g" \
    -e "s|__USER_SERVICE_URL__|${USER_SERVICE_URL_ESCAPED}|g" \
    -e "s|__PRODUCT_SERVICE_URL__|${PRODUCT_SERVICE_URL_ESCAPED}|g" \
    -e "s|__STORE_SERVICE_URL__|${STORE_SERVICE_URL_ESCAPED}|g" \
    -e "s|__CART_SERVICE_URL__|${CART_SERVICE_URL_ESCAPED}|g" \
    -e "s|__ORDER_SERVICE_URL__|${ORDER_SERVICE_URL_ESCAPED}|g" \
    -e "s|__PAYMENT_SERVICE_URL__|${PAYMENT_SERVICE_URL_ESCAPED}|g" \
    "${template}" > "${output}"

  echo "Registering task definition: $(basename "${template}")"
  aws ecs register-task-definition \
    --cli-input-json "file://${output}" \
    --region "${AWS_REGION}" >/dev/null
done

echo "All task definitions registered."
