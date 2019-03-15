/* ソースコードの表示と実行
中にあるHTMLのソースコードの実行結果をそのコードを同時に表示します。
あのサンプルページを動かすために作りました。

使い方：
<html-code>表示したいHTMLコード</html-code>
*/

class HTMLCode extends HTMLElement
{
	public static Init( tagname = 'html-code' ) { if ( customElements.get( tagname ) ) { return; }　customElements.define( tagname, this ); }

	private code: HTMLElement;

	constructor()
	{
		super();

		const shadow = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.innerHTML = [
			':host { display: block; width: 100%; height: fit-content; margin: 0.5rem 0; }',
			':host > div { width: 100%; display: flex; justify-content: space-between; }',
			':host > div > * { width: 49%; margin: 0; padding: 0.5em; box-sizing: border-box; border-radius: 0.5rem; border: 1px solid gray; }',
			'pre { margin: 0; overflow: auto; }',
		].join( '' );

		const contents = document.createElement( 'div' );

		// 実行結果を置いておく場所
		const view = document.createElement( 'div' );
		// このタグ内にあるタグをそのまま持ってきて表示する。
		const slot = document.createElement( 'slot' );
		view.appendChild( slot );

		// ソースを置いておく場所
		const source = document.createElement( 'div' );
		const pre = document.createElement( 'pre' );
		this.code = document.createElement( 'code' );
		pre.append( this.code );
		source.appendChild( pre );

		// コードを読み込む
		this.updateCode();

		// change属性が設定されている場合、changeイベントの監視を行う。
		if ( this.hasAttribute( 'change' ) && this.children[ 0 ] )
		{
			this.children[ 0 ].addEventListener( 'change', ( event ) => { console.log( event ); } );
		}

		contents.appendChild( view );
		contents.appendChild( source );

		shadow.appendChild( style );
		shadow.appendChild( contents );
	}

	public updateCode()
	{
		// 設定されているコンテンツをそのままコードとして使います。
		// innerHTMLをtextContentに入れることで、タグなどを無効化するブラウザ任せの実装です。
		// ただし、<my-tag flag></my-tag> が <my-tag flag=""></my-tag> になってしまうのでそこだけ修正します。
		this.code.textContent = this.innerHTML.replace( /\=\"\"/g, '' );
	}
}

( ( script ) =>
{
	if ( document.readyState !== 'loading' ) { return HTMLCode.Init( script.dataset.tagname ); }
	document.addEventListener( 'DOMContentLoaded', () => { HTMLCode.Init( script.dataset.tagname ); } );
} )( <HTMLScriptElement>document.currentScript );
