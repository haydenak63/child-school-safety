#!/usr/bin/env bash
# Installs an uploaded next-build.zip as the live .next directory.
# Run from the application root (~/halo) after uploading the zip there.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f next-build.zip ]; then
  echo "next-build.zip not found in $(pwd)" >&2
  exit 1
fi

rm -rf next-build
unzip -q -o next-build.zip

if [ ! -f next-build/BUILD_ID ]; then
  echo "Unpacked archive is missing BUILD_ID; refusing to swap it in." >&2
  exit 1
fi

rm -rf .next
mv next-build .next
rm -f next-build.zip

echo "Installed build $(cat .next/BUILD_ID)"
echo "Now restart the Node.js app from cPanel."
