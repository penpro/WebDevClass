#!/usr/bin/env bash
#
# Zip the Lambda source for upload. The Node.js 20 runtime on AWS already
# includes the AWS SDK v3, so we don't need to bundle node_modules — the
# zip only contains index.js and package.json.
#
# Usage:
#   ./scripts/package-lambda.sh
#
# Produces: serverless-todo/lambda.zip
#
# Upload via the AWS CLI:
#   aws lambda update-function-code \
#     --function-name todos-handler \
#     --zip-file fileb://serverless-todo/lambda.zip
#
# Or upload through the Lambda console: "Upload from" -> ".zip file".

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
LAMBDA_DIR="$SCRIPT_DIR/../lambda"
OUT="$SCRIPT_DIR/../lambda.zip"

if [[ ! -d "$LAMBDA_DIR" ]]; then
  echo "Lambda dir not found at $LAMBDA_DIR" >&2
  exit 1
fi

cd "$LAMBDA_DIR"
rm -f "$OUT"
zip -r "$OUT" . -x "node_modules/*" "*.zip" ".gitignore"
echo "Wrote $OUT"
unzip -l "$OUT"
