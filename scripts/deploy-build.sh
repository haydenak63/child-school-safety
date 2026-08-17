#!/usr/bin/env bash
# Installs an uploaded next-build.tar.gz as the live .next directory.
# Run from the application root (~/halo) after uploading the archive there.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f next-build.tar.gz ]; then
  echo "next-build.tar.gz not found in $(pwd)" >&2
  echo "Build it on Windows with: npm run package:build" >&2
  exit 1
fi

# Archives produced by PowerShell's Compress-Archive used to extract as
# read-only directories, so make any leftover tree writable before removing it.
purge() {
  if [ -e "$1" ]; then
    chmod -R u+rwX "$1" 2>/dev/null || true
    rm -rf "$1"
  fi
}

purge next-build
tar -xzf next-build.tar.gz

if [ ! -f next-build/BUILD_ID ]; then
  echo "Unpacked archive is missing BUILD_ID; refusing to swap it in." >&2
  purge next-build
  exit 1
fi

purge .next
mv next-build .next
rm -f next-build.tar.gz next-build.zip

echo "Installed build $(cat .next/BUILD_ID)"
echo "Now restart the Node.js app from cPanel."
