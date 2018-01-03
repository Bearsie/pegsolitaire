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

			if (peg)
			{
				document.addEventListener( `${pointingMethod}move`, dragPegTo , false );
				pegHolder.addEventListener( eventTypeEnd, checkAbbilityToDropPeg, false );
			}

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvY2FsU3RvcmFnZVNlcnZpY2UuanMiLCJjdXJyZW50UGVnQm9hcmRDb21wb3NpdGlvbi5qcyIsIm1vdmVDb3VudGVyLmpzIiwibW92ZXNCYWNrdXAuanMiLCJlcnJvck1lc3NhZ2UuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMb2NhbFN0b3JhZ2VTZXJ2aWNlXHJcbntcclxuXHRjb25zdHJ1Y3RvcigpXHJcblx0e1xyXG5cdFx0dGhpcy5zdG9yYWdlID0gaXNMb2NhbFN0b3JhZ2VTdXBwb3J0ZWQoKSA/IHdpbmRvdy5sb2NhbFN0b3JhZ2UgOiBuZXcgZHVtbXlTdG9yYWdlKCk7XHJcblx0XHR0aGlzLmJvYXJkQ29tcG9zaXRpb24gPSBcImJvYXJkQ29tcG9zaXRpb25cIjtcclxuXHRcdHRoaXMubW92ZXNCYWNrdXAgPSBcIm1vdmVzQmFja3VwXCIgO1xyXG5cdFx0dGhpcy5tb3ZlQ291bnRlciA9IFwibW92ZUNvdW50ZXJcIjtcclxuXHR9XHJcblxyXG5cclxuXHRnZXRCb2FyZENvbXBvc2l0aW9uKClcclxuXHR7XHJcblx0XHRsZXQgc3RvcmFnZUl0ZW0gPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSggdGhpcy5ib2FyZENvbXBvc2l0aW9uICk7XHJcblxyXG5cdFx0aWYgKCBzdG9yYWdlSXRlbSApIHJldHVybiBKU09OLnBhcnNlKCBzdG9yYWdlSXRlbSApO1xyXG5cdFx0ZWxzZSByZXR1cm4gbnVsbDtcclxuXHR9XHJcblxyXG5cdHNldEJvYXJkQ29tcG9zaXRpb24oIGJvYXJkQ29tcG9zaXRpb24gKVxyXG5cdHtcclxuXHRcdHRoaXMuc3RvcmFnZS5zZXRJdGVtKCB0aGlzLmJvYXJkQ29tcG9zaXRpb24sIEpTT04uc3RyaW5naWZ5KGJvYXJkQ29tcG9zaXRpb24pICkgO1xyXG5cdH1cclxuXHJcblxyXG5cdGdldE1vdmVzQmFja3VwKClcclxuXHR7XHJcblx0XHRsZXQgc3RvcmFnZUl0ZW0gPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSggdGhpcy5tb3Zlc0JhY2t1cCApO1xyXG5cclxuXHRcdGlmICggc3RvcmFnZUl0ZW0gKSByZXR1cm4gSlNPTi5wYXJzZSggc3RvcmFnZUl0ZW0gKTtcclxuXHRcdGVsc2UgcmV0dXJuIG51bGw7XHJcblx0fVxyXG5cclxuXHRzZXRNb3Zlc0JhY2t1cCggYmFja3VwIClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5zdG9yYWdlLnNldEl0ZW0oIHRoaXMubW92ZXNCYWNrdXAsIEpTT04uc3RyaW5naWZ5KGJhY2t1cCkgKSA7XHJcblx0fVxyXG5cclxuXHJcblx0Z2V0TW92ZUNvdW50ZXIoKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSggdGhpcy5tb3ZlQ291bnRlciApO1xyXG5cdH1cclxuXHJcblx0c2V0TW92ZUNvdW50ZXIoIGNvdW50ZXIgKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLnN0b3JhZ2Uuc2V0SXRlbSggdGhpcy5tb3ZlQ291bnRlciwgY291bnRlciApIDtcclxuXHR9XHJcblxyXG5cclxuXHRjbGVhckdhbWVTdGF0ZSgpXHJcblx0e1xyXG5cdFx0dGhpcy5zdG9yYWdlLmNsZWFyKCk7XHJcblx0fVxyXG5cclxufVxyXG5cclxuXHJcbmNsYXNzIGR1bW15U3RvcmFnZVxyXG57XHJcbiAgY29uc3RydWN0b3IoKVxyXG5cdHtcclxuXHRcdHRoaXMuc3RvcmFnZSA9IHt9O1xyXG5cdH1cclxuXHJcbiAgc2V0SXRlbSgga2V5LCB2YWx1ZSApXHJcblx0e1xyXG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZVtrZXldID0gU3RyaW5nKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgZ2V0SXRlbSgga2V5IClcclxuXHR7XHJcbiAgICByZXR1cm4gdGhpcy5zdG9yYWdlLmhhc093blByb3BlcnR5KCBrZXkgKSA/IHRoaXMuc3RvcmFnZVtrZXldIDogdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgY2xlYXIoIClcclxuXHR7XHJcbiAgICByZXR1cm4gdGhpcy5zdG9yYWdlID0ge307XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gaXNMb2NhbFN0b3JhZ2VTdXBwb3J0ZWQoKVxyXG57XHJcblx0dHJ5XHJcblx0e1xyXG5cdFx0bGV0IHN0b3JhZ2UgPSB3aW5kb3cubG9jYWxTdG9yYWdlO1xyXG5cdFx0c3RvcmFnZS5zZXRJdGVtKCBcInRlc3Rfa2V5XCIsIFwidGVzdF92YWx1ZVwiICk7XHJcblx0XHRzdG9yYWdlLnJlbW92ZUl0ZW0oIFwidGVzdF9rZXlcIiApO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdGNhdGNoKCBlcnJvciApXHJcblx0e1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxufVxyXG4iLCJjbGFzcyBDdXJyZW50UGVnQm9hcmRDb21wb3NpdGlvblxyXG57XHJcblx0Y29uc3RydWN0b3IoIHBlZ0JvYXJkIClcclxuXHR7XHJcblx0XHR0aGlzLnJvd3MgPSBbXTtcclxuXHRcdHBlZ0JvYXJkLmZvckVhY2goIHJvdyA9PiB0aGlzLnJvd3MucHVzaCggcm93ICkgKTtcclxuXHR9XHJcblxyXG5cdGdldEN1cnJlbnRCb2FyZFZhbHVlKCBwZWdIb2xkZXJQb3NpdGlvbiApXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMucm93c1twZWdIb2xkZXJQb3NpdGlvbi5yb3dOcl1bcGVnSG9sZGVyUG9zaXRpb24uY29sdW1uTnJdO1xyXG5cdH1cclxuXHJcblx0Y2hhbmdlQm9hcmRWYWx1ZSggcGVnSG9sZGVyUG9zaXRpb24sIHZhbHVlIClcclxuXHR7XHJcblx0XHR0aGlzLnJvd3NbcGVnSG9sZGVyUG9zaXRpb24ucm93TnJdW3BlZ0hvbGRlclBvc2l0aW9uLmNvbHVtbk5yXSA9IHZhbHVlO1xyXG5cdH1cclxuXHRnZXRXaG9sZUJvYXJkKClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5yb3dzO1xyXG5cdH1cclxufVxyXG4iLCJjbGFzcyBNb3ZlQ291bnRlclxyXG57XHJcblx0Y29uc3RydWN0b3IoIGNvdW50ZXIgKVxyXG5cdHtcclxuXHRcdGlmICggY291bnRlciA+IDAgKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnZhbHVlID0gY291bnRlciA7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdHRoaXMudmFsdWUgPSAwO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Z2V0KClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy52YWx1ZTtcclxuXHR9XHJcblxyXG5cdGluY3JlYXNlKClcclxuXHR7XHJcblx0XHR0aGlzLnZhbHVlKysgO1xyXG5cdH1cclxuXHJcblx0ZGVjcmVhc2UoKVxyXG5cdHtcclxuXHRcdHRoaXMudmFsdWUtLSA7XHJcblx0fVxyXG59XHJcbiIsImNsYXNzIEJhY2t1cFxyXG57XHJcblx0Y29uc3RydWN0b3IoIHNhdmVkQmFja3VwLCBjdXJyZW50Qm9hcmQsIGxvZ1RvQ29uc29sZSA9IGZhbHNlIClcclxuXHR7XHJcblx0XHRpZiAoIHNhdmVkQmFja3VwID09IG51bGwpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuc3RhcnRGaWVsZCA9IFtdO1xyXG5cdFx0XHR0aGlzLmJlYXRlbkZpZWxkID0gW107XHJcblx0XHRcdHRoaXMuZW5kRmllbGQgPSBbXTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5zdGFydEZpZWxkID0gc2F2ZWRCYWNrdXAuc3RhcnRGaWVsZCA7XHJcblx0XHRcdHRoaXMuYmVhdGVuRmllbGQgPSBzYXZlZEJhY2t1cC5iZWF0ZW5GaWVsZDtcclxuXHRcdFx0dGhpcy5lbmRGaWVsZCA9IHNhdmVkQmFja3VwLmVuZEZpZWxkO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5jdXJyZW50Qm9hcmQgPSBjdXJyZW50Qm9hcmQ7XHJcblx0XHR0aGlzLmxvZ0JhY2t1cFRvQ29uc29sZSA9IGxvZ1RvQ29uc29sZTtcclxuXHR9XHJcblxyXG5cdG1ha2VCYWNrdXAgKCBtb3ZpbmdQZWdQb3NpdGlvbiwgYmVhdGVuUGVnUG9zaXRpb24sIGRlc3RpbmF0aW9uUGVnUG9zaXRpb24sIG1vdmVDb3VudGVyIClcclxuXHR7XHJcblx0XHR0aGlzLnN0YXJ0RmllbGQucHVzaCggbW92aW5nUGVnUG9zaXRpb24gKTtcclxuXHRcdHRoaXMuYmVhdGVuRmllbGQucHVzaCggYmVhdGVuUGVnUG9zaXRpb24gKTtcclxuXHRcdHRoaXMuZW5kRmllbGQucHVzaCggZGVzdGluYXRpb25QZWdQb3NpdGlvbiApO1xyXG5cclxuXHRcdGlmICh0aGlzLmxvZ0JhY2t1cFRvQ29uc29sZSlcclxuXHRcdHtcclxuXHRcdFx0XHRsb2dCYWNrdXBpbmdUb0NvbnNvbGUoIHRoaXMuc3RhcnRGaWVsZFt0aGlzLnN0YXJ0RmllbGQubGVuZ3RoIC0gMV0sXHJcblx0XHRcdFx0XHRcdFx0XHRcdCAgIFx0XHRcdFx0XHQgdGhpcy5iZWF0ZW5GaWVsZFt0aGlzLmJlYXRlbkZpZWxkLmxlbmd0aCAtIDFdLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQgICBcdFx0XHQgXHRcdCB0aGlzLmVuZEZpZWxkW3RoaXMuZW5kRmllbGQubGVuZ3RoIC0gMV0sXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgbW92ZUNvdW50ZXJcclxuXHRcdFx0XHRcdFx0XHRcdFx0IFx0XHRcdFx0IFx0ICk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXN0b3JlQmFja3VwKGFwcGx5QWN0aW9uc0ZvckJvYXJkRmllbGQsIHVwZGF0ZUJvYXJkQ29tcG9zaXRpb24sIG1vdmVDb3VudGVyKVxyXG5cdHtcclxuXHRcdGFwcGx5QWN0aW9uc0ZvckJvYXJkRmllbGQoIHRoaXMuc3RhcnRGaWVsZFt0aGlzLnN0YXJ0RmllbGQubGVuZ3RoIC0gMV0sIGNyZWF0ZVBlZ0luLCBjaGFuZ2VDbGFzc0ZsYWcgKTtcclxuXHRcdGFwcGx5QWN0aW9uc0ZvckJvYXJkRmllbGQoIHRoaXMuYmVhdGVuRmllbGRbdGhpcy5iZWF0ZW5GaWVsZC5sZW5ndGggLSAxXSwgY3JlYXRlUGVnSW4sIGNoYW5nZUNsYXNzRmxhZyApO1xyXG5cdFx0YXBwbHlBY3Rpb25zRm9yQm9hcmRGaWVsZCggdGhpcy5lbmRGaWVsZFt0aGlzLmVuZEZpZWxkLmxlbmd0aCAtIDFdLCByZW1vdmVQZWdGcm9tLCBjaGFuZ2VDbGFzc0ZsYWcgKTtcclxuXHJcblx0XHR1cGRhdGVCb2FyZENvbXBvc2l0aW9uKCB0aGlzLmN1cnJlbnRCb2FyZCwgdGhpcy5zdGFydEZpZWxkW3RoaXMuc3RhcnRGaWVsZC5sZW5ndGggLSAxXSwgXCJwZWdcIiApO1xyXG5cdFx0dXBkYXRlQm9hcmRDb21wb3NpdGlvbiggdGhpcy5jdXJyZW50Qm9hcmQsIHRoaXMuYmVhdGVuRmllbGRbdGhpcy5iZWF0ZW5GaWVsZC5sZW5ndGggLSAxXSwgXCJwZWdcIiApO1xyXG5cdFx0dXBkYXRlQm9hcmRDb21wb3NpdGlvbiggdGhpcy5jdXJyZW50Qm9hcmQsIHRoaXMuZW5kRmllbGRbdGhpcy5lbmRGaWVsZC5sZW5ndGggLSAxXSwgXCJlbXB0eVwiICk7XHJcblxyXG5cdFx0aWYgKCB0aGlzLmxvZ0JhY2t1cFRvQ29uc29sZSApXHJcblx0XHR7XHJcblx0XHRcdFx0bG9nUmVzdG9yaW5nQmFja3VwVG9Db25zb2xlKCB0aGlzLmVuZEZpZWxkW3RoaXMuZW5kRmllbGQubGVuZ3RoIC0gMV0sXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCB0aGlzLmJlYXRlbkZpZWxkW3RoaXMuYmVhdGVuRmllbGQubGVuZ3RoIC0gMV0sXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCB0aGlzLnN0YXJ0RmllbGRbdGhpcy5zdGFydEZpZWxkLmxlbmd0aCAtIDFdLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgbW92ZUNvdW50ZXJcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnN0YXJ0RmllbGQucG9wKCk7XHJcblx0XHR0aGlzLmJlYXRlbkZpZWxkLnBvcCgpO1xyXG5cdFx0dGhpcy5lbmRGaWVsZC5wb3AoKTtcclxuXHR9XHJcblxyXG5cdGdldEJhY2t1cCgpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0XCJzdGFydEZpZWxkXCIgIDogdGhpcy5zdGFydEZpZWxkLFxyXG5cdFx0XHRcImJlYXRlbkZpZWxkXCIgOiB0aGlzLmJlYXRlbkZpZWxkLFxyXG5cdFx0XHRcImVuZEZpZWxkXCIgICAgOiB0aGlzLmVuZEZpZWxkXHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0aGFzUmVjb3JkcygpXHJcblx0e1xyXG5cdFx0aWYgKCB0aGlzLnN0YXJ0RmllbGQubGVuZ3RoID09IDAgfHwgdGhpcy5iZWF0ZW5GaWVsZC5sZW5ndGggPT0gMCB8fCB0aGlzLmVuZEZpZWxkLmxlbmd0aCA9PSAwIClcclxuXHRcdHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSByZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gbG9nQmFja3VwaW5nVG9Db25zb2xlKCBtb3ZpbmdQZWdQb3NpdGlvbiwgYmVhdGVuUGVnUG9zaXRpb24sIGRlc3RpbmF0aW9uUGVnUG9zaXRpb24sIG1vdmVDb3VudGVyIClcclxue1xyXG5cdGNvbnNvbGUubG9nKGAqKioqKioqKioqKiBCYWNrdXBpbmcgKioqKioqKioqKioqKiAtIE1vdmUgbm8uOiAke21vdmVDb3VudGVyfVxcbmAgK1xyXG5cdGBtb3ZlIGZyb206ICgke21vdmluZ1BlZ1Bvc2l0aW9uLnJvd05yfSAsICR7bW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnJ9KSB0bzogKCR7ZGVzdGluYXRpb25QZWdQb3NpdGlvbi5yb3dOcn0gLCAke2Rlc3RpbmF0aW9uUGVnUG9zaXRpb24uY29sdW1uTnJ9KVxcbmAgK1xyXG5cdGBiZWF0ZW4gcGVnOiAoJHtiZWF0ZW5QZWdQb3NpdGlvbi5yb3dOcn0gLCAke2JlYXRlblBlZ1Bvc2l0aW9uLmNvbHVtbk5yfSlgICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvZ1Jlc3RvcmluZ0JhY2t1cFRvQ29uc29sZSggZGVzdGluYXRpb25QZWdQb3NpdGlvbiwgYmVhdGVuUGVnUG9zaXRpb24sIG1vdmluZ1BlZ1Bvc2l0aW9uLCBtb3ZlQ291bnRlciApXHJcbntcclxuXHRjb25zb2xlLmxvZyhgKioqKioqKioqKiogUmVzdG9yaW5nIGJhY2t1cCAqKioqKioqKioqKioqIC0gTW92ZSBuby46ICR7bW92ZUNvdW50ZXJ9XFxuYCArXHJcbiAgXHRcdFx0XHRcdFx0YHJlc3RvcmUgZnJvbTogKCR7ZGVzdGluYXRpb25QZWdQb3NpdGlvbi5yb3dOcn0gLCAke2Rlc3RpbmF0aW9uUGVnUG9zaXRpb24uY29sdW1uTnJ9KSB0bzogKCR7bW92aW5nUGVnUG9zaXRpb24ucm93TnJ9ICwgJHttb3ZpbmdQZWdQb3NpdGlvbi5jb2x1bW5Ocn0pXFxuYCArXHJcbiAgXHRcdFx0XHRcdFx0YGJlYXRlbiBwZWc6ICgke2JlYXRlblBlZ1Bvc2l0aW9uLnJvd05yfSAsICR7YmVhdGVuUGVnUG9zaXRpb24uY29sdW1uTnJ9KWAgKTtcclxufVxyXG4iLCJjbGFzcyBFcnJvck1lc3NhZ2Vcclxue1xyXG5cdGNvbnN0cnVjdG9yKCBtZXNzYWdlIClcclxuXHR7XHJcblx0XHR0aGlzLm1lc3NhZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCJlcnJvck1lc3NhZ2VcIiApIDtcclxuXHRcdHRoaXMubWVzc2FnZS5jbGFzc0xpc3QuYWRkKCBcImJvdHRvbUJhclwiICk7XHJcblx0XHR0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBtZXNzYWdlIDtcclxuXHR9XHJcblxyXG5cdHNob3coKVxyXG5cdHtcclxuXHRcdHRoaXMubWVzc2FnZS5jbGFzc0xpc3QuYWRkKCBcImJvdHRvbUJhci0tc2hvd1wiICk7XHJcblx0fVxyXG5cclxuXHRoaWRlKClcclxuXHR7XHJcblx0XHR0aGlzLm1lc3NhZ2UuY2xhc3NMaXN0LnJlbW92ZSggXCJib3R0b21CYXItLXNob3dcIiApIDtcclxuXHR9XHJcbn1cclxuIiwibGV0IGxvY2FsU3RvcmFnZSA9IG5ldyBMb2NhbFN0b3JhZ2VTZXJ2aWNlKCk7XHJcbmNvbnNvbGUubG9nKGxvY2FsU3RvcmFnZSk7XHJcbmxldCBzdGFydGluZ1BlZ0JvYXJkID0gc29saXRhaXJlR2FtZUluaXRpYWxCb2FyZCggbG9jYWxTdG9yYWdlICk7XHJcblxyXG53aW5kb3cub25sb2FkID0gZHJhd1NvbGl0YWlyZUdhbWVCb2FyZCggc3RhcnRpbmdQZWdCb2FyZCApIDtcclxuXHJcbmxldCBib2FyZCA9IG5ldyBDdXJyZW50UGVnQm9hcmRDb21wb3NpdGlvbiggc3RhcnRpbmdQZWdCb2FyZCApO1xyXG5sZXQgbW92ZUNvdW50ZXIgPSBuZXcgTW92ZUNvdW50ZXIoIGxvY2FsU3RvcmFnZS5nZXRNb3ZlQ291bnRlcigpICk7XHJcbmxldCBtb3Zlc0JhY2t1cCA9IG5ldyBCYWNrdXAoIGxvY2FsU3RvcmFnZS5nZXRNb3Zlc0JhY2t1cCgpLCBib2FyZCwgZW5hYmxlTG9nVG9Db25zb2xlKCkgKTtcclxubGV0IGVycm9yTWVzc2FnZSA9IG5ldyBFcnJvck1lc3NhZ2UoIFwiTW92ZSBub3QgYWxsb3dlZCFcIiApO1xyXG5sZXQgbmV3R2FtZUJ1dHRvbiA9IGFkZE5ld0dhbWVCdXR0b24oKTtcclxuXHJcbmlmICggbW92ZXNCYWNrdXAuaGFzUmVjb3JkcygpIClcclxue1xyXG5cdGFkZEJhY2tCdXR0b24oIGJvYXJkICk7XHJcblx0bmV3R2FtZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwibmF2aWdhdGlvbl9fYnV0dG9uLS1maXJzdFwiKTtcclxufVxyXG51cGRhdGVDb3VudGVyT25TY3JlZW4oIG1vdmVDb3VudGVyLmdldCgpICk7XHJcblxyXG5pZiAoIGlzR2FtZU92ZXIoIGJvYXJkICkgKVxyXG57XHJcblx0bGV0IGFtb3VudE9mUGVnc0xlZnQgPSBjb3VudFBlZ3NMZWZ0KCBib2FyZCApO1xyXG5cdHNob3dHYW1lT3Zlck1lc3NhZ2VJbmNsdWRpbmdJbmZvQWJvdXQoYW1vdW50T2ZQZWdzTGVmdCk7XHJcbn1cclxuXHJcbmxvZ1RvQ29uc29sZUFsbEFsbG93ZWREZXN0aW5hdGlvbnMoIGJvYXJkICk7XHJcblxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBkcmF3U29saXRhaXJlR2FtZUJvYXJkKCBwZWdCb2FyZCApXHJcbntcclxuXHRsZXQgYW1vdW50T2ZSb3dzID0gcGVnQm9hcmQubGVuZ3RoO1xyXG5cdGxldCBhbW91bnRPZkNvbHVtbnMgPSBwZWdCb2FyZFswXS5sZW5ndGg7XHJcblx0bGV0IGFzc2lzdGFudFJvd3MgPSBjcmVhdGVSb3dzRm9yRmxleEFsbGlnbWVudCggYW1vdW50T2ZSb3dzICk7XHJcblxyXG5cdGFzc2lzdGFudFJvd3MuZm9yRWFjaCggKCBhc3Npc3RhbnRSb3csIHJvd05yICkgPT5cclxuXHR7XHJcblx0XHRcdGZvciAoIGxldCBjb2x1bW5OciA9IDAgOyBjb2x1bW5OciA8IGFtb3VudE9mQ29sdW1ucyA7IGNvbHVtbk5yKysgKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0XHRpZiAoIHBlZ0JvYXJkW3Jvd05yXVtjb2x1bW5Ocl0gIT0gXCJibGFua1wiIClcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0YXNzaXN0YW50Um93LmFwcGVuZENoaWxkKCBkcmF3UGVnRmllbGQoIHBlZ0JvYXJkLCByb3dOciwgY29sdW1uTnIgKSApO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIFwicGVnQm9hcmRcIiApLmFwcGVuZENoaWxkKCBhc3Npc3RhbnRSb3cgKTtcclxuXHR9KTtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBjcmVhdGVSb3dzRm9yRmxleEFsbGlnbWVudCggYW1vdW50T2ZSb3dzIClcclxue1xyXG5cdGxldCBwZWdCb2FyZFJvd3MgPSBbXTtcclxuXHJcblx0Zm9yICggbGV0IHJvd05yID0gMCA7IHJvd05yIDwgYW1vdW50T2ZSb3dzIDsgcm93TnIrKyApXHJcblx0e1xyXG5cdFx0Ly9jcmVhdGluZyByb3dzIG9mIGJvYXJkLCB3aGljaCBpbiBDU1Mgd2lsbCBiZSBkaXNwbGF5ZWQgYXMgXCJmbGV4XCIgKG9uZSB1bmRlciBhbm90aGVyKVxyXG5cdFx0bGV0IHBlZ0JvYXJkUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggXCJESVZcIiApO1xyXG5cdFx0cGVnQm9hcmRSb3cuY2xhc3NOYW1lID0gXCJwZWdCb2FyZF9fcm93XCIgO1xyXG5cdFx0cGVnQm9hcmRSb3dzLnB1c2goIHBlZ0JvYXJkUm93ICk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcGVnQm9hcmRSb3dzO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGluaXRpYWxQZWdCb2FyZFZhbHVlKCByb3dOdW1iZXIsIGNvbHVtbk51bWJlciApXHJcbntcclxuXHRsZXQgcGVnQm9hcmQgPSBzb2xpdGFpcmVHYW1lSW5pdGlhbEJvYXJkKCBsb2NhbFN0b3JhZ2UgKTtcclxuXHJcblx0cmV0dXJuIHBlZ0JvYXJkW3Jvd051bWJlcl1bY29sdW1uTnVtYmVyXSA7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gc29saXRhaXJlR2FtZUluaXRpYWxCb2FyZCggbG9jYWxTdG9yYWdlIClcclxue1xyXG5cdGxldCBwZWdCb2FyZDtcclxuXHJcblx0aWYoIGxvY2FsU3RvcmFnZS5nZXRCb2FyZENvbXBvc2l0aW9uKCkgKVxyXG5cdHtcclxuXHRcdHBlZ0JvYXJkID0gbG9jYWxTdG9yYWdlLmdldEJvYXJkQ29tcG9zaXRpb24oKTtcclxuXHR9XHJcblx0ZWxzZVxyXG5cdHtcclxuXHRcdHBlZ0JvYXJkID0gW1xyXG5cdFx0XHRbIFwiYmxhbmtcIiAsIFwiYmxhbmtcIiAsIFwicGVnXCIgLCBcInBlZ1wiICAgXHQgICAsIFwicGVnXCIgLCBcImJsYW5rXCIgLCBcImJsYW5rXCIgICBdICxcclxuXHRcdFx0WyBcImJsYW5rXCIgLCBcImJsYW5rXCIgLCBcInBlZ1wiICwgXCJwZWdcIiAgICBcdCAgICwgXCJwZWdcIiAsIFwiYmxhbmtcIiAsIFwiYmxhbmtcIiAgIF0gLFxyXG5cdFx0XHRbIFwicGVnXCIgICAsIFwicGVnXCIgICAsIFwicGVnXCIgLCBcInBlZ1wiICAgIFx0ICAgLCBcInBlZ1wiICwgXCJwZWdcIiAgICwgXCJwZWdcIiAgICAgXSAsXHJcblx0XHRcdFsgXCJwZWdcIiAgICwgXCJwZWdcIiAgICwgXCJwZWdcIiAsIFwiZW1wdHlcIiAgICAgICwgXCJwZWdcIiAsIFwicGVnXCIgICAsIFwicGVnXCIgICAgIF0gLFxyXG5cdFx0XHRbIFwicGVnXCIgICAsIFwicGVnXCIgICAsIFwicGVnXCIgLCBcInBlZ1wiICAgIFx0ICAgLCBcInBlZ1wiICwgXCJwZWdcIiAgICwgXCJwZWdcIiAgICAgXSAsXHJcblx0XHRcdFsgXCJibGFua1wiICwgXCJibGFua1wiICwgXCJwZWdcIiAsIFwicGVnXCIgICAgXHQgICAsIFwicGVnXCIgLCBcImJsYW5rXCIgLCBcImJsYW5rXCIgICBdICxcclxuXHRcdFx0WyBcImJsYW5rXCIgLCBcImJsYW5rXCIgLCBcInBlZ1wiICwgXCJwZWdcIiAgICBcdCAgICwgXCJwZWdcIiAsIFwiYmxhbmtcIiAsIFwiYmxhbmtcIiAgIF1cclxuXHRcdF0gO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHBlZ0JvYXJkO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGRyYXdQZWdGaWVsZCggcGVnQm9hcmQsIHJvd05yLCBjb2x1bW5OciApXHJcbntcclxuXHRcdGxldCBwZWdIb2xkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCBcIkRJVlwiICk7XHJcblx0XHRwZWdIb2xkZXIuaWQgPSBgcGVnSG9sZGVyJHtyb3dOcn0ke2NvbHVtbk5yfWAgO1xyXG5cdFx0cGVnSG9sZGVyLmNsYXNzTGlzdC5hZGQoIFwicGVnQm9hcmRfX3BlZ0hvbGRlclwiICkgO1xyXG5cclxuXHRcdGlmICggcGVnQm9hcmRbcm93TnJdW2NvbHVtbk5yXSA9PSBcInBlZ1wiIClcclxuXHRcdHtcclxuXHRcdFx0Y3JlYXRlUGVnSW4oIHBlZ0hvbGRlciApO1xyXG5cdFx0XHRwZWdIb2xkZXIuY2xhc3NMaXN0LmFkZCggXCJwZWdCb2FyZF9fcGVnSG9sZGVyLS13aXRoUGVnXCIgKTtcclxuXHRcdH1cclxuXHRcdGlmICggcGVnQm9hcmRbcm93TnJdW2NvbHVtbk5yXSA9PSBcImVtcHR5XCIgKVxyXG5cdFx0e1xyXG5cdFx0XHRwZWdIb2xkZXIuY2xhc3NMaXN0LmFkZCggXCJwZWdCb2FyZF9fcGVnSG9sZGVyLS1lbXB0eVwiICk7XHJcblx0XHR9XHJcblxyXG5cdFx0YWRkRXZlbnRIYW5kbGVyc0ZvciggXCJtb3VzZVwiLCBwZWdIb2xkZXIgKTtcclxuXHRcdGFkZEV2ZW50SGFuZGxlcnNGb3IoIFwidG91Y2hcIiwgcGVnSG9sZGVyICk7XHJcblxyXG5cdFx0cmV0dXJuIHBlZ0hvbGRlcjtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQZWdJbiggcGVnSG9sZGVyIClcclxue1xyXG5cdFx0bGV0IHBlZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIFwiSU1HXCIgKTtcclxuXHRcdHBlZy5pZCA9IFwicGVnXCIgKyBwZWdIb2xkZXIuaWQuc2xpY2UoOSkgO1xyXG5cdFx0cGVnLmNsYXNzTmFtZSA9IFwicGVnQm9hcmRfX3BlZ1wiIDtcclxuXHRcdHBlZy5zcmMgPSBcImltZy9wZWcucG5nXCIgO1xyXG5cdFx0cGVnSG9sZGVyLmFwcGVuZENoaWxkKCBwZWcgKSA7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gYWRkRXZlbnRIYW5kbGVyc0ZvciggcG9pbnRpbmdNZXRob2QsIHBlZ0hvbGRlciApXHJcbntcclxuXHRsZXQgZXZlbnRUeXBlID0gZ2V0RXZlbnRUeXBlKCBwb2ludGluZ01ldGhvZCApO1xyXG5cdGxldCBldmVudFR5cGVTdGFydCA9IGV2ZW50VHlwZS5zdGFydDtcclxuXHRsZXQgZXZlbnRUeXBlRW5kID0gZXZlbnRUeXBlLmVuZDtcclxuXHJcblx0cGVnSG9sZGVyLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50VHlwZVN0YXJ0LCBmdW5jdGlvbiAoc3RhcnRQb2ludClcclxuXHR7XHJcblx0XHRcdGxldCBkcm9wRGVzdGluYXRpb24gPSBzdGFydFBvaW50LmN1cnJlbnRUYXJnZXQ7XHJcblx0XHRcdGxldCBwZWcgPSBzdGFydFBvaW50LmN1cnJlbnRUYXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQ7XHJcblx0XHRcdHN0YXJ0UG9pbnQucHJldmVudERlZmF1bHQoKTsgIC8vcHJldmVudCBmcm9tIGhvdmVyIGVmZmVjdCBhbmQgc2Nyb2xsaW5nIGR1cmluZyB0b3VjaCBtb3ZlXHJcblx0XHRcdGVycm9yTWVzc2FnZS5oaWRlKCk7XHJcblxyXG5cdFx0XHRpZiAocGVnKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggYCR7cG9pbnRpbmdNZXRob2R9bW92ZWAsIGRyYWdQZWdUbyAsIGZhbHNlICk7XHJcblx0XHRcdFx0cGVnSG9sZGVyLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50VHlwZUVuZCwgY2hlY2tBYmJpbGl0eVRvRHJvcFBlZywgZmFsc2UgKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gZHJhZ1BlZ1RvKCBkZXN0aW5hdGlvbiApXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZiAoIHBvaW50aW5nTWV0aG9kSXNUb3VjaCggcG9pbnRpbmdNZXRob2QgKSApXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0ZGVzdGluYXRpb24gPSBkZXN0aW5hdGlvbi50b3VjaGVzWzBdO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0bW92ZSggcGVnICkudG8oIGRlc3RpbmF0aW9uICk7XHJcblx0XHRcdFx0ZHJvcERlc3RpbmF0aW9uID0gZGV0ZXJtaW5lRHJvcERlc3RpbmF0aW9uKCBkZXN0aW5hdGlvbiApO1xyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gZGV0ZXJtaW5lRHJvcERlc3RpbmF0aW9uKCBkZXN0aW5hdGlvbiApXHJcblx0XHRcdHtcclxuXHRcdFx0XHRsZXQgZWxlbWVudEJlbG93ID0gZ2V0RWxlbWVudEJlbG93KCBkZXN0aW5hdGlvbiApO1xyXG5cclxuXHRcdFx0XHRpZiAoIGVsZW1lbnRCZWxvdyAhPSBkcm9wRGVzdGluYXRpb24gKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGlmICggaXNEcm9wcGFibGUoZWxlbWVudEJlbG93KSApXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdHBlZy5zdHlsZS5jdXJzb3IgPSBcInBvaW50ZXJcIjtcclxuXHRcdFx0XHRcdFx0ZWxlbWVudEJlbG93LmNsYXNzTGlzdC5hZGQoXCJwZWdCb2FyZF9fcGVnSG9sZGVyLS1kcm9wcGFibGVcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0cGVnLnN0eWxlLmN1cnNvciA9IFwibm8tZHJvcFwiO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGlmICggaXNEcm9wcGFibGUoIGRyb3BEZXN0aW5hdGlvbiApIClcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0ZHJvcERlc3RpbmF0aW9uLmNsYXNzTGlzdC5yZW1vdmUoIFwicGVnQm9hcmRfX3BlZ0hvbGRlci0tZHJvcHBhYmxlXCIgKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGRyb3BEZXN0aW5hdGlvbiA9IGVsZW1lbnRCZWxvdztcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiBkcm9wRGVzdGluYXRpb247XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRmdW5jdGlvbiBwb2ludGluZ01ldGhvZElzVG91Y2goIHBvaW50aW5nTWV0aG9kIClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGlmICggcG9pbnRpbmdNZXRob2QgPT0gXCJ0b3VjaFwiIClcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRmdW5jdGlvbiBtb3ZlKCBlbGVtZW50IClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHJldHVybiB7XHJcblxyXG5cdFx0XHRcdFx0dG8oIGN1cnJlbnRQb2ludCApIHtcclxuXHRcdFx0XHRcdFx0ZWxlbWVudC5zdHlsZS5sZWZ0ID0gY3VycmVudFBvaW50LnBhZ2VYIC0gZWxlbWVudC5vZmZzZXRXaWR0aC8yICsgXCJweFwiIDtcclxuXHRcdFx0XHRcdFx0ZWxlbWVudC5zdHlsZS50b3AgPSBjdXJyZW50UG9pbnQucGFnZVkgLSBlbGVtZW50Lm9mZnNldEhlaWdodC8yICsgXCJweFwiIDtcclxuXHRcdFx0XHRcdFx0ZWxlbWVudC5zdHlsZS56SW5kZXggPSAxMDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHJcblx0XHRcdGZ1bmN0aW9uIGdldEVsZW1lbnRCZWxvdyggY3VycmVudFBvaW50IClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHBlZy5oaWRkZW4gPSB0cnVlO1xyXG5cdFx0XHRcdGxldCBlbGVtZW50QmVsb3cgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KCBjdXJyZW50UG9pbnQuY2xpZW50WCwgY3VycmVudFBvaW50LmNsaWVudFkgKTtcclxuXHRcdFx0XHRwZWcuaGlkZGVuID0gZmFsc2U7XHJcblxyXG5cdFx0XHRcdHJldHVybiBlbGVtZW50QmVsb3c7XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRmdW5jdGlvbiBpc0Ryb3BwYWJsZSggZWxlbWVudEJlbG93IClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGlmICggZWxlbWVudEJlbG93ICYmIGVsZW1lbnRCZWxvdy5jbGFzc05hbWUgJiYgZWxlbWVudEJlbG93LmNsYXNzTGlzdC5jb250YWlucyhcInBlZ0JvYXJkX19wZWdIb2xkZXItLWVtcHR5XCIpIClcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRmdW5jdGlvbiBjaGVja0FiYmlsaXR5VG9Ecm9wUGVnKCBlbmRQb2ludCApXHJcblx0XHRcdHtcclxuXHRcdFx0XHRsZXQgcGVnSG9sZGVyT2ZNb3ZpbmdQZWcgPSBlbmRQb2ludC5jdXJyZW50VGFyZ2V0O1xyXG5cdFx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoIGAke3BvaW50aW5nTWV0aG9kfW1vdmVgLCBkcmFnUGVnVG8gLCBmYWxzZSApO1xyXG5cclxuXHRcdFx0XHRpZiAoIGlzRHJvcHBhYmxlKCBkcm9wRGVzdGluYXRpb24gKSApXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0ZHJvcERlc3RpbmF0aW9uLmNsYXNzTGlzdC5yZW1vdmUoIFwicGVnQm9hcmRfX3BlZ0hvbGRlci0tZHJvcHBhYmxlXCIgKTtcclxuXHRcdFx0XHRcdGRyb3AoIHBlZ0hvbGRlck9mTW92aW5nUGVnLCBkcm9wRGVzdGluYXRpb24gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJldHVyblBlZ1RvU3RhcnRQb2ludEZyb20oIHBlZ0hvbGRlck9mTW92aW5nUGVnICk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRwZWdIb2xkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciggZXZlbnRUeXBlRW5kLCBjaGVja0FiYmlsaXR5VG9Ecm9wUGVnLCBmYWxzZSApO1xyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcmV0dXJuUGVnVG9TdGFydFBvaW50RnJvbSggcGVnSG9sZGVyT2ZNb3ZpbmdQZWcgKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IG1vdmluZ1BlZ1Bvc2l0aW9uID1cclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyb3dOciBcdFx0XHQ6IFx0TnVtYmVyKCBwZWdIb2xkZXJPZk1vdmluZ1BlZy5pZC5zdWJzdHIoOSwxKSApICxcclxuXHRcdFx0XHRcdGNvbHVtbk5yXHRcdDogXHROdW1iZXIoIHBlZ0hvbGRlck9mTW92aW5nUGVnLmlkLnN1YnN0cigxMCwxKSApXHJcblx0XHRcdFx0fSA7XHJcblx0XHRcdFx0YXBwbHlBY3Rpb25zRm9yQm9hcmRGaWVsZCggbW92aW5nUGVnUG9zaXRpb24gLCByZW1vdmVQZWdGcm9tLCBjcmVhdGVQZWdJbiApO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSwgZmFsc2UpO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGdldEV2ZW50VHlwZSggcG9pbnRpbmdNZXRob2QgKVxyXG57XHJcblx0bGV0IGV2ZW50VHlwZVN0YXJ0O1xyXG5cdGxldCBldmVudFR5cGVFbmQ7XHJcblxyXG5cdHN3aXRjaCAoIHBvaW50aW5nTWV0aG9kIClcclxuXHR7XHJcblx0XHRjYXNlIFwibW91c2VcIiA6XHJcblx0XHRcdGV2ZW50VHlwZVN0YXJ0ID0gYCR7cG9pbnRpbmdNZXRob2R9ZG93bmAgO1xyXG5cdFx0XHRldmVudFR5cGVFbmQgPSBgJHtwb2ludGluZ01ldGhvZH11cGAgO1xyXG5cdFx0XHRicmVhaztcclxuXHJcblx0XHRjYXNlIFwidG91Y2hcIiA6XHJcblx0XHRcdGV2ZW50VHlwZVN0YXJ0ID0gYCR7cG9pbnRpbmdNZXRob2R9c3RhcnRgIDtcclxuXHRcdFx0ZXZlbnRUeXBlRW5kID0gYCR7cG9pbnRpbmdNZXRob2R9ZW5kYCA7XHJcblx0XHRcdGJyZWFrO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdHN0YXJ0OiBldmVudFR5cGVTdGFydCxcclxuXHRcdGVuZDogZXZlbnRUeXBlRW5kXHJcblx0fTtcclxuXHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gZHJvcCggcGVnSG9sZGVyT2ZNb3ZpbmdQZWcsIHBlZ0Rlc3RpdGF0aW9uSG9sZGVyIClcclxue1xyXG5cdGxldCBtb3ZpbmdQZWcgPSBwZWdIb2xkZXJPZk1vdmluZ1BlZy5maXJzdEVsZW1lbnRDaGlsZDtcclxuXHRsZXQgbW92aW5nUGVnUG9zaXRpb24gPVxyXG5cdHtcclxuXHRcdHJvd05yIFx0XHRcdDogXHROdW1iZXIoIHBlZ0hvbGRlck9mTW92aW5nUGVnLmlkLnN1YnN0cig5LDEpICkgLFxyXG5cdFx0Y29sdW1uTnJcdFx0OiBcdE51bWJlciggcGVnSG9sZGVyT2ZNb3ZpbmdQZWcuaWQuc3Vic3RyKDEwLDEpIClcclxuXHR9IDtcclxuXHJcblx0bGV0IHBlZ0Rlc3RpdGF0aW9uUG9zaXRpb24gPVxyXG5cdHtcclxuXHRcdHJvd05yIFx0XHRcdDogXHROdW1iZXIoIHBlZ0Rlc3RpdGF0aW9uSG9sZGVyLmlkLnN1YnN0cig5LDEpICkgLFxyXG5cdFx0Y29sdW1uTnJcdFx0OiBcdE51bWJlciggcGVnRGVzdGl0YXRpb25Ib2xkZXIuaWQuc3Vic3RyKDEwLDEpIClcclxuXHR9O1xyXG5cclxuXHRsZXQgcGVnTW92ZSA9IGNoZWNrQWNjZXB0YWJsZU1vdmVzKCBib2FyZCwgbW92aW5nUGVnUG9zaXRpb24gKTtcclxuXHRsZXQgZGlyZWN0aW9uID0gY2FsY3VsYXRlTW92ZURpcmVjdGlvbiggbW92aW5nUGVnUG9zaXRpb24sIHBlZ0Rlc3RpdGF0aW9uUG9zaXRpb24gKTtcclxuXHJcblx0aWYgKCAoIHBlZ01vdmUubW92ZUFsbG93ZWRbZGlyZWN0aW9uXSA9PSB0cnVlICkgJiZcclxuXHRcdCAgIG1vdmVJc05vdERpYWdvbmFsKCBkaXJlY3Rpb24sIG1vdmluZ1BlZ1Bvc2l0aW9uLCBwZWdEZXN0aXRhdGlvblBvc2l0aW9uICkgJiZcclxuXHRcdCAgIG1vdmVTdGVwSXNPbmx5QWJvdXRUd29GaWVsZHMoIGRpcmVjdGlvbiwgbW92aW5nUGVnUG9zaXRpb24sIHBlZ0Rlc3RpdGF0aW9uUG9zaXRpb24gKSApXHJcblx0e1xyXG5cdFx0YXBwbHlBY3Rpb25zRm9yQm9hcmRGaWVsZCggcGVnTW92ZS5iZWF0ZW5QZWdQb3NpdGlvbltkaXJlY3Rpb25dLCByZW1vdmVQZWdGcm9tLCBjaGFuZ2VDbGFzc0ZsYWcgKTtcclxuXHRcdGFwcGx5QWN0aW9uc0ZvckJvYXJkRmllbGQoIG1vdmluZ1BlZ1Bvc2l0aW9uLCByZW1vdmVQZWdGcm9tLCBjaGFuZ2VDbGFzc0ZsYWcgKTtcclxuXHRcdGFwcGx5QWN0aW9uc0ZvckJvYXJkRmllbGQoIHBlZ01vdmUuZGVzdGluYXRpb25QZWdQb3NpdGlvbltkaXJlY3Rpb25dLCBjcmVhdGVQZWdJbiwgY2hhbmdlQ2xhc3NGbGFnICk7XHJcblx0XHQvL3BlZ0Rlc3RpdGF0aW9uSG9sZGVyLmFwcGVuZENoaWxkKG1vdmluZ1BlZyk7XHJcblxyXG5cdFx0dXBkYXRlQm9hcmRDb21wb3NpdGlvbiggYm9hcmQsIG1vdmluZ1BlZ1Bvc2l0aW9uLCBcImVtcHR5XCIgKTtcclxuXHRcdHVwZGF0ZUJvYXJkQ29tcG9zaXRpb24oIGJvYXJkLCBwZWdNb3ZlLmJlYXRlblBlZ1Bvc2l0aW9uW2RpcmVjdGlvbl0sIFwiZW1wdHlcIiApO1xyXG5cdFx0dXBkYXRlQm9hcmRDb21wb3NpdGlvbiggYm9hcmQsIHBlZ01vdmUuZGVzdGluYXRpb25QZWdQb3NpdGlvbltkaXJlY3Rpb25dLCBcInBlZ1wiICk7XHJcblxyXG5cdFx0YWRkQmFja0J1dHRvbiggYm9hcmQgKTtcclxuXHRcdG5ld0dhbWVCdXR0b24uY2xhc3NMaXN0LmFkZChcIm5hdmlnYXRpb25fX2J1dHRvbi0tZmlyc3RcIik7XHJcblx0XHRtb3ZlQ291bnRlci5pbmNyZWFzZSgpO1xyXG5cdFx0dXBkYXRlQ291bnRlck9uU2NyZWVuKCBtb3ZlQ291bnRlci5nZXQoKSApO1xyXG5cdFx0bW92ZXNCYWNrdXAubWFrZUJhY2t1cCggbW92aW5nUGVnUG9zaXRpb24sIHBlZ01vdmUuYmVhdGVuUGVnUG9zaXRpb25bZGlyZWN0aW9uXSwgcGVnTW92ZS5kZXN0aW5hdGlvblBlZ1Bvc2l0aW9uW2RpcmVjdGlvbl0sIG1vdmVDb3VudGVyLmdldCgpICk7XHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0Qm9hcmRDb21wb3NpdGlvbiggYm9hcmQuZ2V0V2hvbGVCb2FyZCgpICk7XHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0TW92ZXNCYWNrdXAoIG1vdmVzQmFja3VwLmdldEJhY2t1cCgpICk7XHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0TW92ZUNvdW50ZXIoIG1vdmVDb3VudGVyLmdldCgpICk7XHJcblxyXG5cdFx0bG9nVG9Db25zb2xlQWxsQWxsb3dlZERlc3RpbmF0aW9ucyggYm9hcmQgKTtcclxuXHR9XHJcblx0ZWxzZVxyXG5cdHtcclxuXHRcdGRpc3BsYXlNZXNzYWdlVGhhdE1vdmVJc05vdEFsbG93ZWQoIHBlZ0Rlc3RpdGF0aW9uSG9sZGVyICk7XHJcblx0XHRhcHBseUFjdGlvbnNGb3JCb2FyZEZpZWxkKCBtb3ZpbmdQZWdQb3NpdGlvbiAsIHJlbW92ZVBlZ0Zyb20sIGNyZWF0ZVBlZ0luICk7XHJcblx0fVxyXG5cclxuXHRpZiAoIGlzR2FtZU92ZXIoIGJvYXJkICkgKVxyXG5cdHtcclxuXHRcdGxldCBhbW91bnRPZlBlZ3NMZWZ0ID0gY291bnRQZWdzTGVmdCggYm9hcmQgKTtcclxuXHRcdHNob3dHYW1lT3Zlck1lc3NhZ2VJbmNsdWRpbmdJbmZvQWJvdXQoYW1vdW50T2ZQZWdzTGVmdCk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGNoZWNrQWNjZXB0YWJsZU1vdmVzKCBjdXJyZW50Qm9hcmQsIG1vdmluZ1BlZ1Bvc2l0aW9uIClcclxue1xyXG5cdGxldCBiZWF0ZW5QZWdQb3NpdGlvbiA9XHJcbiAge1xyXG4gICAgd2VzdCA6XHJcbiAgICB7XHJcbiAgICAgIHJvd05yIFx0XHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5yb3dOciAsXHJcbiAgICAgIGNvbHVtbk5yXHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5jb2x1bW5OciAtIDFcclxuICAgIH0sXHJcblxyXG5cdFx0ZWFzdCA6XHJcbiAgICB7XHJcblx0XHRcdHJvd05yIFx0XHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5yb3dOciAsXHJcblx0XHRcdGNvbHVtbk5yXHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5jb2x1bW5OciArIDFcclxuXHRcdH0sXHJcblxyXG4gXHRcdG5vcnRoIDpcclxuICAgIHtcclxuXHRcdFx0cm93TnIgXHRcdFx0OiBcdG1vdmluZ1BlZ1Bvc2l0aW9uLnJvd05yIC0gMSAsXHJcblx0XHRcdGNvbHVtbk5yXHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5jb2x1bW5OclxyXG5cdFx0fSxcclxuXHJcblx0XHRzb3V0aCA6XHJcbiAgICB7XHJcblx0XHRcdHJvd05yIFx0XHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5yb3dOciArIDEgLFxyXG5cdFx0XHRjb2x1bW5Oclx0XHQ6IFx0bW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnJcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRsZXQgZGVzdGluYXRpb25QZWdQb3NpdGlvbiA9XHJcblx0e1xyXG5cdFx0d2VzdDpcclxuXHRcdHtcclxuXHRcdFx0cm93TnIgXHRcdFx0OiBcdG1vdmluZ1BlZ1Bvc2l0aW9uLnJvd05yICxcclxuXHRcdFx0Y29sdW1uTnJcdFx0OiBcdG1vdmluZ1BlZ1Bvc2l0aW9uLmNvbHVtbk5yIC0gMixcclxuXHRcdH0sXHJcblxyXG5cdFx0ZWFzdDpcclxuXHRcdHtcclxuXHRcdFx0cm93TnIgXHRcdFx0OiBcdG1vdmluZ1BlZ1Bvc2l0aW9uLnJvd05yICxcclxuXHRcdFx0Y29sdW1uTnJcdFx0OiBcdG1vdmluZ1BlZ1Bvc2l0aW9uLmNvbHVtbk5yICsgMixcclxuXHRcdH0sXHJcblxyXG5cdFx0bm9ydGg6XHJcblx0XHR7XHJcblx0XHRcdHJvd05yIFx0XHRcdDogXHRtb3ZpbmdQZWdQb3NpdGlvbi5yb3dOciAtIDIgLFxyXG5cdFx0XHRjb2x1bW5Oclx0XHQ6IFx0bW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnIsXHJcblx0XHR9LFxyXG5cclxuXHRcdHNvdXRoOlxyXG5cdFx0e1xyXG5cdFx0XHRyb3dOciBcdFx0XHQ6IFx0bW92aW5nUGVnUG9zaXRpb24ucm93TnIgKyAyICxcclxuXHRcdFx0Y29sdW1uTnJcdFx0OiBcdG1vdmluZ1BlZ1Bvc2l0aW9uLmNvbHVtbk5yLFxyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdGxldCBtb3ZlQWxsb3dlZCA9XHJcblx0e1xyXG5cdFx0d2VzdCBcdFx0OiBcdGZhbHNlLFxyXG5cdFx0ZWFzdCBcdFx0OiBcdGZhbHNlLFxyXG5cdFx0bm9ydGggXHQ6IFx0ZmFsc2UsXHJcblx0XHRzb3V0aCBcdDogXHRmYWxzZVxyXG5cdH07XHJcblxyXG5cdGZvciAobGV0IGtleSBpbiBtb3ZlQWxsb3dlZCApXHJcblx0e1xyXG5cdFx0aWYoIG1vdmluZ1BlZ0lzSW5BcHByb3ByaWF0ZVBvc2l0aW9uKCBrZXksIG1vdmluZ1BlZ1Bvc2l0aW9uICkgJiZcclxuXHRcdFx0bW92aW5nUGVnRXhpc3QoIGN1cnJlbnRCb2FyZCwgbW92aW5nUGVnUG9zaXRpb24gKSAmJlxyXG5cdFx0XHRwZWdUb0JlYXRFeGlzdCggY3VycmVudEJvYXJkLCBiZWF0ZW5QZWdQb3NpdGlvbltrZXldICkgJiZcclxuXHRcdFx0ZGVzdGluYXRpb25GaWVsZElzRW1wdHkoIGN1cnJlbnRCb2FyZCwgZGVzdGluYXRpb25QZWdQb3NpdGlvbltrZXldKSApXHJcblx0XHR7XHJcblx0XHRcdG1vdmVBbGxvd2VkW2tleV0gPSB0cnVlIDtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0bW92ZUFsbG93ZWRba2V5XSA9IGZhbHNlIDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiB7IG1vdmluZ1BlZ1Bvc2l0aW9uLCBiZWF0ZW5QZWdQb3NpdGlvbiwgZGVzdGluYXRpb25QZWdQb3NpdGlvbiwgbW92ZUFsbG93ZWQgfSA7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gbW92aW5nUGVnRXhpc3QoIGN1cnJlbnRCb2FyZCwgbW92aW5nUGVnUG9zaXRpb24gKVxyXG57XHJcblx0aWYgKCBjdXJyZW50Qm9hcmQuZ2V0Q3VycmVudEJvYXJkVmFsdWUoIG1vdmluZ1BlZ1Bvc2l0aW9uICkgPT0gXCJwZWdcIiApXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdGVsc2VcclxuXHR7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIHBlZ1RvQmVhdEV4aXN0KCBjdXJyZW50Qm9hcmQsIGJlYXRlblBlZ1Bvc2l0aW9uVmFsdWUgKVxyXG57XHJcblx0aWYgKCBjdXJyZW50Qm9hcmQuZ2V0Q3VycmVudEJvYXJkVmFsdWUoIGJlYXRlblBlZ1Bvc2l0aW9uVmFsdWUgKSA9PSBcInBlZ1wiIClcclxuXHR7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0ZWxzZVxyXG5cdHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gZGVzdGluYXRpb25GaWVsZElzRW1wdHkoIGN1cnJlbnRCb2FyZCwgZGVzdGluYXRpb25QZWdQb3NpdGlvblZhbHVlIClcclxue1xyXG5cdGlmICggY3VycmVudEJvYXJkLmdldEN1cnJlbnRCb2FyZFZhbHVlKCBkZXN0aW5hdGlvblBlZ1Bvc2l0aW9uVmFsdWUgKSA9PSBcImVtcHR5XCIgKVxyXG5cdHtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRlbHNlXHJcblx0e1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBtb3ZpbmdQZWdJc0luQXBwcm9wcmlhdGVQb3NpdGlvbigga2V5LCBtb3ZpbmdQZWdQb3NpdGlvbiApXHJcbntcclxuXHRpZiAoIGtleSA9PSBcIndlc3RcIiAmJiBtb3ZpbmdQZWdQb3NpdGlvbi5jb2x1bW5OciA8IDIgKVxyXG5cdHtcclxuXHRcdHJldHVybiBmYWxzZSA7XHJcblx0fVxyXG5cdGVsc2UgaWYgKCBrZXkgPT0gXCJlYXN0XCIgJiYgbW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnIgPiA0IClcclxuXHR7XHJcblx0XHRyZXR1cm4gZmFsc2UgO1xyXG5cdH1cclxuXHRlbHNlIGlmICgga2V5ID09IFwibm9ydGhcIiAmJiBtb3ZpbmdQZWdQb3NpdGlvbi5yb3dOciA8IDIgKVxyXG5cdHtcclxuXHRcdHJldHVybiBmYWxzZSA7XHJcblx0fVxyXG5cdGVsc2UgaWYgKCBrZXkgPT0gXCJzb3V0aFwiICYmIG1vdmluZ1BlZ1Bvc2l0aW9uLnJvd05yID4gNCApXHJcblx0e1xyXG5cdFx0cmV0dXJuIGZhbHNlIDtcclxuXHR9XHJcblx0ZWxzZVxyXG5cdHtcclxuXHRcdHJldHVybiB0cnVlIDtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gbW92ZUlzTm90RGlhZ29uYWwoIGtleSwgbW92aW5nUGVnUG9zaXRpb24sIGRlc3RpbmF0aW9uUGVnUG9zaXRpb24gKVxyXG57XHJcblx0aWYgKCAoIGtleSA9PSBcIndlc3RcIiB8fCBrZXkgPT0gXCJlYXN0XCIgKSAmJlxyXG5cdCAgICAgKCBtb3ZpbmdQZWdQb3NpdGlvbi5yb3dOciA9PSBkZXN0aW5hdGlvblBlZ1Bvc2l0aW9uLnJvd05yICkgKVxyXG5cdHtcclxuXHRcdHJldHVybiB0cnVlIDtcclxuXHR9XHJcblx0ZWxzZSBpZiAoICgga2V5ID09IFwibm9ydGhcIiB8fCBrZXkgPT0gXCJzb3V0aFwiICkgJiZcclxuXHQgICAgICAgICAgKCBtb3ZpbmdQZWdQb3NpdGlvbi5jb2x1bW5OciA9PSBkZXN0aW5hdGlvblBlZ1Bvc2l0aW9uLmNvbHVtbk5yICkgKVxyXG5cdHtcclxuXHRcdHJldHVybiB0cnVlIDtcclxuXHR9XHJcblx0ZWxzZVxyXG5cdHtcclxuXHRcdHJldHVybiBmYWxzZSA7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIG1vdmVTdGVwSXNPbmx5QWJvdXRUd29GaWVsZHMoIGtleSwgbW92aW5nUGVnUG9zaXRpb24sIGRlc3RpbmF0aW9uUGVnUG9zaXRpb24gKVxyXG57XHJcblx0aWYgKCAoIGtleSA9PSBcIndlc3RcIiB8fCBrZXkgPT0gXCJlYXN0XCIgKSAmJlxyXG5cdCAgICAgKCBNYXRoLmFicyggbW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnIgLSBkZXN0aW5hdGlvblBlZ1Bvc2l0aW9uLmNvbHVtbk5yICkgPT0gMiApIClcclxuXHR7XHJcblx0XHRyZXR1cm4gdHJ1ZSA7XHJcblx0fVxyXG5cdGVsc2UgaWYgKCAoIGtleSA9PSBcIm5vcnRoXCIgfHwga2V5ID09IFwic291dGhcIiApICYmXHJcblx0ICAgICAgICAgICggTWF0aC5hYnMoIG1vdmluZ1BlZ1Bvc2l0aW9uLnJvd05yIC0gZGVzdGluYXRpb25QZWdQb3NpdGlvbi5yb3dOcikgPT0gMiApICApXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRydWUgO1xyXG5cdH1cclxuXHRlbHNlXHJcblx0e1xyXG5cdFx0cmV0dXJuIGZhbHNlIDtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gY2FsY3VsYXRlTW92ZURpcmVjdGlvbiggbW92aW5nUGVnUG9zaXRpb24sIHBlZ0Rlc3RpdGF0aW9uUG9zaXRpb24gKVxyXG57XHJcblx0bGV0IG1vdmVEaXJlY3Rpb247XHJcblxyXG5cdGlmICggbW92aW5nUGVnUG9zaXRpb24ucm93TnIgLSBwZWdEZXN0aXRhdGlvblBvc2l0aW9uLnJvd05yID09IDAgKVxyXG5cdHtcclxuXHRcdGlmICggbW92aW5nUGVnUG9zaXRpb24uY29sdW1uTnIgLSBwZWdEZXN0aXRhdGlvblBvc2l0aW9uLmNvbHVtbk5yID4gMCApXHJcblx0XHR7XHJcblx0XHRcdG1vdmVEaXJlY3Rpb24gPSBcIndlc3RcIjtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0bW92ZURpcmVjdGlvbiA9IFwiZWFzdFwiO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRlbHNlXHJcblx0e1xyXG5cdFx0aWYgKCBtb3ZpbmdQZWdQb3NpdGlvbi5yb3dOciAtIHBlZ0Rlc3RpdGF0aW9uUG9zaXRpb24ucm93TnIgPiAwIClcclxuXHRcdHtcclxuXHRcdFx0bW92ZURpcmVjdGlvbiA9IFwibm9ydGhcIjtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0bW92ZURpcmVjdGlvbiA9IFwic291dGhcIjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiBtb3ZlRGlyZWN0aW9uO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZVBlZ0Zyb20oIHBlZ0hvbGRlciApXHJcbntcclxuXHR3aGlsZSggcGVnSG9sZGVyLmhhc0NoaWxkTm9kZXMoKSApXHJcblx0e1xyXG5cdFx0cGVnSG9sZGVyLnJlbW92ZUNoaWxkKCBwZWdIb2xkZXIubGFzdENoaWxkICk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGFwcGx5QWN0aW9uc0ZvckJvYXJkRmllbGQoIGJvYXJkRmllbGRQb3NpdGlvbiwgLi4uYWN0aW9ucyApXHJcbntcclxuXHRsZXQgYm9hcmRGaWVsZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBgcGVnSG9sZGVyJHtib2FyZEZpZWxkUG9zaXRpb24ucm93TnJ9JHtib2FyZEZpZWxkUG9zaXRpb24uY29sdW1uTnJ9YCApIDtcclxuXHRmb3IgKCBsZXQgYWN0aW9uIG9mIGFjdGlvbnMgKVxyXG5cdHtcclxuXHRcdGFjdGlvbiggYm9hcmRGaWVsZCApO1xyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiB1cGRhdGVCb2FyZENvbXBvc2l0aW9uKCBjdXJyZW50Qm9hcmQsIGZpZWxkUG9zaXRpb24sIHVwZGF0ZWRWYWx1ZSApXHJcbntcclxuXHRjdXJyZW50Qm9hcmQuY2hhbmdlQm9hcmRWYWx1ZSggZmllbGRQb3NpdGlvbiwgdXBkYXRlZFZhbHVlICk7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gY2hhbmdlQ2xhc3NGbGFnKCBwZWdIb2xkZXIgKVxyXG57XHJcblx0cGVnSG9sZGVyLmNsYXNzTGlzdC50b2dnbGUoIFwicGVnQm9hcmRfX3BlZ0hvbGRlci0tZW1wdHlcIiApO1xyXG5cdHBlZ0hvbGRlci5jbGFzc0xpc3QudG9nZ2xlKCBcInBlZ0JvYXJkX19wZWdIb2xkZXItLXdpdGhQZWdcIiApO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGFkZEJhY2tCdXR0b24oIGN1cnJlbnRCb2FyZCApXHJcbntcclxuXHRpZiAoIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBcImJhY2tCdXR0b25cIiApID09IG51bGwgKVxyXG5cdHtcclxuXHRcdGxldCBiYWNrQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggXCJCVVRUT05cIiApO1xyXG5cdFx0YmFja0J1dHRvbi5pZCA9IFwiYmFja0J1dHRvblwiIDtcclxuXHRcdGJhY2tCdXR0b24uY2xhc3NOYW1lID0gXCJuYXZpZ2F0aW9uX19idXR0b24gbmF2aWdhdGlvbl9fYnV0dG9uLS1sYXN0XCI7XHJcblx0XHRiYWNrQnV0dG9uLnRleHRDb250ZW50ID0gXCJCYWNrXCIgO1xyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJuYXZcIilbMF0uYXBwZW5kQ2hpbGQoIGJhY2tCdXR0b24gKTtcclxuXHJcblx0XHRiYWNrQnV0dG9uLm9uY2xpY2sgPSAoKSA9PlxyXG5cdFx0e1xyXG5cdFx0XHRtb3ZlQ291bnRlci5kZWNyZWFzZSgpO1xyXG5cdFx0XHR1cGRhdGVDb3VudGVyT25TY3JlZW4oIG1vdmVDb3VudGVyLmdldCgpICk7XHJcblx0XHRcdG1vdmVzQmFja3VwLnJlc3RvcmVCYWNrdXAoIGFwcGx5QWN0aW9uc0ZvckJvYXJkRmllbGQsIHVwZGF0ZUJvYXJkQ29tcG9zaXRpb24sIG1vdmVDb3VudGVyLmdldCgpICk7XHJcblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRCb2FyZENvbXBvc2l0aW9uKCBjdXJyZW50Qm9hcmQuZ2V0V2hvbGVCb2FyZCgpICk7XHJcblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRNb3Zlc0JhY2t1cCggbW92ZXNCYWNrdXAuZ2V0QmFja3VwKCkgKTtcclxuXHRcdFx0bG9jYWxTdG9yYWdlLnNldE1vdmVDb3VudGVyKCBtb3ZlQ291bnRlci5nZXQoKSApO1xyXG5cdFx0XHRsb2dUb0NvbnNvbGVBbGxBbGxvd2VkRGVzdGluYXRpb25zKCBjdXJyZW50Qm9hcmQgKTtcclxuXHJcblx0XHRcdGlmICggbW92ZUNvdW50ZXIuZ2V0KCkgPT0gMCApXHJcblx0XHRcdHtcclxuXHRcdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCJiYWNrQnV0dG9uXCIgKS5yZW1vdmUoKTtcclxuXHRcdFx0XHRuZXdHYW1lQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJuYXZpZ2F0aW9uX19idXR0b24tLWZpcnN0XCIpO1xyXG5cdFx0XHRcdGxvY2FsU3RvcmFnZS5jbGVhckdhbWVTdGF0ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHR9XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQ291bnRlck9uU2NyZWVuKCB2YWx1ZSApXHJcbntcclxuXHRsZXQgc2NvcmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBcIi5zY29yZVBhbmVsX19zY29yZVwiICk7XHJcblx0c2NvcmUudGV4dENvbnRlbnQgPSB2YWx1ZSA7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gZGlzcGxheU1lc3NhZ2VUaGF0TW92ZUlzTm90QWxsb3dlZCggcGVnRGVzdGl0YXRpb25Ib2xkZXIgKVxyXG57XHJcblx0ZXJyb3JNZXNzYWdlLnNob3coKTtcclxuXHRwZWdEZXN0aXRhdGlvbkhvbGRlci5jbGFzc0xpc3QuYWRkKCBcInBlZ0JvYXJkX19wZWdIb2xkZXItLW5vbkRyb3BwYWJsZVwiICkgO1xyXG5cclxuXHRzZXRUaW1lb3V0KCAoKSA9PlxyXG5cdHtcclxuXHRcdGVycm9yTWVzc2FnZS5oaWRlKCk7XHJcblx0XHRwZWdEZXN0aXRhdGlvbkhvbGRlci5jbGFzc0xpc3QucmVtb3ZlKCBcInBlZ0JvYXJkX19wZWdIb2xkZXItLW5vbkRyb3BwYWJsZVwiICkgO1xyXG5cdH0sIDIwMDApO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGlzR2FtZU92ZXIoY3VycmVudEJvYXJkKVxyXG57XHJcblx0bGV0IGdhbWVPdmVyID0gZmFsc2U7XHJcblxyXG5cdGlmICggZmluZEFsbEFsbG93ZWREZXN0aW5hdGlvbiggY3VycmVudEJvYXJkICkuc2l6ZSA9PSAwIClcclxuXHR7XHJcblx0XHRnYW1lT3ZlciA9IHRydWU7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gZ2FtZU92ZXI7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gZmluZEFsbEFsbG93ZWREZXN0aW5hdGlvbiggY3VycmVudEJvYXJkIClcclxue1xyXG5cdFx0bGV0IGFsbG93ZWREZXN0aW5hdGlvbnMgPSBuZXcgU2V0KCk7XHJcblxyXG5cdFx0Y3VycmVudEJvYXJkLmdldFdob2xlQm9hcmQoKS5mb3JFYWNoKCAoIHJvd1ZhbHVlLCByb3dOciwgcm93QXJyYXkgKSA9PlxyXG5cdFx0e1xyXG5cdFx0XHRyb3dWYWx1ZS5mb3JFYWNoKCAoIGNvbHVtblZhbHVlLCBjb2x1bW5OciwgY29sdW1uQXJyYXkgKSA9PlxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IHBlZ1Bvc2l0aW9uVG9DaGVjayA9XHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cm93TnIsXHJcblx0XHRcdFx0XHRjb2x1bW5OclxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0bGV0IHBlZ01vdmUgPSBjaGVja0FjY2VwdGFibGVNb3ZlcyggY3VycmVudEJvYXJkLCBwZWdQb3NpdGlvblRvQ2hlY2sgKTtcclxuXHJcblx0XHRcdFx0Zm9yICggbGV0IGRpcmVjdGlvbiBpbiBwZWdNb3ZlLm1vdmVBbGxvd2VkIClcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRpZiAoIHBlZ01vdmUubW92ZUFsbG93ZWRbZGlyZWN0aW9uXSA9PSB0cnVlIClcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0bGV0IHN0YXJ0UG9zaXRpb25YID0gcGVnTW92ZS5tb3ZpbmdQZWdQb3NpdGlvbi5yb3dOcjtcclxuXHRcdFx0XHRcdFx0bGV0IHN0YXJ0UG9zaXRpb25ZID0gcGVnTW92ZS5tb3ZpbmdQZWdQb3NpdGlvbi5jb2x1bW5OcjtcclxuXHRcdFx0XHRcdFx0bGV0IGVuZFBvc2l0aW9uWCA9IHBlZ01vdmUuZGVzdGluYXRpb25QZWdQb3NpdGlvbltkaXJlY3Rpb25dLnJvd05yO1xyXG5cdFx0XHRcdFx0XHRsZXQgZW5kUG9zaXRpb25ZID0gcGVnTW92ZS5kZXN0aW5hdGlvblBlZ1Bvc2l0aW9uW2RpcmVjdGlvbl0uY29sdW1uTnI7XHJcblx0XHRcdFx0XHRcdGxldCBhbGxvd2VkRGVzdGluYXRpb24gPSBgKCR7c3RhcnRQb3NpdGlvblh9LCAke3N0YXJ0UG9zaXRpb25ZfSktPigke2VuZFBvc2l0aW9uWH0sICR7ZW5kUG9zaXRpb25ZfSlgIDtcclxuXHRcdFx0XHRcdFx0YWxsb3dlZERlc3RpbmF0aW9ucy5hZGQoIGFsbG93ZWREZXN0aW5hdGlvbiApO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gYWxsb3dlZERlc3RpbmF0aW9ucyA7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gc2hvd0dhbWVPdmVyTWVzc2FnZUluY2x1ZGluZ0luZm9BYm91dChhbW91bnRPZlBlZ3NMZWZ0KVxyXG57XHJcblx0bGV0IG1lc3NhZ2U7XHJcblxyXG5cdGlmICggYW1vdW50T2ZQZWdzTGVmdCA9PSAxIClcclxuXHR7XHJcblx0XHRtZXNzYWdlID0gXCJDb25ncmF0dWxhdGlvbnMhIFlvdSd2ZSB3b24hXFxuIERvIHlvdSB3YW50IHRvIHBsYXkgYWdhaW4/XCIgO1xyXG5cdH1cclxuXHRlbHNlIG1lc3NhZ2UgPSBgR2FtZSBvdmVyISBZb3UndmUgZmFpbGVkIHRvIHdpbi4gWW91ciBzY29yZSBpczpcXG4tIGFtb3VudCBvZiBtb3ZlczogJHttb3ZlQ291bnRlci5nZXQoKX1cXG4tIGFtb3VudCBvZiBQZWdzIGxlZnQ6ICR7YW1vdW50T2ZQZWdzTGVmdH1cXG5cXG5EbyB5b3Ugd2FudCB0byBwbGF5IGFnYWluP2AgO1xyXG5cclxuXHRsZXQgbWVzc2FnZUJveCA9IGFsZXJ0V2l0aCggbWVzc2FnZSApO1xyXG5cdGFwcGx5VXNlclJlYWN0aW9uVG8oIG1lc3NhZ2VCb3ggKTtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBjb3VudFBlZ3NMZWZ0KCBjdXJyZW50Qm9hcmQgKVxyXG57XHJcblx0bGV0IGNvdW50UGVnID0gMDtcclxuXHJcblx0Y3VycmVudEJvYXJkLmdldFdob2xlQm9hcmQoKS5mb3JFYWNoKCAoIHJvd1ZhbHVlLCByb3dOciwgcm93QXJyYXkgKSA9PlxyXG5cdHtcclxuXHRcdHJvd1ZhbHVlLmZvckVhY2goICggY29sdW1uVmFsdWUsIGNvbHVtbk5yLCBjb2x1bW5BcnJheSApID0+XHJcblx0XHR7XHJcblx0XHRcdGxldCBwZWdQb3NpdGlvblRvQ2hlY2sgPVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0cm93TnIsXHJcblx0XHRcdFx0Y29sdW1uTnJcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGlmICggY3VycmVudEJvYXJkLmdldEN1cnJlbnRCb2FyZFZhbHVlKCBwZWdQb3NpdGlvblRvQ2hlY2sgKSA9PSBcInBlZ1wiKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Y291bnRQZWcrKztcclxuXHRcdFx0fVxyXG5cclxuXHRcdH0pO1xyXG5cclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIGNvdW50UGVnIDtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBlbmFibGVMb2dUb0NvbnNvbGUoKVxyXG57XHJcblx0cmV0dXJuIHRydWU7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gYWRkTmV3R2FtZUJ1dHRvbigpXHJcbntcclxuXHRsZXQgbmV3R2FtZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBcIm5ld0dhbWVCdXR0b25cIiApO1xyXG5cclxuXHRuZXdHYW1lQnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB7XHJcblx0ICBsZXQgbWVzc2FnZUJveCA9IGFsZXJ0V2l0aCggXCJEbyB5b3Ugd2FudCB0byBzdGFydCBuZXcgZ2FtZT9cIiApO1xyXG5cdCAgYXBwbHlVc2VyUmVhY3Rpb25UbyggbWVzc2FnZUJveCApO1xyXG5cdH07XHJcblxyXG5cdHJldHVybiBuZXdHYW1lQnV0dG9uO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGFsZXJ0V2l0aCggbWVzc2FnZSApXHJcbntcclxuXHRsZXQgbW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCJtb2RhbFwiICk7XHJcblx0bGV0IG1vZGFsQm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIFwiLm1vZGFsX19tZXNzYWdlXCIgKTtcclxuXHRtb2RhbEJvZHkuaW5uZXJUZXh0ID0gbWVzc2FnZSA7XHJcblx0bW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xyXG5cclxuXHRyZXR1cm4gbW9kYWw7XHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gYXBwbHlVc2VyUmVhY3Rpb25UbyggbWVzc2FnZUJveCApXHJcbntcclxuXHRsZXQgbmV3R2FtZUNvbmZpcm1hdGlvbkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBcIm1vZGFsT2tCdXR0b25cIiApO1xyXG5cdGxldCBuZXdHYW1lQ2FuY2VsYXRpb25CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCJtb2RhbENhbmNlbEJ1dHRvblwiICk7XHJcblxyXG5cdG5ld0dhbWVDb25maXJtYXRpb25CdXR0b24ub25jbGljayA9ICgpID0+IHtcclxuXHRcdGxvY2FsU3RvcmFnZS5jbGVhckdhbWVTdGF0ZSgpO1xyXG5cdFx0c3RhcnROZXdHYW1lKCkgO1xyXG5cdFx0bWVzc2FnZUJveC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblx0fTtcclxuXHJcblx0bmV3R2FtZUNhbmNlbGF0aW9uQnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB7XHJcblx0XHRtZXNzYWdlQm94LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuXHR9O1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0TmV3R2FtZSgpXHJcbntcclxuXHRpZiAoIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBcImJhY2tCdXR0b25cIiApIClcclxuXHR7XHJcblx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCJiYWNrQnV0dG9uXCIgKS5yZW1vdmUoKTtcclxuXHRcdG5ld0dhbWVCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcIm5hdmlnYXRpb25fX2J1dHRvbi0tZmlyc3RcIik7XHJcblx0fVxyXG4gIGxvY2FsU3RvcmFnZS5jbGVhckdhbWVTdGF0ZSgpO1xyXG5cdGxldCBpbml0aWFsUGVnQm9hcmQgPSBzb2xpdGFpcmVHYW1lSW5pdGlhbEJvYXJkKCBsb2NhbFN0b3JhZ2UgKTtcclxuXHRyZWRyYXdTb2xpdGFpcmVHYW1lQm9hcmQoIGluaXRpYWxQZWdCb2FyZCApO1xyXG5cdGJvYXJkID0gbmV3IEN1cnJlbnRQZWdCb2FyZENvbXBvc2l0aW9uKCBpbml0aWFsUGVnQm9hcmQgKSA7XHJcblx0bW92ZUNvdW50ZXIgPSBuZXcgTW92ZUNvdW50ZXIoIGxvY2FsU3RvcmFnZS5nZXRNb3ZlQ291bnRlcigpICk7XHJcblx0dXBkYXRlQ291bnRlck9uU2NyZWVuKCBtb3ZlQ291bnRlci5nZXQoKSApO1xyXG5cdG1vdmVzQmFja3VwID0gbmV3IEJhY2t1cCggbG9jYWxTdG9yYWdlLmdldE1vdmVzQmFja3VwKCkgLCBib2FyZCwgZW5hYmxlTG9nVG9Db25zb2xlKCkgKTtcclxuXHRsb2dUb0NvbnNvbGVBbGxBbGxvd2VkRGVzdGluYXRpb25zKCBib2FyZCApIDtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiByZWRyYXdTb2xpdGFpcmVHYW1lQm9hcmQoIGluaXRpYWxQZWdCb2FyZCApXHJcbntcclxuXHRpbml0aWFsUGVnQm9hcmQuZm9yRWFjaCggKCByb3dWYWx1ZSwgcm93TnIsIHJvd0FycmF5ICkgPT5cclxuXHR7XHJcblx0XHRyb3dWYWx1ZS5mb3JFYWNoKCAoIGNvbHVtblZhbHVlLCBjb2x1bW5OciwgY29sdW1uQXJyYXkgKSA9PlxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgcGVnSG9sZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGBwZWdIb2xkZXIke3Jvd05yfSR7Y29sdW1uTnJ9YCApO1xyXG5cclxuXHRcdFx0aWYgKCByb3dOciA9PSBNYXRoLmZsb29yKCByb3dBcnJheS5sZW5ndGgvMiApICYmIGNvbHVtbk5yID09IE1hdGguZmxvb3IoIGNvbHVtbkFycmF5Lmxlbmd0aC8yICkgKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0XHRyZW1vdmVQZWdGcm9tKCBwZWdIb2xkZXIgKTtcclxuXHRcdFx0XHRcdHBlZ0hvbGRlci5jbGFzc0xpc3QucmVtb3ZlKCBcInBlZ0JvYXJkX19wZWdIb2xkZXItLXdpdGhQZWdcIiApO1xyXG5cdFx0XHRcdFx0cGVnSG9sZGVyLmNsYXNzTGlzdC5hZGQoIFwicGVnQm9hcmRfX3BlZ0hvbGRlci0tZW1wdHlcIiApO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKCBjb2x1bW5WYWx1ZSA9PSBcInBlZ1wiIClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdFx0cmVtb3ZlUGVnRnJvbSggcGVnSG9sZGVyICk7XHJcblx0XHRcdFx0XHRjcmVhdGVQZWdJbiggcGVnSG9sZGVyICk7XHJcblx0XHRcdFx0XHRwZWdIb2xkZXIuY2xhc3NMaXN0LnJlbW92ZSggXCJwZWdCb2FyZF9fcGVnSG9sZGVyLS1lbXB0eVwiICk7XHJcblx0XHRcdFx0XHRwZWdIb2xkZXIuY2xhc3NMaXN0LmFkZCggXCJwZWdCb2FyZF9fcGVnSG9sZGVyLS13aXRoUGVnXCIgKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH0pO1xyXG5cclxuXHR9KTtcclxuXHJcbn1cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gbG9nVG9Db25zb2xlQWxsQWxsb3dlZERlc3RpbmF0aW9ucyggY3VycmVudEJvYXJkIClcclxue1xyXG5cdFx0bGV0IGFsbG93ZWREZXN0aW5hdGlvbnMgPSBcIlwiIDtcclxuXHRcdGZvciAoIGxldCB2YWx1ZSBvZiBmaW5kQWxsQWxsb3dlZERlc3RpbmF0aW9uKGN1cnJlbnRCb2FyZCkudmFsdWVzKCkgKVxyXG5cdFx0e1xyXG5cdFx0XHRhbGxvd2VkRGVzdGluYXRpb25zICs9IGAke3ZhbHVlfSwgYCA7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGNvbnNvbGUubG9nKCBgQWxsb3dlZCBkZXN0aW5hdGlvbnM6ICR7YWxsb3dlZERlc3RpbmF0aW9uc31cclxuXHRcdFx0XHRcdEFsbG93ZWQgZGVzdGluYXRpb25zOiAke2ZpbmRBbGxBbGxvd2VkRGVzdGluYXRpb24oY3VycmVudEJvYXJkKS5zaXplfWApO1xyXG59XHJcbiJdfQ==
