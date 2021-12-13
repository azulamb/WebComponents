interface EmojiElement extends HTMLElement
{
	value: string;
}

( ( script, init ) =>
{
	const id = script.dataset.tagname || 'e-moji';
	if ( customElements.get( id ) ) { return; }
	if ( !document.getElementById( id ) )
	{
		const style = document.createElement( 'style' );
		style.textContent = `@font-face { font-family: "Emoji"; src: url( ${ script.dataset.emoji || 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/fonts/NotoColorEmoji.ttf' } ); }@font-face { font-family: "Blank"; src: url( ${ script.dataset.blank || 'https://raw.githubusercontent.com/adobe-fonts/adobe-blank/master/AdobeBlank.ttf' } ); }`;
		style.id = id;
		document.head.appendChild( style );
	}
	if ( document.readyState !== 'loading' ) { return init( script ); }
	document.addEventListener( 'DOMContentLoaded', () => { init( script ); } );
} )( <HTMLScriptElement>document.currentScript, ( script: HTMLScriptElement ) =>
{
	( ( component, tagname = 'e-moji' ) =>
	{
		if ( customElements.get( tagname ) ) { return; }
		customElements.define( tagname, component );
	} )( class extends HTMLElement implements EmojiElement
	{
		private text: SVGTextElement;

		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { display: inline-block; --size: 1rem; }',
				':host > div { font-family: Emoji, Blank; width: var( --size ); height: var( --size ); }',
				':host > div > svg { width: 100%; height: 100%; display: block; }',
			].join( '' );

			this.text = document.createElementNS( 'http://www.w3.org/2000/svg', 'text' );
			this.text.setAttribute( 'x', '0' );
			this.text.setAttribute( 'y', '50%' );
			this.text.style.fontSize = '16px';
			this.text.setAttribute( 'dominant-baseline', 'central' );

			const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
			svg.setAttributeNS( null, 'width', '20' );
			svg.setAttributeNS( null, 'height', '20' );
			svg.setAttributeNS( null, 'viewBox', '0 0 20 20' );
			svg.appendChild( this.text );

			const contents = document.createElement( 'div' );
			contents.appendChild( svg );

			this.update();

			shadow.appendChild( style );
			shadow.appendChild( contents );
		}

		get value() { return this.getAttribute( 'value' ) || ''; }
		set value( value ) { this.setAttribute( 'value', value ); }

		static get observedAttributes() { return [ 'value' ]; }

		public attributeChangedCallback( attrName: string, oldVal: any , newVal: any )
		{
			if ( oldVal === newVal ) { return; }
			if ( typeof newVal === 'string' )
			{
				newVal = [ ... newVal ][ 0 ] || '';
			}
			this.value = newVal;
			this.update();
		}

		private update()
		{
			this.text.textContent = this.value;
		}
	}, script.dataset.tagname );
} );
