if ( "serviceWorker" in navigator )
{
		navigator.serviceWorker
			.register( "./service-worker.js", { scope: "./"} )
			.then( registration => {
					console.log("Service Worker has been registred", registration);
			})
			.catch( error => {
					console.log("Service Worker has failed to register", error);
			});
}
