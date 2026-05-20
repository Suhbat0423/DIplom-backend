#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AWS_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${AWS_DIR}/../.." && pwd)"

if [[ -f "${AWS_DIR}/services.env" ]]; then
  set -a
  source "${AWS_DIR}/services.env"
  set +a
fi

: "${AWS_REGION:?AWS_REGION is required}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${IMAGE_TAG:=latest}"
: "${IMAGE_PLATFORM:=linux/amd64}"

SERVICES=(
  "api-gateway"
  "user-service"
  "product-service"
  "store-service"
  "cart-service"
  "order-service"
  "payment-service"
)

aws ecr get-login-password --region "${AWS_REGION}" \
  | docker login --username AWS --password-stdin \
    "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

for service in "${SERVICES[@]}"; do
  repo_name="ecom/${service}"
  image_uri="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${repo_name}:${IMAGE_TAG}"
  service_dir="${REPO_ROOT}/services/${service}"

  echo "Ensuring ECR repository exists: ${repo_name}"
  aws ecr describe-repositories \
    --repository-names "${repo_name}" \
    --region "${AWS_REGION}" >/dev/null 2>&1 \
    || aws ecr create-repository \
      --repository-name "${repo_name}" \
      --image-scanning-configuration scanOnPush=true \
      --region "${AWS_REGION}" >/dev/null

  echo "Building and pushing image for platform ${IMAGE_PLATFORM}: ${image_uri}"
  docker buildx build \
    --platform "${IMAGE_PLATFORM}" \
    --tag "${image_uri}" \
    --push \
    "${service_dir}"
done

echo "All images built and pushed."
