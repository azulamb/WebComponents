/* 将棋の盤面
GameBoardを継承して、将棋の盤面を表示します。
そのため、game-board.jsより後に読み込むようにしておきましょう。
また、今回はrating-starsとは異なり、ShogiPieceありきで実装していきます。

*/

document.addEventListener( 'DOMContentLoaded', () => { ShogiBoard.Init(); } );

class ShogiBoard extends GameBoard
{
	public static Init( tagname = 'shogi-board' ) { customElements.define( tagname, this ); }

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

	// 将棋の駒を配置します。
	// 使い方は setPiece( X座標, Y座標, 駒(ShogiPiece) ) か setPiece( X座標, Y座標, 駒名(string) ) です。 
	// X座標とY座標は1から始まることを想定します。（将棋詳しくないけど12歩みたいな感じで読み上げてた気がする。）
	public setPiece( x:number, y: number, piece: ShogiPiece|string, enemy?: boolean, reverse?: boolean )
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
		piece.dataset.position = 'x' + ( x - 1 ) + 'y' + ( y - 1);

		// 将棋盤に駒を置きます。
		this.appendChild( piece );
	}
}
