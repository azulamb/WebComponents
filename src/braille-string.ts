/* 点字
①④
②⑤
③⑥
00654321

・　
・　
　・
00100011 => 35

①④ AD
②⑤ BE
③⑥ CF
0000FEDC BA654321
*/

class BrailleString extends HTMLElement
{
	public static Init( tagname = 'braille-string' )
	{
		if ( customElements.get( tagname ) ) { return; }

		this.AddTable( 'en', {} );

		customElements.define( tagname, this );
	}

	private static Table: { [ keys: string ]: { [ keys: string ]: number } } = {};

	public static AddTable( lang: string, table: { [ keys: string ]: number } )
	{
		this.Table[ lang ] = table;
	}

	private contents: HTMLElement;

	constructor()
	{
		super();

		const shadow = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.innerHTML = [
			':host { display: inline-block; }',
		].join( '' );

		this.contents = document.createElement( 'div' );

		shadow.appendChild( style );
		shadow.appendChild( this.contents );

		const observer = new MutationObserver( ( mutations ) => { this.update(); } );
		observer.observe( this, { childList: true } );

		this.update();
	}

	private numToBraille( bnum: number )
	{
		const str: string[] = [];
		do
		{
			const b = bnum & 0x1F;
			str.push( String.fromCodePoint( b + 0x2800 ) );
			bnum >>= 6;
		} while( 0 < bnum );

		return str.join( '' );
	}

	public update()
	{
		const lang = this.getAttribute( 'lang' ) || 'en';
		const table = BrailleString.Table[ lang ];
		if ( !table ) { this.contents.innerHTML = ''; return; }
		const strings = Array.from( this.textContent || '' );

		this.contents.textContent = strings.map( ( char ) => { return this.numToBraille( table[ char ] || 0 ); } ).join( '' );
	}

	static get observedAttributes() { return [ 'lang' ]; }

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
} )( <HTMLScriptElement>document.currentScript, BrailleString );
