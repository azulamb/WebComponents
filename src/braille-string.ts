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

interface BrailleStringElement extends HTMLElement{}

interface AddBrailleString { ( lang: string, table: { [ keys: string ]: string } ): void; }

( ( script, init ) =>
{
	if ( document.readyState !== 'loading' ) { return init( script ); }
	document.addEventListener( 'DOMContentLoaded', () => { init( script ); } );
} )( <HTMLScriptElement>document.currentScript, ( script: HTMLScriptElement ) =>
{
	const Table: { [ keys: string ]: { [ keys: string ]: number } } = {};

	function AddTable( lang: string, table: { [ keys: string ]: number } )
	{
		// TODO: merge.
		Table[ lang ] = table;
	}

	AddTable( 'en', {} );

	(<any>window)[ script.dataset.addfunc || 'AddBrailleString' ] = AddTable;

	( ( component, tagname = 'braille-string' ) =>
	{
		if ( customElements.get( tagname ) ) { return; }
		customElements.define( tagname, component );
	})( class BrailleString extends HTMLElement implements BrailleStringElement
	{
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
			const table = Table[ lang ];
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
	}, script.dataset.tagname );
} );
