#!/bin/bash

GAME_NUMBER=$1
TIME_SCALE=$2
COMMAND=$(find logs -type f -a -regex "logs/$GAME_NUMBER.*")
if [[ $GAME_NUMBER == "latest" ]]; then
    COMMAND="logs/$(ls -1t logs | head -1)"
fi

cp "$COMMAND" visual.json

echo "Visualizing $COMMAND"
./space-tyckiting.app/Contents/MacOS/space-tyckiting --args path=visual.json timescale=$TIME_SCALE
