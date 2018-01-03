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
