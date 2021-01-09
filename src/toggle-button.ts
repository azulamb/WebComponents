/* */

interface ToggleButtonElement extends HTMLElement
{
	toggle(): ToggleButtonElement;
	checked: boolean;
}

( ( script, init ) =>
{
	if ( document.readyState !== 'loading' ) { return init( script ); }
	document.addEventListener( 'DOMContentLoaded', () => { init( script ); } );
} )( <HTMLScriptElement>document.currentScript, ( script: HTMLScriptElement ) =>
{
	( ( component, tagname = 'toggle-button' ) =>
	{
		if ( customElements.get( tagname ) ) { return; }
		customElements.define( tagname, component );
	} )( class extends HTMLElement implements ToggleButtonElement
	{
		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { --height: 1.5rem; --border: calc( var( --height ) / 10 ); --back: #8a8a8a; --front: #8a8a8a; --unchecked: #eaeaea; --checked: #66ff95; --cursor: pointer; --duration: 0.2s; --timing-function: ease-in-out; --delay: 0s; display: inline-block; width: calc( var( --height ) * 1.6 ); }',
				':host > div { --radius: calc( var( --height ) / 2 ); width: 100%; height: var( --height ); position: relative; box-sizing: border-box; }',
				':host > div > div { background: var( --back ); width: 100%; height: 100%; position: absolute; top: 0; left: 0; border-radius: var( --radius ); display: flex; justify-content: center; align-items: center; cursor: var( --cursor ); }',
				':host > div > div::before { content: ""; display: block; background: var( --unchecked ); width: calc( 100% - var( --border ) * 2 ); height: calc( 100% - var( --border ) * 2 ); border-radius: calc( var( --radius ) * 0.8 ); transition: background var( --duration ) var( --timing-function ) var( --delay ); }',
				':host > div > div::after { content: ""; display: block; width: var( --height ); height: var( --height ); border-radius: 50%; background: var( --front ); position: absolute; left: 0; transition: left var( --duration ) var( --timing-function ) var( --delay ); }',
				':host( [ checked ] ) > div > div::before { background: var( --checked ); }',
				':host( [ checked ] ) > div > div::after { left: calc( 100% - var( --height ) ); }',
			].join( '' );

			const button = document.createElement( 'div' );
			button.addEventListener( 'click', () => { this.toggle(); } );

			const contents = document.createElement( 'div' );
			contents.appendChild( button );

			shadow.appendChild( style );
			shadow.appendChild( contents );
		}

		public toggle()
		{
			this.checked = !this.checked;
			return this;
		}

		get checked() { return this.hasAttribute( 'checked' ); }
		set checked( value )
		{
			const changed = !value === this.checked;
			if ( !changed ) { return; }
			value ? this.setAttribute( 'checked', 'checked' ) : this.removeAttribute( 'checked' );
			this.dispatchEvent( new CustomEvent( 'change' ) );
		}

		static get observedAttributes() { return [ 'checked' ]; }

		attributeChangedCallback( name: string, oldValue: any, newValue: any )
		{
			this.checked = !!newValue;
		}
	}, script.dataset.tagname );
} );
