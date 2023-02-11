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

    if(curLowPlan.length == 0){
        curLowPlan = bfs_action_simp(playerID, gameState, tar_loc = findLocation(curHighPlan[0],gameState.map));
        
        if(curLowPlan.length!=0){
            //if found keep moving
            curLowPlan.push("interact");
            curHighPlan.shift();
        }
    const next_action = curLowPlan.shift();
    executeAction(playerID, gameState, next_action);
    }

    if(curHighPlan.length == 0){
        curHighPlan = high_level_action(playerID, gameState, tar_loc = findLocation(curHighPlan[0],gameState.map));
        
        if(curHighPlan.length!=0){
            //if found keep moving
            curHighPlan.push("interact");
            curLowPlan.shift();
        }
    const next_action = curHighPlan.shift();
    executeAction(playerID, gameState, next_action);
    }
     
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

const low_level_actions_list = [control.up, control.down, control.left, control.right, control.wait]; // pickup and dropoff object/obstacle?
const high_level_actions_list = [deliver_object, remove_obstacle, wait];

function bfs_action_simp(agentID, gameState, tar_loc){
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


function high_level_action(agentID, gameState, tar_loc){
    // let robot_level = robot1.level;
    let robot_level = robotLevel;
    let predicted_human_action = null; // assume initially level 0
    
    predicted_human_action = level_recursion(predicted_human_action, robot_level);
    robot_action = get_robot_action_bfs(agentID, gameState, tar_loc, predicted_human_action);

    return robot_action;
}

function get_robot_action_bfs(agentID, gameState, tar_loc, predicted_human_action){

}

function level_recursion(predicted_human_action, level){
    if(level == 0){
        return predicted_human_action; // egocentric
    }
    return level_recursion(predict_human_action_by_EP(level), level-1);
}

function predict_human_action_by_EP(level){
    if(human1.action==null){
        return high_level_actions_list[Math.floor(Math.random() * high_level_actions_list.length)];
    }
    else{ // to do: use key-value map or dict of possible action, ep (for each human's current action
        if (level == 1){
            if(human1.action == actions.holding){
                return high_level_actions_list[0];
            }
            else if(human1.action == actions.notHolding){
                return high_level_actions_list[2];
            }
            else if(human1.action == actions.lifting){
                return high_level_actions_list[0];
            }
            else if(human1.action == actions.interact){
                return high_level_actions_list[0];
            }
            else if(human1.action == actions.wait){
                return high_level_actions_list[2];
            }
        }
        else if (level == 2){ // dep more on interact on object or obstacle
            if(human1.action == actions.holding){
                return high_level_actions_list[0];
            }
            else if(human1.action == actions.notHolding){
                return high_level_actions_list[2];
            }
            else if(human1.action == actions.lifting){  
                return high_level_actions_list[0];
            }
            else if(human1.action == actions.interact){
                return high_level_actions_list[0];
            }
            else if(human1.action == actions.wait){
                return high_level_actions_list[2];
            }
        }
    }
}
