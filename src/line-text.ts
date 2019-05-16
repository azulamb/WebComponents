/* */

interface LineTextElement extends HTMLElement
{
}

( ( script, init ) =>
{
	if ( document.readyState !== 'loading' ) { return init( script ); }
	document.addEventListener( 'DOMContentLoaded', () => { init( script ); } );
} )( <HTMLScriptElement>document.currentScript, ( script: HTMLScriptElement ) =>
{
	class LineText extends HTMLElement implements LineTextElement
	{
		public static Init( tagname = 'line-text' )
		{
			if ( customElements.get( tagname ) ) { return; }
			customElements.define( tagname, this );
		}

		private str: HTMLElement;
		private svg: SVGElement;
		private text: SVGTextElement;

		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { display: block; --color: black; }',
				':host > div { position: relative; overflow: hidden; }',
				':host > div > svg { max-width: 100%; }',
				':host > div > span { visibility: hidden; position: absolute; white-space: nowrap; }',
			].join( '' );

			this.str = document.createElement( 'span' );
			this.str.appendChild( document.createElement( 'slot' ) );

			this.text = document.createElementNS( 'http://www.w3.org/2000/svg', 'text' );
			this.text.setAttribute( 'x', '0' );
			this.text.setAttribute( 'y', '0' );
			this.text.setAttribute( 'dominant-baseline', 'text-before-edge' );
			this.text.setAttribute( 'fill', 'var( --color )' );
			this.svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
			this.svg.setAttributeNS( null, 'preserveAspectRatio', 'none' );
			this.svg.appendChild( this.text );

			const contents = document.createElement( 'div' );
			contents.appendChild( this.str );
			contents.appendChild( this.svg );

			shadow.appendChild( style );
			shadow.appendChild( contents );

			const observer = new MutationObserver( ( records ) => { this.update(); } );
			observer.observe( this, { characterData: true } );

			this.update();
		}

		private update()
		{
			this.text.textContent = this.textContent;

			const width = this.str.offsetWidth;
			const height = this.str.offsetHeight;

			this.svg.setAttributeNS( null, 'width', width + 'px' );
			this.svg.setAttributeNS( null, 'height', height + 'px' );
			this.svg.setAttributeNS( null, 'viewBox', '0 0 ' + width + ' ' + height );
		}

		static get observedAttributes() { return [ 'style' ]; }

		public attributeChangedCallback( attrName: string, oldVal: any , newVal: any )
		{
			if ( oldVal === newVal ) { return; }
			this.update();
		}
	}

	LineText.Init( script.dataset.tagname );
} );
