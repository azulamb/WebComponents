interface HexMapElement extends HTMLElement
{
}

( ( script, init ) =>
{
	if ( document.readyState !== 'loading' ) { return init( script ); }
	document.addEventListener( 'DOMContentLoaded', () => { init( script ); } );
} )( <HTMLScriptElement>document.currentScript, ( script: HTMLScriptElement ) =>
{
	( ( component, tagname = 'hex-map' ) =>
	{
		if ( customElements.get( tagname ) ) { return; }
		customElements.define( tagname, component );
	})( class extends HTMLElement
	{
		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { --size: 100px; display: block; width: fit-content; height: fit-content; }',
				':host > div { width: 100%; height: 100%; overflow: auto; }',
				'::slotted( hex-line:nth-child( even ) ) { margin-left: calc( var( --size ) / 2 ); }',
				'::slotted( hex-line:not( :last-child ) ){ margin-bottom: calc(var(--size)*-0.2); }',
			].join( '' );

			const contents = document.createElement( 'div' );
			contents.appendChild( document.createElement( 'slot' ) );

			shadow.appendChild( style );
			shadow.appendChild( contents );
		}
	}, script.dataset.tagname );
} );
