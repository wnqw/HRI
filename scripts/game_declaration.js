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

let player1 = new Player(id = playerID.human, type = "player", color ="yellow", str = 5, dex = 8, // 5, 9
    rewards = reward);
let robot1 = new Player(id = playerID.robot, type = "robot", color = "green", str = 8, dex = 5, // 8, 4
    rewards = reward, level = "0.5");

let player_opt = new Player(id = playerID.human_opt, type = "player", color ="red", str = 5, dex = 8, // 5, 9
rewards = reward);


let player_list = [player1, robot1];
// let player_list = [player_opt, robot1];


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
    all_locs;
    all_deliver_places;

    constructor(map, agents, loc, goal = 1, collected=[], policy = null, all_locs = null, all_deliver_places=null){
        this.map = map;
        this.objs = generateObjects(map);
        this.agents = agents;
        this.loc = loc;
        this.goal = goal;
        this.collected = collected;
        this.policy = policy;
        this.all_locs = all_locs;
        this.all_deliver_places = all_deliver_places;
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

// Experiment Maps //


let map_1 =     [["#","#","#","#"  ,"#","#","#","#"  ,"#","#","#"],
                         ["#",".",".","a:1:1",".",".",".","b:2:2",".",".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["A1",".",".","."  ,".",".",".","."  ,".",".","B1"],
                         ["#",".",".","1"  ,".",".",".","2"  ,".",".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".",".",".",".",".",".",".",".","#"],
                         ["#","#","#","#" ,"#","#","#","#" ,"#","#","#"]];

const pi_1 = {
    "0":["b:2:2","B1","b:2:2","B1","b:2:2","B1"]
}
const opt_pi_human_1 = {
    "0":["a:1:1","A1"]
}
const all_locs_1 = ["a:1:1", "b:2:2"];
const all_deliver_places_1 = ["A1", "B1"];

let stage_1 = new GameState(map_1, player_list, loc_list, goal= 3, [],
                                    policy = pi_1, all_locs = all_locs_1, all_deliver_places = all_deliver_places_1);



let map_2 =     [["#","#","#","#"  ,"#","#","A1","#"  ,"#","#","#"],
                ["#",".",".",".",".",".",".",".",".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".","1",".","."  ,".","a:1:1","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".","2",".","."  ,".","b:2:2","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".",".",".",".",".",".",".",".","#"],
                ["#","#","#","#" ,"#","#","B1","#" ,"#","#","#"]];
           
const pi_2 = {
    "0":["b:2:2","B1","b:2:2","B1","b:2:2","B1"]
}
const opt_pi_human_2 = {
    "0":["a:1:1","A1"]
}
const all_locs_2 = ["a:1:1", "b:2:2"];
const all_deliver_places_2 = ["A1", "B1"];

let stage_2 = new GameState(map_2, player_list, loc_list, goal= 3, [],
                                    policy = pi_2, all_locs = all_locs_2, all_deliver_places = all_deliver_places_2);



let map_3 =     [["#","#","#","#"  ,"#","#","#","#"  ,"#","#","#"],
                ["#",".",".",".",".",".",".",".",".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","2"  ,".",".",".","1"  ,".",".","#"],
                ["B1",".",".","."  ,".",".",".","."  ,".",".","A1"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","b:2:2",".",".",".","a:1:1",".",".","#"],
                ["#","#","#","#" ,"#","#","#","#" ,"#","#","#"]];
           
const pi_3 = {
    "0":["b:2:2","B1","b:2:2","B1","b:2:2","B1"]
}
const opt_pi_human_3 = {
    "0":["a:1:1","A1"]
}
const all_locs_3 = ["a:1:1", "b:2:2"];
const all_deliver_places_3 = ["A1", "B1"];

let stage_3 = new GameState(map_3, player_list, loc_list, goal= 3, [],
                                    policy = pi_3, all_locs = all_locs_3, all_deliver_places = all_deliver_places_3);



let map_4 =     [["#","#","#","#"  ,"B1","#","#","#"  ,"#","#","#"],
                ["#",".",".",".",".",".",".",".",".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#","b:2:2",".","."  ,".","2",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#","a:1:1",".","."  ,".","1",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".",".",".",".",".",".",".",".","#"],
                ["#","#","#","#" ,"A1","#","#","#" ,"#","#","#"]];
                               
const pi_4 = {
    "0":["b:2:2","B1","b:2:2","B1","b:2:2","B1"]
}
const opt_pi_human_4 = {
    "0":["a:1:1","A1"]
}
const all_locs_4 = ["a:1:1", "b:2:2"];
const all_deliver_places_4 = ["A1", "B1"];

let stage_4 = new GameState(map_4, player_list, loc_list, goal= 3, [],
                                    policy = pi_4, all_locs = all_locs_4, all_deliver_places = all_deliver_places_4);



let map_5 =     [["#","#","#","#"  ,"#","#","#","#"  ,"#","#","#"],
                         ["#",".",".","a:1:1",".",".",".","b:2:2",".",".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".",".","."  ,".",".",".","."  ,".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".","@:2:6","B1"],
                         ["#",".",".","1"  ,".",".",".","2"  ,".",".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".","@:1:1",".",".",".",".",".",".","#"],
                         ["#","#","#","A1" ,"#","#","#","#" ,"#","#","#"]];

const pi_5= {
    "0":["@:1:1","a:1:1","A1"]
}
const opt_pi_human_5 = {
    "0":["@:2:6","b:2:2","B1"]
}
const all_locs_5 = ["@:1:1","@:2:6","a:1:1", "b:2:2"];
const all_deliver_places_5 = ["A1", "B1"];

let stage_5 = new GameState(map_5,  player_list, loc_list, goal= 1, [],
                                    policy = pi_5, all_locs = all_locs_5, all_deliver_places = all_deliver_places_5);


let map_6 =     [["#","#","#","#"  ,"#","#","#","#"  ,"#","#","#"],
                ["#",".",".",".",".",".",".",".",".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["A1","@:1:1",".",".","."  ,"1",".",".","."  ,"a:1:1","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".","2",".","."  ,".","b:2:2","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".",".",".",".","@:2:6",".",".",".","#"],
                ["#","#","#","#" ,"#","#","B1","#" ,"#","#","#"]];

const pi_6= {
    "0":["@:1:1","a:1:1","A1"]
}
const opt_pi_human_6 = {
    "0":["@:2:6","b:2:2","B1"]
}
const all_locs_6 = ["@:1:1","@:2:6","a:1:1", "b:2:2"];
const all_deliver_places_6 = ["A1", "B1"];

let stage_6 = new GameState(map_6,  player_list, loc_list, goal= 1, [],
                                    policy = pi_6, all_locs = all_locs_6, all_deliver_places = all_deliver_places_6);


let map_7 =     [["#","#","#","#"  ,"#","#","#","A1"  ,"#","#","#"],
                ["#",".",".",".",".",".",".","@:1:1",".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#", ".",".",".","."  ,".",".",".","."  ,".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","2"  ,".",".",".","1"  ,".",".","#"],
                ["B1","@:2:6",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","b:2:2",".",".",".","a:1:1",".",".","#"],
                ["#","#","#","#" ,"#","#","#","#" ,"#","#","#"]];

const pi_7 = {
    "0":["@:1:1","a:1:1","A1"]
}
const opt_pi_human_7 = {
    "0":["@:2:6","b:2:2","B1"]
}
const all_locs_7 = ["@:1:1","@:2:6","a:1:1", "b:2:2"];
const all_deliver_places_7 = ["A1", "B1"];

let stage_7 = new GameState(map_7,  player_list, loc_list, goal= 1, [],
                                    policy = pi_7, all_locs = all_locs_7, all_deliver_places = all_deliver_places_7);


let map_8 =     [["#","#","#","#"  ,"B1","#","#","#"  ,"#","#","#"],
                ["#",".",".",".","@:2:6",".",".",".",".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#", "b:2:2",".",".","."  ,"2",".",".","."  ,".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#","a:1:1",".","."  ,".","1",".","."  ,".","@:1:1","A1"],
                ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                ["#",".",".",".",".",".",".",".",".",".","#"],
                ["#","#","#","#" ,"#","#","#","#" ,"#","#","#"]];

const pi_8 = {
    "0":["@:1:1","a:1:1","A1"]
}
const opt_pi_human_8 = {
    "0":["@:2:6","b:2:2","B1"]
}
const all_locs_8 = ["@:1:1","@:2:6","a:1:1", "b:2:2"];
const all_deliver_places_8 = ["A1", "B1"];

let stage_8 = new GameState(map_8,  player_list, loc_list, goal= 1, [],
                                    policy = pi_8, all_locs = all_locs_8, all_deliver_places = all_deliver_places_8);
                    
                    


let map_template_1 =     [["#","#","#","#"  ,"#","#","#","#"  ,"#","#","#"],
                         ["#",".",".","a:1:8",".",".",".","b:2:2",".",".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".",".","."  ,".",".",".","."  ,".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".","1"  ,".",".",".","2"  ,".","@:2:6","B1"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".","."  ,".",".",".","."  ,".",".","#"],
                         ["#",".",".","@:1:1",".",".",".",".",".",".","#"],
                         ["#","#","#","A1" ,"#","#","#","#" ,"#","#","#"]];


const pi_template1 = {
    "0":["@:1:1","a:1:8","A1"]
}


const all_locs_template1 = ["@:1:1","@:2:6","a:1:8", "b:2:2"];
const all_deliver_places_template = ["A1", "B1"];

let stage_template1 = new GameState(map_template_1, player_list, loc_list, goal= 1, [],
    policy = pi_template1, all_locs = all_locs_template1, all_deliver_places = all_deliver_places_template);

 
//TODO: function to check that the gameStage and all declaration is valid. 
//      This includes checking unique id of obj

const tutorial_stages = [stage_tutorial1, stage_tutorial2];
const experiment_stages = [stage_1, stage_2, stage_3, stage_4, stage_5, stage_6, stage_7, stage_8];

let stages = [...tutorial_stages, ...experiment_stages];
// let stages = [stage_8];
 