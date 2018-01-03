
class LocalStorageService
{constructor()
{this.storage=isLocalStorageSupported()?window.localStorage:new dummyStorage();this.boardComposition="boardComposition";this.movesBackup="movesBackup";this.moveCounter="moveCounter";}
getBoardComposition()
{let storageItem=this.storage.getItem(this.boardComposition);if(storageItem)return JSON.parse(storageItem);else return null;}
setBoardComposition(boardComposition)
{this.storage.setItem(this.boardComposition,JSON.stringify(boardComposition));}
getMovesBackup()
{let storageItem=this.storage.getItem(this.movesBackup);if(storageItem)return JSON.parse(storageItem);else return null;}
setMovesBackup(backup)
{return this.storage.setItem(this.movesBackup,JSON.stringify(backup));}
getMoveCounter()
{return this.storage.getItem(this.moveCounter);}
setMoveCounter(counter)
{return this.storage.setItem(this.moveCounter,counter);}
clearGameState()
{this.storage.clear();}}
class dummyStorage
{constructor()
{this.storage={};}
setItem(key,value)
{return this.storage[key]=String(value);}
getItem(key)
{return this.storage.hasOwnProperty(key)?this.storage[key]:undefined;}
clear()
{return this.storage={};}}
function isLocalStorageSupported()
{try
{let storage=window.localStorage;storage.setItem("test_key","test_value");storage.removeItem("test_key");return true;}
catch(error)
{return false;}}
class CurrentPegBoardComposition
{constructor(pegBoard)
{this.rows=[];pegBoard.forEach(row=>this.rows.push(row));}
getCurrentBoardValue(pegHolderPosition)
{return this.rows[pegHolderPosition.rowNr][pegHolderPosition.columnNr];}
changeBoardValue(pegHolderPosition,value)
{this.rows[pegHolderPosition.rowNr][pegHolderPosition.columnNr]=value;}
getWholeBoard()
{return this.rows;}}
class MoveCounter
{constructor(counter)
{if(counter>0)
{this.value=counter;}
else
{this.value=0;}}
get()
{return this.value;}
increase()
{this.value++;}
decrease()
{this.value--;}}
class Backup
{constructor(savedBackup,currentBoard,logToConsole=false)
{if(savedBackup==null)
{this.startField=[];this.beatenField=[];this.endField=[];}
else
{this.startField=savedBackup.startField;this.beatenField=savedBackup.beatenField;this.endField=savedBackup.endField;}
this.currentBoard=currentBoard;this.logBackupToConsole=logToConsole;}
makeBackup(movingPegPosition,beatenPegPosition,destinationPegPosition,moveCounter)
{this.startField.push(movingPegPosition);this.beatenField.push(beatenPegPosition);this.endField.push(destinationPegPosition);if(this.logBackupToConsole)
{logBackupingToConsole(this.startField[this.startField.length-1],this.beatenField[this.beatenField.length-1],this.endField[this.endField.length-1],moveCounter);}}
restoreBackup(applyActionsForBoardField,updateBoardComposition,moveCounter)
{applyActionsForBoardField(this.startField[this.startField.length-1],createPegIn,changeClassFlag);applyActionsForBoardField(this.beatenField[this.beatenField.length-1],createPegIn,changeClassFlag);applyActionsForBoardField(this.endField[this.endField.length-1],removePegFrom,changeClassFlag);updateBoardComposition(this.currentBoard,this.startField[this.startField.length-1],"peg");updateBoardComposition(this.currentBoard,this.beatenField[this.beatenField.length-1],"peg");updateBoardComposition(this.currentBoard,this.endField[this.endField.length-1],"empty");if(this.logBackupToConsole)
{logRestoringBackupToConsole(this.endField[this.endField.length-1],this.beatenField[this.beatenField.length-1],this.startField[this.startField.length-1],moveCounter);}
this.startField.pop();this.beatenField.pop();this.endField.pop();}
getBackup()
{return{"startField":this.startField,"beatenField":this.beatenField,"endField":this.endField};}
hasRecords()
{if(this.startField.length==0||this.beatenField.length==0||this.endField.length==0)
{return false;}
else return true;}}
function logBackupingToConsole(movingPegPosition,beatenPegPosition,destinationPegPosition,moveCounter)
{console.log(`*********** Backuping ************* - Move no.: ${moveCounter}\n`+`move from: (${movingPegPosition.rowNr} , ${movingPegPosition.columnNr}) to: (${destinationPegPosition.rowNr} , ${destinationPegPosition.columnNr})\n`+`beaten peg: (${beatenPegPosition.rowNr} , ${beatenPegPosition.columnNr})`);}
function logRestoringBackupToConsole(destinationPegPosition,beatenPegPosition,movingPegPosition,moveCounter)
{console.log(`*********** Restoring backup ************* - Move no.: ${moveCounter}\n`+`restore from: (${destinationPegPosition.rowNr} , ${destinationPegPosition.columnNr}) to: (${movingPegPosition.rowNr} , ${movingPegPosition.columnNr})\n`+`beaten peg: (${beatenPegPosition.rowNr} , ${beatenPegPosition.columnNr})`);}
class ErrorMessage
{constructor(message)
{this.message=document.getElementById("errorMessage");this.message.classList.add("bottomBar");this.message.textContent=message;}
show()
{this.message.classList.add("bottomBar--show");}
hide()
{this.message.classList.remove("bottomBar--show");}}
let localStorage=new LocalStorageService();console.log(localStorage);let startingPegBoard=solitaireGameInitialBoard(localStorage);window.onload=drawSolitaireGameBoard(startingPegBoard);let board=new CurrentPegBoardComposition(startingPegBoard);let moveCounter=new MoveCounter(localStorage.getMoveCounter());let movesBackup=new Backup(localStorage.getMovesBackup(),board,enableLogToConsole());let errorMessage=new ErrorMessage("Move not allowed!");let newGameButton=addNewGameButton();if(movesBackup.hasRecords())
{addBackButton(board);newGameButton.classList.add("navigation__button--first");}
updateCounterOnScreen(moveCounter.get());if(isGameOver(board))
{let amountOfPegsLeft=countPegsLeft(board);showGameOverMessageIncludingInfoAbout(amountOfPegsLeft);}
logToConsoleAllAllowedDestinations(board);function drawSolitaireGameBoard(pegBoard)
{let amountOfRows=pegBoard.length;let amountOfColumns=pegBoard[0].length;let assistantRows=createRowsForFlexAlligment(amountOfRows);assistantRows.forEach((assistantRow,rowNr)=>{for(let columnNr=0;columnNr<amountOfColumns;columnNr++)
{if(pegBoard[rowNr][columnNr]!="blank")
{assistantRow.appendChild(drawPegField(pegBoard,rowNr,columnNr));}};document.getElementById("pegBoard").appendChild(assistantRow);});}
function createRowsForFlexAlligment(amountOfRows)
{let pegBoardRows=[];for(let rowNr=0;rowNr<amountOfRows;rowNr++)
{let pegBoardRow=document.createElement("DIV");pegBoardRow.className="pegBoard__row";pegBoardRows.push(pegBoardRow);}
return pegBoardRows;}
function initialPegBoardValue(rowNumber,columnNumber)
{let pegBoard=solitaireGameInitialBoard(localStorage);return pegBoard[rowNumber][columnNumber];}
function solitaireGameInitialBoard(localStorage)
{let pegBoard;if(localStorage.getBoardComposition())
{pegBoard=localStorage.getBoardComposition();}
else
{pegBoard=[["blank","blank","peg","peg","peg","blank","blank"],["blank","blank","peg","peg","peg","blank","blank"],["peg","peg","peg","peg","peg","peg","peg"],["peg","peg","peg","empty","peg","peg","peg"],["peg","peg","peg","peg","peg","peg","peg"],["blank","blank","peg","peg","peg","blank","blank"],["blank","blank","peg","peg","peg","blank","blank"]];}
return pegBoard;}
function drawPegField(pegBoard,rowNr,columnNr)
{let pegHolder=document.createElement("DIV");pegHolder.id=`pegHolder${rowNr}${columnNr}`;pegHolder.classList.add("pegBoard__pegHolder");if(pegBoard[rowNr][columnNr]=="peg")
{createPegIn(pegHolder);pegHolder.classList.add("pegBoard__pegHolder--withPeg");}
if(pegBoard[rowNr][columnNr]=="empty")
{pegHolder.classList.add("pegBoard__pegHolder--empty");}
addEventHandlersFor("mouse",pegHolder);addEventHandlersFor("touch",pegHolder);return pegHolder;}
function createPegIn(pegHolder)
{let peg=document.createElement("IMG");peg.id="peg"+pegHolder.id.slice(9);peg.className="pegBoard__peg";peg.src="img/peg.png";pegHolder.appendChild(peg);}
function addEventHandlersFor(pointingMethod,pegHolder)
{let eventType=getEventType(pointingMethod);let eventTypeStart=eventType.start;let eventTypeEnd=eventType.end;pegHolder.addEventListener(eventTypeStart,function(startPoint)
{let dropDestination=startPoint.currentTarget;let peg=startPoint.currentTarget.firstElementChild;startPoint.preventDefault();errorMessage.hide();document.addEventListener(`${pointingMethod}move`,dragPegTo,false);pegHolder.addEventListener(eventTypeEnd,checkAbbilityToDropPeg,false);function dragPegTo(destination)
{if(pointingMethodIsTouch(pointingMethod))
{destination=destination.touches[0];}
move(peg).to(destination);dropDestination=determineDropDestination(destination);}
function determineDropDestination(destination)
{let elementBelow=getElementBelow(destination);if(elementBelow!=dropDestination)
{if(isDroppable(elementBelow))
{peg.style.cursor="pointer";elementBelow.classList.add("pegBoard__pegHolder--droppable");}
else{peg.style.cursor="no-drop";}
if(isDroppable(dropDestination))
{dropDestination.classList.remove("pegBoard__pegHolder--droppable");}
dropDestination=elementBelow;}
return dropDestination;}
function pointingMethodIsTouch(pointingMethod)
{if(pointingMethod=="touch")
{return true;}
else
{return false;}}
function move(element)
{return{to(currentPoint){element.style.left=currentPoint.pageX-element.offsetWidth/2+"px";element.style.top=currentPoint.pageY-element.offsetHeight/2+"px";element.style.zIndex=10;}};}
function getElementBelow(currentPoint)
{peg.hidden=true;let elementBelow=document.elementFromPoint(currentPoint.clientX,currentPoint.clientY);peg.hidden=false;return elementBelow;}
function isDroppable(elementBelow)
{if(elementBelow&&elementBelow.className&&elementBelow.classList.contains("pegBoard__pegHolder--empty"))
{return true;}
else
{return false;}}
function checkAbbilityToDropPeg(endPoint)
{let pegHolderOfMovingPeg=endPoint.currentTarget;document.removeEventListener(`${pointingMethod}move`,dragPegTo,false);if(isDroppable(dropDestination))
{dropDestination.classList.remove("pegBoard__pegHolder--droppable");drop(pegHolderOfMovingPeg,dropDestination);}
else
{returnPegToStartPointFrom(pegHolderOfMovingPeg);}
pegHolder.removeEventListener(eventTypeEnd,checkAbbilityToDropPeg,false);}
function returnPegToStartPointFrom(pegHolderOfMovingPeg)
{let movingPegPosition={rowNr:Number(pegHolderOfMovingPeg.id.substr(9,1)),columnNr:Number(pegHolderOfMovingPeg.id.substr(10,1))};applyActionsForBoardField(movingPegPosition,removePegFrom,createPegIn);}},false);}
function getEventType(pointingMethod)
{let eventTypeStart;let eventTypeEnd;switch(pointingMethod)
{case"mouse":eventTypeStart=`${pointingMethod}down`;eventTypeEnd=`${pointingMethod}up`;break;case"touch":eventTypeStart=`${pointingMethod}start`;eventTypeEnd=`${pointingMethod}end`;break;}
return{start:eventTypeStart,end:eventTypeEnd};}
function drop(pegHolderOfMovingPeg,pegDestitationHolder)
{let movingPeg=pegHolderOfMovingPeg.firstElementChild;let movingPegPosition={rowNr:Number(pegHolderOfMovingPeg.id.substr(9,1)),columnNr:Number(pegHolderOfMovingPeg.id.substr(10,1))};let pegDestitationPosition={rowNr:Number(pegDestitationHolder.id.substr(9,1)),columnNr:Number(pegDestitationHolder.id.substr(10,1))};let pegMove=checkAcceptableMoves(board,movingPegPosition);let direction=calculateMoveDirection(movingPegPosition,pegDestitationPosition);if((pegMove.moveAllowed[direction]==true)&&moveIsNotDiagonal(direction,movingPegPosition,pegDestitationPosition)&&moveStepIsOnlyAboutTwoFields(direction,movingPegPosition,pegDestitationPosition))
{applyActionsForBoardField(pegMove.beatenPegPosition[direction],removePegFrom,changeClassFlag);applyActionsForBoardField(movingPegPosition,removePegFrom,changeClassFlag);applyActionsForBoardField(pegMove.destinationPegPosition[direction],createPegIn,changeClassFlag);updateBoardComposition(board,movingPegPosition,"empty");updateBoardComposition(board,pegMove.beatenPegPosition[direction],"empty");updateBoardComposition(board,pegMove.destinationPegPosition[direction],"peg");addBackButton(board);newGameButton.classList.add("navigation__button--first");moveCounter.increase();updateCounterOnScreen(moveCounter.get());movesBackup.makeBackup(movingPegPosition,pegMove.beatenPegPosition[direction],pegMove.destinationPegPosition[direction],moveCounter.get());localStorage.setBoardComposition(board.getWholeBoard());localStorage.setMovesBackup(movesBackup.getBackup());localStorage.setMoveCounter(moveCounter.get());logToConsoleAllAllowedDestinations(board);}
else
{displayMessageThatMoveIsNotAllowed(pegDestitationHolder);applyActionsForBoardField(movingPegPosition,removePegFrom,createPegIn);}
if(isGameOver(board))
{let amountOfPegsLeft=countPegsLeft(board);showGameOverMessageIncludingInfoAbout(amountOfPegsLeft);}}
function checkAcceptableMoves(currentBoard,movingPegPosition)
{let beatenPegPosition={west:{rowNr:movingPegPosition.rowNr,columnNr:movingPegPosition.columnNr-1},east:{rowNr:movingPegPosition.rowNr,columnNr:movingPegPosition.columnNr+1},north:{rowNr:movingPegPosition.rowNr-1,columnNr:movingPegPosition.columnNr},south:{rowNr:movingPegPosition.rowNr+1,columnNr:movingPegPosition.columnNr}};let destinationPegPosition={west:{rowNr:movingPegPosition.rowNr,columnNr:movingPegPosition.columnNr-2,},east:{rowNr:movingPegPosition.rowNr,columnNr:movingPegPosition.columnNr+2,},north:{rowNr:movingPegPosition.rowNr-2,columnNr:movingPegPosition.columnNr,},south:{rowNr:movingPegPosition.rowNr+2,columnNr:movingPegPosition.columnNr,}};let moveAllowed={west:false,east:false,north:false,south:false};for(let key in moveAllowed)
{if(movingPegIsInAppropriatePosition(key,movingPegPosition)&&movingPegExist(currentBoard,movingPegPosition)&&pegToBeatExist(currentBoard,beatenPegPosition[key])&&destinationFieldIsEmpty(currentBoard,destinationPegPosition[key]))
{moveAllowed[key]=true;}
else
{moveAllowed[key]=false;}}
return{movingPegPosition,beatenPegPosition,destinationPegPosition,moveAllowed};}
function movingPegExist(currentBoard,movingPegPosition)
{if(currentBoard.getCurrentBoardValue(movingPegPosition)=="peg")
{return true;}
else
{return false;}}
function pegToBeatExist(currentBoard,beatenPegPositionValue)
{if(currentBoard.getCurrentBoardValue(beatenPegPositionValue)=="peg")
{return true;}
else
{return false;}}
function destinationFieldIsEmpty(currentBoard,destinationPegPositionValue)
{if(currentBoard.getCurrentBoardValue(destinationPegPositionValue)=="empty")
{return true;}
else
{return false;}}
function movingPegIsInAppropriatePosition(key,movingPegPosition)
{if(key=="west"&&movingPegPosition.columnNr<2)
{return false;}
else if(key=="east"&&movingPegPosition.columnNr>4)
{return false;}
else if(key=="north"&&movingPegPosition.rowNr<2)
{return false;}
else if(key=="south"&&movingPegPosition.rowNr>4)
{return false;}
else
{return true;}}
function moveIsNotDiagonal(key,movingPegPosition,destinationPegPosition)
{if((key=="west"||key=="east")&&(movingPegPosition.rowNr==destinationPegPosition.rowNr))
{return true;}
else if((key=="north"||key=="south")&&(movingPegPosition.columnNr==destinationPegPosition.columnNr))
{return true;}
else
{return false;}}
function moveStepIsOnlyAboutTwoFields(key,movingPegPosition,destinationPegPosition)
{if((key=="west"||key=="east")&&(Math.abs(movingPegPosition.columnNr-destinationPegPosition.columnNr)==2))
{return true;}
else if((key=="north"||key=="south")&&(Math.abs(movingPegPosition.rowNr-destinationPegPosition.rowNr)==2))
{return true;}
else
{return false;}}
function calculateMoveDirection(movingPegPosition,pegDestitationPosition)
{let moveDirection;if(movingPegPosition.rowNr-pegDestitationPosition.rowNr==0)
{if(movingPegPosition.columnNr-pegDestitationPosition.columnNr>0)
{moveDirection="west";}
else
{moveDirection="east";}}
else
{if(movingPegPosition.rowNr-pegDestitationPosition.rowNr>0)
{moveDirection="north";}
else
{moveDirection="south";}}
return moveDirection;}
function removePegFrom(pegHolder)
{while(pegHolder.hasChildNodes())
{pegHolder.removeChild(pegHolder.lastChild);}}
function applyActionsForBoardField(boardFieldPosition,...actions)
{let boardField=document.getElementById(`pegHolder${boardFieldPosition.rowNr}${boardFieldPosition.columnNr}`);for(let action of actions)
{action(boardField);}}
function updateBoardComposition(currentBoard,fieldPosition,updatedValue)
{currentBoard.changeBoardValue(fieldPosition,updatedValue);}
function changeClassFlag(pegHolder)
{pegHolder.classList.toggle("pegBoard__pegHolder--empty");pegHolder.classList.toggle("pegBoard__pegHolder--withPeg");}
function addBackButton(currentBoard)
{if(document.getElementById("backButton")==null)
{let backButton=document.createElement("BUTTON");backButton.id="backButton";backButton.className="navigation__button navigation__button--last";backButton.textContent="Back";document.getElementsByTagName("nav")[0].appendChild(backButton);backButton.onclick=()=>{moveCounter.decrease();updateCounterOnScreen(moveCounter.get());movesBackup.restoreBackup(applyActionsForBoardField,updateBoardComposition,moveCounter.get());localStorage.setBoardComposition(currentBoard.getWholeBoard());localStorage.setMovesBackup(movesBackup.getBackup());localStorage.setMoveCounter(moveCounter.get());logToConsoleAllAllowedDestinations(currentBoard);if(moveCounter.get()==0)
{document.getElementById("backButton").remove();newGameButton.classList.remove("navigation__button--first");localStorage.clearGameState();}};}}
function updateCounterOnScreen(value)
{let score=document.querySelector(".scorePanel__score");score.textContent=value;}
function displayMessageThatMoveIsNotAllowed(pegDestitationHolder)
{errorMessage.show();pegDestitationHolder.classList.add("pegBoard__pegHolder--nonDroppable");setTimeout(()=>{errorMessage.hide();pegDestitationHolder.classList.remove("pegBoard__pegHolder--nonDroppable");},2000);}
function isGameOver(currentBoard)
{let gameOver=false;if(findAllAllowedDestination(currentBoard).size==0)
{gameOver=true;}
return gameOver;}
function findAllAllowedDestination(currentBoard)
{let allowedDestinations=new Set();currentBoard.getWholeBoard().forEach((rowValue,rowNr,rowArray)=>{rowValue.forEach((columnValue,columnNr,columnArray)=>{let pegPositionToCheck={rowNr,columnNr};let pegMove=checkAcceptableMoves(currentBoard,pegPositionToCheck);for(let direction in pegMove.moveAllowed)
{if(pegMove.moveAllowed[direction]==true)
{let startPositionX=pegMove.movingPegPosition.rowNr;let startPositionY=pegMove.movingPegPosition.columnNr;let endPositionX=pegMove.destinationPegPosition[direction].rowNr;let endPositionY=pegMove.destinationPegPosition[direction].columnNr;let allowedDestination=`(${startPositionX}, ${startPositionY})->(${endPositionX}, ${endPositionY})`;allowedDestinations.add(allowedDestination);}}});});return allowedDestinations;}
function showGameOverMessageIncludingInfoAbout(amountOfPegsLeft)
{let message;if(amountOfPegsLeft==1)
{message="Congratulations! You've won!\n Do you want to play again?";}
else message=`Game over! You've failed to win. Your score is:\n- amount of moves: ${moveCounter.get()}\n- amount of Pegs left: ${amountOfPegsLeft}\n\nDo you want to play again?`;let messageBox=alertWith(message);applyUserReactionTo(messageBox);}
function countPegsLeft(currentBoard)
{let countPeg=0;currentBoard.getWholeBoard().forEach((rowValue,rowNr,rowArray)=>{rowValue.forEach((columnValue,columnNr,columnArray)=>{let pegPositionToCheck={rowNr,columnNr};if(currentBoard.getCurrentBoardValue(pegPositionToCheck)=="peg")
{countPeg++;}});});return countPeg;}
function enableLogToConsole()
{return true;}
function addNewGameButton()
{let newGameButton=document.getElementById("newGameButton");newGameButton.onclick=()=>{let messageBox=alertWith("Do you want to start new game?");applyUserReactionTo(messageBox);};return newGameButton;}
function alertWith(message)
{let modal=document.getElementById("modal");let modalBody=document.querySelector(".modal__message");modalBody.innerText=message;modal.style.display="flex";return modal;}
function applyUserReactionTo(messageBox)
{let newGameConfirmationButton=document.getElementById("modalOkButton");let newGameCancelationButton=document.getElementById("modalCancelButton");newGameConfirmationButton.onclick=()=>{localStorage.clearGameState();startNewGame();messageBox.style.display="none";};newGameCancelationButton.onclick=()=>{messageBox.style.display="none";};}
function startNewGame()
{if(document.getElementById("backButton"))
{document.getElementById("backButton").remove();newGameButton.classList.remove("navigation__button--first");}
localStorage.clearGameState();let initialPegBoard=solitaireGameInitialBoard(localStorage);redrawSolitaireGameBoard(initialPegBoard);board=new CurrentPegBoardComposition(initialPegBoard);moveCounter=new MoveCounter(localStorage.getMoveCounter());updateCounterOnScreen(moveCounter.get());movesBackup=new Backup(localStorage.getMovesBackup(),board,enableLogToConsole());logToConsoleAllAllowedDestinations(board);}
function redrawSolitaireGameBoard(initialPegBoard)
{initialPegBoard.forEach((rowValue,rowNr,rowArray)=>{rowValue.forEach((columnValue,columnNr,columnArray)=>{let pegHolder=document.getElementById(`pegHolder${rowNr}${columnNr}`);if(rowNr==Math.floor(rowArray.length/2)&&columnNr==Math.floor(columnArray.length/2))
{removePegFrom(pegHolder);pegHolder.classList.remove("pegBoard__pegHolder--withPeg");pegHolder.classList.add("pegBoard__pegHolder--empty");}
else if(columnValue=="peg")
{removePegFrom(pegHolder);createPegIn(pegHolder);pegHolder.classList.remove("pegBoard__pegHolder--empty");pegHolder.classList.add("pegBoard__pegHolder--withPeg");}});});}
function logToConsoleAllAllowedDestinations(currentBoard)
{let allowedDestinations="";for(let value of findAllAllowedDestination(currentBoard).values())
{allowedDestinations+=`${value}, `;}
return console.log(`Allowed destinations: ${allowedDestinations}
					Allowed destinations: ${findAllAllowedDestination(currentBoard).size}`);}