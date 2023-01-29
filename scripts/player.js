const playerID = {
    human: "1",
    robot: "2"
}

const playerIDlist = ["1","2"];

const directions = {
    up: "up",
    down: "down",
    left: "left",
    right: "right",
}

//TODO: change the names to make more senses

const actions = {
    holding: "holding",
    notHolding: "not holding",
    lifting: "lifting",
    interact: "interact",
    wait: "wait"
}

const control = {
    up: directions.up,
    down: directions.down,
    left: directions.left,
    right: directions.right,
    interact: "interact",
    wait: "wait"
}


class Player{

    id;   //unique id (player# or ai#)
    type; //player or robot
    color;

    //
    str;     //[1,10]
    dex;     //[1,10]
    rewards;

    //Location
    loc; 

    direction; //up, down, left, right
    speed;     //# tile per sec
    action;    //
    hold_object; 
    level;    // optional: level of recursive

    constructor(id, type, color, str, dex, rewards, direction = directions.up, 
                speed = 1, action = actions.notHolding, hold_object=null, level=0){
        this.id = id;
        this.type = type;
        this.color = color;
        
        this.str = str;
        this.dex = dex;
        this.rewards = rewards;

        this.direction = direction;
        this.speed = speed;
        this.action = action;
        this.hold_object = hold_object
        this.level = level;
    }

}