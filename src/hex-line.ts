interface HexLineElement extends HTMLElement
{
}

( ( script, init ) =>
{
	if ( document.readyState !== 'loading' ) { return init( script ); }
	document.addEventListener( 'DOMContentLoaded', () => { init( script ); } );
} )( <HTMLScriptElement>document.currentScript, ( script: HTMLScriptElement ) =>
{
	class HexLine extends HTMLElement implements HexLineElement
	{
		public static Init( tagname = 'hex-line' )
		{
			if ( customElements.get( tagname ) ) { return; }
			customElements.define( tagname, this );
		}

		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { --size: 100px; display: block; width: fit-content; height: fit-content; }',
				':host > div { display: flex; width: 100%; height: 100%; overflow: auto; }',
				'::slotted( hex-chip ) { width: var( --size ); }',
			].join( '' );

			const contents = document.createElement( 'div' );
			contents.appendChild( document.createElement( 'slot' ) );

			shadow.appendChild( style );
			shadow.appendChild( contents );
		}
	}

	HexLine.Init( script.dataset.tagname );
} );
