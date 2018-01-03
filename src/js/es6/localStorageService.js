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
