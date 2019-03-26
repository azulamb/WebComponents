/*
*/

class MorseCode extends HTMLElement
{
	public static Init( tagname = 'morse-code' )
	{
		if ( customElements.get( tagname ) ) { return; }

		this.AddTable( 'en', { S: '000', s: '000', O: '111', o: '111' } );

		customElements.define( tagname, this );
	}

	private static Table: { [ keys: string ]: { [ keys: string ]: string } } = {};

	public static AddTable( lang: string, table: { [ keys: string ]: string } )
	{
		this.Table[ lang ] = table;
	}

	private contents: HTMLElement;

	constructor()
	{
		super();

		const shadow = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.innerHTML =
		[
			':host { display: inline-block; }',
		].join( '' );

		this.contents = document.createElement( 'div' );

		shadow.appendChild( style );
		shadow.appendChild( this.contents );

		const observer = new MutationObserver( ( mutations ) => { this.update(); } );
		observer.observe( this, { childList: true } );

		this.update();
	}

	private convert( code: string, s: string, l: string )
	{
		return code.replace( /0/g, s ).replace( /1/g, l );
	}

	public update()
	{
		const lang = this.getAttribute( 'lang' ) || 'en';
		const table = MorseCode.Table[ lang ];
		if ( !table ) { this.contents.innerHTML = ''; return; }
		const strings = Array.from( this.textContent || '' );

		const s = this.getAttribute( 'short' ) || '・';
		const l = this.getAttribute( 'long' ) || '－';
		this.contents.textContent = strings.map( ( char ) => { return this.convert( table[ char ] || '', s, l ); } ).join( '' );
	}

	static get observedAttributes() { return [ 'lang', 'short', 'long' ]; }

	public attributeChangedCallback( attrName: string, oldVal: any , newVal: any )
	{
		if ( oldVal === newVal ) { return; }

		this.update();
	}
}

( ( script, wc ) =>
{
	if ( document.readyState !== 'loading' ) { return wc.Init( script.dataset.tagname ); }
	document.addEventListener( 'DOMContentLoaded', () => { wc.Init( script.dataset.tagname ); } );
} )( <HTMLScriptElement>document.currentScript, MorseCode );
