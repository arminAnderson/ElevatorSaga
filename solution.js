{
    init: function(elevators, floors) {
        let fList = [];
        for(var i = 0; i < floors.length; ++i)
        {
            fList.push(0);
            let floor = floors[i];
            floor.on("up_button_pressed", function() {
                fList[floor.floorNum()] = 1;
                for(var i = 0; i < elevators.length; ++i)
                {
                    if(elevators[i].loadFactor() < .05)
                    {
                        elevators[i].issueOrder(floor.floorNum(), false);
                        break;
                    };
                };
            });
            floor.on("down_button_pressed", function() {
                fList[floor.floorNum()] = 1;
                for(var i = 0; i < elevators.length; ++i)
                {
                    if(elevators[i].loadFactor() < .05)
                    {
                        elevators[i].issueOrder(floor.floorNum(), false);
                        break;
                    };
                };
            });
        }

        for(var e = 0; e < elevators.length; ++e)
        {
            let elevator = elevators[e];
            elevator.issueOrder = function(f, m, s) {
                if((m && elevator.queue < 3) || elevator.queue < 2 || s != undefined)
                {
                    elevator.goToFloor(f, m);
                    fList[f] = 0;
                    ++elevator.queue;
                }
            };
            elevator.queue = 0;
            elevator.on("idle", function() {
                var i = elevator.currentFloor() - 1;
                var j = elevator.currentFloor() + 1;
                while(i >= 0 || j <= floors.length - 1)
                {
                    if(i == -1) { i = 0; }
                    if(j == floors.length) { j = floors.length - 1; }
                    if(fList[i] == 1 || fList[j] == 1)
                    {
                        if(fList[i] == 1 && fList[j] == 1)
                        {
                            elevator.issueOrder(j, false);
                        }
                        else if(fList[i] == 1)
                        {
                            elevator.issueOrder(i, false);
                        }
                        else
                        {
                            elevator.issueOrder(j, false);
                        }
                        break;
                    }
                    --i;
                    ++j;
                }
            });
            
            elevator.on("floor_button_pressed", function(floorNum) {
                var arr = elevator.getPressedFloors();
                var l = [];
                for(let i = 0; i < floors.length; ++i)
                {
                    l.push(0);
                }
                for(var i = 0; i < arr.length; ++i) {
                    ++l[arr[i]];
                }
                var f = 0;
                for(var i = 1; i < l.length; ++i)
                {
                    if(l[i] > l[f])
                    {
                        f = i;
                    }
                }
                elevator.issueOrder(f, true, true);
            });
            
            elevator.on("passing_floor", function(floorNum, direction) {
                if(elevator.loadFactor() < .7 && fList[floorNum] == 1 && elevator.lastFloor != floorNum)
                {
                    elevator.issueOrder(floorNum, true);
                };
            });
            
            elevator.on("stopped_at_floor", function(floorNum) {
                --elevator.queue;
            });
        };
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
