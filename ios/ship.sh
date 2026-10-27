#!/usr/bin/env bash
# Bump build number, regenerate the project, archive, and upload to TestFlight.
# Uses the Apple account signed into Xcode (Settings → Accounts); no secrets here.
set -euo pipefail
cd "$(dirname "$0")"

current=$(grep -E '^\s*CURRENT_PROJECT_VERSION:' project.yml | grep -oE '[0-9]+')
next=$((current + 1))
sed -i '' "s/CURRENT_PROJECT_VERSION: \"$current\"/CURRENT_PROJECT_VERSION: \"$next\"/" project.yml
echo "build $current → $next"

xcodegen generate >/dev/null
rm -rf build/Gym321.xcarchive build/export
xcodebuild -project Gym321.xcodeproj -scheme Gym321 \
  -destination 'generic/platform=iOS' -configuration Release \
  -archivePath build/Gym321.xcarchive -allowProvisioningUpdates archive \
  | grep -E 'error:|ARCHIVE (SUCCEEDED|FAILED)'
xcodebuild -exportArchive -archivePath build/Gym321.xcarchive \
  -exportOptionsPlist ExportOptions.plist -exportPath build/export -allowProvisioningUpdates \
  | grep -E 'error:|Upload succeeded|EXPORT (SUCCEEDED|FAILED)'
