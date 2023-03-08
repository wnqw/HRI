const dirToMovement = {
    up: [-1,0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1]
}

let robotLevel = 0;
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

// function getHighPlan(playerID, gameState){
    
// }

function nextAction(playerID, gameState){

    if(curHighPlan.length===0 && curLowPlan.length ===0) return;

    if(curLowPlan.length == 0){
        curLowPlan = bfs_level1(playerID, "1", gameState, tar_loc = findLocation(curHighPlan[0],gameState.map), undefined);
        
        // if (robotLevel == 0) {
        //     curLowPlan = bfs_level0(playerID, gameState, tar_loc = findLocation(curHighPlan[0],gameState.map));
        // }
        // if (robotLevel == 1) {
        //     curLowPlan = bfs_level1(playerID, gameState, tar_loc = findLocation(curHighPlan[0],gameState.map));
        // }
        // if (robotLevel == 2) {
        //     curLowPlan = bfs_level2(playerID, gameState, tar_loc = findLocation(curHighPlan[0],gameState.map));
        // }

        if(curLowPlan.length != 0){
            //if found keep moving
            curLowPlan.push("interact");
            curHighPlan.shift();
        }
    }
    
    const next_action = curLowPlan.shift();

    executeAction(playerID, gameState, next_action);
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
    console.log("L0 start");

    let q = [];    
   
    //Manually construct the initial simplified player list
    const agents = []; 
    for(const a of gameState.agents){
       //The key elements are just id, location, and direction (not holding yet)
       agents.push([ a.id, a.loc, a.direction]);
    }
    const player_ind = findIndfromID(agents, agentID);

    if (typeof searchNode === "undefined"){
        console.log("L0 searchNode undefined");
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
            console.log("found");
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



function bfs_level1(agentID, otherID, gameState, tar_loc, searchNode){
    console.log("L1 start");

    let q = [];    
   
    //Manually construct the initial simplified player list
    const agents = []; 
    for(const a of gameState.agents){
       //The key elements are just id, location, and direction (not holding yet)
       agents.push([ a.id, a.loc, a.direction]);
    }
    const player_ind = findIndfromID(agents, agentID);

    if (typeof searchNode === "undefined"){
        console.log("L1 searchNode undefined");
        searchNode = {
            agents: agents,
            hist: []
        };
    }

    q.push(searchNode); 
    let ind = 0;
    while(ind < q.length){
        let curSearchNode = q[ind++];

        if(checkGoalLocation(curSearchNode.agents[player_ind], tar_loc) ){
            console.log("found");
            return(q[ind-1].hist);
        }
        
        for(const a of actions_list){
            let nextNode = nextState(curSearchNode, a, agentID, gameState)
            let others_leve0_actions = bfs_level0(otherID, gameState, tar_loc, nextNode);
            console.log(others_leve0_actions);

            // get agent action response to others_leve0_actions[0]
            let agent_response_action = agent_response_action(agentID, otherID, others_leve0_actions[0], gameState, nextNode);
            let nextNode2 = nextState(nextNode, agent_response_action, agentID, gameState);

            if(checkDupedSimpState(q, nextNode) === false){
                q.push(nextNode);
            }
        }
    }    

    console.log("L1 Not Found");
    return([]);
}

function agent_response_action(agentID, otherID, others_action, gameState, nextNode){
    let other_player = nextNode.agents[findIndfromID(nextNode.agents, otherID)];
    let player = nextNode.agents[findIndfromID(nextNode.agents, agentID)];
    let curHighPlan_copy = curHighPlan;
    let new_tar_loc = findLocation(curHighPlan_copy[0], gameState.map);
     

    if(others_action === other_player[keyToInd.dir]){
        let other_loc = [other_player[keyToInd.loc][0], other_player[keyToInd.loc][1]];
        other_loc[0] = other_loc[0] + dirToMovement[others_action][0];
        other_loc[1] = other_loc[1] + dirToMovement[others_action][1];

        let other_loc_ele = gameState.map[other_loc[0]][other_loc[1]];
        if(other_loc_ele === "." || other_loc_ele === id){
            let others_distance_plan = [];

            for (const plan_id in curHighPlan_copy){
                let plan_loc = findLocation(plan_id, gameState.map);
                let others_distance = manhattanDistance(plan_loc, other_loc);
                others_distance_plan.push([others_distance, plan_id]);
            }
            others_distance_plan.sort(function(a, b){return a[0] - b[0]});
            
            if (others_distance_plan[0][1] === curHighPlan_copy[0]){  
                curHighPlan_copy.shift(); // this agent yeild if his current goal overlaps with the other agent's 
                new_tar_loc = findLocation(curHighPlan_copy[0], gameState.map);
            }
        }
    }
    let player_distance_action = [];

    for (const action of actions_list){
        if (action != control.wait){
            let agent_loc = [player[keyToInd.loc][0], player[keyToInd.loc][1]];
            agent_loc[0] = agent_loc[0] + dirToMovement[action][0];
            agent_loc[1] = agent_loc[1] + dirToMovement[action][1];

            let agent_loc_ele = gameState.map[agent_loc[0]][agent_loc[1]];
            if(agent_loc_ele === "." || agent_loc_ele === id){
                distance = manhattanDistance(new_tar_loc, agent_loc);
                player_distance_action.push([distance, action]);
            }
        }
    }
    player_distance_action.sort(function(a, b){return a[0] - b[0]});
    return player_distance_action[0][1];
}






function bfs_level2(agentID, otherID, gameState, tar_loc){
    console.log("L2 start");

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
        
        for(const a of actions_list){
            let nextNode = nextState(curSearchNode, a, agentID, gameState)
            let others_leve1_actions = bfs_level1(otherID, gameState, tar_loc, nextNode);
            // get agent action response to others_leve0_actions[0]
            let agent_response_action = agent_response_action(agentID, otherID, others_leve1_actions[0], gameState, nextNode);
            let nextNode2 = nextState(nextNode, agent_response_action, agentID, gameState);

            if(checkDupedSimpState(q, nextNode2) === false){
                q.push(nextNode2);
            }
        }
    }    

    console.log("L2 Not Found");
    return([]);
}