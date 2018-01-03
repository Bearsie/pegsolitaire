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
