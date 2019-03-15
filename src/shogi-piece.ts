/* 将棋の駒
将棋の駒を表示します。
何もしなければ空ですが、役職や敵味方、成ってるかどうかの指定を入れることで、いい感じに中身が将棋の駒になってくれます。

使い方：
<shogi-piece></shogi-piece>
<shogi-piece piece="PIECE" reverse emeny style="--size: SIZE;"></shogi-piece>
* PIECE
    * 将棋の駒を指定します。英語表記はWikipediaを参照しました。
        * 玉 もしくは king   もしくは k ... 玉。ただしenemy属性がある場合は王になります。
        * 飛 もしくは rook   もしくは r ... 飛。ただしreverse属性がある場合は竜になります。
        * 角 もしくは bishop もしくは b ... 角。ただしreverse属性がある場合は馬になります。
        * 金 もしくは gold   もしくは g ... 金。
        * 銀 もしくは silver もしくは s ... 銀。ただしreverse属性がある場合は全になります。
        * 桂 もしくは knight もしくは n ... 桂。ただしreverse属性がある場合は圭になります。
        * 香 もしくは lance  もしくは l ... 香。ただしreverse属性がある場合は仝になります。
        * 歩 もしくは pawn   もしくは p ... 歩。ただしreverse属性がある場合はとになります。
* reverse
    * 成るフラグで、この属性が存在すると一部の駒は成った状態になります。
* enemy
    * 敵フラグで、この属性が存在すると上下反転のほか、玉は王になります。
* SIZE
    * 駒の大きさです。デフォルトは2remです。
*/

class ShogiPiece extends HTMLElement
{
	public static Init( tagname = 'shogi-piece' ) { customElements.define( tagname, this ); }

	public static Pieces: { print: string, enemy?: string, reverse?: string, names: string[] }[] =
	[
		{ print: '玉', enemy: '王', names: [ 'king', 'k', '玉' ] },
		{ print: '飛', reverse: '竜', names: [ 'rook', 'r', '飛' ] },
		{ print: '角', reverse: '馬', names: [ 'bishop', 'b', '角' ] },
		{ print: '金', names: [ 'gold', 'g', '金' ] },
		{ print: '銀', reverse: '全', names: [ 'silver', 's', '銀' ] },
		{ print: '桂', reverse: '圭', names: [ 'knight', 'n', '桂' ] },
		{ print: '香', reverse: '仝', names: [ 'lance', 'l', '香' ] },
		{ print: '歩', reverse: 'と', names: [ 'pawn', 'p', '歩' ] },
	];

	constructor()
	{
		super();

		const shadow = this.attachShadow( { mode: 'open' } );

		// 今回は以下のような構造にします。
		/*
		<div>
			<::before>駒の外枠</::before>
			外部から与えられた駒の中身
			<::after>駒の中身(ちゃんと指定しないと空)</::after>
		</div>
		*/
		// この3つの要素を重ねて表現します。
		const styles = [
			':host { display: block; --shogi-size: var( --size, 2rem ); width: var( --shogi-size ); height: var( --shogi-size ); line-height: var( --shogi-size ); }',
			':host > div { position: relative; text-align: center; font-size: var( --shogi-size ); width: 100%; height: 100%; font-size: calc( var( --shogi-size ) / 2 ); }',
			// 基本となる将棋の駒の設定です。
			':host > div::before, :host > div::after { display: block; width: 1em; height: 1em; line-height: 1em; text-align: center; position: absolute; top: 0; bottom: 0; left: 0; right: 0; margin: auto; }',
			// 駒の枠です。
			':host > div::before { content: "☖"; font-size: var( --shogi-size ); }',
			// 指定された規定の駒のスタイルです。
			':host > div::after { font-size: calc( var( --shogi-size ) / 2 ); }',
			// 敵側だったときは180度回転します。
			':host( [ enemy ] ) > div { transform: rotate( 180deg ); }',
		];

		// stylesに各駒のスタイルを追加していきます。
		ShogiPiece.Pieces.forEach( ( data ) =>
		{
			// 通常の駒
			styles.push(
				data.names.map( ( name ) => { return ':host( [ piece = "' + name + '" ] ) > div::after' } ).join( ',' ) +
				' { content: "' + data.print + '"; }'
			);

			// 敵側にいるときだけ特殊な駒の処理
			if ( data.enemy )
			{
				styles.push(
					data.names.map( ( name ) => { return ':host( [ piece = "' + name + '" ][ enemy ] ) > div::after' } ).join( ',' ) +
					' { content: "' + data.enemy + '"; }'
				);
			}

			// 成った時の駒の処理
			if ( data.reverse )
			{
				styles.push(
					data.names.map( ( name ) => { return ':host( [ piece = "' + name + '" ][ reverse ] ) > div::after' } ).join( ',' ) +
					' { content: "' + data.reverse + '"; }'
				);
			}
		} );

		const style = document.createElement( 'style' );
		style.innerHTML = styles.join( '' );

		const div = document.createElement( 'div' );
		// <slot> とは子要素の代入先を指定するタグです。
		// <slot>が以下のように使われていたとします。
		/*
		<div>
			<slot></slot>
		</div>
		*/
		// 例えば以下のように子要素を追加したとします。
		/*
		<my-tag>
			<div>test1</div>
			<div>test2</div>
		</my-tag>
		*/
		// この時、あたかも以下のような内部構造に成ったかのように振る舞います。
		/*
		<div>
			<div>test1</div>
			<div>test2</div>
		</div>
		*/
		// あくまで振る舞いがこうなるだけです。<slot>内は外界扱いなので、スタイルも影響を受けています。
		// また子要素はthis.childrenで参照したり、<my-tag>に対してappendChildできるので、普通の囲みタグの実装が可能です。
		div.appendChild( document.createElement( 'slot' ) );

		shadow.appendChild( style );
		shadow.appendChild( div );
	}

	// プロパティを作ります。
	// const piece = element.place; で駒名を取得できます。
	// 内容的にはpiece属性を読み込んでいるだけです。
	get piece() { return this.getAttribute( 'piece' ) || ''; }
	// element.piece = 'king'; で駒を玉にできます。
	// 内容的にはpiece属性に代入した文字列を設定しているだけです。
	set piece( value ) { this.setAttribute( 'piece', value ); }

	// enemyはemeny属性がある場合はtrue、ない場合はfalseを返します。
	get enemy() { return this.hasAttribute( 'enemy' ); }
	// 設定する場合は、それがtrueになるかどうかで追加と削除の適切な方を行います。
	set enemy( value )
	{
		if ( value )
		{
			// 追加します。
			this.setAttribute( 'enemy', 'true' );
		} else
		{
			// 削除します。
			this.removeAttribute( 'enemy' );
		}
	}

	// reverseはenemyと同じ挙動です。
	get reverse() { return this.hasAttribute( 'reverse' ); }
	// 設定する場合は、それがtrueになるかどうかで追加と削除の適切な方を行います。
	set reverse( value )
	{
		if ( value )
		{
			// 追加します。
			this.setAttribute( 'reverse', 'true' );
		} else
		{
			// 削除します。
			this.removeAttribute( 'reverse' );
		}
	}
}

( ( script ) =>
{
	if ( document.readyState !== 'loading' ) { return ShogiPiece.Init( script.dataset.tagname ); }
	document.addEventListener( 'DOMContentLoaded', () => { ShogiPiece.Init( script.dataset.tagname ); } );
} )( <HTMLScriptElement>document.currentScript );
