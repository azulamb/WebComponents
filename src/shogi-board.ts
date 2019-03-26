/* 将棋の盤面
GameBoardを継承して、将棋の盤面を表示します。
そのため、game-board.jsより後に読み込むようにしておきましょう。
また、今回はrating-starsとは異なり、ShogiPieceありきで実装していきます。（めんどうなので。）

使い方：
<game-board>に入っている機能は省略します。
<shogi-board></shogi-board>
<shogi-board>
	<shogi-piece></shogi-piece> ...
</shogi-board>
const element = new ShogiBoard();
* element.setPiece( x: number, y: number, piece: ShogiPiece | string, enemy?: boolean, reverse?: boolean )
    * 指定座標に<shogi-piece>を設置します。
	* 第3引数が文字列の場合はその駒に応じた<shogi-piece>を作成します。
	* 第4,5引数を指定した場合、更にその設定に上書きを行います。
* fing( x: number, y: number ): ShogiPiece | null
    * 指定座標の駒を返します。存在しない場合はnullを返します。
* move( x: number, y: number, mx: number, my: number ): ShogiPiece | null
    * (x,y)にある駒を(mx,my)に移動します。
	* 駒が存在しない場合はnullを返します。
*/

// TODO:!!!!!!!!!!!!!!!!!
/*
　987654321
一
二
三
四
五
六
七
八
九
*/

class ShogiBoard extends GameBoard
{
	public static Init( tagname = 'shogi-board' )
	{
		if ( customElements.get( tagname ) ) { return; }
		customElements.define( tagname, this );
	}

	// 今回constructor()は省略します。
	// 初期化でいじりたい部分はinitBoard()に集約しているので、オーバーライドして最小の労力で将棋の盤面を作ります。

	// 盤面の初期設定を行います。
	protected initBoard()
	{
		// 盤面のサイズが指定されていない場合、8x8になるようにします。（8x8は適当）
		if ( !this.hasAttribute( 'width' ) ) { this.width = 9; }
		if ( !this.hasAttribute( 'height' ) ) { this.height = 9; }

		// 色は1色用意しておきます。
		this.colors = [ { name: 'on', var: 'select', color: 'rgba(137, 157, 255, 0.5)' } ];
	}

	protected addPieceStyle( styles: string[], position: string, x: number, y: number )
	{
		styles.push(
			'div.board > [ data-position = "' + position + '" ] {' +
			'grid-column: -' + x + '/-' + ( x + 1 ) +';grid-row: -' + y + '/-' + ( y + 1 ) + ';' +
			'}',
			'::slotted( [ data-position = "' + position + '" ] ) { left: calc( ( 100% ' + ' * ' +
			( this.width - x ) + ' ) / ' + this.width + ' ); top: calc( 100% ' + ' * ' + ( y - 1 ) + ' / ' + this.height + ' ); }'
		);
	}

	// 将棋の駒を配置します。
	// 使い方は setPiece( X座標, Y座標, 駒(ShogiPiece) ) か setPiece( X座標, Y座標, 駒名(string) ) です。 
	// X座標とY座標は1から始まることを想定します。（将棋詳しくないけど12歩みたいな感じで読み上げてた気がする。）
	public setPiece( x: number, y: number, piece: ShogiPiece | string, enemy?: boolean, reverse?: boolean )
	{
		if ( typeof piece === 'string' )
		{
			// 将棋の駒を文字列で指定されているので、その駒を作る。
			const name = piece;
			piece = new ShogiPiece();
			piece.piece = name;
		}
		// ここに来た時点でpieceは必ずShogiPieceになっています。

		// オプションの設定を行います。
		if ( enemy !== undefined ) { piece.enemy = !!enemy; }
		if ( piece !== undefined ) { piece.reverse = !!reverse; }

		// 駒を配置します。
		piece.dataset.position = 'x' + x + 'y' + y;

		// 将棋盤に駒を置きます。
		this.appendChild( piece );
	}

	// 将棋の駒を探します。
	public find( x: number, y: number )
	{
		const element = this.querySelector( '[ data-position="x' + Math.floor( x ) + 'y' + Math.floor( y ) + '" ]' );
		if ( !element || element.tagName !== 'shogi-piece' ) { return null; }
		return <ShogiBoard>element;
	}

	// 駒を移動します。
	// 成ることができるよう、移動に成功した場合は駒を返します。
	public move( x: number, y: number, mx: number, my: number )
	{
		x = Math.floor( x );
		y = Math.floor( y );
		const piece = this.find( x, y );
		if ( !piece ) { return null; }

		mx = Math.floor( mx );
		my = Math.floor( my );
		piece.dataset.position = 'x' + mx + 'y' + my;

		return piece;
	}

	// 駒を取ります。
	// 指定座標にある駒を対象の手持ちに加えます。
	public capture( x: number, y: number, enemy: boolean )
	{
		this.querySelectorAll( '[ data-position="x' + Math.floor( x ) + 'y' + Math.floor( y ) + '" ]' ).forEach( ( piece: ShogiPiece ) =>
		{
			// 自分の味方は取りません。
			if ( piece.enemy === enemy ) { return; }
			// 敵は取って持ち駒にします。
			piece.enemy = enemy;
			piece.dataset.position = '';
			piece.slot = enemy ? 'top' : 'bottom';
		} );
	}
}

( ( script, wc ) =>
{
	if ( document.readyState !== 'loading' ) { return wc.Init( script.dataset.tagname ); }
	document.addEventListener( 'DOMContentLoaded', () => { wc.Init( script.dataset.tagname ); } );
} )( <HTMLScriptElement>document.currentScript, ShogiBoard );
