/* */

interface ModalDialogElement extends HTMLElement
{
	nobackclose: boolean;
	noclosebutton: boolean;
	show(): void;
	close(): void;
}

( ( script, init ) =>
{
	if ( document.readyState !== 'loading' ) { return init( script ); }
	document.addEventListener( 'DOMContentLoaded', () => { init( script ); } );
} )( <HTMLScriptElement>document.currentScript, ( script: HTMLScriptElement ) =>
{
	( ( component, tagname = 'modal-dialog' ) =>
	{
		if ( customElements.get( tagname ) ) { return; }
		customElements.define( tagname, component );
	} )( class extends HTMLElement implements ModalDialogElement
	{
		public onclose: () => boolean;
		private bodyOverflow = '';

		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { --dialog-back: #e3e4f1; --close-symbol: "×"; --close-back: var( --dialog-back ); --button-size: 2em; --offset-button: calc( var( --button-size ) * -0.5 ); --max-width: 100%; --max-height: 100%; --padding: 2em; z-index: 10000; background:rgba( 0, 0, 0, 0.8 ); position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden; opacity: 1; box-sizing: border-box; padding: var( --padding ); display: block; }',
				':host( :not( [ show ] ) ) { opacity: 0; pointer-events: none; }',
				':host > div { display: grid; justify-content: center; align-items: center; grid-template-columns: 100%; grid-template-rows: 100%; width: 100%; height: 100%; }',
				':host > div > div { max-width: var( --max-width ); max-height: var( --max-height ); position: relative; }',
				':host > div > div > div { border-radius: 0.2em; background: var( --dialog-back ); max-height: calc( 100vh - var( --padding ) * 2 ); padding: 0.5em; box-sizing: border-box; overflow: auto; }',
				':host button { position: absolute; display: block; right: var( --offset-button ); top: var( --offset-button ); border-radius: 50%; width: var( --button-size ); height: var( --button-size ); border: 0; outline: 0; box-sizing: border-box; text-align: center; padding: 0; cursor: pointer; font-weight: bold; font-family: monospace; }',
				':host button::before { content:var( --close-symbol ); display: inline; }',
				':host( [ nobutton ] ) > div > button { display: none; }',
			].join( '' );

			const dialogcontents = document.createElement( 'div' );
			dialogcontents.appendChild( document.createElement( 'slot' ) );

			const close = document.createElement( 'button' );

			const dialog = document.createElement( 'div' );
			dialog.appendChild( dialogcontents );
			dialog.appendChild( close );

			const contents = document.createElement( 'div' );
			contents.appendChild( dialog );

			shadow.appendChild( style );
			shadow.appendChild( contents );

			( ( stopevent ) =>
			{
				this.addEventListener( 'wheel', stopevent );
				this.addEventListener( 'contextmenu', stopevent );
				contents.addEventListener( 'wheel', stopevent );
				contents.addEventListener( 'contextmenu', stopevent );
				contents.addEventListener( 'click', stopevent );
			} )( ( event: MouseEvent ) => { event.stopPropagation(); event.preventDefault(); } );

			( ( stopevent ) =>
			{
				dialogcontents.addEventListener( 'wheel', stopevent );
				dialogcontents.addEventListener( 'contextmenu', stopevent );
				dialogcontents.addEventListener( 'click', stopevent );
			} )( ( event: MouseEvent ) => { event.stopPropagation(); } );

			( ( onClose ) =>
			{
				this.addEventListener( 'click', onClose );
				close.addEventListener( 'click', onClose );
			} ) ( ( event: MouseEvent ) =>
			{
				event.stopPropagation();
				if ( event.target === this && this.nobackclose ) { return; }
				if ( this.onclose && !this.onclose() ) { return; }
				this.close();
			} );

			this.bodyOverflow = document.body.style.overflowY;

			if ( this.hasAttribute( 'show' ) )
			{
				this.show();
			}
		}

		get nobackclose() { return this.hasAttribute( 'nobackclose' ); }
		set nobackclose( value )
		{
			value ? this.setAttribute( 'nobackclose', 'nobackclose' ) : this.removeAttribute( 'nobackclose' );
		}

		get noclosebutton() { return this.hasAttribute( 'noclosebutton' ); }
		set noclosebutton( value )
		{
			value ? this.setAttribute( 'noclosebutton', 'noclosebutton' ) : this.removeAttribute( 'nobackclose' );
		}

		public show()
		{
			this.setAttribute( 'show', '' );
			this.bodyOverflow = document.body.style.overflowY;
			document.body.style.overflowY = 'hidden';
			return this;
		}

		public close()
		{
			this.removeAttribute( 'show' );
			document.body.style.overflowY = this.bodyOverflow;
			return this;
		}
	}, script.dataset.tagname );
} );
