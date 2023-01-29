//Declare maps, objects, and players here 
// id has to be unique

//Special Symbol
const stringToObject = {
    ".":"floor",
    "#":"wall",
    " ":"outside"
}

const typeToColor = {
    "a":"lightblue",
    "b":"lightpink",
    "c":"lightgreen",
    "d":"purple",
    "obstacle": "brown"
}

// Default 11 x 11 map but 9 x 9 space
let map00 = [["#","#","#","#","#","#","#","#","#","#","#"],
            ["#",".",".",".",".",".",".",".",".",".","#"],
            ["#",".",".",".",".",".",".",".",".",".","#"],
            ["#",".",".",".",".",".",".",".",".",".","#"],
            ["#",".",".",".",".",".",".",".",".",".","#"],
            ["#",".",".",".",".",".",".",".",".",".","#"],
            ["#",".",".",".",".",".",".",".",".",".","#"],
            ["#",".",".",".",".",".",".",".",".",".","#"],
            ["#",".",".",".",".",".",".",".",".",".","#"],
            ["#",".",".",".",".",".",".",".",".",".","#"],
            ["#","#","#","#","#","#","#","#","#","#","#"]];

// Default 11 x 11 map but 7 x 7 space
let map01 = [[" "," "," "," "," "," "," "," "," "," "," "],
            [" ","#","#","#","#","#","#","#","#","#"," "],
            [" ","#",".",".",".",".",".",".",".","#"," "],
            [" ","#",".",".",".",".",".",".",".","#"," "],
            [" ","#",".",".",".",".",".",".",".","#"," "],
            [" ","#",".",".",".",".",".",".",".","#"," "],
            [" ","#",".",".",".",".",".",".",".","#"," "],
            [" ","#",".",".",".",".",".",".",".","#"," "],
            [" ","#",".",".",".",".",".",".",".","#"," "],
            [" ","#","#","#","#","#","#","#","#","#"," "],
            [" "," "," "," "," "," "," "," "," "," "," "]];

function generateObjects(map){
    let objects = [];
    for(let i =0;i < map.length; i++){
        for(let j = 0; j< map[i].length; j++){
            let temp = map[i][j].split(":");
            if(temp[0] in reward){
                const temp_obj = new GameObject(id = map[i][j], type = temp[0], isObstacle = false, 
                                                shape = "square", weight = Number(temp[1]), fragility = Number(temp[2]));
                objects.push(temp_obj);
            }else if(temp[0] === "@"){
                const temp_obj = new GameObject(id = map[i][j], type = "obstacle", isObstacle = true, 
                                                shape = "circle", weight = Number(temp[1]), fragility = Number(temp[2]));
                objects.push(temp_obj);
            }
        }
    }
    return(objects);
}

// --- Location Declaration ---//
// unique id and align with the object class
// id pattern = [A-Z][0-9], the number represents count
// TODO: change this into function like object
let loc_A1 = new Location(id = "A1", type="a");
let loc_B1 = new Location(id= "B1", type = "b");
let loc_C1 = new Location(id= "C1", type = "c");
let loc_D1 = new Location(id= "D1", type = "d");

let loc_A2 = new Location(id = "A2", type="a");
let loc_B2 = new Location(id = "B2", type = "b");

let loc_list = [loc_A1, loc_A2, loc_B1, loc_B2, loc_C1, loc_D1];

// Player Declaration //
let reward = {"a": 5, "b":10, "c":15, "d":20}

let player1 = new Player(id = playerID.human, type = "player", color ="blue", str = 5, dex = 9,
    rewards = reward);
let robot1 = new Player(id = playerID.robot, type = "robot", color = "red", str = 8, dex = 4,
    rewards = reward, level = "0.5");


let player_list = [player1, robot1];

// A game stage includes a map, obj list, player, location, goal condition, collected
// TODO: Maintain a separate list of objs, locs, players outside of GameState ??


class GameState {

    map;
    objs;
    agents;
    loc; 
    goal;
    collected;
    policy;

    constructor(map, agents, loc, goal = 1, collected=[], policy = null){
        this.map = map;
        this.objs = generateObjects(map);
        this.agents = agents;
        this.loc = loc;
        this.goal = goal;
        this.collected = collected;
        this.policy = policy;
    }
}

// --- Map Declaration --- //
/// For the object, the format is type:weight:fragirity:optional_id

/// Tutorial (Alone) //
let map_tutorial1 = [[" "," "," ","#","#","#"  ,"#","#"," "," "," "],
                     [" "," "," ","#",".","a:1:1",".","#"," "," "," "],
                     [" "," "," ","#",".","."  ,".","#"," "," "," "],
                     [" "," "," ","#",".","."  ,".","#"," "," "," "],
                     [" "," "," ","#",".","."  ,".","#"," "," "," "],
                     [" "," "," ","#",".","1"  ,".","#"," "," "," "],
                     [" "," "," ","#",".","."  ,".","#"," "," "," "],
                     [" "," "," ","#",".","."  ,".","#"," "," "," "],
                     [" "," "," ","#",".","."  ,".","#"," "," "," "],
                     [" "," "," ","#",".","."  ,".","#"," "," "," "],
                     [" "," "," ","#","#","A1" ,"#","#"," "," "," "]];
const pi_tutorial1 = {
    0:[],
    0.5:[],
    1:[],
    F:[]
}
let stage_tutorial1 = new GameState(map_tutorial1, [player1], loc_list, goal= 1, [],
                            policy = pi_tutorial1);

let map_tutorial2 = [["#","#","#","#","#","#","#","#","#","#","#"],
                     ["#",".",".","a:2:2",".",".",".","b:8:3",".",".","#"],
                     ["#",".",".",".",".",".",".",".",".",".","#"],
                     ["#",".",".",".",".",".",".",".",".",".","#"],
                     ["#",".",".",".",".",".",".",".",".",".","#"],
                     ["#",".",".",".",".","1",".",".",".",".","#"],
                     ["#",".",".",".",".",".",".",".",".",".","#"],
                     ["#",".",".",".",".",".",".",".",".",".","#"],
                     ["#",".",".",".",".",".",".",".",".",".","#"],
                     ["#",".",".","@:1:1",".",".",".","@:2:2",".",".","#"],
                     ["#","#","#","A1","#","#","#","B1","#","#","#"]];

let stage_tutorial2 = new GameState(map_tutorial2, [player1], loc_list, goal= 1, [],
                            policy = pi_tutorial1);


// Training Maps //

let map_training1 =     [["#","#","#","#"  ,"#","#","#","#"  ,"#","#","#"],
                         ["#",".",".","a:1:1",".","#",".","b:2:2",".",".","#"],
                         ["#",".",".","."  ,".","#",".","."  ,".",".","#"],
                         ["#",".",".","."  ,".","#",".","."  ,".",".","#"],
                         ["#",".",".","."  ,".","#",".","."  ,".",".","#"],
                         ["#",".",".","1"  ,".","#",".","2"  ,".",".","#"],
                         ["#",".",".","."  ,".","#",".","."  ,".",".","#"],
                         ["#",".",".","."  ,".","#",".","."  ,".",".","#"],
                         ["#",".",".","."  ,".","#",".","."  ,".",".","#"],
                         ["#",".",".","@:1:1",".","#",".","@:2:2",".",".","#"],
                         ["#","#","#","A1" ,"#","#","#","B1" ,"#","#","#"]];
const pi_training1 = {
    "0":["@:2:2","b:2:2","B1"],
    "0.5":["@:2:2","b:2:2","B1"],
    "1":["@:2:2","b:2:2","B1"],
    "F":["@:2:2","b:2:2","B1"]
}
let stage_training1 = new GameState(map_training1, player_list, loc_list, goal= 2, [],
                                    policy = pi_training1);


let map_training2 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#","b:6:9",".",".","a:5:9","#","a:8:4",".",".","b:8:5","#"],
                         ["#",".",".",".",".","#",".",".",".",".","#"],
                         ["#",".",".",".",".","#",".",".",".",".","#"],
                         ["#",".",".",".",".","#",".",".",".",".","#"],
                         ["#",".","1",".",".","#",".",".","2",".","#"],
                         ["#",".",".",".",".","#",".",".",".",".","#"],
                         ["#",".",".",".",".","#",".",".",".",".","#"],
                         ["#",".",".",".",".","#",".",".",".",".","#"],
                         ["#","@:5:5",".",".","@:6:5","#","@:5:5",".",".","@:5:4","#"],
                         ["#","A1","#","#","B1","#","B2","#","#","A2","#"]];
const pi_training2 = {
    "0":["@:5:4","a:8:4","A2"],
    "0.5":["@:5:4","a:8:4","A2"],
    "1":["@:5:4","a:8:4","A2"],
    "F":["@:5:4","a:8:4","A2"]
}
let stage_training2 = new GameState(map_training2,  player_list, loc_list, goal= 2, [],
                                    policy = pi_training2);


let map_training3 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#",".","b:1:1",".",".",".",".",".","a:3:3",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","1",".",".",".","2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".","@:1:1",".",".",".",".",".","@:1:2",".","#"],
                         ["#","#","B1","#","#","#","#","#","A1","#","#"]];
const pi_training3 = {
    "0":["@:1:1","b:1:1","B1"],
    "0.5":["b:1:1","B1"],
    "1":["b:1:1","B1"],
    "F":["@:1:1","b:1:1","B1"]
}
let stage_training3 = new GameState(map_training3, player_list, loc_list, goal= 1, [],
                                    policy = pi_training3);

let map_training4 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#",".","b:3:3",".",".",".",".",".","c:3:2",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","1",".",".",".","2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".","@:2:2",".",".",".",".",".","@:3:8",".","#"],
                         ["#","#","B1","#","#","#","#","#","C1","#","#"]];
const pi_training4 = {
    "0":["@:2:2","b:3:3","B1"],
    "0.5":["b:3:3","B1"],
    "1":["c:3:2","A1"],
    "F":["c:3:2","A1"]
}
let stage_training4 = new GameState(map_training4, player_list, loc_list, goal= 1, [],
                                    policy = pi_training4);

let map_training5 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#",".","b:3:2",".",".","c:4:4",".",".","d:4:7",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","1",".",".",".","2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".","@:2:2",".",".","@:4:6",".",".","@:8:3",".","#"],
                         ["#","#","B1","#","#","C1","#","#","D1","#","#"]];
const pi_training5 = {
    "0":["@:2:2","b:3:2","B1"],
    "0.5":["b:3:2","B1"],
    "1":["c:4:4","C1"],
    "F":["d:4:7","D1"]
}
let stage_training5 = new GameState(map_training5, player_list, loc_list, goal= 1, [],
                                    policy = pi_training5);

let map_training6 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#",".","a:2:2",".","b:4:6",".","c:4:3",".","d:5:7",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","1",".",".",".","2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".","@:1:1",".","@:1:2",".","@:8:3",".","@:7:2",".","#"],
                         ["#","#","A1","#","B1","#","C1","#","D1","#","#"]];
const pi_training6 = {
    "0":["@:8:3","c:4:3","C1"],
    "0.5":["c:4:3","C1"],
    "1":["@:1:2","@:1:1"],
    "F":["@:7:2","@:8:3","c:4:3","C1"]
}
let stage_training6 = new GameState(map_training6, player_list, loc_list, goal= 1, [],
                                    policy = pi_training6);


let map_training7 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#",".","a:1:1",".","b:3:3",".","c:4:7",".","d:3:6",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","1",".",".",".","2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".","@:2:2",".","@:3:3",".","@:3:4",".","@:8:4",".","#"],
                         ["#","#","A1","#","B1","#","C1","#","D1","#","#"]];
const pi_training7 = {
    "0":["@:3:3","b:3:3","B1","@:2:2","a:1:1","A1"],
    "0.5":["@:3:3","b:3:3","B1","@:2:2","a:1:1","A1"],
    "1":["@:3:4","@:3:3","b:3:3","B1"],
    "F":["@:8:4","@:3:4"]
}
let stage_training7 = new GameState(map_training7, player_list, loc_list, goal= 2, [],
                                    policy = pi_training7);

// Testing Stages //

let map_testing1 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#","a:4:9",".",".","a:4:10","#","b:6:5",".",".","b:6:4","#"],
                         ["#",".",".",".",".","#",".",".",".",".","#"],
                         ["#",".",".",".",".","#",".",".",".",".","#"],
                         ["#",".",".",".",".","#",".",".",".",".","#"],
                         ["#",".","1",".",".","#",".",".","2",".","#"],
                         ["#",".",".",".",".","#",".",".",".",".","#"],
                         ["#",".",".",".",".","#",".",".",".",".","#"],
                         ["#",".",".",".",".","#",".",".",".",".","#"],
                         ["#","@:6:7",".",".","@:5:7","#","@:8:3",".",".","@:9:3","#"],
                         ["#","A1","#","#","A1","#","B1","#","#","B2","#"]];
const pi_testing1 = {
    "0":["@:8:3","b:6:4","B1"],
    "0.5":["@:8:3","b:6:4","B1"],
    "1":["@:8:3","b:6:4","B1"],
    "F":["@:8:3","b:6:4","B1"]
}
let stage_testing1 = new GameState(map_testing1,  player_list, loc_list, goal= 2, [],
                                    policy = pi_testing1);


let map_testing2 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#",".",".","b:3:3:1",".",".",".","b:3:3:2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","1",".",".",".","2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","@:1:1:1",".",".",".","@:1:1:2",".",".","#"],
                         ["#","#","#","B1","#","#","#","B2","#","#","#"]];
const pi_testing2 = {
    "0":["@:1:1:2","b:3:3:2","B2"],
    "0.5":["b:3:3:1","B1"],
    "1":["b:3:3:1","B1"],
    "F":["@:1:1:1"]
}
let stage_testing2 = new GameState(map_testing2, player_list, loc_list, goal= 1, [],
                                    policy = pi_testing2);


let map_testing3 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#",".",".","c:4:4",".",".",".","b:3:3",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","1",".",".",".","2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","@:4:7",".",".",".","@:2:2",".",".","#"],
                         ["#","#","#","C1","#","#","#","B1","#","#","#"]];
const pi_testing3 = {
    "0":["@:2:2","b:3:3","B1"],
    "0.5":["b:3:3","B1"],
    "1":["c:4:4","C1"],
    "F":["@:4:7"]
}
let stage_testing3 = new GameState(map_testing3, player_list, loc_list, goal= 1, [],
                                    policy = pi_testing3);

let map_testing4 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#",".",".","d:4:8",".",".","c:4:4",".","b:3:3",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","1",".",".",".","2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".","@:8:4",".",".","@:7:3",".",".","@:4:3",".","#"],
                         ["#","#","D1","#","#","C1","#","#","B1","#","#"]];
const pi_testing4 = {
    "0":["@:7:3","c:4:4","C1"],
    "0.5":["c:4:4"],
    "1":["@:b:3:3","B1"],
    "F":["@:8:4"]
}
let stage_testing4 = new GameState(map_testing4, player_list, loc_list, goal= 1, [],
                                    policy = pi_testing4);

let map_testing5 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#",".","d:2:8",".","c:2:2",".","b:1:1",".","a:1:6",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","1",".",".",".","2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".","@:7:4",".","@:3:3",".","@:1:1",".","@:3:2",".","#"],
                         ["#","#","D1","#","C1","#","B1","#","A1","#","#"]];
const pi_testing5 = {
    "0":["@:3:3","c:2:2","C1"],
    "0.5":["c:2:2","C1"],
    "1":["@:1:1","@:3:3","A1"],
    "F":["@:7:4"]
}
let stage_testing5 = new GameState(map_testing5, player_list, loc_list, goal= 1, [],
                                    policy = pi_testing5);

let map_testing6 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#",".","b:1:1",".","d:4:7",".","c:3:9",".","a:7:4",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","1",".",".",".","2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".","@:2:2",".","@:1:1",".","@:8:2",".","@:3:3",".","#"],
                         ["#","#","B1","#","D1","#","C1","#","A1","#","#"]];
const pi_testing6 = {
    "0":["@:2:2","b:1:1","B1"],
    "0.5":["b:1:1"],
    "1":["@:1:1","@:8:2"],
    "F":["@:1:1","@:8:2"]
}
let stage_testing6 = new GameState(map_testing6, player_list, loc_list, goal= 1, [],
                                    policy = pi_testing6);

let map_testing7 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#",".","b:1:2",".","a:4:4",".","d:4:9",".","c:4:1",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","1",".",".",".","2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".","@:2:1",".","@:3:3",".","@:6:2",".","@:7:4",".","#"],
                         ["#","#","B1","#","A1","#","D1","#","C1","#","#"]];
const pi_testing7 = {
    "0":["@:3:3","a:4:4","A1","@:2:1","b:1:2","B1"],
    "0.5":["@:7:4","c:4:1","C1","@:2:1","b:1:2","B1"],
    "1":["@:3:3","a:4:4","A1","@:2:1","b:1:2","B1"],
    "F":["@:7:4","@:6:2","c:4:1","C1"]
}
let stage_testing7 = new GameState(map_testing7, player_list, loc_list, goal= 2, [],
                                    policy = pi_testing7);

let map_testing8 =     [["#","#","#","#","#","#","#","#","#","#","#"],
                         ["#",".","c:2:9",".","b:4:1",".","a:5:2",".","d:2:3",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".","1",".",".",".","2",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#",".","@:8:1",".","@:1:3",".","@:3:4",".","@:3:7",".","#"],
                         ["#","#","C1","#","B1","#","A1","#","D1","#","#"]];
const pi_testing8 = {
    "0":["@:3:4","a:5:2","A1","@:1:3","b:4:1","B1"],
    "0.5":["@:3:4","a:5:2","A1","@:1:3","b:4:1","B1"],
    "1":["@:1:3","d:2:3","D1"],
    "F":["@:8:1","d:2:3","D1"]
}
let stage_testing8 = new GameState(map_testing8, player_list, loc_list, goal= 2, [],
                                    policy = pi_testing8);


//TODO: function to check that the gameStage and all declaration is valid. 
//      This includes checking unique id of obj.


// the list of all states in order to appear in the experiment
const tutorial_stages = [stage_tutorial1, stage_tutorial2];
const training_stages = [stage_training1, stage_training2, stage_training3, stage_training4, stage_training5,
                         stage_training6, stage_training7];
const testing_stages = [stage_testing1,stage_testing2,stage_testing3,stage_testing4,stage_testing5,stage_testing6];

let stages = [...tutorial_stages, ...training_stages, ...testing_stages];



