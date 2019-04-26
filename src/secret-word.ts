/*
*/

interface SecretWordElement extends HTMLElement { open(): void }

( ( script, wc ) =>
{
	if ( document.readyState !== 'loading' ) { return wc.Init( script.dataset.tagname ); }
	document.addEventListener( 'DOMContentLoaded', () => { wc.Init( script.dataset.tagname ); } );
} )( <HTMLScriptElement>document.currentScript, class extends HTMLElement implements SecretWordElement
{
	public static Init( tagname = 'secret-word' ) { if ( customElements.get( tagname ) ) { return; } customElements.define( tagname, this ); }

	private button: HTMLAnchorElement;
	constructor()
	{
		super();

		const shadow = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.innerHTML =
		[
			':host { --text: "Secret"; display: inline-block; border: 1px solid gray; border-radius: 0.2em; padding: 0 0.5em; margin: 0 0.5em; }',
			':host > a { cursor: pointer; text-decoration: none; }',
			':host > a::before { content: var( --text ); }',
			':host > div { display: none; position: relative; overflow: none; }',
			':host( [ show ] ) > a { display: none; }',
			':host( [ show ] ) > div { display: inline-block; }',
		].join( '' );

		if ( !this.hasAttribute( 'title' ) ) { this.setAttribute( 'title', 'Secret' ); }

		const link = document.createElement( 'a' );
		link.addEventListener( 'click', () => { this.open(); } );

		const contents = document.createElement( 'div' );
		contents.appendChild( document.createElement( 'slot' ) );

		shadow.appendChild( style );
		shadow.appendChild( link );
		shadow.appendChild( contents );
	}

	public open()
	{
		this.setAttribute( 'show', '' );
		this.dispatchEvent( new Event( 'open' ) );
	}
} );
