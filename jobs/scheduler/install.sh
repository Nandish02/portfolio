#!/bin/zsh
# Install all three launchd jobs into ~/Library/LaunchAgents and bootstrap them.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/Library/LaunchAgents"
mkdir -p "$DEST"

for plist in "$HERE/launchd/"com.nandish.jobs.*.plist; do
    name=$(basename "$plist")
    echo "Installing $name -> $DEST/$name"
    cp "$plist" "$DEST/$name"
    # Stop if already running, then load fresh
    launchctl bootout "gui/$(id -u)/${name%.plist}" 2>/dev/null || true
    launchctl bootstrap "gui/$(id -u)" "$DEST/$name"
    launchctl enable "gui/$(id -u)/${name%.plist}"
done

echo
echo "Installed launch agents:"
launchctl list | grep com.nandish.jobs || true
echo
echo "To uninstall later, run:  ./scheduler/uninstall.sh"
