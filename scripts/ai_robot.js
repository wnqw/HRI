const dirToMovement = {
    up: [-1,0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1],
    wait: [0, 0]
}

// ROBOT LEVEL
let robot_bfs_level = 1;

// high-level movement
let curHighPlan_Robot_level0 = [];
var curHighPlan_Robot_level1 = {plans: []};
var curHighPlan_Robot_level2 = {plans: []};
var curHighPlan_Human_level1 = {plans: []};
var curHighPlan_Human_level2 = {plans: []};

// low-level movement
let curLowPlan = [];

// others
let level0robot_policy = 0; 

function setHighPlan(playerID, gameState){
    let agentInd = - 1; 
    
    for(let i = 0; i < gameState.agents.length;i++){
        if(gameState.agents[i].id === playerID){
            agentInd = i;
        }
    }
    if(agentInd === -1) return;

    curHighPlan_Robot_level0 = gameState.policy[level0robot_policy];
    curHighPlan_Robot_level1.plans = gameState.all_locs;
    curHighPlan_Robot_level2.plans = gameState.all_locs;
    curHighPlan_Human_level1.plans = gameState.all_locs;
    curHighPlan_Human_level2.plans = gameState.all_locs;
    if (robot_bfs_level === 0){
        console.log('initial curHighPlan_Robot_level0: ' + curHighPlan_Robot_level0);
    }
 }


function nextAction(playerID, gameState){
    if(curHighPlan_Robot_level0.length===0 && curLowPlan.length ===0) return;

    if(curLowPlan.length === 0){

        if (robot_bfs_level === 0){
            curLowPlan = bfs_level0(playerID, gameState, tar_loc = findLocation(curHighPlan_Robot_level0[0], gameState.map), undefined);
        }
        else if (robot_bfs_level === 1){
            curLowPlan = bfs_level1(playerID, "1", gameState, undefined, undefined, curHighPlan_Robot_level1, curHighPlan_Human_level1);
        }
        else if (robot_bfs_level === 2){
            curLowPlan = bfs_level2(playerID, "1", gameState, curHighPlan_Robot_level2, curHighPlan_Human_level2, curHighPlan_Robot_level1, curHighPlan_Human_level1);
        }
        
        if(curLowPlan.length != 0){
            curLowPlan.push("interact");
            if (robot_bfs_level === 0){
                curHighPlan_Robot_level0.shift();
            }
        }
    }
    
    const next_action = curLowPlan.shift();

    executeAction(playerID, gameState, next_action);
}


function manhattanDistance(loc1, loc2){
    return(Math.abs(loc1[0] - loc2[0]) + Math.abs(loc1[1] - loc2[1]));
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
        if(new_loc_ele === "." || new_loc_ele === target_id){
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
    holding: 3 // not used yet
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

const actions_list = [control.up, control.down, control.left, control.right, control.wait];

function bfs_level0(agentID, gameState, tar_loc, searchNode){
    /*
    this agent find next state node then push it to the queue, if it hits the goal state, return the path history
    */
    console.log("L0 start");
    console.log('current curHighPlan_Robot_level0: ' + curHighPlan_Robot_level0);

    if (tar_loc.length === 0){
        console.log("bfs_level0 tar_loc is []");
        return ([]);
    }

    let q = [];    
   
    const agents = []; 
    for(const a of gameState.agents){
       //The key elements are just id, location, and direction (not holding yet)
       agents.push([ a.id, a.loc, a.direction]);
    }
    const player_ind = findIndfromID(agents, agentID);

    if (typeof searchNode === "undefined"){
        console.log("L0 searchNode undefined. Might be calling by itself.");
        searchNode = {
            agents: agents,
            hist: []
        };
    }

    q.push(searchNode); 
    let ind = 0;
    while(ind < q.length){
        let curNode = q[ind++];

        if(checkGoalLocation(curNode.agents[player_ind], tar_loc) ){
            console.log("L0 found hist: " + q[ind-1].hist);
            return(q[ind-1].hist);
        }
        
        for(const a of actions_list){
            //Generate new state if possible
            
            let nextNode = nextState(curNode, a, agentID, gameState)
            //check repeat stage somehow
            if(checkDupedSimpState(q, nextNode) === false){
                q.push(nextNode);
            }
        }
    }    

    console.log("L0 Not Found");
    return([]);
}



function bfs_level1(agentID, otherID, gameState, searchNode, tar_loc, player_objIDs, other_objIDs){
    /* 
    this agent find next state node, then give this node to the bfs_level0, then compute other agent's level0 actions.
    Then, this agent finds the optimal action given the other agent's level0 actions.
    Then, this agent find next state node given that optimal response action.
    Then, if hits the goal location, it returns the path history.
    */
    console.log("L1 start");

    let q = [];    
   
    const agents = []; 

    for(const a of gameState.agents){
       agents.push([ a.id, a.loc, a.direction]);
    }
    const player_ind = findIndfromID(agents, agentID);

    if (typeof searchNode === "undefined"){
        console.log("L1 searchNode undefined. Might be calling by itself.");
        searchNode = {
            agents: agents,
            hist: [],
            tar_loc: tar_loc
        };
    }

    q.push(searchNode); 
    let ind = 0;
    while(ind < q.length){
        let curSearchNode = q[ind++];

        if(curSearchNode.tar_loc != undefined){
            if(checkGoalLocation(curSearchNode.agents[player_ind], curSearchNode.tar_loc)){
                console.log("L1 found hist:" + q[ind-1].hist);
                let tar_id = gameState.map[curSearchNode.tar_loc[0]][curSearchNode.tar_loc[1]];
                console.log("L1 tar_id:" + tar_id);
                return(q[ind-1].hist);
            }
        }

        for(const a of actions_list){
            let nextNode = nextState(curSearchNode, a, agentID, gameState)

            let other_player = nextNode.agents[findIndfromID(nextNode.agents, otherID)]; // prev loc needed
            let other_loc = [other_player[keyToInd.loc][0], other_player[keyToInd.loc][1]];
            let other_tar_id = find_nearest_target_id_to_player(gameState, other_loc, other_objIDs.plans);
            let other_tar_loc = findLocation(other_tar_id, gameState.map);
            if (other_tar_loc === []) continue;

            let others_leve0_actions = bfs_level0(otherID, gameState, other_tar_loc, nextNode);
            if (others_leve0_actions === []){
                console.log("bfs_level1 others_leve0_actions is empty");
                continue;
            }
            let response_a_loc = agent_response_action_dynamic(agentID, otherID, others_leve0_actions[0], gameState, nextNode, player_objIDs.plans, other_objIDs.plans);
            if (response_a_loc === []){
                console.log("bfs_level1 response_a_loc is empty");
                continue;
            }

            let response_a = response_a_loc[0];
            let nearest_tar_loc = response_a_loc[1];

            let nextNode2 = nextState(nextNode, response_a, agentID, gameState);
            nextNode2.tar_loc = nearest_tar_loc;

            if(checkDupedSimpState(q, nextNode2) === false){
                console.log("L1 action: " + a + ", others next action: "+others_leve0_actions[0]+ ", others next target: " +other_tar_id+", next action: " + response_a+ ", next target: " + gameState.map[nextNode2.tar_loc[0]][nextNode2.tar_loc[1]]);
                q.push(nextNode2);
            }
        }
    }    

    console.log("L1 Not Found");
    return([]);
}


function bfs_level2(agentID, otherID, gameState, player_objIDs, other_objIDs, player_objIDs_1, other_objIDs_1){
    /* 
    this agent find next state node, then give this node to the bfs_level0, then compute other agent's level0 actions.
    Then, this agent finds the optimal action given the other agent's level0 actions.
    Then, this agent find next state node given that optimal response action.
    Then, if hits the goal location, it returns the path history.
    */
    console.log("L2 start");

    let q = [];    
   
    const agents = []; 

    for(const a of gameState.agents){
       agents.push([ a.id, a.loc, a.direction]);
    }
    const player_ind = findIndfromID(agents, agentID);

    const searchNode = {
        agents: agents,
        hist: [],
        tar_loc: undefined
    };

    q.push(searchNode); 
    let ind = 0;
    while(ind < q.length){
         let curSearchNode = q[ind++];

         if(curSearchNode.tar_loc != undefined){
            if(checkGoalLocation(curSearchNode.agents[player_ind], curSearchNode.tar_loc)){
                console.log("L2 found hist:" + q[ind-1].hist);
                let tar_id = gameState.map[curSearchNode.tar_loc[0]][curSearchNode.tar_loc[1]];
                console.log("L2 tar_id:" + tar_id);
                return(q[ind-1].hist);
            }
        }

        for(const a of actions_list){
            let nextNode = nextState(curSearchNode, a, agentID, gameState)

            let other_player = nextNode.agents[findIndfromID(nextNode.agents, otherID)]; // prev loc needed
            let other_loc = [other_player[keyToInd.loc][0], other_player[keyToInd.loc][1]];
            let other_tar_id = find_nearest_target_id_to_player(gameState, other_loc, other_objIDs.plans);
            let other_tar_loc = findLocation(other_tar_id, gameState.map);
            if (other_tar_loc === []) continue;

            let others_leve1_actions = bfs_level1(otherID, agentID, gameState, nextNode, other_tar_loc, other_objIDs_1, player_objIDs_1);
            if (others_leve1_actions === []){
                console.log("bfs_level2 others_leve1_actions is empty");
                continue;
            }
                        
            let response_a_loc = agent_response_action_dynamic(agentID, otherID, others_leve1_actions[0], gameState, nextNode, player_objIDs.plans, other_objIDs.plans);
            if (response_a_loc === []){
                console.log("bfs_level2 response_a_loc is empty");
                continue;
            }

            let response_a = response_a_loc[0];
            let nearest_tar_loc = response_a_loc[1];

            let nextNode2 = nextState(nextNode, response_a, agentID, gameState);
            nextNode2.tar_loc = nearest_tar_loc;

            if(checkDupedSimpState(q, nextNode2) === false){
                console.log("L2 action: " + a + ", others next action: "+others_leve1_actions[0]+ ", others next target: " +other_tar_id+", next action: " + response_a+ ", next target: " + gameState.map[nextNode2.tar_loc[0]][nextNode2.tar_loc[1]]);
                q.push(nextNode2);
            }
        }
    }    

    console.log("L2 Not Found");
    return([]);
}



// robot find obj nearest to human
// interact with obj: if human cant do, and robot can do 
// if not interact: robot find next nearest obj

function agent_response_action_dynamic(agentID, otherID, others_action, gameState, nextNode, player_objIDs, other_objIDs){

    let other_player = nextNode.agents[findIndfromID(nextNode.agents, otherID)];
    let player = nextNode.agents[findIndfromID(nextNode.agents, agentID)];
    let player_instance = findAgentfromID(gameState, agentID);
    let other_instance = findAgentfromID(gameState, otherID);


    if (player_instance.hold_object == null){
        // try help the other player
        let other_loc = [other_player[keyToInd.loc][0], other_player[keyToInd.loc][1]];

        if(others_action === other_player[keyToInd.dir]){
            other_loc[0] = other_loc[0] + dirToMovement[others_action][0];
            other_loc[1] = other_loc[1] + dirToMovement[others_action][1];
        }

        let other_loc_ele = gameState.map[other_loc[0]][other_loc[1]];
        let nearest_target_id_to_other = undefined;

        if(other_loc_ele === "." || other_loc_ele === otherID){
             
            nearest_target_id_to_other = find_nearest_target_id_to_player(gameState, other_loc, other_objIDs);
            let nearest_target_loc_to_other = findLocation(nearest_target_id_to_other, gameState.map);
            let nearest_obj_to_other = findObjfromID(gameState, nearest_target_loc_to_other)

            // console.log("nearest_target_id_to_other: " + nearest_target_id_to_other);

            if (!(check_if_can_interact(nearest_obj_to_other, other_instance)) && check_if_can_interact(nearest_obj_to_other, player_instance)){
                let action = find_action_to_loc(gameState, player, nearest_target_loc_to_other);
                console.log("action case 1: " + action);
                return [action, nearest_target_loc_to_other];
            }
        }

        // if cant help the other player, find nearest obj to do
        let player_loc = [player[keyToInd.loc][0], player[keyToInd.loc][1]];

        let nearest_target_id_to_player = find_nearest_target_id_to_player(gameState, player_loc, player_objIDs);
        if ((nearest_target_id_to_player === nearest_target_id_to_other) && (nearest_target_id_to_other != undefined)){
            // console.log("nearest target overlap: " + nearest_target_id_to_player);
            nearest_target_id_to_player = find_next_nearest_target_id_to_player(gameState, player_loc, player_objIDs);
        }

        let nearest_target_loc_to_player = findLocation(nearest_target_id_to_player, gameState.map);
        let nearest_obj_to_player = findObjfromID(gameState, nearest_target_loc_to_player);
        
        // console.log('nearest_target_id_to_player: ' + nearest_target_id_to_player);

        if(check_if_can_interact(nearest_obj_to_player, player_instance)){
            let action = find_action_to_loc(gameState, player, nearest_target_loc_to_player);
            console.log("action case 2: " + action);
            return [action, nearest_target_loc_to_player];
        }
    }
     
    else{
        // is holding an obj, try deliver it
        let deliver_id = find_deliver_place(player_instance, gameState);
        // console.log('deliver_id: ' + deliver_id);
        let deliver_loc = findLocation(deliver_id, gameState.map);
        let action = find_action_to_loc(gameState, player, deliver_loc);
        console.log("action case 3: " + action);
        return [action, deliver_loc];
    }

    console.log("action is empty");
    return ([]);
}

function find_deliver_place(player_instance, gameState){
    let held_obj_id = player_instance.hold_object.id;
    // console.log('held_obj_id: ' + held_obj_id);
    for (deliver_id of gameState.all_deliver_places){
        if (held_obj_id.charAt(0).toUpperCase() === deliver_id.charAt(0)){
            return deliver_id;
        }
    }
    console.log("find_deliver_place is false");
    return false;
}





function findObjfromID(gamegState, id){
    for(const obj of gamegState.objs){
        if (obj.id === gamegState.map[id[0]][id[1]]){
            return(obj);
        }
    }
    console.log("cant find obj");
    return false;
}

function findAgentfromID(gameState, id){
    for(const agent of gameState.agents){
        if (agent.id === id){
            return(agent);
        }
    }
    console.log("cant find agent");
    return false;
}

function check_if_can_interact(obj, agent){
    if ((obj.weight <= agent.str) && (obj.fragility <= agent.dex)){
        return true;
    }
    console.log("cant interact");
    return false;
}

function find_action_to_loc(gameState, player, loc){
    let player_distance_action = [];

    for (const action of actions_list){
        let agent_loc = [player[keyToInd.loc][0], player[keyToInd.loc][1]];
        agent_loc[0] = agent_loc[0] + dirToMovement[action][0];
        agent_loc[1] = agent_loc[1] + dirToMovement[action][1];

        let agent_loc_ele = gameState.map[agent_loc[0]][agent_loc[1]];
        if(agent_loc_ele === "." || agent_loc_ele === player.id){
            distance = manhattanDistance(loc, agent_loc);
            player_distance_action.push([distance, action]);
        }
    }
    player_distance_action.sort(function(a, b){return a[0] - b[0]});
    return player_distance_action[0][1];
}


function find_nearest_target_id_to_player(gameState, player_loc, locs){
    player_distance_plan = [];
    for (const target_id of locs){ 
        let target_loc = findLocation(target_id, gameState.map);
        if (target_loc === []) continue;
        let player_distance = manhattanDistance(target_loc, player_loc);
        player_distance_plan.push([player_distance, target_id]);
    }
    player_distance_plan.sort(function(a, b){return a[0] - b[0]});

    let nearest_target_id_to_player = player_distance_plan[0][1];
    
    return nearest_target_id_to_player;
}

function find_next_nearest_target_id_to_player(gameState, player_loc, locs){
    player_distance_plan = [];
    for (const target_id of locs){ 
        let target_loc = findLocation(target_id, gameState.map);
        if (target_loc === []) continue;
        let player_distance = manhattanDistance(target_loc, player_loc);
        player_distance_plan.push([player_distance, target_id]);
    }

    player_distance_plan.sort(function(a, b){return a[0] - b[0]});

    if (player_distance_plan.length === 1){
        return player_distance_plan[0][1];
    }

    return player_distance_plan[1][1];
}