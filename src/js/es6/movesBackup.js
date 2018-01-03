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
