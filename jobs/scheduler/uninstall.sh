#!/bin/zsh
set -e
DEST="$HOME/Library/LaunchAgents"
for name in com.nandish.jobs.ats com.nandish.jobs.daily com.nandish.jobs.google-window; do
    echo "Removing $name"
    launchctl bootout "gui/$(id -u)/$name" 2>/dev/null || true
    rm -f "$DEST/$name.plist"
done
echo "Done."
