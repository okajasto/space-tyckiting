### Detailed documentation

Clients and servers communicate WebSockets (http://socket.io/).

Client send it's action to ´action´. Action message contains keys `type` and `data`. The only exception to this is the `skip` message, where `data` is optional.

```json
{
    "type": "move",
    "data": {
        "x": 0,
        "y": 1
    }
}
```

#### Server broadcasts to clients

* `start` Initial data of the game. This will be received after all bots have joined the game.

    ```json
        {
        "you": {
            "id": 0,
            "name": "Destroyer Bot",
            "team": "Havoc",
            "x": 3,
            "y": 5
        },
        "team": [
            {"id": 1, "name": "Terminator", "team": "Havoc", x: 14, y: 13},
            {"id": 2, "name": "Destructor", "team": "Havoc", x: 8, y: 25}
        ],
        "opponents": [
            {"id": 4, "team": "Solid", "name": "T-1"}
            {"id": 5, "team": "Solid", "name": "T-2"}
            {"id": 6, "team": "Solid", "name": "T-3"}
        ],
        "config": {
            "width": 28,
            "height": 28,
            "move": 2,
            "cannon": 1,
            "radar": 3
        }
    ```

    * `you` Information of your player. `id` is how you identify your player. The variables x and y are the location on a map.
    * `team` Information of your team players.
    * `opponents` List of other players. No location is for opponents are known.
    * `map` Size of the map in `[width, height]` format.

* `events` All bots receive events after each turn has been played. This message will tell what happened after your move.

    An example of a situation where you radared an area where player 1 is, and at the same time
    you have been hit.

    ```json
    {
        "type": "events",
        "data": [
            {
                "event": "round",
                "data": {
                    "roundId": 1
                }
            },
            {
                "event": "hit",
                "data": {
                    "hp": -1,
                    "id": 0
                    "name": "T-1",
                    "team": "Solid"
                }
            },
            {
                "event": "detected",
                "data": {
                    "id": 0
                }
            },
            {
                "event": "see",
                "data": {
                    "positions": [
                        {
                            "id": 1,
                            "name": "Terminator",
                            "team": "Havoc"
                            "x": 0,
                            "y": 1
                        }
                    ]
                }
            },
            {
                "event": "message",
                "data": {
                        "messageId": 78,
                        "source": {
                            "id": 1,
                            "name": "Terminator",
                            "team": "Havoc",
                        },
                        "message": "Hasta la vista, baby"
                    }
                }
            }
        ]
    }
    ```

    All possible events:

    * `round` The current number of the round. Increases with each game loop.

    * `hit` Bot has been hit. This might mean that you have been hit, or you hit another bot.

        `id` will identify the target of the damage. If you have been hit,
        the data will contain an additional `hp` value which will tell how many
        health points you lost. You won't receive the `hp` data when hitting others.

    * `die` Bot has died. This might mean that you died, or that you killed another bot.

    * `see` Results from radaring or seeing bots. You will never be included in this event.

    * `detected` You will be notified that you have been seen or radared.

    * `move` Your or one of your team bots new position after move action. Cannot move out of map.

    * `message` Messages from other bots.

* `end` Game has ended. Game ends when there are less than two bots alive.

    ```json
    {
        "winner": {
            "team": "Havoc"
        }
    }
    ```

    * `winner` Information about who won.


#### Client actions to server

Each message you send to the server can optionally contain `message` string in `data`. This will be broadcasted to other players.

**Before game loop**

* `join` Join the game

    ```json
        {"name": "Destroyer Bot", "team": "Team Havoc"}
    ```

    The name can contain any characters in *[A-Za-z0-9 ]*. The length must be between 1 - 15 characters.

**While game loop**

* `action` Perform an action. Only one action per round is allowed Possible action are `move`, `radar`, `cannon`

    * `Move` your bot to point **(x, y)**

        ```json
        {
            "type": "move",
            "data": {"x": 6, "y": 0}
        }
        ```

        Moving to the same point that you currently occupy has same effect as `skip`.

    * `radar` Radar an area centered at point **(x, y)**

        ```json
        {
            "type": "radar",
            "data": {"x": 3, "y": 3}
        }
        ```

    * `cannon` Cannon point **(x, y)**

        ```json
        {
            "type": "cannon",
            "data": {"x": 12, "y": 5}
        }
        ```


    * `skip` Skip your turn

        ```json
        {
            "type": "skip"
        }
        ```
* `message` Broadcast a message to all bots. This does not count as part of your action.
    *   ```json
        {
            "message": "Die!"
        }
        ```
