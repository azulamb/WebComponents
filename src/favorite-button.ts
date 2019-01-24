/* お気に入りボタン
☆をクリックすると★になって、更にクリックすると☆に戻ります。
そんな、単純なボタン。

使い方：
<favorite-button></favorite-button>
<favorite-button on style="--color:COLOR"></favorite-button>
* on
    * お気に入りにしている状態を表す属性で、存在しているとオンになります。
* COLOR
    * 文字色を指定できます。
const element = new FavoriteButton();
* element.addeventListener( 'change', ( this: FavoriteButton, event: Event ) => any );
    * 変更時に発生するイベントです。
*/

// カスタムタグの登録を行います。
document.addEventListener( 'DOMContentLoaded', () => { FavoriteButton.Init(); } );

class FavoriteButton extends HTMLElement
{
	// タグの登録やその前後になにかする必要がある場合に行う処理。
	public static Init( tagname = 'favorite-button' )
	{
		// このタグを登録する処理を書いておきます。
		// 本来は以下のように書きます。
		//customElements.define( tagname, FavoriteButton );
		// このようにクラス内のstaticな場所に記述しておくと、thisで済むのでコピペができて大変楽です。
		customElements.define( tagname, this );
	}

	constructor()
	{
		// このsuperの呼び出しは必須です。
		super();

		// ShadowDOMを取得します。
		// これはこのタグの中身であり、ここに要素を追加することでこのタグのコンテンツを描画できます。
		const shadow = this.attachShadow( { mode: 'open' } );

		// <style>を作って、ShadowDOMに追加することにします。
		// CSSは例外を除き独立していて、このタグの内外で影響しません。
		// 例えば大本のWebページで文字サイズを30pxにしていたとしても、ここではブラウザデフォルトのスタイルに戻っています。
		const style = document.createElement( 'style' );
		// スタイルは今回文字配列を結合して、innerHTMLに代入する力技で対応します。
		// コメントも書きやすいしね！！
		style.innerHTML = [
			// :host はこのタグそのものを指す擬似クラスです。
			':host { display: inline-block; cursor: pointer; }',
			// :host はこのタグそのものなので、:host > div はこのタグの中身直下の<div>を指します。
			// また、内外で影響しない例外の1つが、CSSカスタムプロパティを用いたスタイルフックです。
			// これを使って、<my-tag style="--color:red;"></my-tag>などの表記で外部からスタイルの設定を行うことが可能です。
			':host > div { color: var( --color, orange ); }',
			// オンオフの状態によって、コンテンツの中身を書き換えます。
			':host > div::before { content: "☆"; }',
			// このタグに属性がついていたときにオンの状態にします。
			// <my-tag></my-tag>ではオフで、<my-tag on></my-tag>の時にオンになります。
			// :host( XXX ) は、タグがXXXの時に有効になります。例えば :host( .on ) は <my-tag class="on"></my-tag> の時を指します。
			':host( [ on ] ) > div::before { content: "★"; }',
		].join( '' );

		// 実際の★が入る要素を作ります。
		const div = document.createElement( 'div' );
		// クリックされた時に、属性の付替えを行います。
		div.addEventListener( 'click', () =>
		{
			// onという属性が付いていなければ付けて、付いている場合は外します。
			this.toggleAttribute( 'on' );
			// changeイベントを登録している場合に、そのイベントを発生させます。
			// 特に入れる値もないのでこれで良しとします。
			// 値の取得などは、event.targetがこのタグ自身になっているので、そこ経由で利用してもらいます。
			this.dispatchEvent( new Event( 'change' ) );
		} );

		// ShadowDOMに<style>と<div>を追加します。
		shadow.appendChild( style );
		shadow.appendChild( div );

		// これにより、このタグは以下のようになります。
		/*
		<my-tag>
			#shadow-root
				<style>:host ... 省略 ... </style>
				<div></div>
		</my-tag>
		*/
	}
}
