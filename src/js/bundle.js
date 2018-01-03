class LocalStorageService
{
	constructor()
	{
		this.storage = isLocalStorageSupported() ? window.localStorage : new dummyStorage();
		this.boardComposition = "boardComposition";
		this.movesBackup = "movesBackup" ;
		this.moveCounter = "moveCounter";
	}


	getBoardComposition()
	{
		let storageItem = this.storage.getItem( this.boardComposition );

		if ( storageItem ) return JSON.parse( storageItem );
		else return null;
	}

	setBoardComposition( boardComposition )
	{
		this.storage.setItem( this.boardComposition, JSON.stringify(boardComposition) ) ;
	}


	getMovesBackup()
	{
		let storageItem = this.storage.getItem( this.movesBackup );

		if ( storageItem ) return JSON.parse( storageItem );
		else return null;
	}

	setMovesBackup( backup )
	{
		return this.storage.setItem( this.movesBackup, JSON.stringify(backup) ) ;
	}


	getMoveCounter()
	{
		return this.storage.getItem( this.moveCounter );
	}

	setMoveCounter( counter )
	{
		return this.storage.setItem( this.moveCounter, counter ) ;
	}


	clearGameState()
	{
		this.storage.clear();
	}

}


class dummyStorage
{
  constructor()
	{
		this.storage = {};
	}

  setItem( key, value )
	{
    return this.storage[key] = String( value );
  }

  getItem( key )
	{
    return this.storage.hasOwnProperty( key ) ? this.storage[key] : undefined;
  }

  clear( )
	{
    return this.storage = {};
  }
}


function isLocalStorageSupported()
{
	try
	{
		let storage = window.localStorage;
		storage.setItem( "test_key", "test_value" );
		storage.removeItem( "test_key" );
		return true;
	}
	catch( error )
	{
		return false;
	}
}

class CurrentPegBoardComposition
{
	constructor( pegBoard )
	{
		this.rows = [];
		pegBoard.forEach( row => this.rows.push( row ) );
	}

	getCurrentBoardValue( pegHolderPosition )
	{
		return this.rows[pegHolderPosition.rowNr][pegHolderPosition.columnNr];
	}

	changeBoardValue( pegHolderPosition, value )
	{
		this.rows[pegHolderPosition.rowNr][pegHolderPosition.columnNr] = value;
	}
	getWholeBoard()
	{
		return this.rows;
	}
}

class MoveCounter
{
	constructor( counter )
	{
		if ( counter > 0 )
		{
			this.value = counter ;
		}
		else
		{
			this.value = 0;
		}
	}

	get()
	{
		return this.value;
	}

	increase()
	{
		this.value++ ;
	}

	decrease()
	{
		this.value-- ;
	}
}

class Backup
{
	constructor( savedBackup, currentBoard, logToConsole = false )
	{
		if ( savedBackup == null)
		{
			this.startField = [];
			this.beatenField = [];
			this.endField = [];
		}
		else
		{
			this.startField = savedBackup.startField ;
			this.beatenField = savedBackup.beatenField;
			this.endField = savedBackup.endField;
		}
		this.currentBoard = currentBoard;
		this.logBackupToConsole = logToConsole;
	}

	makeBackup ( movingPegPosition, beatenPegPosition, destinationPegPosition, moveCounter )
	{
		this.startField.push( movingPegPosition );
		this.beatenField.push( beatenPegPosition );
		this.endField.push( destinationPegPosition );

		if (this.logBackupToConsole)
		{
				logBackupingToConsole( this.startField[this.startField.length - 1],
									   					 this.beatenField[this.beatenField.length - 1],
									   			 		 this.endField[this.endField.length - 1],
														 moveCounter
									 				 	 );
		}
	}

	restoreBackup(applyActionsForBoardField, updateBoardComposition, moveCounter)
	{
		applyActionsForBoardField( this.startField[this.startField.length - 1], createPegIn, changeClassFlag );
		applyActionsForBoardField( this.beatenField[this.beatenField.length - 1], createPegIn, changeClassFlag );
		applyActionsForBoardField( this.endField[this.endField.length - 1], removePegFrom, changeClassFlag );

		updateBoardComposition( this.currentBoard, this.startField[this.startField.length - 1], "peg" );
		updateBoardComposition( this.currentBoard, this.beatenField[this.beatenField.length - 1], "peg" );
		updateBoardComposition( this.currentBoard, this.endField[this.endField.length - 1], "empty" );

		if ( this.logBackupToConsole )
		{
				logRestoringBackupToConsole( this.endField[this.endField.length - 1],
																		 this.beatenField[this.beatenField.length - 1],
																		 this.startField[this.startField.length - 1],
																		 moveCounter
																		);
		}

		this.startField.pop();
		this.beatenField.pop();
		this.endField.pop();
	}

	getBackup()
	{
		return {
			"startField"  : this.startField,
			"beatenField" : this.beatenField,
			"endField"    : this.endField
		};
	}

	hasRecords()
	{
		if ( this.startField.length == 0 || this.beatenField.length == 0 || this.endField.length == 0 )
		{
			return false;
		}
		else return true;
	}

}


function logBackupingToConsole( movingPegPosition, beatenPegPosition, destinationPegPosition, moveCounter )
{
	console.log(`*********** Backuping ************* - Move no.: ${moveCounter}\n` +
	`move from: (${movingPegPosition.rowNr} , ${movingPegPosition.columnNr}) to: (${destinationPegPosition.rowNr} , ${destinationPegPosition.columnNr})\n` +
	`beaten peg: (${beatenPegPosition.rowNr} , ${beatenPegPosition.columnNr})` );
}

function logRestoringBackupToConsole( destinationPegPosition, beatenPegPosition, movingPegPosition, moveCounter )
{
	console.log(`*********** Restoring backup ************* - Move no.: ${moveCounter}\n` +
  						`restore from: (${destinationPegPosition.rowNr} , ${destinationPegPosition.columnNr}) to: (${movingPegPosition.rowNr} , ${movingPegPosition.columnNr})\n` +
  						`beaten peg: (${beatenPegPosition.rowNr} , ${beatenPegPosition.columnNr})` );
}

class ErrorMessage
{
	constructor( message )
	{
		this.message = document.getElementById( "errorMessage" ) ;
		this.message.classList.add( "bottomBar" );
		this.message.textContent = message ;
	}

	show()
	{
		this.message.classList.add( "bottomBar--show" );
	}

	hide()
	{
		this.message.classList.remove( "bottomBar--show" ) ;
	}
}

let localStorage = new LocalStorageService();
console.log(localStorage);
let startingPegBoard = solitaireGameInitialBoard( localStorage );

window.onload = drawSolitaireGameBoard( startingPegBoard ) ;

let board = new CurrentPegBoardComposition( startingPegBoard );
let moveCounter = new MoveCounter( localStorage.getMoveCounter() );
let movesBackup = new Backup( localStorage.getMovesBackup(), board, enableLogToConsole() );
let errorMessage = new ErrorMessage( "Move not allowed!" );
let newGameButton = addNewGameButton();

if ( movesBackup.hasRecords() )
{
	addBackButton( board );
	newGameButton.classList.add("navigation__button--first");
}
updateCounterOnScreen( moveCounter.get() );

if ( isGameOver( board ) )
{
	let amountOfPegsLeft = countPegsLeft( board );
	showGameOverMessageIncludingInfoAbout(amountOfPegsLeft);
}

logToConsoleAllAllowedDestinations( board );




function drawSolitaireGameBoard( pegBoard )
{
	let amountOfRows = pegBoard.length;
	let amountOfColumns = pegBoard[0].length;
	let assistantRows = createRowsForFlexAlligment( amountOfRows );

	assistantRows.forEach( ( assistantRow, rowNr ) =>
	{
			for ( let columnNr = 0 ; columnNr < amountOfColumns ; columnNr++ )
			{
					if ( pegBoard[rowNr][columnNr] != "blank" )
					{
						assistantRow.appendChild( drawPegField( pegBoard, rowNr, columnNr ) );
					}
			};

			document.getElementById( "pegBoard" ).appendChild( assistantRow );
	});
}



function createRowsForFlexAlligment( amountOfRows )
{
	let pegBoardRows = [];

	for ( let rowNr = 0 ; rowNr < amountOfRows ; rowNr++ )
	{
		//creating rows of board, which in CSS will be displayed as "flex" (one under another)
		let pegBoardRow = document.createElement( "DIV" );
		pegBoardRow.className = "pegBoard__row" ;
		pegBoardRows.push( pegBoardRow );
	}

	return pegBoardRows;
}



function initialPegBoardValue( rowNumber, columnNumber )
{
	let pegBoard = solitaireGameInitialBoard( localStorage );

	return pegBoard[rowNumber][columnNumber] ;
}



function solitaireGameInitialBoard( localStorage )
{
	let pegBoard;

	if( localStorage.getBoardComposition() )
	{
		pegBoard = localStorage.getBoardComposition();
	}
	else
	{
		pegBoard = [
			[ "blank" , "blank" , "peg" , "peg"   	   , "peg" , "blank" , "blank"   ] ,
			[ "blank" , "blank" , "peg" , "peg"    	   , "peg" , "blank" , "blank"   ] ,
			[ "peg"   , "peg"   , "peg" , "peg"    	   , "peg" , "peg"   , "peg"     ] ,
			[ "peg"   , "peg"   , "peg" , "empty"      , "peg" , "peg"   , "peg"     ] ,
			[ "peg"   , "peg"   , "peg" , "peg"    	   , "peg" , "peg"   , "peg"     ] ,
			[ "blank" , "blank" , "peg" , "peg"    	   , "peg" , "blank" , "blank"   ] ,
			[ "blank" , "blank" , "peg" , "peg"    	   , "peg" , "blank" , "blank"   ]
		] ;
	}

	return pegBoard;
}



function drawPegField( pegBoard, rowNr, columnNr )
{
		let pegHolder = document.createElement( "DIV" );
		pegHolder.id = `pegHolder${rowNr}${columnNr}` ;
		pegHolder.classList.add( "pegBoard__pegHolder" ) ;

		if ( pegBoard[rowNr][columnNr] == "peg" )
		{
			createPegIn( pegHolder );
			pegHolder.classList.add( "pegBoard__pegHolder--withPeg" );
		}
		if ( pegBoard[rowNr][columnNr] == "empty" )
		{
			pegHolder.classList.add( "pegBoard__pegHolder--empty" );
		}

		addEventHandlersFor( "mouse", pegHolder );
		addEventHandlersFor( "touch", pegHolder );

		return pegHolder;
}



function createPegIn( pegHolder )
{
		let peg = document.createElement( "IMG" );
		peg.id = "peg" + pegHolder.id.slice(9) ;
		peg.className = "pegBoard__peg" ;
		peg.src = "img/peg.png" ;
		pegHolder.appendChild( peg ) ;
}



function addEventHandlersFor( pointingMethod, pegHolder )
{
	let eventType = getEventType( pointingMethod );
	let eventTypeStart = eventType.start;
	let eventTypeEnd = eventType.end;

	pegHolder.addEventListener( eventTypeStart, function (startPoint)
	{
			let dropDestination = startPoint.currentTarget;
			let peg = startPoint.currentTarget.firstElementChild;
			startPoint.preventDefault();  //prevent from hover effect and scrolling during touch move
			errorMessage.hide();
			document.addEventListener( `${pointingMethod}move`, dragPegTo , false );
			pegHolder.addEventListener( eventTypeEnd, checkAbbilityToDropPeg, false );

			function dragPegTo( destination )
			{
				if ( pointingMethodIsTouch( pointingMethod ) )
				{
					destination = destination.touches[0];
				}

				move( peg ).to( destination );
				dropDestination = determineDropDestination( destination );
			}


			function determineDropDestination( destination )
			{
				let elementBelow = getElementBelow( destination );

				if ( elementBelow != dropDestination )
				{
					if ( isDroppable(elementBelow) )
					{
						peg.style.cursor = "pointer";
						elementBelow.classList.add("pegBoard__pegHolder--droppable");
					}
					else {
						peg.style.cursor = "no-drop";
					}

					if ( isDroppable( dropDestination ) )
					{
						dropDestination.classList.remove( "pegBoard__pegHolder--droppable" );
					}
					dropDestination = elementBelow;
				}

				return dropDestination;
			}


			function pointingMethodIsTouch( pointingMethod )
			{
				if ( pointingMethod == "touch" )
				{
					return true;
				}
				else
				{
					return false;
				}
			}


			function move( element )
			{
				return {

					to( currentPoint ) {
						element.style.left = currentPoint.pageX - element.offsetWidth/2 + "px" ;
						element.style.top = currentPoint.pageY - element.offsetHeight/2 + "px" ;
						element.style.zIndex = 10;
					}
				};

			}


			function getElementBelow( currentPoint )
			{
				peg.hidden = true;
				let elementBelow = document.elementFromPoint( currentPoint.clientX, currentPoint.clientY );
				peg.hidden = false;

				return elementBelow;
			}


			function isDroppable( elementBelow )
			{
				if ( elementBelow && elementBelow.className && elementBelow.classList.contains("pegBoard__pegHolder--empty") )
				{
					return true;
				}
				else
				{
					return false;
				}
			}


			function checkAbbilityToDropPeg( endPoint )
			{
				let pegHolderOfMovingPeg = endPoint.currentTarget;
				document.removeEventListener( `${pointingMethod}move`, dragPegTo , false );

				if ( isDroppable( dropDestination ) )
				{
					dropDestination.classList.remove( "pegBoard__pegHolder--droppable" );
					drop( pegHolderOfMovingPeg, dropDestination );
				}
				else
				{
					returnPegToStartPointFrom( pegHolderOfMovingPeg );
				}

				pegHolder.removeEventListener( eventTypeEnd, checkAbbilityToDropPeg, false );
			}


			function returnPegToStartPointFrom( pegHolderOfMovingPeg )
			{
				let movingPegPosition =
				{
					rowNr 			: 	Number( pegHolderOfMovingPeg.id.substr(9,1) ) ,
					columnNr		: 	Number( pegHolderOfMovingPeg.id.substr(10,1) )
				} ;
				applyActionsForBoardField( movingPegPosition , removePegFrom, createPegIn );
			}

		}, false);
}



function getEventType( pointingMethod )
{
	let eventTypeStart;
	let eventTypeEnd;

	switch ( pointingMethod )
	{
		case "mouse" :
			eventTypeStart = `${pointingMethod}down` ;
			eventTypeEnd = `${pointingMethod}up` ;
			break;

		case "touch" :
			eventTypeStart = `${pointingMethod}start` ;
			eventTypeEnd = `${pointingMethod}end` ;
			break;
	}

	return {
		start: eventTypeStart,
		end: eventTypeEnd
	};

}



function drop( pegHolderOfMovingPeg, pegDestitationHolder )
{
	let movingPeg = pegHolderOfMovingPeg.firstElementChild;
	let movingPegPosition =
	{
		rowNr 			: 	Number( pegHolderOfMovingPeg.id.substr(9,1) ) ,
		columnNr		: 	Number( pegHolderOfMovingPeg.id.substr(10,1) )
	} ;

	let pegDestitationPosition =
	{
		rowNr 			: 	Number( pegDestitationHolder.id.substr(9,1) ) ,
		columnNr		: 	Number( pegDestitationHolder.id.substr(10,1) )
	};

	let pegMove = checkAcceptableMoves( board, movingPegPosition );
	let direction = calculateMoveDirection( movingPegPosition, pegDestitationPosition );

	if ( ( pegMove.moveAllowed[direction] == true ) &&
		   moveIsNotDiagonal( direction, movingPegPosition, pegDestitationPosition ) &&
		   moveStepIsOnlyAboutTwoFields( direction, movingPegPosition, pegDestitationPosition ) )
	{
		applyActionsForBoardField( pegMove.beatenPegPosition[direction], removePegFrom, changeClassFlag );
		applyActionsForBoardField( movingPegPosition, removePegFrom, changeClassFlag );
		applyActionsForBoardField( pegMove.destinationPegPosition[direction], createPegIn, changeClassFlag );
		//pegDestitationHolder.appendChild(movingPeg);

		updateBoardComposition( board, movingPegPosition, "empty" );
		updateBoardComposition( board, pegMove.beatenPegPosition[direction], "empty" );
		updateBoardComposition( board, pegMove.destinationPegPosition[direction], "peg" );

		addBackButton( board );
		newGameButton.classList.add("navigation__button--first");
		moveCounter.increase();
		updateCounterOnScreen( moveCounter.get() );
		movesBackup.makeBackup( movingPegPosition, pegMove.beatenPegPosition[direction], pegMove.destinationPegPosition[direction], moveCounter.get() );
		localStorage.setBoardComposition( board.getWholeBoard() );
		localStorage.setMovesBackup( movesBackup.getBackup() );
		localStorage.setMoveCounter( moveCounter.get() );

		logToConsoleAllAllowedDestinations( board );
	}
	else
	{
		displayMessageThatMoveIsNotAllowed( pegDestitationHolder );
		applyActionsForBoardField( movingPegPosition , removePegFrom, createPegIn );
	}

	if ( isGameOver( board ) )
	{
		let amountOfPegsLeft = countPegsLeft( board );
		showGameOverMessageIncludingInfoAbout(amountOfPegsLeft);
	}
}



function checkAcceptableMoves( currentBoard, movingPegPosition )
{
	let beatenPegPosition =
  {
    west :
    {
      rowNr 			: 	movingPegPosition.rowNr ,
      columnNr		: 	movingPegPosition.columnNr - 1
    },

		east :
    {
			rowNr 			: 	movingPegPosition.rowNr ,
			columnNr		: 	movingPegPosition.columnNr + 1
		},

 		north :
    {
			rowNr 			: 	movingPegPosition.rowNr - 1 ,
			columnNr		: 	movingPegPosition.columnNr
		},

		south :
    {
			rowNr 			: 	movingPegPosition.rowNr + 1 ,
			columnNr		: 	movingPegPosition.columnNr
		}
	};

	let destinationPegPosition =
	{
		west:
		{
			rowNr 			: 	movingPegPosition.rowNr ,
			columnNr		: 	movingPegPosition.columnNr - 2,
		},

		east:
		{
			rowNr 			: 	movingPegPosition.rowNr ,
			columnNr		: 	movingPegPosition.columnNr + 2,
		},

		north:
		{
			rowNr 			: 	movingPegPosition.rowNr - 2 ,
			columnNr		: 	movingPegPosition.columnNr,
		},

		south:
		{
			rowNr 			: 	movingPegPosition.rowNr + 2 ,
			columnNr		: 	movingPegPosition.columnNr,
		}
	};

	let moveAllowed =
	{
		west 		: 	false,
		east 		: 	false,
		north 	: 	false,
		south 	: 	false
	};

	for (let key in moveAllowed )
	{
		if( movingPegIsInAppropriatePosition( key, movingPegPosition ) &&
			movingPegExist( currentBoard, movingPegPosition ) &&
			pegToBeatExist( currentBoard, beatenPegPosition[key] ) &&
			destinationFieldIsEmpty( currentBoard, destinationPegPosition[key]) )
		{
			moveAllowed[key] = true ;
		}
		else
		{
			moveAllowed[key] = false ;
		}
	}

	return { movingPegPosition, beatenPegPosition, destinationPegPosition, moveAllowed } ;
}



function movingPegExist( currentBoard, movingPegPosition )
{
	if ( currentBoard.getCurrentBoardValue( movingPegPosition ) == "peg" )
	{
		return true;
	}
	else
	{
		return false;
	}
}



function pegToBeatExist( currentBoard, beatenPegPositionValue )
{
	if ( currentBoard.getCurrentBoardValue( beatenPegPositionValue ) == "peg" )
	{
		return true;
	}
	else
	{
		return false;
	}
}



function destinationFieldIsEmpty( currentBoard, destinationPegPositionValue )
{
	if ( currentBoard.getCurrentBoardValue( destinationPegPositionValue ) == "empty" )
	{
		return true;
	}
	else
	{
		return false;
	}
}



function movingPegIsInAppropriatePosition( key, movingPegPosition )
{
	if ( key == "west" && movingPegPosition.columnNr < 2 )
	{
		return false ;
	}
	else if ( key == "east" && movingPegPosition.columnNr > 4 )
	{
		return false ;
	}
	else if ( key == "north" && movingPegPosition.rowNr < 2 )
	{
		return false ;
	}
	else if ( key == "south" && movingPegPosition.rowNr > 4 )
	{
		return false ;
	}
	else
	{
		return true ;
	}
}



function moveIsNotDiagonal( key, movingPegPosition, destinationPegPosition )
{
	if ( ( key == "west" || key == "east" ) &&
	     ( movingPegPosition.rowNr == destinationPegPosition.rowNr ) )
	{
		return true ;
	}
	else if ( ( key == "north" || key == "south" ) &&
	          ( movingPegPosition.columnNr == destinationPegPosition.columnNr ) )
	{
		return true ;
	}
	else
	{
		return false ;
	}
}



function moveStepIsOnlyAboutTwoFields( key, movingPegPosition, destinationPegPosition )
{
	if ( ( key == "west" || key == "east" ) &&
	     ( Math.abs( movingPegPosition.columnNr - destinationPegPosition.columnNr ) == 2 ) )
	{
		return true ;
	}
	else if ( ( key == "north" || key == "south" ) &&
	          ( Math.abs( movingPegPosition.rowNr - destinationPegPosition.rowNr) == 2 )  )
	{
		return true ;
	}
	else
	{
		return false ;
	}
}



function calculateMoveDirection( movingPegPosition, pegDestitationPosition )
{
	let moveDirection;

	if ( movingPegPosition.rowNr - pegDestitationPosition.rowNr == 0 )
	{
		if ( movingPegPosition.columnNr - pegDestitationPosition.columnNr > 0 )
		{
			moveDirection = "west";
		}
		else
		{
			moveDirection = "east";
		}
	}
	else
	{
		if ( movingPegPosition.rowNr - pegDestitationPosition.rowNr > 0 )
		{
			moveDirection = "north";
		}
		else
		{
			moveDirection = "south";
		}
	}

	return moveDirection;
}



function removePegFrom( pegHolder )
{
	while( pegHolder.hasChildNodes() )
	{
		pegHolder.removeChild( pegHolder.lastChild );
	}
}



function applyActionsForBoardField( boardFieldPosition, ...actions )
{
	let boardField = document.getElementById( `pegHolder${boardFieldPosition.rowNr}${boardFieldPosition.columnNr}` ) ;
	for ( let action of actions )
	{
		action( boardField );
	}
}



function updateBoardComposition( currentBoard, fieldPosition, updatedValue )
{
	currentBoard.changeBoardValue( fieldPosition, updatedValue );
}



function changeClassFlag( pegHolder )
{
	pegHolder.classList.toggle( "pegBoard__pegHolder--empty" );
	pegHolder.classList.toggle( "pegBoard__pegHolder--withPeg" );
}



function addBackButton( currentBoard )
{
	if ( document.getElementById( "backButton" ) == null )
	{
		let backButton = document.createElement( "BUTTON" );
		backButton.id = "backButton" ;
		backButton.className = "navigation__button navigation__button--last";
		backButton.textContent = "Back" ;
		document.getElementsByTagName("nav")[0].appendChild( backButton );

		backButton.onclick = () =>
		{
			moveCounter.decrease();
			updateCounterOnScreen( moveCounter.get() );
			movesBackup.restoreBackup( applyActionsForBoardField, updateBoardComposition, moveCounter.get() );
			localStorage.setBoardComposition( currentBoard.getWholeBoard() );
			localStorage.setMovesBackup( movesBackup.getBackup() );
			localStorage.setMoveCounter( moveCounter.get() );
			logToConsoleAllAllowedDestinations( currentBoard );

			if ( moveCounter.get() == 0 )
			{
				document.getElementById( "backButton" ).remove();
				newGameButton.classList.remove("navigation__button--first");
				localStorage.clearGameState();
			}
		};

	}
}



function updateCounterOnScreen( value )
{
	let score = document.querySelector( ".scorePanel__score" );
	score.textContent = value ;
}



function displayMessageThatMoveIsNotAllowed( pegDestitationHolder )
{
	errorMessage.show();
	pegDestitationHolder.classList.add( "pegBoard__pegHolder--nonDroppable" ) ;

	setTimeout( () =>
	{
		errorMessage.hide();
		pegDestitationHolder.classList.remove( "pegBoard__pegHolder--nonDroppable" ) ;
	}, 2000);
}



function isGameOver(currentBoard)
{
	let gameOver = false;

	if ( findAllAllowedDestination( currentBoard ).size == 0 )
	{
		gameOver = true;
	}

	return gameOver;
}



function findAllAllowedDestination( currentBoard )
{
		let allowedDestinations = new Set();

		currentBoard.getWholeBoard().forEach( ( rowValue, rowNr, rowArray ) =>
		{
			rowValue.forEach( ( columnValue, columnNr, columnArray ) =>
			{
				let pegPositionToCheck =
				{
					rowNr,
					columnNr
				};
				let pegMove = checkAcceptableMoves( currentBoard, pegPositionToCheck );

				for ( let direction in pegMove.moveAllowed )
				{
					if ( pegMove.moveAllowed[direction] == true )
					{
						let startPositionX = pegMove.movingPegPosition.rowNr;
						let startPositionY = pegMove.movingPegPosition.columnNr;
						let endPositionX = pegMove.destinationPegPosition[direction].rowNr;
						let endPositionY = pegMove.destinationPegPosition[direction].columnNr;
						let allowedDestination = `(${startPositionX}, ${startPositionY})->(${endPositionX}, ${endPositionY})` ;
						allowedDestinations.add( allowedDestination );
					}
				}
			});
		});

		return allowedDestinations ;
}



function showGameOverMessageIncludingInfoAbout(amountOfPegsLeft)
{
	let message;

	if ( amountOfPegsLeft == 1 )
	{
		message = "Congratulations! You've won!\n Do you want to play again?" ;
	}
	else message = `Game over! You've failed to win. Your score is:\n- amount of moves: ${moveCounter.get()}\n- amount of Pegs left: ${amountOfPegsLeft}\n\nDo you want to play again?` ;

	let messageBox = alertWith( message );
	applyUserReactionTo( messageBox );
}



function countPegsLeft( currentBoard )
{
	let countPeg = 0;

	currentBoard.getWholeBoard().forEach( ( rowValue, rowNr, rowArray ) =>
	{
		rowValue.forEach( ( columnValue, columnNr, columnArray ) =>
		{
			let pegPositionToCheck =
			{
				rowNr,
				columnNr
			};

			if ( currentBoard.getCurrentBoardValue( pegPositionToCheck ) == "peg")
			{
				countPeg++;
			}

		});

	});

	return countPeg ;
}



function enableLogToConsole()
{
	return true;
}



function addNewGameButton()
{
	let newGameButton = document.getElementById( "newGameButton" );

	newGameButton.onclick = () => {
	  let messageBox = alertWith( "Do you want to start new game?" );
	  applyUserReactionTo( messageBox );
	};

	return newGameButton;
}



function alertWith( message )
{
	let modal = document.getElementById( "modal" );
	let modalBody = document.querySelector( ".modal__message" );
	modalBody.innerText = message ;
	modal.style.display = "flex";

	return modal;
}



function applyUserReactionTo( messageBox )
{
	let newGameConfirmationButton = document.getElementById( "modalOkButton" );
	let newGameCancelationButton = document.getElementById( "modalCancelButton" );

	newGameConfirmationButton.onclick = () => {
		localStorage.clearGameState();
		startNewGame() ;
		messageBox.style.display = "none";
	};

	newGameCancelationButton.onclick = () => {
		messageBox.style.display = "none";
	};
}



function startNewGame()
{
	if ( document.getElementById( "backButton" ) )
	{
		document.getElementById( "backButton" ).remove();
		newGameButton.classList.remove("navigation__button--first");
	}
  localStorage.clearGameState();
	let initialPegBoard = solitaireGameInitialBoard( localStorage );
	redrawSolitaireGameBoard( initialPegBoard );
	board = new CurrentPegBoardComposition( initialPegBoard ) ;
	moveCounter = new MoveCounter( localStorage.getMoveCounter() );
	updateCounterOnScreen( moveCounter.get() );
	movesBackup = new Backup( localStorage.getMovesBackup() , board, enableLogToConsole() );
	logToConsoleAllAllowedDestinations( board ) ;
}



function redrawSolitaireGameBoard( initialPegBoard )
{
	initialPegBoard.forEach( ( rowValue, rowNr, rowArray ) =>
	{
		rowValue.forEach( ( columnValue, columnNr, columnArray ) =>
		{
			let pegHolder = document.getElementById( `pegHolder${rowNr}${columnNr}` );

			if ( rowNr == Math.floor( rowArray.length/2 ) && columnNr == Math.floor( columnArray.length/2 ) )
			{
					removePegFrom( pegHolder );
					pegHolder.classList.remove( "pegBoard__pegHolder--withPeg" );
					pegHolder.classList.add( "pegBoard__pegHolder--empty" );
			}
			else if ( columnValue == "peg" )
			{
					removePegFrom( pegHolder );
					createPegIn( pegHolder );
					pegHolder.classList.remove( "pegBoard__pegHolder--empty" );
					pegHolder.classList.add( "pegBoard__pegHolder--withPeg" );
			}

		});

	});

}



function logToConsoleAllAllowedDestinations( currentBoard )
{
		let allowedDestinations = "" ;
		for ( let value of findAllAllowedDestination(currentBoard).values() )
		{
			allowedDestinations += `${value}, ` ;
		}

		return console.log( `Allowed destinations: ${allowedDestinations}
					Allowed destinations: ${findAllAllowedDestination(currentBoard).size}`);
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvY2FsU3RvcmFnZVNlcnZpY2UuanMiLCJjdXJyZW50UGVnQm9hcmRDb21wb3NpdGlvbi5qcyIsIm1vdmVDb3VudGVyLmpzIiwibW92ZXNCYWNrdXAuanMiLCJlcnJvck1lc3NhZ2UuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTG9jYWxTdG9yYWdlU2VydmljZVxyXG57XHJcblx0Y29uc3RydWN0b3IoKVxyXG5cdHtcclxuXHRcdHRoaXMuc3RvcmFnZSA9IGlzTG9jYWxTdG9yYWdlU3VwcG9ydGVkKCkgPyB3aW5kb3cubG9jYWxTdG9yYWdlIDogbmV3IGR1bW15U3RvcmFnZSgpO1xyXG5cdFx0dGhpcy5ib2FyZENvbXBvc2l0aW9uID0gXCJib2FyZENvbXBvc2l0aW9uXCI7XHJcblx0XHR0aGlzLm1vdmVzQmFja3VwID0gXCJtb3Zlc0JhY2t1cFwiIDtcclxuXHRcdHRoaXMubW92ZUNvdW50ZXIgPSBcIm1vdmVDb3VudGVyXCI7XHJcblx0fVxyXG5cclxuXHJcblx0Z2V0Qm9hcmRDb21wb3NpdGlvbigpXHJcblx0e1xyXG5cdFx0bGV0IHN0b3JhZ2VJdGVtID0gdGhpcy5zdG9yYWdlLmdldEl0ZW0oIHRoaXMuYm9hcmRDb21wb3NpdGlvbiApO1xyXG5cclxuXHRcdGlmICggc3RvcmFnZUl0ZW0gKSByZXR1cm4gSlNPTi5wYXJzZSggc3RvcmFnZUl0ZW0gKTtcclxuXHRcdGVsc2UgcmV0dXJuIG51bGw7XHJcblx0fVxyXG5cclxuXHRzZXRCb2FyZENvbXBvc2l0aW9uKCBib2FyZENvbXBvc2l0aW9uIClcclxuXHR7XHJcblx0XHR0aGlzLnN0b3JhZ2Uuc2V0SXRlbSggdGhpcy5ib2FyZENvbXBvc2l0aW9uLCBKU09OLnN0cmluZ2lmeShib2FyZENvbXBvc2l0aW9uKSApIDtcclxuXHR9XHJcblxyXG5cclxuXHRnZXRNb3Zlc0JhY2t1cCgpXHJcblx0e1xyXG5cdFx0bGV0IHN0b3JhZ2VJdGVtID0gdGhpcy5zdG9yYWdlLmdldEl0ZW0oIHRoaXMubW92ZXNCYWNrdXAgKTtcclxuXHJcblx0XHRpZiAoIHN0b3JhZ2VJdGVtICkgcmV0dXJuIEpTT04ucGFyc2UoIHN0b3JhZ2VJdGVtICk7XHJcblx0XHRlbHNlIHJldHVybiBudWxsO1xyXG5cdH1cclxuXHJcblx0c2V0TW92ZXNCYWNrdXAoIGJhY2t1cCApXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuc3RvcmFnZS5zZXRJdGVtKCB0aGlzLm1vdmVzQmFja3VwLCBKU09OLnN0cmluZ2lmeShiYWNrdXApICkgO1xyXG5cdH1cclxuXHJcblxyXG5cdGdldE1vdmVDb3VudGVyKClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5zdG9yYWdlLmdldEl0ZW0oIHRoaXMubW92ZUNvdW50ZXIgKTtcclxuXHR9XHJcblxyXG5cdHNldE1vdmVDb3VudGVyKCBjb3VudGVyIClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5zdG9yYWdlLnNldEl0ZW0oIHRoaXMubW92ZUNvdW50ZXIsIGNvdW50ZXIgKSA7XHJcblx0fVxyXG5cclxuXHJcblx0Y2xlYXJHYW1lU3RhdGUoKVxyXG5cdHtcclxuXHRcdHRoaXMuc3RvcmFnZS5jbGVhcigpO1xyXG5cdH1cclxuXHJcbn1cclxuXHJcblxyXG5jbGFzcyBkdW1teVN0b3JhZ2Vcclxue1xyXG4gIGNvbnN0cnVjdG9yKClcclxuXHR7XHJcblx0XHR0aGlzLnN0b3JhZ2UgPSB7fTtcclxuXHR9XHJcblxyXG4gIHNldEl0ZW0oIGtleSwgdmFsdWUgKVxyXG5cdHtcclxuICAgIHJldHVybiB0aGlzLnN0b3JhZ2Vba2V5XSA9IFN0cmluZyggdmFsdWUgKTtcclxuICB9XHJcblxyXG4gIGdldEl0ZW0oIGtleSApXHJcblx0e1xyXG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgPyB0aGlzLnN0b3JhZ2Vba2V5XSA6IHVuZGVmaW5lZDtcclxuICB9XHJcblxyXG4gIGNsZWFyKCApXHJcblx0e1xyXG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZSA9IHt9O1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGlzTG9jYWxTdG9yYWdlU3VwcG9ydGVkKClcclxue1xyXG5cdHRyeVxyXG5cdHtcclxuXHRcdGxldCBzdG9yYWdlID0gd2luZG93LmxvY2FsU3RvcmFnZTtcclxuXHRcdHN0b3JhZ2Uuc2V0SXRlbSggXCJ0ZXN0X2tleVwiLCBcInRlc3RfdmFsdWVcIiApO1xyXG5cdFx0c3RvcmFnZS5yZW1vdmVJdGVtKCBcInRlc3Rfa2V5XCIgKTtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRjYXRjaCggZXJyb3IgKVxyXG5cdHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcbn1cclxuIiwiY2xhc3MgQ3VycmVudFBlZ0JvYXJkQ29tcG9zaXRpb25cclxue1xyXG5cdGNvbnN0cnVjdG9yKCBwZWdCb2FyZCApXHJcblx0e1xyXG5cdFx0dGhpcy5yb3dzID0gW107XHJcblx0XHRwZWdCb2FyZC5mb3JFYWNoKCByb3cgPT4gdGhpcy5yb3dzLnB1c2goIHJvdyApICk7XHJcblx0fVxyXG5cclxuXHRnZXRDdXJyZW50Qm9hcmRWYWx1ZSggcGVnSG9sZGVyUG9zaXRpb24gKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLnJvd3NbcGVnSG9sZGVyUG9zaXRpb24ucm93TnJdW3BlZ0hvbGRlclBvc2l0aW9uLmNvbHVtbk5yXTtcclxuXHR9XHJcblxyXG5cdGNoYW5nZUJvYXJkVmFsdWUoIHBlZ0hvbGRlclBvc2l0aW9uLCB2YWx1ZSApXHJcblx0e1xyXG5cdFx0dGhpcy5yb3dzW3BlZ0hvbGRlclBvc2l0aW9uLnJvd05yXVtwZWdIb2xkZXJQb3NpdGlvbi5jb2x1bW5Ocl0gPSB2YWx1ZTtcclxuXHR9XHJcblx0Z2V0V2hvbGVCb2FyZCgpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMucm93cztcclxuXHR9XHJcbn1cclxuIiwiY2xhc3MgTW92ZUNvdW50ZXJcclxue1xyXG5cdGNvbnN0cnVjdG9yKCBjb3VudGVyIClcclxuXHR7XHJcblx0XHRpZiAoIGNvdW50ZXIgPiAwIClcclxuXHRcdHtcclxuXHRcdFx0dGhpcy52YWx1ZSA9IGNvdW50ZXIgO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnZhbHVlID0gMDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGdldCgpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMudmFsdWU7XHJcblx0fVxyXG5cclxuXHRpbmNyZWFzZSgpXHJcblx0e1xyXG5cdFx0dGhpcy52YWx1ZSsrIDtcclxuXHR9XHJcblxyXG5cdGRlY3JlYXNlKClcclxuXHR7XHJcblx0XHR0aGlzLnZhbHVlLS0gO1xyXG5cdH1cclxufVxyXG4iLCJjbGFzcyBCYWNrdXBcclxue1xyXG5cdGNvbnN0cnVjdG9yKCBzYXZlZEJhY2t1cCwgY3VycmVudEJvYXJkLCBsb2dUb0NvbnNvbGUgPSBmYWxzZSApXHJcblx0e1xyXG5cdFx0aWYgKCBzYXZlZEJhY2t1cCA9PSBudWxsKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnN0YXJ0RmllbGQgPSBbXTtcclxuXHRcdFx0dGhpcy5iZWF0ZW5GaWVsZCA9IFtdO1xyXG5cdFx0XHR0aGlzLmVuZEZpZWxkID0gW107XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuc3RhcnRGaWVsZCA9IHNhdmVkQmFja3VwLnN0YXJ0RmllbGQgO1xyXG5cdFx0XHR0aGlzLmJlYXRlbkZpZWxkID0gc2F2ZWRCYWNrdXAuYmVhdGVuRmllbGQ7XHJcblx0XHRcdHRoaXMuZW5kRmllbGQgPSBzYXZlZEJhY2t1cC5lbmRGaWVsZDtcclxuXHRcdH1cclxuXHRcdHRoaXMuY3VycmVudEJvYXJkID0gY3VycmVudEJvYXJkO1xyXG5cdFx0dGhpcy5sb2dCYWNrdXBUb0NvbnNvbGUgPSBsb2dUb0NvbnNvbGU7XHJcblx0fVxyXG5cclxuXHRtYWtlQmFja3VwICggbW92aW5nUGVnUG9zaXRpb24sIGJlYXRlblBlZ1Bvc2l0aW9uLCBkZXN0aW5hdGlvblBlZ1Bvc2l0aW9uLCBtb3ZlQ291bnRlciApXHJcblx0e1xyXG5cdFx0dGhpcy5zdGFydEZpZWxkLnB1c2goIG1vdmluZ1BlZ1Bvc2l0aW9uICk7XHJcblx0XHR0aGlzLmJlYXRlbkZpZWxkLnB1c2goIGJlYXRlblBlZ1Bvc2l0aW9uICk7XHJcblx0XHR0aGlzLmVuZEZpZWxkLnB1c2goIGRlc3RpbmF0aW9uUGVnUG9zaXRpb24gKTtcclxuXHJcblx0XHRpZiAodGhpcy5sb2dCYWNrdXBUb0NvbnNvbGUpXHJcblx0XHR7XHJcblx0XHRcdFx0bG9nQmFja3VwaW5nVG9Db25zb2xlKCB0aGlzLnN0YXJ0RmllbGRbdGhpcy5zdGFydEZpZWxkLmxlbmd0aCAtIDFdLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQgICBcdFx0XHRcdFx0IHRoaXMuYmVhdGVuRmllbGRbdGhpcy5iZWF0ZW5GaWVsZC5sZW5ndGggLSAxXSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0ICAgXHRcdFx0IFx0XHQgdGhpcy5lbmRGaWVsZFt0aGlzLmVuZEZpZWxkLmxlbmd0aCAtIDFdLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0IG1vdmVDb3VudGVyXHJcblx0XHRcdFx0XHRcdFx0XHRcdCBcdFx0XHRcdCBcdCApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmVzdG9yZUJhY2t1cChhcHBseUFjdGlvbnNGb3JCb2FyZEZpZWxkLCB1cGRhdGVCb2FyZENvbXBvc2l0aW9uLCBtb3ZlQ291bnRlcilcclxuXHR7XHJcblx0XHRhcHBseUFjdGlvbnNGb3JCb2FyZEZpZWxkKCB0aGlzLnN0YXJ0RmllbGRbdGhpcy5zdGFydEZpZWxkLmxlbmd0aCAtIDFdLCBjcmVhdGVQZWdJbiwgY2hhbmdlQ2xhc3NGbGFnICk7XHJcblx0XHRhcHBseUFjdGlvbnNGb3JCb2FyZEZpZWxkKCB0aGlzLmJlYXRlbkZpZWxkW3RoaXMuYmVhdGVuRmllbGQubGVuZ3RoIC0gMV0sIGNyZWF0ZVBlZ0luLCBjaGFuZ2VDbGFzc0ZsYWcgKTtcclxuXHRcdGFwcGx5QWN0aW9uc0ZvckJvYXJkRmllbGQoIHRoaXMuZW5kRmllbGRbdGhpcy5lbmRGaWVsZC5sZW5ndGggLSAxXSwgcmVtb3ZlUGVnRnJvbSwgY2hhbmdlQ2xhc3NGbGFnICk7XHJcblxyXG5cdFx0dXBkYXRlQm9hcmRDb21wb3NpdGlvbiggdGhpcy5jdXJyZW50Qm9hcmQsIHRoaXMuc3RhcnRGaWVsZFt0aGlzLnN0YXJ0RmllbGQubGVuZ3RoIC0gMV0sIFwicGVnXCIgKTtcclxuXHRcdHVwZGF0ZUJvYXJkQ29tcG9zaXRpb24oIHRoaXMuY3VycmVudEJvYXJkLCB0aGlzLmJlYXRlbkZpZWxkW3RoaXMuYmVhdGVuRmllbGQubGVuZ3RoIC0gMV0sIFwicGVnXCIgKTtcclxuXHRcdHVwZGF0ZUJvYXJkQ29tcG9zaXRpb24oIHRoaXMuY3VycmVudEJvYXJkLCB0aGlzLmVuZEZpZWxkW3RoaXMuZW5kRmllbGQubGVuZ3RoIC0gMV0sIFwiZW1wdHlcIiApO1xyXG5cclxuXHRcdGlmICggdGhpcy5sb2dCYWNrdXBUb0NvbnNvbGUgKVxyXG5cdFx0e1xyXG5cdFx0XHRcdGxvZ1Jlc3RvcmluZ0JhY2t1cFRvQ29uc29sZSggdGhpcy5lbmRGaWVsZFt0aGlzLmVuZEZpZWxkLmxlbmd0aCAtIDFdLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgdGhpcy5iZWF0ZW5GaWVsZFt0aGlzLmJlYXRlbkZpZWxkLmxlbmd0aCAtIDFdLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgdGhpcy5zdGFydEZpZWxkW3RoaXMuc3RhcnRGaWVsZC5sZW5ndGggLSAxXSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0IG1vdmVDb3VudGVyXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5zdGFydEZpZWxkLnBvcCgpO1xyXG5cdFx0dGhpcy5iZWF0ZW5GaWVsZC5wb3AoKTtcclxuXHRcdHRoaXMuZW5kRmllbGQucG9wKCk7XHJcblx0fVxyXG5cclxuXHRnZXRCYWNrdXAoKVxyXG5cdHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdFwic3RhcnRGaWVsZFwiICA6IHRoaXMuc3RhcnRGaWVsZCxcclxuXHRcdFx0XCJiZWF0ZW5GaWVsZFwiIDogdGhpcy5iZWF0ZW5GaWVsZCxcclxuXHRcdFx0XCJlbmRGaWVsZFwiICAgIDogdGhpcy5lbmRGaWVsZFxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdGhhc1JlY29yZHMoKVxyXG5cdHtcclxuXHRcdGlmICggdGhpcy5zdGFydEZpZWxkLmxlbmd0aCA9PSAwIHx8IHRoaXMuYmVhdGVuRmllbGQubGVuZ3RoID09IDAgfHwgdGhpcy5lbmRGaWVsZC5sZW5ndGggPT0gMCApXHJcblx0XHR7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGVsc2UgcmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGxvZ0JhY2t1cGluZ1RvQ29uc29sZSggbW92aW5nUGVnUG9zaXRpb24sIGJlYXRlblBlZ1Bvc2l0aW9uLCBkZXN0aW5hdGlvblBlZ1Bvc2l0aW9uLCBtb3ZlQ291bnRlciApXHJcbntcclxuXHRjb25zb2xlLmxvZyhgKioqKioqKioqKiogQmFja3VwaW5nICoqKioqKioqKioqKiogLSBNb3ZlIG5vLjogJHttb3ZlQ291bnRlcn1cXG5gICtcclxuXHRgbW92ZSBmcm9tOiAoJHttb3ZpbmdQZWdQb3NpdGlvbi5yb3dOcn0gLCAke21vdmluZ1BlZ1Bvc2l0aW9uLmNvbHVtbk5yfSkgdG86ICgke2Rlc3RpbmF0aW9uUGVnUG9zaXRpb24ucm93TnJ9ICwgJHtkZXN0aW5hdGlvblBlZ1Bvc2l0aW9uLmNvbHVtbk5yfSlcXG5gICtcclxuXHRgYmVhdGVuIHBlZzogKCR7YmVhdGVuUGVnUG9zaXRpb24ucm93TnJ9ICwgJHtiZWF0ZW5QZWdQb3NpdGlvbi5jb2x1bW5Ocn0pYCApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsb2dSZXN0b3JpbmdCYWNrdXBUb0NvbnNvbGUoIGRlc3RpbmF0aW9uUGVnUG9zaXRpb24sIGJlYXRlblBlZ1Bvc2l0aW9uLCBtb3ZpbmdQZWdQb3NpdGlvbiwgbW92ZUNvdW50ZXIgKVxyXG57XHJcblx0Y29uc29sZS5sb2coYCoqKioqKioqKioqIFJlc3RvcmluZyBiYWNrdXAgKioqKioqKioqKioqKiAtIE1vdmUgbm8uOiAke21vdmVDb3VudGVyfVxcbmAgK1xyXG4gIFx0XHRcdFx0XHRcdGByZXN0b3JlIGZyb206ICgke2Rlc3RpbmF0aW9uUGVnUG9zaXRpb24ucm93TnJ9ICwgJHtkZXN0aW5hdGlvblBlZ1Bvc2l0aW9uLmNvbHVtbk5yfSkgdG86ICgke21vdmluZ1BlZ1Bvc2l0aW9uLnJvd05yfSAsICR7bW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnJ9KVxcbmAgK1xyXG4gIFx0XHRcdFx0XHRcdGBiZWF0ZW4gcGVnOiAoJHtiZWF0ZW5QZWdQb3NpdGlvbi5yb3dOcn0gLCAke2JlYXRlblBlZ1Bvc2l0aW9uLmNvbHVtbk5yfSlgICk7XHJcbn1cclxuIiwiY2xhc3MgRXJyb3JNZXNzYWdlXHJcbntcclxuXHRjb25zdHJ1Y3RvciggbWVzc2FnZSApXHJcblx0e1xyXG5cdFx0dGhpcy5tZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIFwiZXJyb3JNZXNzYWdlXCIgKSA7XHJcblx0XHR0aGlzLm1lc3NhZ2UuY2xhc3NMaXN0LmFkZCggXCJib3R0b21CYXJcIiApO1xyXG5cdFx0dGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gbWVzc2FnZSA7XHJcblx0fVxyXG5cclxuXHRzaG93KClcclxuXHR7XHJcblx0XHR0aGlzLm1lc3NhZ2UuY2xhc3NMaXN0LmFkZCggXCJib3R0b21CYXItLXNob3dcIiApO1xyXG5cdH1cclxuXHJcblx0aGlkZSgpXHJcblx0e1xyXG5cdFx0dGhpcy5tZXNzYWdlLmNsYXNzTGlzdC5yZW1vdmUoIFwiYm90dG9tQmFyLS1zaG93XCIgKSA7XHJcblx0fVxyXG59XHJcbiIsImxldCBsb2NhbFN0b3JhZ2UgPSBuZXcgTG9jYWxTdG9yYWdlU2VydmljZSgpO1xyXG5jb25zb2xlLmxvZyhsb2NhbFN0b3JhZ2UpO1xyXG5sZXQgc3RhcnRpbmdQZWdCb2FyZCA9IHNvbGl0YWlyZUdhbWVJbml0aWFsQm9hcmQoIGxvY2FsU3RvcmFnZSApO1xyXG5cclxud2luZG93Lm9ubG9hZCA9IGRyYXdTb2xpdGFpcmVHYW1lQm9hcmQoIHN0YXJ0aW5nUGVnQm9hcmQgKSA7XHJcblxyXG5sZXQgYm9hcmQgPSBuZXcgQ3VycmVudFBlZ0JvYXJkQ29tcG9zaXRpb24oIHN0YXJ0aW5nUGVnQm9hcmQgKTtcclxubGV0IG1vdmVDb3VudGVyID0gbmV3IE1vdmVDb3VudGVyKCBsb2NhbFN0b3JhZ2UuZ2V0TW92ZUNvdW50ZXIoKSApO1xyXG5sZXQgbW92ZXNCYWNrdXAgPSBuZXcgQmFja3VwKCBsb2NhbFN0b3JhZ2UuZ2V0TW92ZXNCYWNrdXAoKSwgYm9hcmQsIGVuYWJsZUxvZ1RvQ29uc29sZSgpICk7XHJcbmxldCBlcnJvck1lc3NhZ2UgPSBuZXcgRXJyb3JNZXNzYWdlKCBcIk1vdmUgbm90IGFsbG93ZWQhXCIgKTtcclxubGV0IG5ld0dhbWVCdXR0b24gPSBhZGROZXdHYW1lQnV0dG9uKCk7XHJcblxyXG5pZiAoIG1vdmVzQmFja3VwLmhhc1JlY29yZHMoKSApXHJcbntcclxuXHRhZGRCYWNrQnV0dG9uKCBib2FyZCApO1xyXG5cdG5ld0dhbWVCdXR0b24uY2xhc3NMaXN0LmFkZChcIm5hdmlnYXRpb25fX2J1dHRvbi0tZmlyc3RcIik7XHJcbn1cclxudXBkYXRlQ291bnRlck9uU2NyZWVuKCBtb3ZlQ291bnRlci5nZXQoKSApO1xyXG5cclxuaWYgKCBpc0dhbWVPdmVyKCBib2FyZCApIClcclxue1xyXG5cdGxldCBhbW91bnRPZlBlZ3NMZWZ0ID0gY291bnRQZWdzTGVmdCggYm9hcmQgKTtcclxuXHRzaG93R2FtZU92ZXJNZXNzYWdlSW5jbHVkaW5nSW5mb0Fib3V0KGFtb3VudE9mUGVnc0xlZnQpO1xyXG59XHJcblxyXG5sb2dUb0NvbnNvbGVBbGxBbGxvd2VkRGVzdGluYXRpb25zKCBib2FyZCApO1xyXG5cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gZHJhd1NvbGl0YWlyZUdhbWVCb2FyZCggcGVnQm9hcmQgKVxyXG57XHJcblx0bGV0IGFtb3VudE9mUm93cyA9IHBlZ0JvYXJkLmxlbmd0aDtcclxuXHRsZXQgYW1vdW50T2ZDb2x1bW5zID0gcGVnQm9hcmRbMF0ubGVuZ3RoO1xyXG5cdGxldCBhc3Npc3RhbnRSb3dzID0gY3JlYXRlUm93c0ZvckZsZXhBbGxpZ21lbnQoIGFtb3VudE9mUm93cyApO1xyXG5cclxuXHRhc3Npc3RhbnRSb3dzLmZvckVhY2goICggYXNzaXN0YW50Um93LCByb3dOciApID0+XHJcblx0e1xyXG5cdFx0XHRmb3IgKCBsZXQgY29sdW1uTnIgPSAwIDsgY29sdW1uTnIgPCBhbW91bnRPZkNvbHVtbnMgOyBjb2x1bW5OcisrIClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdFx0aWYgKCBwZWdCb2FyZFtyb3dOcl1bY29sdW1uTnJdICE9IFwiYmxhbmtcIiApXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGFzc2lzdGFudFJvdy5hcHBlbmRDaGlsZCggZHJhd1BlZ0ZpZWxkKCBwZWdCb2FyZCwgcm93TnIsIGNvbHVtbk5yICkgKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBcInBlZ0JvYXJkXCIgKS5hcHBlbmRDaGlsZCggYXNzaXN0YW50Um93ICk7XHJcblx0fSk7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gY3JlYXRlUm93c0ZvckZsZXhBbGxpZ21lbnQoIGFtb3VudE9mUm93cyApXHJcbntcclxuXHRsZXQgcGVnQm9hcmRSb3dzID0gW107XHJcblxyXG5cdGZvciAoIGxldCByb3dOciA9IDAgOyByb3dOciA8IGFtb3VudE9mUm93cyA7IHJvd05yKysgKVxyXG5cdHtcclxuXHRcdC8vY3JlYXRpbmcgcm93cyBvZiBib2FyZCwgd2hpY2ggaW4gQ1NTIHdpbGwgYmUgZGlzcGxheWVkIGFzIFwiZmxleFwiIChvbmUgdW5kZXIgYW5vdGhlcilcclxuXHRcdGxldCBwZWdCb2FyZFJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIFwiRElWXCIgKTtcclxuXHRcdHBlZ0JvYXJkUm93LmNsYXNzTmFtZSA9IFwicGVnQm9hcmRfX3Jvd1wiIDtcclxuXHRcdHBlZ0JvYXJkUm93cy5wdXNoKCBwZWdCb2FyZFJvdyApO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHBlZ0JvYXJkUm93cztcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBpbml0aWFsUGVnQm9hcmRWYWx1ZSggcm93TnVtYmVyLCBjb2x1bW5OdW1iZXIgKVxyXG57XHJcblx0bGV0IHBlZ0JvYXJkID0gc29saXRhaXJlR2FtZUluaXRpYWxCb2FyZCggbG9jYWxTdG9yYWdlICk7XHJcblxyXG5cdHJldHVybiBwZWdCb2FyZFtyb3dOdW1iZXJdW2NvbHVtbk51bWJlcl0gO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIHNvbGl0YWlyZUdhbWVJbml0aWFsQm9hcmQoIGxvY2FsU3RvcmFnZSApXHJcbntcclxuXHRsZXQgcGVnQm9hcmQ7XHJcblxyXG5cdGlmKCBsb2NhbFN0b3JhZ2UuZ2V0Qm9hcmRDb21wb3NpdGlvbigpIClcclxuXHR7XHJcblx0XHRwZWdCb2FyZCA9IGxvY2FsU3RvcmFnZS5nZXRCb2FyZENvbXBvc2l0aW9uKCk7XHJcblx0fVxyXG5cdGVsc2VcclxuXHR7XHJcblx0XHRwZWdCb2FyZCA9IFtcclxuXHRcdFx0WyBcImJsYW5rXCIgLCBcImJsYW5rXCIgLCBcInBlZ1wiICwgXCJwZWdcIiAgIFx0ICAgLCBcInBlZ1wiICwgXCJibGFua1wiICwgXCJibGFua1wiICAgXSAsXHJcblx0XHRcdFsgXCJibGFua1wiICwgXCJibGFua1wiICwgXCJwZWdcIiAsIFwicGVnXCIgICAgXHQgICAsIFwicGVnXCIgLCBcImJsYW5rXCIgLCBcImJsYW5rXCIgICBdICxcclxuXHRcdFx0WyBcInBlZ1wiICAgLCBcInBlZ1wiICAgLCBcInBlZ1wiICwgXCJwZWdcIiAgICBcdCAgICwgXCJwZWdcIiAsIFwicGVnXCIgICAsIFwicGVnXCIgICAgIF0gLFxyXG5cdFx0XHRbIFwicGVnXCIgICAsIFwicGVnXCIgICAsIFwicGVnXCIgLCBcImVtcHR5XCIgICAgICAsIFwicGVnXCIgLCBcInBlZ1wiICAgLCBcInBlZ1wiICAgICBdICxcclxuXHRcdFx0WyBcInBlZ1wiICAgLCBcInBlZ1wiICAgLCBcInBlZ1wiICwgXCJwZWdcIiAgICBcdCAgICwgXCJwZWdcIiAsIFwicGVnXCIgICAsIFwicGVnXCIgICAgIF0gLFxyXG5cdFx0XHRbIFwiYmxhbmtcIiAsIFwiYmxhbmtcIiAsIFwicGVnXCIgLCBcInBlZ1wiICAgIFx0ICAgLCBcInBlZ1wiICwgXCJibGFua1wiICwgXCJibGFua1wiICAgXSAsXHJcblx0XHRcdFsgXCJibGFua1wiICwgXCJibGFua1wiICwgXCJwZWdcIiAsIFwicGVnXCIgICAgXHQgICAsIFwicGVnXCIgLCBcImJsYW5rXCIgLCBcImJsYW5rXCIgICBdXHJcblx0XHRdIDtcclxuXHR9XHJcblxyXG5cdHJldHVybiBwZWdCb2FyZDtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBkcmF3UGVnRmllbGQoIHBlZ0JvYXJkLCByb3dOciwgY29sdW1uTnIgKVxyXG57XHJcblx0XHRsZXQgcGVnSG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggXCJESVZcIiApO1xyXG5cdFx0cGVnSG9sZGVyLmlkID0gYHBlZ0hvbGRlciR7cm93TnJ9JHtjb2x1bW5Ocn1gIDtcclxuXHRcdHBlZ0hvbGRlci5jbGFzc0xpc3QuYWRkKCBcInBlZ0JvYXJkX19wZWdIb2xkZXJcIiApIDtcclxuXHJcblx0XHRpZiAoIHBlZ0JvYXJkW3Jvd05yXVtjb2x1bW5Ocl0gPT0gXCJwZWdcIiApXHJcblx0XHR7XHJcblx0XHRcdGNyZWF0ZVBlZ0luKCBwZWdIb2xkZXIgKTtcclxuXHRcdFx0cGVnSG9sZGVyLmNsYXNzTGlzdC5hZGQoIFwicGVnQm9hcmRfX3BlZ0hvbGRlci0td2l0aFBlZ1wiICk7XHJcblx0XHR9XHJcblx0XHRpZiAoIHBlZ0JvYXJkW3Jvd05yXVtjb2x1bW5Ocl0gPT0gXCJlbXB0eVwiIClcclxuXHRcdHtcclxuXHRcdFx0cGVnSG9sZGVyLmNsYXNzTGlzdC5hZGQoIFwicGVnQm9hcmRfX3BlZ0hvbGRlci0tZW1wdHlcIiApO1xyXG5cdFx0fVxyXG5cclxuXHRcdGFkZEV2ZW50SGFuZGxlcnNGb3IoIFwibW91c2VcIiwgcGVnSG9sZGVyICk7XHJcblx0XHRhZGRFdmVudEhhbmRsZXJzRm9yKCBcInRvdWNoXCIsIHBlZ0hvbGRlciApO1xyXG5cclxuXHRcdHJldHVybiBwZWdIb2xkZXI7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gY3JlYXRlUGVnSW4oIHBlZ0hvbGRlciApXHJcbntcclxuXHRcdGxldCBwZWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCBcIklNR1wiICk7XHJcblx0XHRwZWcuaWQgPSBcInBlZ1wiICsgcGVnSG9sZGVyLmlkLnNsaWNlKDkpIDtcclxuXHRcdHBlZy5jbGFzc05hbWUgPSBcInBlZ0JvYXJkX19wZWdcIiA7XHJcblx0XHRwZWcuc3JjID0gXCJpbWcvcGVnLnBuZ1wiIDtcclxuXHRcdHBlZ0hvbGRlci5hcHBlbmRDaGlsZCggcGVnICkgO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGFkZEV2ZW50SGFuZGxlcnNGb3IoIHBvaW50aW5nTWV0aG9kLCBwZWdIb2xkZXIgKVxyXG57XHJcblx0bGV0IGV2ZW50VHlwZSA9IGdldEV2ZW50VHlwZSggcG9pbnRpbmdNZXRob2QgKTtcclxuXHRsZXQgZXZlbnRUeXBlU3RhcnQgPSBldmVudFR5cGUuc3RhcnQ7XHJcblx0bGV0IGV2ZW50VHlwZUVuZCA9IGV2ZW50VHlwZS5lbmQ7XHJcblxyXG5cdHBlZ0hvbGRlci5hZGRFdmVudExpc3RlbmVyKCBldmVudFR5cGVTdGFydCwgZnVuY3Rpb24gKHN0YXJ0UG9pbnQpXHJcblx0e1xyXG5cdFx0XHRsZXQgZHJvcERlc3RpbmF0aW9uID0gc3RhcnRQb2ludC5jdXJyZW50VGFyZ2V0O1xyXG5cdFx0XHRsZXQgcGVnID0gc3RhcnRQb2ludC5jdXJyZW50VGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xyXG5cdFx0XHRzdGFydFBvaW50LnByZXZlbnREZWZhdWx0KCk7ICAvL3ByZXZlbnQgZnJvbSBob3ZlciBlZmZlY3QgYW5kIHNjcm9sbGluZyBkdXJpbmcgdG91Y2ggbW92ZVxyXG5cdFx0XHRlcnJvck1lc3NhZ2UuaGlkZSgpO1xyXG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBgJHtwb2ludGluZ01ldGhvZH1tb3ZlYCwgZHJhZ1BlZ1RvICwgZmFsc2UgKTtcclxuXHRcdFx0cGVnSG9sZGVyLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50VHlwZUVuZCwgY2hlY2tBYmJpbGl0eVRvRHJvcFBlZywgZmFsc2UgKTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIGRyYWdQZWdUbyggZGVzdGluYXRpb24gKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYgKCBwb2ludGluZ01ldGhvZElzVG91Y2goIHBvaW50aW5nTWV0aG9kICkgKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGRlc3RpbmF0aW9uID0gZGVzdGluYXRpb24udG91Y2hlc1swXTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdG1vdmUoIHBlZyApLnRvKCBkZXN0aW5hdGlvbiApO1xyXG5cdFx0XHRcdGRyb3BEZXN0aW5hdGlvbiA9IGRldGVybWluZURyb3BEZXN0aW5hdGlvbiggZGVzdGluYXRpb24gKTtcclxuXHRcdFx0fVxyXG5cclxuXHJcblx0XHRcdGZ1bmN0aW9uIGRldGVybWluZURyb3BEZXN0aW5hdGlvbiggZGVzdGluYXRpb24gKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IGVsZW1lbnRCZWxvdyA9IGdldEVsZW1lbnRCZWxvdyggZGVzdGluYXRpb24gKTtcclxuXHJcblx0XHRcdFx0aWYgKCBlbGVtZW50QmVsb3cgIT0gZHJvcERlc3RpbmF0aW9uIClcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRpZiAoIGlzRHJvcHBhYmxlKGVsZW1lbnRCZWxvdykgKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRwZWcuc3R5bGUuY3Vyc29yID0gXCJwb2ludGVyXCI7XHJcblx0XHRcdFx0XHRcdGVsZW1lbnRCZWxvdy5jbGFzc0xpc3QuYWRkKFwicGVnQm9hcmRfX3BlZ0hvbGRlci0tZHJvcHBhYmxlXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdHBlZy5zdHlsZS5jdXJzb3IgPSBcIm5vLWRyb3BcIjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZiAoIGlzRHJvcHBhYmxlKCBkcm9wRGVzdGluYXRpb24gKSApXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGRyb3BEZXN0aW5hdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCBcInBlZ0JvYXJkX19wZWdIb2xkZXItLWRyb3BwYWJsZVwiICk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRkcm9wRGVzdGluYXRpb24gPSBlbGVtZW50QmVsb3c7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gZHJvcERlc3RpbmF0aW9uO1xyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcG9pbnRpbmdNZXRob2RJc1RvdWNoKCBwb2ludGluZ01ldGhvZCApXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZiAoIHBvaW50aW5nTWV0aG9kID09IFwidG91Y2hcIiApXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gbW92ZSggZWxlbWVudCApXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cclxuXHRcdFx0XHRcdHRvKCBjdXJyZW50UG9pbnQgKSB7XHJcblx0XHRcdFx0XHRcdGVsZW1lbnQuc3R5bGUubGVmdCA9IGN1cnJlbnRQb2ludC5wYWdlWCAtIGVsZW1lbnQub2Zmc2V0V2lkdGgvMiArIFwicHhcIiA7XHJcblx0XHRcdFx0XHRcdGVsZW1lbnQuc3R5bGUudG9wID0gY3VycmVudFBvaW50LnBhZ2VZIC0gZWxlbWVudC5vZmZzZXRIZWlnaHQvMiArIFwicHhcIiA7XHJcblx0XHRcdFx0XHRcdGVsZW1lbnQuc3R5bGUuekluZGV4ID0gMTA7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fTtcclxuXHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRmdW5jdGlvbiBnZXRFbGVtZW50QmVsb3coIGN1cnJlbnRQb2ludCApXHJcblx0XHRcdHtcclxuXHRcdFx0XHRwZWcuaGlkZGVuID0gdHJ1ZTtcclxuXHRcdFx0XHRsZXQgZWxlbWVudEJlbG93ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCggY3VycmVudFBvaW50LmNsaWVudFgsIGN1cnJlbnRQb2ludC5jbGllbnRZICk7XHJcblx0XHRcdFx0cGVnLmhpZGRlbiA9IGZhbHNlO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gZWxlbWVudEJlbG93O1xyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gaXNEcm9wcGFibGUoIGVsZW1lbnRCZWxvdyApXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZiAoIGVsZW1lbnRCZWxvdyAmJiBlbGVtZW50QmVsb3cuY2xhc3NOYW1lICYmIGVsZW1lbnRCZWxvdy5jbGFzc0xpc3QuY29udGFpbnMoXCJwZWdCb2FyZF9fcGVnSG9sZGVyLS1lbXB0eVwiKSApXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gY2hlY2tBYmJpbGl0eVRvRHJvcFBlZyggZW5kUG9pbnQgKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IHBlZ0hvbGRlck9mTW92aW5nUGVnID0gZW5kUG9pbnQuY3VycmVudFRhcmdldDtcclxuXHRcdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCBgJHtwb2ludGluZ01ldGhvZH1tb3ZlYCwgZHJhZ1BlZ1RvICwgZmFsc2UgKTtcclxuXHJcblx0XHRcdFx0aWYgKCBpc0Ryb3BwYWJsZSggZHJvcERlc3RpbmF0aW9uICkgKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGRyb3BEZXN0aW5hdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCBcInBlZ0JvYXJkX19wZWdIb2xkZXItLWRyb3BwYWJsZVwiICk7XHJcblx0XHRcdFx0XHRkcm9wKCBwZWdIb2xkZXJPZk1vdmluZ1BlZywgZHJvcERlc3RpbmF0aW9uICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXR1cm5QZWdUb1N0YXJ0UG9pbnRGcm9tKCBwZWdIb2xkZXJPZk1vdmluZ1BlZyApO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cGVnSG9sZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoIGV2ZW50VHlwZUVuZCwgY2hlY2tBYmJpbGl0eVRvRHJvcFBlZywgZmFsc2UgKTtcclxuXHRcdFx0fVxyXG5cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHJldHVyblBlZ1RvU3RhcnRQb2ludEZyb20oIHBlZ0hvbGRlck9mTW92aW5nUGVnIClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGxldCBtb3ZpbmdQZWdQb3NpdGlvbiA9XHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cm93TnIgXHRcdFx0OiBcdE51bWJlciggcGVnSG9sZGVyT2ZNb3ZpbmdQZWcuaWQuc3Vic3RyKDksMSkgKSAsXHJcblx0XHRcdFx0XHRjb2x1bW5Oclx0XHQ6IFx0TnVtYmVyKCBwZWdIb2xkZXJPZk1vdmluZ1BlZy5pZC5zdWJzdHIoMTAsMSkgKVxyXG5cdFx0XHRcdH0gO1xyXG5cdFx0XHRcdGFwcGx5QWN0aW9uc0ZvckJvYXJkRmllbGQoIG1vdmluZ1BlZ1Bvc2l0aW9uICwgcmVtb3ZlUGVnRnJvbSwgY3JlYXRlUGVnSW4gKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH0sIGZhbHNlKTtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRFdmVudFR5cGUoIHBvaW50aW5nTWV0aG9kIClcclxue1xyXG5cdGxldCBldmVudFR5cGVTdGFydDtcclxuXHRsZXQgZXZlbnRUeXBlRW5kO1xyXG5cclxuXHRzd2l0Y2ggKCBwb2ludGluZ01ldGhvZCApXHJcblx0e1xyXG5cdFx0Y2FzZSBcIm1vdXNlXCIgOlxyXG5cdFx0XHRldmVudFR5cGVTdGFydCA9IGAke3BvaW50aW5nTWV0aG9kfWRvd25gIDtcclxuXHRcdFx0ZXZlbnRUeXBlRW5kID0gYCR7cG9pbnRpbmdNZXRob2R9dXBgIDtcclxuXHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0Y2FzZSBcInRvdWNoXCIgOlxyXG5cdFx0XHRldmVudFR5cGVTdGFydCA9IGAke3BvaW50aW5nTWV0aG9kfXN0YXJ0YCA7XHJcblx0XHRcdGV2ZW50VHlwZUVuZCA9IGAke3BvaW50aW5nTWV0aG9kfWVuZGAgO1xyXG5cdFx0XHRicmVhaztcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRzdGFydDogZXZlbnRUeXBlU3RhcnQsXHJcblx0XHRlbmQ6IGV2ZW50VHlwZUVuZFxyXG5cdH07XHJcblxyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGRyb3AoIHBlZ0hvbGRlck9mTW92aW5nUGVnLCBwZWdEZXN0aXRhdGlvbkhvbGRlciApXHJcbntcclxuXHRsZXQgbW92aW5nUGVnID0gcGVnSG9sZGVyT2ZNb3ZpbmdQZWcuZmlyc3RFbGVtZW50Q2hpbGQ7XHJcblx0bGV0IG1vdmluZ1BlZ1Bvc2l0aW9uID1cclxuXHR7XHJcblx0XHRyb3dOciBcdFx0XHQ6IFx0TnVtYmVyKCBwZWdIb2xkZXJPZk1vdmluZ1BlZy5pZC5zdWJzdHIoOSwxKSApICxcclxuXHRcdGNvbHVtbk5yXHRcdDogXHROdW1iZXIoIHBlZ0hvbGRlck9mTW92aW5nUGVnLmlkLnN1YnN0cigxMCwxKSApXHJcblx0fSA7XHJcblxyXG5cdGxldCBwZWdEZXN0aXRhdGlvblBvc2l0aW9uID1cclxuXHR7XHJcblx0XHRyb3dOciBcdFx0XHQ6IFx0TnVtYmVyKCBwZWdEZXN0aXRhdGlvbkhvbGRlci5pZC5zdWJzdHIoOSwxKSApICxcclxuXHRcdGNvbHVtbk5yXHRcdDogXHROdW1iZXIoIHBlZ0Rlc3RpdGF0aW9uSG9sZGVyLmlkLnN1YnN0cigxMCwxKSApXHJcblx0fTtcclxuXHJcblx0bGV0IHBlZ01vdmUgPSBjaGVja0FjY2VwdGFibGVNb3ZlcyggYm9hcmQsIG1vdmluZ1BlZ1Bvc2l0aW9uICk7XHJcblx0bGV0IGRpcmVjdGlvbiA9IGNhbGN1bGF0ZU1vdmVEaXJlY3Rpb24oIG1vdmluZ1BlZ1Bvc2l0aW9uLCBwZWdEZXN0aXRhdGlvblBvc2l0aW9uICk7XHJcblxyXG5cdGlmICggKCBwZWdNb3ZlLm1vdmVBbGxvd2VkW2RpcmVjdGlvbl0gPT0gdHJ1ZSApICYmXHJcblx0XHQgICBtb3ZlSXNOb3REaWFnb25hbCggZGlyZWN0aW9uLCBtb3ZpbmdQZWdQb3NpdGlvbiwgcGVnRGVzdGl0YXRpb25Qb3NpdGlvbiApICYmXHJcblx0XHQgICBtb3ZlU3RlcElzT25seUFib3V0VHdvRmllbGRzKCBkaXJlY3Rpb24sIG1vdmluZ1BlZ1Bvc2l0aW9uLCBwZWdEZXN0aXRhdGlvblBvc2l0aW9uICkgKVxyXG5cdHtcclxuXHRcdGFwcGx5QWN0aW9uc0ZvckJvYXJkRmllbGQoIHBlZ01vdmUuYmVhdGVuUGVnUG9zaXRpb25bZGlyZWN0aW9uXSwgcmVtb3ZlUGVnRnJvbSwgY2hhbmdlQ2xhc3NGbGFnICk7XHJcblx0XHRhcHBseUFjdGlvbnNGb3JCb2FyZEZpZWxkKCBtb3ZpbmdQZWdQb3NpdGlvbiwgcmVtb3ZlUGVnRnJvbSwgY2hhbmdlQ2xhc3NGbGFnICk7XHJcblx0XHRhcHBseUFjdGlvbnNGb3JCb2FyZEZpZWxkKCBwZWdNb3ZlLmRlc3RpbmF0aW9uUGVnUG9zaXRpb25bZGlyZWN0aW9uXSwgY3JlYXRlUGVnSW4sIGNoYW5nZUNsYXNzRmxhZyApO1xyXG5cdFx0Ly9wZWdEZXN0aXRhdGlvbkhvbGRlci5hcHBlbmRDaGlsZChtb3ZpbmdQZWcpO1xyXG5cclxuXHRcdHVwZGF0ZUJvYXJkQ29tcG9zaXRpb24oIGJvYXJkLCBtb3ZpbmdQZWdQb3NpdGlvbiwgXCJlbXB0eVwiICk7XHJcblx0XHR1cGRhdGVCb2FyZENvbXBvc2l0aW9uKCBib2FyZCwgcGVnTW92ZS5iZWF0ZW5QZWdQb3NpdGlvbltkaXJlY3Rpb25dLCBcImVtcHR5XCIgKTtcclxuXHRcdHVwZGF0ZUJvYXJkQ29tcG9zaXRpb24oIGJvYXJkLCBwZWdNb3ZlLmRlc3RpbmF0aW9uUGVnUG9zaXRpb25bZGlyZWN0aW9uXSwgXCJwZWdcIiApO1xyXG5cclxuXHRcdGFkZEJhY2tCdXR0b24oIGJvYXJkICk7XHJcblx0XHRuZXdHYW1lQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJuYXZpZ2F0aW9uX19idXR0b24tLWZpcnN0XCIpO1xyXG5cdFx0bW92ZUNvdW50ZXIuaW5jcmVhc2UoKTtcclxuXHRcdHVwZGF0ZUNvdW50ZXJPblNjcmVlbiggbW92ZUNvdW50ZXIuZ2V0KCkgKTtcclxuXHRcdG1vdmVzQmFja3VwLm1ha2VCYWNrdXAoIG1vdmluZ1BlZ1Bvc2l0aW9uLCBwZWdNb3ZlLmJlYXRlblBlZ1Bvc2l0aW9uW2RpcmVjdGlvbl0sIHBlZ01vdmUuZGVzdGluYXRpb25QZWdQb3NpdGlvbltkaXJlY3Rpb25dLCBtb3ZlQ291bnRlci5nZXQoKSApO1xyXG5cdFx0bG9jYWxTdG9yYWdlLnNldEJvYXJkQ29tcG9zaXRpb24oIGJvYXJkLmdldFdob2xlQm9hcmQoKSApO1xyXG5cdFx0bG9jYWxTdG9yYWdlLnNldE1vdmVzQmFja3VwKCBtb3Zlc0JhY2t1cC5nZXRCYWNrdXAoKSApO1xyXG5cdFx0bG9jYWxTdG9yYWdlLnNldE1vdmVDb3VudGVyKCBtb3ZlQ291bnRlci5nZXQoKSApO1xyXG5cclxuXHRcdGxvZ1RvQ29uc29sZUFsbEFsbG93ZWREZXN0aW5hdGlvbnMoIGJvYXJkICk7XHJcblx0fVxyXG5cdGVsc2VcclxuXHR7XHJcblx0XHRkaXNwbGF5TWVzc2FnZVRoYXRNb3ZlSXNOb3RBbGxvd2VkKCBwZWdEZXN0aXRhdGlvbkhvbGRlciApO1xyXG5cdFx0YXBwbHlBY3Rpb25zRm9yQm9hcmRGaWVsZCggbW92aW5nUGVnUG9zaXRpb24gLCByZW1vdmVQZWdGcm9tLCBjcmVhdGVQZWdJbiApO1xyXG5cdH1cclxuXHJcblx0aWYgKCBpc0dhbWVPdmVyKCBib2FyZCApIClcclxuXHR7XHJcblx0XHRsZXQgYW1vdW50T2ZQZWdzTGVmdCA9IGNvdW50UGVnc0xlZnQoIGJvYXJkICk7XHJcblx0XHRzaG93R2FtZU92ZXJNZXNzYWdlSW5jbHVkaW5nSW5mb0Fib3V0KGFtb3VudE9mUGVnc0xlZnQpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBjaGVja0FjY2VwdGFibGVNb3ZlcyggY3VycmVudEJvYXJkLCBtb3ZpbmdQZWdQb3NpdGlvbiApXHJcbntcclxuXHRsZXQgYmVhdGVuUGVnUG9zaXRpb24gPVxyXG4gIHtcclxuICAgIHdlc3QgOlxyXG4gICAge1xyXG4gICAgICByb3dOciBcdFx0XHQ6IFx0bW92aW5nUGVnUG9zaXRpb24ucm93TnIgLFxyXG4gICAgICBjb2x1bW5Oclx0XHQ6IFx0bW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnIgLSAxXHJcbiAgICB9LFxyXG5cclxuXHRcdGVhc3QgOlxyXG4gICAge1xyXG5cdFx0XHRyb3dOciBcdFx0XHQ6IFx0bW92aW5nUGVnUG9zaXRpb24ucm93TnIgLFxyXG5cdFx0XHRjb2x1bW5Oclx0XHQ6IFx0bW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnIgKyAxXHJcblx0XHR9LFxyXG5cclxuIFx0XHRub3J0aCA6XHJcbiAgICB7XHJcblx0XHRcdHJvd05yIFx0XHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5yb3dOciAtIDEgLFxyXG5cdFx0XHRjb2x1bW5Oclx0XHQ6IFx0bW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnJcclxuXHRcdH0sXHJcblxyXG5cdFx0c291dGggOlxyXG4gICAge1xyXG5cdFx0XHRyb3dOciBcdFx0XHQ6IFx0bW92aW5nUGVnUG9zaXRpb24ucm93TnIgKyAxICxcclxuXHRcdFx0Y29sdW1uTnJcdFx0OiBcdG1vdmluZ1BlZ1Bvc2l0aW9uLmNvbHVtbk5yXHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0bGV0IGRlc3RpbmF0aW9uUGVnUG9zaXRpb24gPVxyXG5cdHtcclxuXHRcdHdlc3Q6XHJcblx0XHR7XHJcblx0XHRcdHJvd05yIFx0XHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5yb3dOciAsXHJcblx0XHRcdGNvbHVtbk5yXHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5jb2x1bW5OciAtIDIsXHJcblx0XHR9LFxyXG5cclxuXHRcdGVhc3Q6XHJcblx0XHR7XHJcblx0XHRcdHJvd05yIFx0XHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5yb3dOciAsXHJcblx0XHRcdGNvbHVtbk5yXHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5jb2x1bW5OciArIDIsXHJcblx0XHR9LFxyXG5cclxuXHRcdG5vcnRoOlxyXG5cdFx0e1xyXG5cdFx0XHRyb3dOciBcdFx0XHQ6IFx0bW92aW5nUGVnUG9zaXRpb24ucm93TnIgLSAyICxcclxuXHRcdFx0Y29sdW1uTnJcdFx0OiBcdG1vdmluZ1BlZ1Bvc2l0aW9uLmNvbHVtbk5yLFxyXG5cdFx0fSxcclxuXHJcblx0XHRzb3V0aDpcclxuXHRcdHtcclxuXHRcdFx0cm93TnIgXHRcdFx0OiBcdG1vdmluZ1BlZ1Bvc2l0aW9uLnJvd05yICsgMiAsXHJcblx0XHRcdGNvbHVtbk5yXHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5jb2x1bW5OcixcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRsZXQgbW92ZUFsbG93ZWQgPVxyXG5cdHtcclxuXHRcdHdlc3QgXHRcdDogXHRmYWxzZSxcclxuXHRcdGVhc3QgXHRcdDogXHRmYWxzZSxcclxuXHRcdG5vcnRoIFx0OiBcdGZhbHNlLFxyXG5cdFx0c291dGggXHQ6IFx0ZmFsc2VcclxuXHR9O1xyXG5cclxuXHRmb3IgKGxldCBrZXkgaW4gbW92ZUFsbG93ZWQgKVxyXG5cdHtcclxuXHRcdGlmKCBtb3ZpbmdQZWdJc0luQXBwcm9wcmlhdGVQb3NpdGlvbigga2V5LCBtb3ZpbmdQZWdQb3NpdGlvbiApICYmXHJcblx0XHRcdG1vdmluZ1BlZ0V4aXN0KCBjdXJyZW50Qm9hcmQsIG1vdmluZ1BlZ1Bvc2l0aW9uICkgJiZcclxuXHRcdFx0cGVnVG9CZWF0RXhpc3QoIGN1cnJlbnRCb2FyZCwgYmVhdGVuUGVnUG9zaXRpb25ba2V5XSApICYmXHJcblx0XHRcdGRlc3RpbmF0aW9uRmllbGRJc0VtcHR5KCBjdXJyZW50Qm9hcmQsIGRlc3RpbmF0aW9uUGVnUG9zaXRpb25ba2V5XSkgKVxyXG5cdFx0e1xyXG5cdFx0XHRtb3ZlQWxsb3dlZFtrZXldID0gdHJ1ZSA7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdG1vdmVBbGxvd2VkW2tleV0gPSBmYWxzZSA7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4geyBtb3ZpbmdQZWdQb3NpdGlvbiwgYmVhdGVuUGVnUG9zaXRpb24sIGRlc3RpbmF0aW9uUGVnUG9zaXRpb24sIG1vdmVBbGxvd2VkIH0gO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIG1vdmluZ1BlZ0V4aXN0KCBjdXJyZW50Qm9hcmQsIG1vdmluZ1BlZ1Bvc2l0aW9uIClcclxue1xyXG5cdGlmICggY3VycmVudEJvYXJkLmdldEN1cnJlbnRCb2FyZFZhbHVlKCBtb3ZpbmdQZWdQb3NpdGlvbiApID09IFwicGVnXCIgKVxyXG5cdHtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRlbHNlXHJcblx0e1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBwZWdUb0JlYXRFeGlzdCggY3VycmVudEJvYXJkLCBiZWF0ZW5QZWdQb3NpdGlvblZhbHVlIClcclxue1xyXG5cdGlmICggY3VycmVudEJvYXJkLmdldEN1cnJlbnRCb2FyZFZhbHVlKCBiZWF0ZW5QZWdQb3NpdGlvblZhbHVlICkgPT0gXCJwZWdcIiApXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdGVsc2VcclxuXHR7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGRlc3RpbmF0aW9uRmllbGRJc0VtcHR5KCBjdXJyZW50Qm9hcmQsIGRlc3RpbmF0aW9uUGVnUG9zaXRpb25WYWx1ZSApXHJcbntcclxuXHRpZiAoIGN1cnJlbnRCb2FyZC5nZXRDdXJyZW50Qm9hcmRWYWx1ZSggZGVzdGluYXRpb25QZWdQb3NpdGlvblZhbHVlICkgPT0gXCJlbXB0eVwiIClcclxuXHR7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0ZWxzZVxyXG5cdHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gbW92aW5nUGVnSXNJbkFwcHJvcHJpYXRlUG9zaXRpb24oIGtleSwgbW92aW5nUGVnUG9zaXRpb24gKVxyXG57XHJcblx0aWYgKCBrZXkgPT0gXCJ3ZXN0XCIgJiYgbW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnIgPCAyIClcclxuXHR7XHJcblx0XHRyZXR1cm4gZmFsc2UgO1xyXG5cdH1cclxuXHRlbHNlIGlmICgga2V5ID09IFwiZWFzdFwiICYmIG1vdmluZ1BlZ1Bvc2l0aW9uLmNvbHVtbk5yID4gNCApXHJcblx0e1xyXG5cdFx0cmV0dXJuIGZhbHNlIDtcclxuXHR9XHJcblx0ZWxzZSBpZiAoIGtleSA9PSBcIm5vcnRoXCIgJiYgbW92aW5nUGVnUG9zaXRpb24ucm93TnIgPCAyIClcclxuXHR7XHJcblx0XHRyZXR1cm4gZmFsc2UgO1xyXG5cdH1cclxuXHRlbHNlIGlmICgga2V5ID09IFwic291dGhcIiAmJiBtb3ZpbmdQZWdQb3NpdGlvbi5yb3dOciA+IDQgKVxyXG5cdHtcclxuXHRcdHJldHVybiBmYWxzZSA7XHJcblx0fVxyXG5cdGVsc2VcclxuXHR7XHJcblx0XHRyZXR1cm4gdHJ1ZSA7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIG1vdmVJc05vdERpYWdvbmFsKCBrZXksIG1vdmluZ1BlZ1Bvc2l0aW9uLCBkZXN0aW5hdGlvblBlZ1Bvc2l0aW9uIClcclxue1xyXG5cdGlmICggKCBrZXkgPT0gXCJ3ZXN0XCIgfHwga2V5ID09IFwiZWFzdFwiICkgJiZcclxuXHQgICAgICggbW92aW5nUGVnUG9zaXRpb24ucm93TnIgPT0gZGVzdGluYXRpb25QZWdQb3NpdGlvbi5yb3dOciApIClcclxuXHR7XHJcblx0XHRyZXR1cm4gdHJ1ZSA7XHJcblx0fVxyXG5cdGVsc2UgaWYgKCAoIGtleSA9PSBcIm5vcnRoXCIgfHwga2V5ID09IFwic291dGhcIiApICYmXHJcblx0ICAgICAgICAgICggbW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnIgPT0gZGVzdGluYXRpb25QZWdQb3NpdGlvbi5jb2x1bW5OciApIClcclxuXHR7XHJcblx0XHRyZXR1cm4gdHJ1ZSA7XHJcblx0fVxyXG5cdGVsc2VcclxuXHR7XHJcblx0XHRyZXR1cm4gZmFsc2UgO1xyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBtb3ZlU3RlcElzT25seUFib3V0VHdvRmllbGRzKCBrZXksIG1vdmluZ1BlZ1Bvc2l0aW9uLCBkZXN0aW5hdGlvblBlZ1Bvc2l0aW9uIClcclxue1xyXG5cdGlmICggKCBrZXkgPT0gXCJ3ZXN0XCIgfHwga2V5ID09IFwiZWFzdFwiICkgJiZcclxuXHQgICAgICggTWF0aC5hYnMoIG1vdmluZ1BlZ1Bvc2l0aW9uLmNvbHVtbk5yIC0gZGVzdGluYXRpb25QZWdQb3NpdGlvbi5jb2x1bW5OciApID09IDIgKSApXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRydWUgO1xyXG5cdH1cclxuXHRlbHNlIGlmICggKCBrZXkgPT0gXCJub3J0aFwiIHx8IGtleSA9PSBcInNvdXRoXCIgKSAmJlxyXG5cdCAgICAgICAgICAoIE1hdGguYWJzKCBtb3ZpbmdQZWdQb3NpdGlvbi5yb3dOciAtIGRlc3RpbmF0aW9uUGVnUG9zaXRpb24ucm93TnIpID09IDIgKSAgKVxyXG5cdHtcclxuXHRcdHJldHVybiB0cnVlIDtcclxuXHR9XHJcblx0ZWxzZVxyXG5cdHtcclxuXHRcdHJldHVybiBmYWxzZSA7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGNhbGN1bGF0ZU1vdmVEaXJlY3Rpb24oIG1vdmluZ1BlZ1Bvc2l0aW9uLCBwZWdEZXN0aXRhdGlvblBvc2l0aW9uIClcclxue1xyXG5cdGxldCBtb3ZlRGlyZWN0aW9uO1xyXG5cclxuXHRpZiAoIG1vdmluZ1BlZ1Bvc2l0aW9uLnJvd05yIC0gcGVnRGVzdGl0YXRpb25Qb3NpdGlvbi5yb3dOciA9PSAwIClcclxuXHR7XHJcblx0XHRpZiAoIG1vdmluZ1BlZ1Bvc2l0aW9uLmNvbHVtbk5yIC0gcGVnRGVzdGl0YXRpb25Qb3NpdGlvbi5jb2x1bW5OciA+IDAgKVxyXG5cdFx0e1xyXG5cdFx0XHRtb3ZlRGlyZWN0aW9uID0gXCJ3ZXN0XCI7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdG1vdmVEaXJlY3Rpb24gPSBcImVhc3RcIjtcclxuXHRcdH1cclxuXHR9XHJcblx0ZWxzZVxyXG5cdHtcclxuXHRcdGlmICggbW92aW5nUGVnUG9zaXRpb24ucm93TnIgLSBwZWdEZXN0aXRhdGlvblBvc2l0aW9uLnJvd05yID4gMCApXHJcblx0XHR7XHJcblx0XHRcdG1vdmVEaXJlY3Rpb24gPSBcIm5vcnRoXCI7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdG1vdmVEaXJlY3Rpb24gPSBcInNvdXRoXCI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gbW92ZURpcmVjdGlvbjtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiByZW1vdmVQZWdGcm9tKCBwZWdIb2xkZXIgKVxyXG57XHJcblx0d2hpbGUoIHBlZ0hvbGRlci5oYXNDaGlsZE5vZGVzKCkgKVxyXG5cdHtcclxuXHRcdHBlZ0hvbGRlci5yZW1vdmVDaGlsZCggcGVnSG9sZGVyLmxhc3RDaGlsZCApO1xyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBhcHBseUFjdGlvbnNGb3JCb2FyZEZpZWxkKCBib2FyZEZpZWxkUG9zaXRpb24sIC4uLmFjdGlvbnMgKVxyXG57XHJcblx0bGV0IGJvYXJkRmllbGQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggYHBlZ0hvbGRlciR7Ym9hcmRGaWVsZFBvc2l0aW9uLnJvd05yfSR7Ym9hcmRGaWVsZFBvc2l0aW9uLmNvbHVtbk5yfWAgKSA7XHJcblx0Zm9yICggbGV0IGFjdGlvbiBvZiBhY3Rpb25zIClcclxuXHR7XHJcblx0XHRhY3Rpb24oIGJvYXJkRmllbGQgKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQm9hcmRDb21wb3NpdGlvbiggY3VycmVudEJvYXJkLCBmaWVsZFBvc2l0aW9uLCB1cGRhdGVkVmFsdWUgKVxyXG57XHJcblx0Y3VycmVudEJvYXJkLmNoYW5nZUJvYXJkVmFsdWUoIGZpZWxkUG9zaXRpb24sIHVwZGF0ZWRWYWx1ZSApO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGNoYW5nZUNsYXNzRmxhZyggcGVnSG9sZGVyIClcclxue1xyXG5cdHBlZ0hvbGRlci5jbGFzc0xpc3QudG9nZ2xlKCBcInBlZ0JvYXJkX19wZWdIb2xkZXItLWVtcHR5XCIgKTtcclxuXHRwZWdIb2xkZXIuY2xhc3NMaXN0LnRvZ2dsZSggXCJwZWdCb2FyZF9fcGVnSG9sZGVyLS13aXRoUGVnXCIgKTtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBhZGRCYWNrQnV0dG9uKCBjdXJyZW50Qm9hcmQgKVxyXG57XHJcblx0aWYgKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCJiYWNrQnV0dG9uXCIgKSA9PSBudWxsIClcclxuXHR7XHJcblx0XHRsZXQgYmFja0J1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIFwiQlVUVE9OXCIgKTtcclxuXHRcdGJhY2tCdXR0b24uaWQgPSBcImJhY2tCdXR0b25cIiA7XHJcblx0XHRiYWNrQnV0dG9uLmNsYXNzTmFtZSA9IFwibmF2aWdhdGlvbl9fYnV0dG9uIG5hdmlnYXRpb25fX2J1dHRvbi0tbGFzdFwiO1xyXG5cdFx0YmFja0J1dHRvbi50ZXh0Q29udGVudCA9IFwiQmFja1wiIDtcclxuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwibmF2XCIpWzBdLmFwcGVuZENoaWxkKCBiYWNrQnV0dG9uICk7XHJcblxyXG5cdFx0YmFja0J1dHRvbi5vbmNsaWNrID0gKCkgPT5cclxuXHRcdHtcclxuXHRcdFx0bW92ZUNvdW50ZXIuZGVjcmVhc2UoKTtcclxuXHRcdFx0dXBkYXRlQ291bnRlck9uU2NyZWVuKCBtb3ZlQ291bnRlci5nZXQoKSApO1xyXG5cdFx0XHRtb3Zlc0JhY2t1cC5yZXN0b3JlQmFja3VwKCBhcHBseUFjdGlvbnNGb3JCb2FyZEZpZWxkLCB1cGRhdGVCb2FyZENvbXBvc2l0aW9uLCBtb3ZlQ291bnRlci5nZXQoKSApO1xyXG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0Qm9hcmRDb21wb3NpdGlvbiggY3VycmVudEJvYXJkLmdldFdob2xlQm9hcmQoKSApO1xyXG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0TW92ZXNCYWNrdXAoIG1vdmVzQmFja3VwLmdldEJhY2t1cCgpICk7XHJcblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRNb3ZlQ291bnRlciggbW92ZUNvdW50ZXIuZ2V0KCkgKTtcclxuXHRcdFx0bG9nVG9Db25zb2xlQWxsQWxsb3dlZERlc3RpbmF0aW9ucyggY3VycmVudEJvYXJkICk7XHJcblxyXG5cdFx0XHRpZiAoIG1vdmVDb3VudGVyLmdldCgpID09IDAgKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIFwiYmFja0J1dHRvblwiICkucmVtb3ZlKCk7XHJcblx0XHRcdFx0bmV3R2FtZUJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKFwibmF2aWdhdGlvbl9fYnV0dG9uLS1maXJzdFwiKTtcclxuXHRcdFx0XHRsb2NhbFN0b3JhZ2UuY2xlYXJHYW1lU3RhdGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUNvdW50ZXJPblNjcmVlbiggdmFsdWUgKVxyXG57XHJcblx0bGV0IHNjb3JlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggXCIuc2NvcmVQYW5lbF9fc2NvcmVcIiApO1xyXG5cdHNjb3JlLnRleHRDb250ZW50ID0gdmFsdWUgO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGRpc3BsYXlNZXNzYWdlVGhhdE1vdmVJc05vdEFsbG93ZWQoIHBlZ0Rlc3RpdGF0aW9uSG9sZGVyIClcclxue1xyXG5cdGVycm9yTWVzc2FnZS5zaG93KCk7XHJcblx0cGVnRGVzdGl0YXRpb25Ib2xkZXIuY2xhc3NMaXN0LmFkZCggXCJwZWdCb2FyZF9fcGVnSG9sZGVyLS1ub25Ecm9wcGFibGVcIiApIDtcclxuXHJcblx0c2V0VGltZW91dCggKCkgPT5cclxuXHR7XHJcblx0XHRlcnJvck1lc3NhZ2UuaGlkZSgpO1xyXG5cdFx0cGVnRGVzdGl0YXRpb25Ib2xkZXIuY2xhc3NMaXN0LnJlbW92ZSggXCJwZWdCb2FyZF9fcGVnSG9sZGVyLS1ub25Ecm9wcGFibGVcIiApIDtcclxuXHR9LCAyMDAwKTtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBpc0dhbWVPdmVyKGN1cnJlbnRCb2FyZClcclxue1xyXG5cdGxldCBnYW1lT3ZlciA9IGZhbHNlO1xyXG5cclxuXHRpZiAoIGZpbmRBbGxBbGxvd2VkRGVzdGluYXRpb24oIGN1cnJlbnRCb2FyZCApLnNpemUgPT0gMCApXHJcblx0e1xyXG5cdFx0Z2FtZU92ZXIgPSB0cnVlO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGdhbWVPdmVyO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGZpbmRBbGxBbGxvd2VkRGVzdGluYXRpb24oIGN1cnJlbnRCb2FyZCApXHJcbntcclxuXHRcdGxldCBhbGxvd2VkRGVzdGluYXRpb25zID0gbmV3IFNldCgpO1xyXG5cclxuXHRcdGN1cnJlbnRCb2FyZC5nZXRXaG9sZUJvYXJkKCkuZm9yRWFjaCggKCByb3dWYWx1ZSwgcm93TnIsIHJvd0FycmF5ICkgPT5cclxuXHRcdHtcclxuXHRcdFx0cm93VmFsdWUuZm9yRWFjaCggKCBjb2x1bW5WYWx1ZSwgY29sdW1uTnIsIGNvbHVtbkFycmF5ICkgPT5cclxuXHRcdFx0e1xyXG5cdFx0XHRcdGxldCBwZWdQb3NpdGlvblRvQ2hlY2sgPVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJvd05yLFxyXG5cdFx0XHRcdFx0Y29sdW1uTnJcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdGxldCBwZWdNb3ZlID0gY2hlY2tBY2NlcHRhYmxlTW92ZXMoIGN1cnJlbnRCb2FyZCwgcGVnUG9zaXRpb25Ub0NoZWNrICk7XHJcblxyXG5cdFx0XHRcdGZvciAoIGxldCBkaXJlY3Rpb24gaW4gcGVnTW92ZS5tb3ZlQWxsb3dlZCApXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0aWYgKCBwZWdNb3ZlLm1vdmVBbGxvd2VkW2RpcmVjdGlvbl0gPT0gdHJ1ZSApXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGxldCBzdGFydFBvc2l0aW9uWCA9IHBlZ01vdmUubW92aW5nUGVnUG9zaXRpb24ucm93TnI7XHJcblx0XHRcdFx0XHRcdGxldCBzdGFydFBvc2l0aW9uWSA9IHBlZ01vdmUubW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnI7XHJcblx0XHRcdFx0XHRcdGxldCBlbmRQb3NpdGlvblggPSBwZWdNb3ZlLmRlc3RpbmF0aW9uUGVnUG9zaXRpb25bZGlyZWN0aW9uXS5yb3dOcjtcclxuXHRcdFx0XHRcdFx0bGV0IGVuZFBvc2l0aW9uWSA9IHBlZ01vdmUuZGVzdGluYXRpb25QZWdQb3NpdGlvbltkaXJlY3Rpb25dLmNvbHVtbk5yO1xyXG5cdFx0XHRcdFx0XHRsZXQgYWxsb3dlZERlc3RpbmF0aW9uID0gYCgke3N0YXJ0UG9zaXRpb25YfSwgJHtzdGFydFBvc2l0aW9uWX0pLT4oJHtlbmRQb3NpdGlvblh9LCAke2VuZFBvc2l0aW9uWX0pYCA7XHJcblx0XHRcdFx0XHRcdGFsbG93ZWREZXN0aW5hdGlvbnMuYWRkKCBhbGxvd2VkRGVzdGluYXRpb24gKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIGFsbG93ZWREZXN0aW5hdGlvbnMgO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIHNob3dHYW1lT3Zlck1lc3NhZ2VJbmNsdWRpbmdJbmZvQWJvdXQoYW1vdW50T2ZQZWdzTGVmdClcclxue1xyXG5cdGxldCBtZXNzYWdlO1xyXG5cclxuXHRpZiAoIGFtb3VudE9mUGVnc0xlZnQgPT0gMSApXHJcblx0e1xyXG5cdFx0bWVzc2FnZSA9IFwiQ29uZ3JhdHVsYXRpb25zISBZb3UndmUgd29uIVxcbiBEbyB5b3Ugd2FudCB0byBwbGF5IGFnYWluP1wiIDtcclxuXHR9XHJcblx0ZWxzZSBtZXNzYWdlID0gYEdhbWUgb3ZlciEgWW91J3ZlIGZhaWxlZCB0byB3aW4uIFlvdXIgc2NvcmUgaXM6XFxuLSBhbW91bnQgb2YgbW92ZXM6ICR7bW92ZUNvdW50ZXIuZ2V0KCl9XFxuLSBhbW91bnQgb2YgUGVncyBsZWZ0OiAke2Ftb3VudE9mUGVnc0xlZnR9XFxuXFxuRG8geW91IHdhbnQgdG8gcGxheSBhZ2Fpbj9gIDtcclxuXHJcblx0bGV0IG1lc3NhZ2VCb3ggPSBhbGVydFdpdGgoIG1lc3NhZ2UgKTtcclxuXHRhcHBseVVzZXJSZWFjdGlvblRvKCBtZXNzYWdlQm94ICk7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gY291bnRQZWdzTGVmdCggY3VycmVudEJvYXJkIClcclxue1xyXG5cdGxldCBjb3VudFBlZyA9IDA7XHJcblxyXG5cdGN1cnJlbnRCb2FyZC5nZXRXaG9sZUJvYXJkKCkuZm9yRWFjaCggKCByb3dWYWx1ZSwgcm93TnIsIHJvd0FycmF5ICkgPT5cclxuXHR7XHJcblx0XHRyb3dWYWx1ZS5mb3JFYWNoKCAoIGNvbHVtblZhbHVlLCBjb2x1bW5OciwgY29sdW1uQXJyYXkgKSA9PlxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgcGVnUG9zaXRpb25Ub0NoZWNrID1cclxuXHRcdFx0e1xyXG5cdFx0XHRcdHJvd05yLFxyXG5cdFx0XHRcdGNvbHVtbk5yXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRpZiAoIGN1cnJlbnRCb2FyZC5nZXRDdXJyZW50Qm9hcmRWYWx1ZSggcGVnUG9zaXRpb25Ub0NoZWNrICkgPT0gXCJwZWdcIilcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGNvdW50UGVnKys7XHJcblx0XHRcdH1cclxuXHJcblx0XHR9KTtcclxuXHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBjb3VudFBlZyA7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gZW5hYmxlTG9nVG9Db25zb2xlKClcclxue1xyXG5cdHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGFkZE5ld0dhbWVCdXR0b24oKVxyXG57XHJcblx0bGV0IG5ld0dhbWVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCJuZXdHYW1lQnV0dG9uXCIgKTtcclxuXHJcblx0bmV3R2FtZUJ1dHRvbi5vbmNsaWNrID0gKCkgPT4ge1xyXG5cdCAgbGV0IG1lc3NhZ2VCb3ggPSBhbGVydFdpdGgoIFwiRG8geW91IHdhbnQgdG8gc3RhcnQgbmV3IGdhbWU/XCIgKTtcclxuXHQgIGFwcGx5VXNlclJlYWN0aW9uVG8oIG1lc3NhZ2VCb3ggKTtcclxuXHR9O1xyXG5cclxuXHRyZXR1cm4gbmV3R2FtZUJ1dHRvbjtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBhbGVydFdpdGgoIG1lc3NhZ2UgKVxyXG57XHJcblx0bGV0IG1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIFwibW9kYWxcIiApO1xyXG5cdGxldCBtb2RhbEJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBcIi5tb2RhbF9fbWVzc2FnZVwiICk7XHJcblx0bW9kYWxCb2R5LmlubmVyVGV4dCA9IG1lc3NhZ2UgO1xyXG5cdG1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuXHJcblx0cmV0dXJuIG1vZGFsO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGFwcGx5VXNlclJlYWN0aW9uVG8oIG1lc3NhZ2VCb3ggKVxyXG57XHJcblx0bGV0IG5ld0dhbWVDb25maXJtYXRpb25CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCJtb2RhbE9rQnV0dG9uXCIgKTtcclxuXHRsZXQgbmV3R2FtZUNhbmNlbGF0aW9uQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIFwibW9kYWxDYW5jZWxCdXR0b25cIiApO1xyXG5cclxuXHRuZXdHYW1lQ29uZmlybWF0aW9uQnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB7XHJcblx0XHRsb2NhbFN0b3JhZ2UuY2xlYXJHYW1lU3RhdGUoKTtcclxuXHRcdHN0YXJ0TmV3R2FtZSgpIDtcclxuXHRcdG1lc3NhZ2VCb3guc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG5cdH07XHJcblxyXG5cdG5ld0dhbWVDYW5jZWxhdGlvbkJ1dHRvbi5vbmNsaWNrID0gKCkgPT4ge1xyXG5cdFx0bWVzc2FnZUJveC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblx0fTtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBzdGFydE5ld0dhbWUoKVxyXG57XHJcblx0aWYgKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCJiYWNrQnV0dG9uXCIgKSApXHJcblx0e1xyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIFwiYmFja0J1dHRvblwiICkucmVtb3ZlKCk7XHJcblx0XHRuZXdHYW1lQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJuYXZpZ2F0aW9uX19idXR0b24tLWZpcnN0XCIpO1xyXG5cdH1cclxuICBsb2NhbFN0b3JhZ2UuY2xlYXJHYW1lU3RhdGUoKTtcclxuXHRsZXQgaW5pdGlhbFBlZ0JvYXJkID0gc29saXRhaXJlR2FtZUluaXRpYWxCb2FyZCggbG9jYWxTdG9yYWdlICk7XHJcblx0cmVkcmF3U29saXRhaXJlR2FtZUJvYXJkKCBpbml0aWFsUGVnQm9hcmQgKTtcclxuXHRib2FyZCA9IG5ldyBDdXJyZW50UGVnQm9hcmRDb21wb3NpdGlvbiggaW5pdGlhbFBlZ0JvYXJkICkgO1xyXG5cdG1vdmVDb3VudGVyID0gbmV3IE1vdmVDb3VudGVyKCBsb2NhbFN0b3JhZ2UuZ2V0TW92ZUNvdW50ZXIoKSApO1xyXG5cdHVwZGF0ZUNvdW50ZXJPblNjcmVlbiggbW92ZUNvdW50ZXIuZ2V0KCkgKTtcclxuXHRtb3Zlc0JhY2t1cCA9IG5ldyBCYWNrdXAoIGxvY2FsU3RvcmFnZS5nZXRNb3Zlc0JhY2t1cCgpICwgYm9hcmQsIGVuYWJsZUxvZ1RvQ29uc29sZSgpICk7XHJcblx0bG9nVG9Db25zb2xlQWxsQWxsb3dlZERlc3RpbmF0aW9ucyggYm9hcmQgKSA7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gcmVkcmF3U29saXRhaXJlR2FtZUJvYXJkKCBpbml0aWFsUGVnQm9hcmQgKVxyXG57XHJcblx0aW5pdGlhbFBlZ0JvYXJkLmZvckVhY2goICggcm93VmFsdWUsIHJvd05yLCByb3dBcnJheSApID0+XHJcblx0e1xyXG5cdFx0cm93VmFsdWUuZm9yRWFjaCggKCBjb2x1bW5WYWx1ZSwgY29sdW1uTnIsIGNvbHVtbkFycmF5ICkgPT5cclxuXHRcdHtcclxuXHRcdFx0bGV0IHBlZ0hvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBgcGVnSG9sZGVyJHtyb3dOcn0ke2NvbHVtbk5yfWAgKTtcclxuXHJcblx0XHRcdGlmICggcm93TnIgPT0gTWF0aC5mbG9vciggcm93QXJyYXkubGVuZ3RoLzIgKSAmJiBjb2x1bW5OciA9PSBNYXRoLmZsb29yKCBjb2x1bW5BcnJheS5sZW5ndGgvMiApIClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdFx0cmVtb3ZlUGVnRnJvbSggcGVnSG9sZGVyICk7XHJcblx0XHRcdFx0XHRwZWdIb2xkZXIuY2xhc3NMaXN0LnJlbW92ZSggXCJwZWdCb2FyZF9fcGVnSG9sZGVyLS13aXRoUGVnXCIgKTtcclxuXHRcdFx0XHRcdHBlZ0hvbGRlci5jbGFzc0xpc3QuYWRkKCBcInBlZ0JvYXJkX19wZWdIb2xkZXItLWVtcHR5XCIgKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmICggY29sdW1uVmFsdWUgPT0gXCJwZWdcIiApXHJcblx0XHRcdHtcclxuXHRcdFx0XHRcdHJlbW92ZVBlZ0Zyb20oIHBlZ0hvbGRlciApO1xyXG5cdFx0XHRcdFx0Y3JlYXRlUGVnSW4oIHBlZ0hvbGRlciApO1xyXG5cdFx0XHRcdFx0cGVnSG9sZGVyLmNsYXNzTGlzdC5yZW1vdmUoIFwicGVnQm9hcmRfX3BlZ0hvbGRlci0tZW1wdHlcIiApO1xyXG5cdFx0XHRcdFx0cGVnSG9sZGVyLmNsYXNzTGlzdC5hZGQoIFwicGVnQm9hcmRfX3BlZ0hvbGRlci0td2l0aFBlZ1wiICk7XHJcblx0XHRcdH1cclxuXHJcblx0XHR9KTtcclxuXHJcblx0fSk7XHJcblxyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGxvZ1RvQ29uc29sZUFsbEFsbG93ZWREZXN0aW5hdGlvbnMoIGN1cnJlbnRCb2FyZCApXHJcbntcclxuXHRcdGxldCBhbGxvd2VkRGVzdGluYXRpb25zID0gXCJcIiA7XHJcblx0XHRmb3IgKCBsZXQgdmFsdWUgb2YgZmluZEFsbEFsbG93ZWREZXN0aW5hdGlvbihjdXJyZW50Qm9hcmQpLnZhbHVlcygpIClcclxuXHRcdHtcclxuXHRcdFx0YWxsb3dlZERlc3RpbmF0aW9ucyArPSBgJHt2YWx1ZX0sIGAgO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBjb25zb2xlLmxvZyggYEFsbG93ZWQgZGVzdGluYXRpb25zOiAke2FsbG93ZWREZXN0aW5hdGlvbnN9XHJcblx0XHRcdFx0XHRBbGxvd2VkIGRlc3RpbmF0aW9uczogJHtmaW5kQWxsQWxsb3dlZERlc3RpbmF0aW9uKGN1cnJlbnRCb2FyZCkuc2l6ZX1gKTtcclxufVxyXG4iXX0=
