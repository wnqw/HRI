const canDropEverywhere = false;

let held_directions = []; //State of which arrow keys we are holding down
let speed = 1;
let curStage;
let totalScore = 0;
let currentScore = 0;
let currentStage = 0;

// logging vars
let robot_steps = [];
let human_steps = [];

let human_loc = [];
let robot_loc = [];

let robot_curr_action = undefined;
let human_curr_action = undefined;

let start_time_robot = 0;
let start_time_human = 0;
let end_time_robot = 0;
let end_time_human = 0;
let time_taken_robot = 0;
let time_taken_human = 0;

function initializeSideInfo(){
   let mapCount = document.querySelector("#mapcount");
   let strStat  = document.querySelector("#strstat");
   let dexStat  = document.querySelector("#dexstat");
   let totalScoreText = document.querySelector("#total-score");
   let currentScoreText = document.querySelector("#current-score");
   let objectiveText = document.querySelector("#objective");
   let currentCollectedText = document.querySelector("#collected");


   strStat.innerText = "Str = " + curStage.agents[0].str;
   dexStat.innerText = "Dex = " + curStage.agents[0].dex;
   mapCount.innerHTML = "<b>Map</b>: " + (currentStage+1) + "/" + stages.length;
   totalScoreText.innerHTML = "<b>Total Score</b>: " + totalScore;
   currentScoreText.innerHTML = "<b>Current Score</b>: " + currentScore;
   if(curStage.goal === 1){
      objectiveText.innerHTML = "<b>Objective</b>: Collect " + curStage.goal + " object";
   }else{
      objectiveText.innerHTML = "<b>Objective</b>: Collect " + curStage.goal + " objects";
   }
   currentCollectedText.innerHTML = "<b>Collected Object</b>:" + curStage.collected.length;
}

//Set up the game loop
const step = () => {
    renderMap(curStage);
    window.requestAnimationFrame(() => {
       step();
    })
 }

function checkEndGame(stage){
   if(stage.goal === stage.collected.length) {
      console.log('stage.collected.length: ' + stage.collected.length);
      return true;
   }
   return false;
}

//Need to reset players 
function resetPlayers(stage){

   for(let i = 0; i < stage.agents.length;i++){
      stage.agents[i].direction = directions.up;
      stage.agents[i].hold_object = null;
      stage.agents[i].action = actions.notHolding;
      stage.agents[i].loc = findLocation(stage.agents[i].id, stage.map);
   }

   setHighPlan(playerID.robot, stage);
}

function clearStage(){
   //Display Clear Message and reset or stop
   console.log("Setting the stage to the next stage...");
   //Move to the next stage if possible
   currentStage +=1;
   if(currentStage < stages.length){
      curStage = stages[currentStage];

      totalScore += currentScore;
      currentScore = 0;
      curStage.collected = [];
      resetPlayers(curStage); 
      initializeSideInfo();  

   }else{
      //done
      console.log("All games are completed!");
   }
}

function startGame(stages){
   curStage = stages[currentStage];
   resetPlayers(curStage);
   initializeSideInfo();
   renderTransition();
   //Initialize the robot.
   //nextAction("2", curStage);

   step();
}

startGame(stages);

// control //

/* Direction key state */

const keys = {
    "ArrowUp": directions.up,
    "ArrowLeft": directions.left,
    "ArrowRight": directions.right,
    "ArrowDown": directions.down,
    " " : actions.interact,
    "Enter": actions.wait,
    "w": directions.up,
    "s": directions.down,
    "a": directions.left,
    "d": directions.right,
}

function executeAction(playerID, stage, cmd, guiupdate = true){
   let temp_player = findObjectbyID(playerID, stage);
   let curMap = stage.map;
   let oldLoc = findLocation(playerID,curMap);  //TODO: change this to maintain within player class
   let newLoc = [oldLoc[0],oldLoc[1]];

   //Movement
   if(cmd===directions.up && temp_player.direction===directions.up)  { newLoc[0] -= 1; }
   if(cmd===directions.down && temp_player.direction===directions.down) { newLoc[0] += 1;  }
   if(cmd===directions.left && temp_player.direction===directions.left) { newLoc[1] -= 1; }
   if(cmd===directions.right && temp_player.direction===directions.right) { newLoc[1] += 1; }
   //Check if a new location is empty
   if(curMap[newLoc[0]][newLoc[1]]==="."){
      curMap[newLoc[0]][newLoc[1]] = playerID;
      curMap[oldLoc[0]][oldLoc[1]] = "."; 
      temp_player.loc = newLoc;
   }

   //direction
   if((cmd===directions.up || cmd===directions.down || cmd ===directions.left || cmd === directions.right) && 
      cmd !== temp_player.direction)
   temp_player.direction = cmd;
      
   //Interact with an object 
   if(cmd === actions.interact){
      //get the direction 
      let dir = [oldLoc[0], oldLoc[1]];
      if(temp_player.direction===directions.up)  { dir[0] -= 1;}
      if(temp_player.direction===directions.down) { dir[0] += 1;  }
      if(temp_player.direction===directions.left) { dir[1] -= 1; }
      if(temp_player.direction===directions.right) { dir[1] += 1; }

      //Case 1: Pickup
      //if no object and right next to an object in the correct direction 
      //and not holding any object
      //and if str >= weight and dex >= fragility, then pick up. 
      //Pick up results in remove the object from the map
      //TODO: curStage -> generic one? 
      //curStage will maintain the class name to be used later.
      let front = findObjectbyID(curMap[dir[0]][dir[1]], curStage);

      if(front instanceof GameObject && temp_player.action !== actions.holding){
         //check can interact
         if(temp_player.str >= front.weight && temp_player.dex >= front.fragility){
            //if it is obstacle, just remove it.
            if(front.isObstacle){
               curMap[dir[0]][dir[1]] = ".";
            }else{
               temp_player.action = actions.holding;
               temp_player.hold_object = front;
               //Don't remove so you can return
               //curMap[dir[0]][dir[1]] = ".";
               
               //don't really need this (yet). Need to update every time player moves too.
               //front.loc = player1.loc;
            }
         }
      }
      //Case 2: Drop down
      //If holding object and the space in front is empty or deilver,
      //Then drop down the object
      //Alternative setup: hold spacebar to hold and release to drop. 
      else if(temp_player.action === actions.holding){
         if(front === "." && canDropEverywhere){
            curMap[dir[0]][dir[1]] = temp_player.hold_object;
            temp_player.action = actions.notHolding;
            temp_player.hold_object = null;
            //don't really need this (yet)
            //front.loc = dir;   
         }
         if(front instanceof Location && front.type === temp_player.hold_object.type){
            //deliver at the correct location 
            stage.collected.push(temp_player.hold_object);
            temp_player.action = actions.notHolding;
            temp_player.hold_object = null; 

            if(guiupdate){
               currentScore += temp_player.rewards[front.type];
               let currentScoreText = document.querySelector("#current-score");
               currentScoreText.innerHTML = "<b>Current Score</b>: " + currentScore;
               let currentCollectedText = document.querySelector("#collected");
               currentCollectedText.innerHTML = "<b>Collected Object</b>:" + stage.collected.length;
            }
         }
         else if(front instanceof Object && front.type === temp_player.hold_object.type && temp_player.hold_object.id === front.id){
            temp_player.action = actions.notHolding;
            temp_player.hold_object = null;
         }
      }
      //TODO: Case 3: Multi agent holding
   }
}


function movePlayer(cmd){
   executeAction(playerID.human,curStage,cmd);

   //do any meaningful command will result in a movement of AI.
   if(typeof cmd !== "undefined"){
      //move AI

      // let start_time_robot = performance.now();
      nextAction(playerID.robot, curStage);
      // let end_time_robot = performance.now();
      // let time_taken_robot = end_time_robot - start_time_robot;
      // console.log('time_taken_robot: ', time_taken_robot + " ms");
   }


   if(checkEndGame(curStage)){
       console.log("Game Ends!!");
       clearStage();
   }

}

// logging:

// human_loc = curStage.agents[0].loc;
// robot_loc = curStage.agents[1].loc;

// console.log("human_loc: ", human_loc);
// console.log("robot_loc: ", robot_loc);

// robot_curr_action = curStage.agents[1].action;
// human_curr_action = curStage.agents[0].action;
// console.log("robot_curr_action: ", robot_curr_action);
// console.log("human_curr_action: ", human_curr_action);

document.addEventListener("keydown", (e) => {
   // end_time_human = performance.now();
   // time_taken_human = end_time_human - start_time_human;
   // start_time_human = performance.now();
   // console.log('time_taken_human: ', time_taken_human + " ms");

   if (e.key === "n") {
      console.log("skip to the next map");
      clearStage();
      return;
   }
   movePlayer(keys[e.key]);

   // if ((keys[e.key] !== actions.wait) && (keys[e.key] !== actions.interact)) {
   //    human_steps.push(keys[e.key]);
   // }
   // console.log("human number of steps: ", human_steps.length);
});