#!/bin/bash

AI1=$1
AI2=$2
CANARY_BIN="/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
FIREFOX_BIN="/Applications/Firefox.app/Contents/MacOS/firefox"

killall node
killall firefox
killall "Google Chrome Canary"
node start-ai.js --ai="$1" --port 4000 & \
node start-ai.js --ai="$2" --port 5000 & \
"$CANARY_BIN" "http://localhost:4000" & \
"$FIREFOX_BIN" "http://localhost:5000" & \
node start-server.js
