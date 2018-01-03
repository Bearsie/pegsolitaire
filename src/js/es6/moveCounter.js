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
