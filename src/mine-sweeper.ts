
class MineSweeper extends HTMLElement
{
	private static Block = 'mine-block';
	private boardStyle: HTMLStyleElement;
	private width: HTMLInputElement;
	private height: HTMLInputElement;
	private bombs: HTMLInputElement;
	private board: HTMLElement;

	public static Init( tagname = 'mine-sweeper', block = MineSweeper.Block )
	{
		// 内部で使うブロックを先に定義します。
		MineSweeper.Block = block;
		MineBlock.Init( block );
		// 定義済みになるまで待った後定義します。
		customElements.whenDefined( block ).then( () => { customElements.define( tagname, this ); } );
	}

	constructor()
	{
		super();

		const shadow = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.innerHTML = [
			':host { display: block; width: 100%; height: fit-content; --mine-flag: "🚩"; }',
			'input { width: 4em; }',
			// プレイ中は設定に触れないようにします。
			':host( [ play ] ) > header > input { pointer-events: none; }',
			':host > div { display: grid; }',
		].join( '' );

		this.boardStyle = document.createElement( 'style' );

		const width = parseInt( this.getAttribute( 'width' ) || '' );
		const height = parseInt( this.getAttribute( 'height' ) || '' );
		const bombs = parseInt( this.getAttribute( 'bombs' ) || '' );

		shadow.appendChild( style );
		shadow.appendChild( this.boardStyle );
		shadow.appendChild( this.initHeader( 0 < width ? width : 9, 0 < height ? height : 9, 0 < bombs ? bombs : 0 ) );
		shadow.appendChild( this.initBoard() );

		this.reset();
	}

	private initHeader( width: number, height: number, bombs: number )
	{
		// ヘッダー部分です。
		const header = document.createElement( 'header' );

		// 要素を生成する一時的な関数を作っておきます。
		function createNumInput( value: number )
		{
			const input = document.createElement( 'input' );
			input.type = 'number';
			input.value = value + '';
			return input;
		}
		function createTextElement( text: string )
		{
			const span = document.createElement( 'span' );
			span.textContent = text;
			return span;
		}

		// 爆弾の数の初期化をします。
		if ( bombs <= 0 ) { bombs = this.calcBombs( width, height ); }

		// 盤面サイズなどの設定を行います。プレイ中これらに触れることはできません。
		// また、盤面の情報などはここに入っている情報を元に生成することにします。
		this.width = createNumInput( width );
		this.height = createNumInput( height );
		this.bombs = createNumInput( bombs );

		// 内容を追加していきます。
		header.appendChild( createTextElement( 'Size:' ) );
		header.appendChild( this.width );
		header.appendChild( createTextElement( 'x' ) );
		header.appendChild( this.height );
		header.appendChild( createTextElement( '💣' ) );
		header.appendChild( this.bombs );

		return header;
	}

	private initBoard()
	{
		// 盤面です。
		this.board = document.createElement( 'div' );

		return this.board;
	}

	private calcBombs( width: number, height: number )
	{
		const bombs = Math.floor( width * height * 0.3 );
		return bombs <= 0 ? 1 : bombs;
	}

	private createBlock( x: number, y: number )
	{
		const block: MineBlock = new ( customElements.get( MineSweeper.Block ) )( x, y );
		block.addEventListener( 'open', ( event: MineEvent & Event ) => { this.open( event.x, event.y ); } );
		block.addEventListener( 'flag', ( event: MineEvent & Event ) => { this.flag( event.x, event.y ); } );
		return block;
	}

	private updateBoard()
	{
		const width = parseInt( this.width.value );
		const height = parseInt( this.height.value );

		// 今あるブロックを全て削除します。
		for ( let i = this.board.children.length - 1 ; 0 <= i ; --i )
		{
			this.board.removeChild( this.board.children[ i ] );
		}

		const styles: string[] = [
			'div.board { ' +
			'grid-template-columns: ' + Array( width ).fill( '1fr' ).join( ' ' ) + '; '+
			'grid-template-rows: '+ Array( height ).fill( '1fr' ).join( ' ' ) + ';' +
			' }',
		];

		const blocks: MineBlock[] = [];
		for ( let y = 1 ; y <= height ; ++y )
		{
			for ( let x = 1 ; x <= width ; ++x )
			{
				const block = this.createBlock( x, y );
				blocks.push( block );
				this.board.appendChild( block );
			}
		}

		this.boardStyle.innerHTML = styles.join( '' );
	}

	public reset()
	{
		this.removeAttribute( 'play' );

		this.updateBoard();
	}

	public play( x: number, y: number )
	{

		// ボムをセットします。

		this.setAttribute( 'play', '' );
	}

	public open( x: number, y: number )
	{
		if ( !this.hasAttribute( 'play' ) )
		{
			this.play( x, y );
		}
	}

	public flag( x: number, y: number )
	{
		
	}
}

interface MineEvent
{
	x: number,
	y: number,
}

class MineBlock extends HTMLElement
{
	public static LONGTIME = 500;
	public static Init( tagname = 'mine-block' ) { customElements.define( tagname, this ); }
	private x: number;
	private y: number;
	private bomb: boolean;

	constructor( x: number, y: number )
	{
		super();

		this.bomb = false;
		this.x = x;
		this.y = y;

		this.style.gridColumn = x + '/' + ( x + 1 );
		this.style.gridRow = y + '/' + ( y + 1 );

		const shadow = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.innerHTML = [
			':host { display: block; width: 100%; height: fit-content; --m-flag: var( --mine-flag, "🚩" ); }',
			':host > div { display: block; width: 100%; padding-top: 100%; position: relative; box-sizing: border-box; overflow: hidden; }',
			':host > div > button { display: block; cursor: pointer; width: 100%; height: 100%; position: absolute; top: 0; left: 0; }',
			':host([ flag ]) button:before { content: var( --m-flag ); }',
			':host([ open ]) > div > button { display: none; }',
		].join( '' );

		const block = document.createElement( 'button' );
		let timer: number = 0;
		// クリックとタップどちらにも対応するため、以下のようにします。
		// * クリック/タップで開く。
		// * 右クリック/ロングタップで旗を立てる。

		block.addEventListener( 'mousedown', ( event ) =>
		{
			// 右クリックされたら旗を立てます。
			if ( event.button === 2 ) { clearTimeout( timer ); timer = 0; return this.flag(); }
			// そうじゃない場合はタイマーを仕掛けます。
			// 一定時間経ったら旗を立てます。
			timer = setTimeout( () => { timer = 0; this.flag(); }, MineBlock.LONGTIME );
		} );

		block.addEventListener( 'mouseup', ( event ) =>
		{
			event.preventDefault();

			// すでに旗を立てていた場合には何もしません。
			if ( timer === 0 ) { return; }
			// 旗を立てない場合は開きます。
			this.open();
			// 旗を立てるタイマーを解除します。
			clearTimeout( timer );
			timer = 0;
		} );

		// 右クリック時に出てくるメニューを無効化します。
		block.addEventListener( 'contextmenu', ( event ) => { event.preventDefault(); } );

		const panel = document.createElement( 'div' );
		panel.appendChild( block );

		shadow.appendChild( style );
		shadow.appendChild( panel );
	}

	public getX() { return this.x; }

	public getY() { return this.y; }

	public setBomb() { this.bomb = true; }

	public isBomb() { return this.bomb; }

	public open()
	{
		this.setAttribute( 'open', '' );
		const event = new CustomEvent<MineEvent>( 'open', { detail: { x: this.x, y: this.y } } );
		this.dispatchEvent( event );
	}

	public flag()
	{
		if ( this.hasAttribute( 'flag' ) )
		{
			// 旗を立てている場合は下ろします。
			this.removeAttribute( 'flag' );
		} else
		{
			// 旗を立てていない場合は立てます。
			this.setAttribute( 'flag', '' );
		}
		const event = new CustomEvent<MineEvent>( 'flag', { detail: { x: this.x, y: this.y } } );
		this.dispatchEvent( event );
	}
}

( ( script ) =>
{
	if ( document.readyState !== 'loading' ) { return MineSweeper.Init( script.dataset.tagname, script.dataset.blockname ); }
	document.addEventListener( 'DOMContentLoaded', () => { MineSweeper.Init( script.dataset.tagname, script.dataset.blockname ); } );
} )( <HTMLScriptElement>document.currentScript );
