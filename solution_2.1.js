{
    init: function(elevators, floors) {
        floors[0].floorID = [];
        for(var i = 0; i < floors.length; ++i)
        {
            floors[0].floorID.push(0);
            let floor = floors[i];
            floor.on("up_button_pressed", function() {
                floors[0].floorID[floor.floorNum()] += 1;
            });
            floor.on("down_button_pressed", function() {
                floors[0].floorID[floor.floorNum()] += 1;
            });
        };

        for(var e = 0; e < elevators.length; ++e)
        {
            let elevator = elevators[e];
            elevator.issueCommand = function(floor, prioritize)
            {
                elevator.goToFloor(floor, prioritize);
                ++elevator.queue;
                floors[0].floorID[floor] = 0;
                elevator.idle = false;
            };
            elevator.queue = 0;
            elevator.idle = true;
            elevator.on("idle", function() {
                elevator.idle = true;
            });

            elevator.on("floor_button_pressed", function(floorNum) {
                elevator.issueCommand(floorNum, false);
            });

            elevator.on("passing_floor", function(floorNum, direction) {
                if(elevator.queue < 3 && floors[0].floorID[floorNum] > 0 && elevator.loadFactor() < .6)
                {
                    elevator.issueCommand(floorNum, true);
                }
            });

            elevator.on("stopped_at_floor", function(floorNum) {
                --elevator.queue;
                if(elevator.queue < 0) { elevator.queue = 0; }
                elevator.goingUpIndicator(true);
                elevator.goingDownIndicator(true);
                floors[0].floorID[floorNum] = 0;
            });
        };
    },
        update: function(dt, elevators, floors) {
            // We normally don't need to do anything here
            for(var e = 0; e < elevators.length; ++e)
            {
                let elevator = elevators[e];
                if(elevator.idle)
                {
                    /*let f = 0;
                for(var i = 1; i < floors.length; ++i)
                {
                    if(floors[0].floorID[i] > floors[0].floorID[f])
                    {
                        f = i;
                    }
                }
                elevator.issueCommand(f, false);
                */
                    let i = elevator.currentFloor() - 1;
                    let j = elevator.currentFloor() + 1;
                    while(i >= 0 || j <= floors.length - 1)
                    {
                        if(i == -1) { i = 0; }
                        if(j == floors.length) { j = floors.length - 1; }
                        if(floors[0].floorID[i] > 0 || floors[0].floorID[j] > 0)
                        {
                            if(floors[0].floorID[i] > 0 && floors[0].floorID[j] > 0)
                            {
                                if(floors[0].floorID[i] > floors[0].floorID[j])
                                {
                                    elevator.issueCommand(i, false);
                                }
                                else
                                {
                                    elevator.issueCommand(j, false);
                                }
                            }
                            else if(floors[0].floorID[i] == 1)
                            {
                                elevator.issueCommand(i, false);
                            }
                            else
                            {
                                elevator.issueCommand(j, false);
                            }
                            break;
                        }
                        --i;
                        ++j;
                    }
                }

                if(elevator.destinationDirection() == "up")
                {
                    elevator.goingDownIndicator(false);
                    elevator.goingUpIndicator(true);
                }
                else if(elevator.destinationDirection() == "down")
                {
                    elevator.goingDownIndicator(true);
                    elevator.goingUpIndicator(false);
                }
            }
        }
}
