#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AWS_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ -f "${AWS_DIR}/services.env" ]]; then
  set -a
  source "${AWS_DIR}/services.env"
  set +a
fi

: "${AWS_REGION:?AWS_REGION is required}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${ECS_CLUSTER_NAME:?ECS_CLUSTER_NAME is required}"

register_scaling() {
  local service_name="$1"
  local min_capacity="$2"
  local max_capacity="$3"
  local target_cpu="$4"

  local resource_id="service/${ECS_CLUSTER_NAME}/${service_name}"
  local policy_name="${service_name}-cpu-target-tracking"

  echo "Registering scalable target for ${service_name}"
  aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id "${resource_id}" \
    --min-capacity "${min_capacity}" \
    --max-capacity "${max_capacity}" \
    --region "${AWS_REGION}" >/dev/null

  echo "Putting scaling policy for ${service_name}"
  aws application-autoscaling put-scaling-policy \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id "${resource_id}" \
    --policy-name "${policy_name}" \
    --policy-type TargetTrackingScaling \
    --target-tracking-scaling-policy-configuration \
      "TargetValue=${target_cpu},PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},ScaleInCooldown=60,ScaleOutCooldown=60" \
    --region "${AWS_REGION}" >/dev/null
}

register_scaling \
  "${API_GATEWAY_SERVICE_NAME:-api-gateway}" \
  "${API_GATEWAY_MIN_CAPACITY:-1}" \
  "${API_GATEWAY_MAX_CAPACITY:-4}" \
  "${API_GATEWAY_TARGET_CPU:-60}"

register_scaling \
  "${PRODUCT_SERVICE_NAME:-product-service}" \
  "${PRODUCT_SERVICE_MIN_CAPACITY:-1}" \
  "${PRODUCT_SERVICE_MAX_CAPACITY:-4}" \
  "${PRODUCT_SERVICE_TARGET_CPU:-60}"

register_scaling \
  "${CART_SERVICE_NAME:-cart-service}" \
  "${CART_SERVICE_MIN_CAPACITY:-1}" \
  "${CART_SERVICE_MAX_CAPACITY:-4}" \
  "${CART_SERVICE_TARGET_CPU:-60}"

register_scaling \
  "${ORDER_SERVICE_NAME:-order-service}" \
  "${ORDER_SERVICE_MIN_CAPACITY:-1}" \
  "${ORDER_SERVICE_MAX_CAPACITY:-4}" \
  "${ORDER_SERVICE_TARGET_CPU:-60}"

register_scaling \
  "${PAYMENT_SERVICE_NAME:-payment-service}" \
  "${PAYMENT_SERVICE_MIN_CAPACITY:-1}" \
  "${PAYMENT_SERVICE_MAX_CAPACITY:-4}" \
  "${PAYMENT_SERVICE_TARGET_CPU:-60}"

echo "Autoscaling configured."
