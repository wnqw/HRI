const dirToMovement = {
    up: [-1,0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1]
}

let robotLevel = 0.5;
// low-level movement
let curHighPlan = [];
let curLowPlan = [];

function setHighPlan(playerID, gameState){
    let agentInd = - 1; 
    
    for(let i = 0; i < gameState.agents.length;i++){
        if(gameState.agents[i].id === playerID){
            agentInd = i;
        }
    }
    if(agentInd === -1) return;

    curHighPlan = gameState.policy[robotLevel];
    console.log(curHighPlan);
}


function nextAction(playerID, gameState){
    if(curHighPlan.length===0 && curLowPlan.length ===0) return;

    curLowPlan = bfs_level0(playerID, gameState, tar_loc = findLocation(curHighPlan[0],gameState.map));
        
    if(curLowPlan.length!=0){
        //if found keep moving
        curLowPlan.push("interact");
        curHighPlan.shift();
    }
    const next_action = curLowPlan.shift();
    executeAction(playerID, gameState, next_action);

    // if(curLowPlan.length == 0){
    //     curLowPlan = bfs_action_simp(playerID, gameState, tar_loc = findLocation(curHighPlan[0],gameState.map));
        
    //     if(curLowPlan.length!=0){
    //         //if found keep moving
    //         curLowPlan.push("interact");
    //         curHighPlan.shift();
    //     }
    // const next_action = curLowPlan.shift();
    // executeAction(playerID, gameState, next_action);
    // }

    // if(curHighPlan.length == 0){
    //     curHighPlan = high_level_action(playerID, gameState, tar_loc = findLocation(curHighPlan[0],gameState.map));
        
    //     if(curHighPlan.length!=0){
    //         //if found keep moving
    //         curHighPlan.push("interact");
    //         curLowPlan.shift();
    //     }
    // const next_action = curHighPlan.shift();
    // executeAction(playerID, gameState, next_action);
    // }
     
}


function manhattanDistance(loc1, loc2){
    return(abs(loc1[0] - loc2[0]) + abs(loc1[1] - loc2[1]))
}

//Simplified State Space 
//Necesarity elements
// My location, The other agent location and their directions. That's all. 
// The (new) map system allow you to pick and drop from the box locations and they won't be gone
// So, you don't need to maintain their status anymore. 
// SeearchState = all agents status (id, loc, dir, hold)

function findIndfromID(list, id){
    for(let i = 0; i< list.length;i++){
        if(list[i][keyToInd.id] === id){
            return(i);
        }
    }
    return(-1);
}

function nextState(searchNode, action, target_id, gameState){
    //Generate the next search state
    //Only care about the next location(s)
    //TODO: generalize to multiple agents
    
    const newSearchNode = structuredClone(searchNode); //Is there a better way to deep clone this?

    //TODO: loop through a list of id for multiple actions
    const ind = findIndfromID(newSearchNode.agents, target_id); 
    const player = newSearchNode.agents[ind]; 
    
    if(action === player[keyToInd.dir]){
        //Move to the next location if possible 
        let new_loc = [player[keyToInd.loc][0], player[keyToInd.loc][1]];
        new_loc[0] = new_loc[0] + dirToMovement[action][0];
        new_loc[1] = new_loc[1] + dirToMovement[action][1];

        new_loc_ele = gameState.map[new_loc[0]][new_loc[1]];
        if(new_loc_ele === "." || new_loc_ele === id){
            player[keyToInd.loc] = new_loc;
        }
    }
    else if(action === control.wait){
        //do nothing
    }
    else if(action === control.interact){
        //place holder for now
    }else{
        //if action != current direction
        player[keyToInd.dir] = action;
    }
    
    newSearchNode.hist.push(action);
    return(newSearchNode);
}

function checkAgentDuped(a1, a2){
    return((a1[1][0] === a2[1][0]) && (a1[1][1] === a2[1][1]) && (a1[2] === a2[2]))
}

function checkDupedSimpState(states, newState){
    const newAgents = newState.agents;
    for(const s of states){
        let duped = true;
        for(let i =0; i < s.agents.length; i++){
            duped = duped && checkAgentDuped(s.agents[i],newAgents[i]);
        }
        if(duped) {
            return(duped);
        }
    }
    return(false);
}

const keyToInd = {
    id: 0,
    loc: 1,
    dir: 2,
    holding: 3 
}

function checkGoalLocation(player, tar_loc){
    //Input: simplified player 
    //If adjacent and dir = point to the target, true
    const temp_dir = dirToMovement[player[keyToInd.dir]];
    const temp_loc = player[keyToInd.loc];
    if( (temp_loc[0] + temp_dir[0]) === tar_loc[0] && 
        (temp_loc[1] + temp_dir[1]) === tar_loc[1]){
            return(true);
    }
    return(false);
}

const low_level_actions_list = [control.up, control.down, control.left, control.right, control.wait]; // pickup and dropoff object/obstacle?

function bfs_level0(agentID, gameState, tar_loc){
    console.log("start");

    let q = [];    
   
    //Manually construct the initial simplified player list
    const agents = []; 
    for(const a of gameState.agents){
       //The key elements are just id, location, and direction (not holding yet)
       agents.push([ a.id, a.loc, a.direction]);
    }
    const player_ind = findIndfromID(agents, agentID);

    const searchNode = {
        agents: agents,
        hist: []
    };

    q.push(searchNode); 
    let ind = 0;
    while(ind < q.length){
        let curSearchNode = q[ind++];

        if(checkGoalLocation(curSearchNode.agents[player_ind], tar_loc) ){
            console.log("found");
            return(q[ind-1].hist);
        }
        
        for(const a of low_level_actions_list){
            //Generate new state if possible
            
            let newSearchNode = nextState(curSearchNode, a, agentID, gameState)
            //check repeat stage somehow
            if(checkDupedSimpState(q, newSearchNode) === false){
                q.push(newSearchNode);
            }
        }
    }    

    console.log("Not Found");
    return([]);
}


// high level actions

const high_level_actions_list = [deliver_object, remove_obstacle, wait];

function high_level_action(agentID, gameState, tar_loc){
    let robot_level = robotLevel; 
    let dfs_max_depth = 2;
    let robot_action_path = [];

    if (robot_level == 0){
        robot_action_path = dfs_level_0(agentID, gameState, tar_loc, 0, dfs_max_depth);
    }
    if (robot_level == 1){
        robot_action_path = dfs_level_1(agentID, gameState, tar_loc, 0, dfs_max_depth);
    }
    if (robot_level == 2){
        robot_action_path = dfs_level_2(agentID, gameState, tar_loc, 0, dfs_max_depth);
    }

    if(robot_action_path == false){
        console.log("Not Found");
        return false;
    }
    
    let robot_action = robot_action_path[0];
    return robot_action;
}


function dfs_level_0(agentID, gameState, tar_loc, cur_depth, max_depth){
    let robot_action_path = [];

    // init agents
    const agents = []; 
    for(const a of gameState.agents){
       agents.push([a.id, a.loc, a.direction, a.high_level_action]);
    }
    const player_index = findIndfromID(agents, agentID);

    // processed nodes
    let processed_nodes = [];
    // cur state node
    let cur_state_node = {
        agents: agents,
        action_path: [],
    };

    robot_action_path = dfs_level_0_visit(agentID, gameState, tar_loc, cur_depth, max_depth, cur_state_node, player_index, processed_nodes);
    return robot_action_path;
}

function dfs_level_0_visit(agentID, gameState, tar_loc, cur_depth, max_depth, cur_node, player_index, processed_nodes){
    processed_nodes.push(cur_node); // processed

    if(checkGoalLocation(cur_node.agents[player_index], tar_loc)){
        console.log("found");
        return cur_node.action_path;
    }

    if (cur_depth > max_depth){
        return false;
    }

    for(const action of high_level_actions_list){ // for v in adjList[u]?
        let next_node = nextState_highlevel(cur_node, action, agentID, gameState);
        if(checkDupedSimpState(processed_nodes, cur_node) == false){ // not processed
            return dfs_level_0_visit(agentID, gameState, tar_loc, cur_depth + 1, max_depth, next_node, player_index, processed_nodes);
        }
    }
}



function dfs_level_1(agentID, gameState, tar_loc, cur_depth, max_depth){
    let robot_action_path = [];

    // init agents
    const agents = []; 
    for(const a of gameState.agents){
       agents.push([a.id, a.loc, a.direction, a.high_level_action]);
    }
    const player_index = findIndfromID(agents, agentID);

    // processed nodes
    let processed_nodes = [];
    // cur state node
    let cur_state_node = {
        agents: agents,
        action_path: [],
    };

    robot_action_path = dfs_level_1_visit(agentID, gameState, tar_loc, cur_depth, max_depth, cur_state_node, player_index, processed_nodes);
    return robot_action_path;
}


function dfs_level_1_visit(agentID, gameState, tar_loc, cur_depth, max_depth, cur_node, player_index, processed_nodes){
    processed_nodes.push(cur_node); // processed

    if(checkGoalLocation(cur_node.agents[player_index], tar_loc)){
        console.log("found");
        return cur_node.action_path;
    }

    if (cur_depth > max_depth){
        return false;
    }

    for(const action of high_level_actions_list){ // for v in adjList[u]?
        let next_node = nextState_highlevel(cur_node, action, agentID, gameState);
        let opponent_action_path = dfs_level_0_visit(agentID, gameState, tar_loc, cur_depth, max_depth, next_node, player_index, processed_nodes);
        let next_node2 = nextState_highlevel(cur_node, opponent_action_path[0], agentID, gameState);
        if(checkDupedSimpState(processed_nodes, cur_node) == false){ // not processed
            return dfs_level_1_visit(agentID, gameState, tar_loc, cur_depth + 1, max_depth, next_node2, player_index, processed_nodes);
        }
    }
}




function dfs_level_2(agentID, gameState, tar_loc, cur_depth, max_depth){
    let robot_action_path = [];

    // init agents
    const agents = []; 
    for(const a of gameState.agents){
       agents.push([a.id, a.loc, a.direction, a.high_level_action]);
    }
    const player_index = findIndfromID(agents, agentID);

    // processed nodes
    let processed_nodes = [];
    // cur state node
    let cur_state_node = {
        agents: agents,
        action_path: [],
    };

    robot_action_path = dfs_level_2_visit(agentID, gameState, tar_loc, cur_depth, max_depth, cur_state_node, player_index, processed_nodes);
    return robot_action_path;
}


function dfs_level_2_visit(agentID, gameState, tar_loc, cur_depth, max_depth, cur_node, player_index, processed_nodes){
    processed_nodes.push(cur_node); // processed

    if(checkGoalLocation(cur_node.agents[player_index], tar_loc)){
        console.log("found");
        return cur_node.action_path;
    }

    if (cur_depth > max_depth){
        return false;
    }

    for(const action of high_level_actions_list){ // for v in adjList[u]?
        let next_node = nextState_highlevel(cur_node, action, agentID, gameState);
        let opponent_action_path = dfs_level_1_visit(agentID, gameState, tar_loc, cur_depth, max_depth, next_node, player_index, processed_nodes)
        let next_node2 = nextState_highlevel(cur_node, opponent_action_path[0], agentID, gameState);
        if(checkDupedSimpState(processed_nodes, cur_node) == false){ // not processed
            return dfs_level_2_visit(agentID, gameState, tar_loc, cur_depth + 1, max_depth, next_node2, player_index, processed_nodes);
        }
    }
}



function nextState_highlevel(cur_node, action, target_id, gameState){
    const next_node = structuredClone(cur_node); //Is there a better way to deep clone this?

    const index = findIndfromID(next_node.agents, target_id); 
    const player = next_node.agents[index]; 
    
    if(action === player[keyToInd_high.high_level_action]){
        player[keyToInd_high.loc] = get_new_loc_for_highlevel(action, player, gameState);
    }
    else{
        //if action != current high_level_action
        player[keyToInd_high.high_level_action] = action;
    }

    next_node.action_path.push(action);
    return(next_node);
}


function get_new_loc_for_highlevel(highlevel_action, player, gameState){
    // TODO: get resulting new loc from low level action
    // based on high level actions, such as deliver, removeObstacle, wait
    let new_loc;
    return new_loc;
}


const keyToInd_high = {
    id: 0,
    loc: 1,
    dir: 2,
    high_level_action: 3,
    // holding: 4
}