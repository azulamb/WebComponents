/*
*/

class DLButton extends HTMLElement
{
	public static Init( tagname = 'dl-button' ) { if ( customElements.get( tagname ) ) { return; } customElements.define( tagname, this ); }

	private button: HTMLAnchorElement;
	constructor()
	{
		super();

		const shadow = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.innerHTML =
		[
			':host { display: inline-block; cursor: pointer; border-radius: 0.2rem; border: 1px solid gray; overflow: hidden; }',
			':host > div { position: relative; width: 100%; height: 100%; box-sizing: border-box; padding: 0.4em 1.2em; display: flex; flex-direction: column; justify-content: center; align-items: center; }',
			':host > div > a { display: block; text-decoration: none; border: 0; position: absolute; top: 0; left: 0; width: 100%; height: 100%; }',
			':host( :empty ) > div:before { content: "Download"; display: inline; }',
			':host( [ disable ] ) {  }',
			':host( [ disable ] ) > div > a { display: none; }',
		].join( '' );

		this.button = document.createElement( 'a' );
		this.setDLAttribute( 'download' );
		this.setDLAttribute( 'src', 'href' );

		const contents = document.createElement( 'div' );
		contents.appendChild( document.createElement( 'slot' ) );
		contents.appendChild( this.button );

		shadow.appendChild( style );
		shadow.appendChild( contents );
	}

	private setDLAttribute( key: string, write?: string )
	{
		if ( !write ) { write = key; }
		const value = this.getAttribute( key ) || '';
		if ( this.button.getAttribute( write ) === value ) { return; }
		this.button.setAttribute( write, value );
	}

	static get observedAttributes() { return [ 'download', 'src' ]; }

	public attributeChangedCallback( attrName: string, oldVal: any , newVal: any )
	{
		if ( oldVal === newVal ) { return; }

		switch ( attrName )
		{
			case 'download': return this.setDLAttribute( 'download' );
			case 'src': return this.setDLAttribute( 'src', 'href' );
		}
	}
}

( ( script, wc ) =>
{
	if ( document.readyState !== 'loading' ) { return wc.Init( script.dataset.tagname ); }
	document.addEventListener( 'DOMContentLoaded', () => { wc.Init( script.dataset.tagname ); } );
} )( <HTMLScriptElement>document.currentScript, DLButton );
