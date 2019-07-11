/* ゲームの盤面
ゲームの盤面を表示します。
主にマスを等間隔に並べて、色つけなどをできるようにします。
またこのクラスを継承して別の盤面も作れるような配慮もしておきます。

使い方：
<shogi-board></shogi-board>
<shogi-board width="WIDTH" height="HEIGHT" style="--border:BORDER;">
	<CHILD /> ...
</shogi-board>
* WIDTH
    * 盤の横のマスの数です。
* HEIGHT
    * 盤の縦のマスの数です。
* BORDER
    * 線の色です。
* CHILD
    * 子要素は駒として扱います。
const element = new GameBoard();
* element.width: number
    * 盤の横のマスの数です。
    * 代入すると横のマスの数をその数にします。
* element.height: number
    * 盤の縦のマスの数です。
    * 代入すると縦のマスの数をその数にします。
* element.select( x: number, y: number, ... colors: string[] )
    * 指定した座標のマスに色を塗ります。色は盤面に設定された色名になります。
	* 複数指定すると複数の指定を追加しますが、指定がない場合はデフォルトになります。
* element.deselect( x: number, y: number, ... colors: string[] )
    * 指定した座標のマスの色を消します。色は盤面に設定された色名になります。
	* 複数指定すると複数の指定を追加しますが、指定がない場合はそのマスの色をすべて消します。

*/

interface GameBoardElement extends HTMLElement
{
	width: number;
	height: number;
}

( ( script, init ) =>
{
	if ( document.readyState !== 'loading' ) { return init( script ); }
	document.addEventListener( 'DOMContentLoaded', () => { init( script ); } );
} )( <HTMLScriptElement>document.currentScript, ( script: HTMLScriptElement ) =>
{
	( ( component, tagname = 'game-board' ) =>
	{
		if ( customElements.get( tagname ) ) { return; }
		customElements.define( tagname, component );
	})( class extends HTMLElement implements GameBoardElement
	{
		// 盤面用のスタイル。
		// 今回は書き換えの必要性があるので分離しておきます。
		private boardStyle: HTMLStyleElement;
		// 盤面のマスを格納。
		protected board: HTMLDivElement;
		// 色の名前と初期値
		protected colors: { name: string, var: string, color: string }[] = [ { name: 'on', var: 'select', color: 'rgba(137, 157, 255, 0.5)' } ];
		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			// 書き換えが必要なスタイルを用意しておきます。
			this.boardStyle = document.createElement( 'style' );
			// マス目を置くのに必要なので予め用意しておきます。
			this.board = document.createElement( 'div' );
			this.board.classList.add( 'board' );

			// 盤面のサイズなど初期設定を行います。
			this.initBoard();

			// 全体的で書き換えが発生しないスタイルを設定します。
			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { display: block; overflow: hidden; width: 100%; height: fit-content; --border-color: var( --border, black ); }',
				// 正方形を作る有名な方法があります。
				// 横幅が決まっている時、paddingの上下に%指定で値を設定すると、横幅に対する割合が使われます。
				// 横幅100%に対し、padding-top: 100%;は、高さ100%と同じ領域を持つことになります。
				':host > div.main { width: 100%; padding: 100% 0 0; position: relative; overflow: hidden; }',
				// 上と下に追加コンテンツを入れておける領域を用意しておきます。
				':host > div.top, :host > div.bottom { position: relative; width: 100%; height: fit-content; }',
				':host > div.top {}',
				':host > div.bottom {}',
				// 直下のコンテンツは全部同じスタイルにしておきます。
				':host > div > div { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }',
				// 盤面の変わらない設定です。
				// 盤面全体を囲む線があります。
				'div.board { display: grid; box-sizing: border-box; border: 1px solid var( --border-color ); }',
				// マスのスタイルです。
				'div.board > div { width: 100%; height: 100%; border-right: 1px solid var( --border-color ); border-bottom: 1px solid var( --border-color ); }',
				// <slot>で入れるコンテンツの設定です。
				// ::slotted( セレクタ ) でslotが置き換わった後の要素に対してスタイルを設定できます。
				// ただし今回は名前指定のないもののみの指定を行います。
				'::slotted( :not( [slot] ) ) { position: absolute; transition: top 0.5s, left 0.5s; }',
				// <slot>には名前をつけることができ、名前がある場合はそこに配置されます。
				'::slotted( [slot] ) { display: inline-block; }',
			].join( '' );

			// マス目を追加します。
			this.updateBoard();

			// 駒は子要素として入れる予定なので、それを入れるスペースを作る。
			const contents = document.createElement( 'div' );
			contents.classList.add( 'contents' );
			contents.appendChild( document.createElement( 'slot' ) );

			// 盤面の要素
			const main = document.createElement( 'div' );
			main.classList.add( 'main' );
			main.appendChild( this.board );
			main.appendChild( contents );

			// 上と下の要素
			const top = document.createElement( 'div' );
			top.classList.add( 'top' );
			const topslot = document.createElement( 'slot' );
			topslot.name = 'top';
			top.appendChild( topslot );

			const bottom = document.createElement( 'div' );
			bottom.classList.add( 'bottom' );
			const bottomslot = document.createElement( 'slot' );
			bottomslot.name = 'bottom';
			bottom.appendChild( bottomslot );

			shadow.appendChild( style );
			shadow.appendChild( this.boardStyle );
			shadow.appendChild( top );
			shadow.appendChild( main );
			shadow.appendChild( bottom );
		}

		// 盤面の初期設定を行います。
		// 今後のことを考え、分離しておきます。
		protected initBoard()
		{
			// 盤面のサイズが指定されていない場合、8x8になるようにします。（8x8は適当）
			if ( !this.hasAttribute( 'width' ) ) { this.width = 8; }
			if ( !this.hasAttribute( 'height' ) ) { this.height = 8; }

			// 色は1色用意しておきます。
			this.colors = [ { name: 'on', var: 'select', color: 'rgba(137, 157, 255, 0.5)' } ];
		}

		private updateBoard()
		{
			// グリッドレイアウトを採用するので、盤面に応じてスタイルを書き換えます。
			// グリッドレイアウトのメリットはきっちりかっちりマス目を表現できることで、デメリットは記述の柔軟性が皆無なところですね。

			const width = this.width;
			const height = this.height;
			const styles: string[] = [];

			styles.push(
				// 縦横の比率に合わせて盤全体の高さを決めます。
				// 縦横同じなら高さは横幅100%に対して100%となり、横10に対し縦5の場合は50%になります。
				':host > div.main { padding: calc( 100% * ' + height + ' / ' + width + ' ) 0 0; }',
				'div.board { ' +
				// 横に何マスあるかの指定です。width分の長さの配列を作って全部均等に分割するような記述にします。
				'grid-template-columns: ' + Array( width ).fill( '1fr' ).join( ' ' ) + '; '+
				// 縦に何マスあるかの指定です。上に同じくheightの数だけ 1fr を追加します。
				'grid-template-rows: '+ Array( height ).fill( '1fr' ).join( ' ' ) + ';' +
				' }',
				// 駒の大きさを指定しておきます。
				'::slotted( :not[ slot ] ) { width: calc( 100% / ' + width + ' ); height: calc( 100% / ' + height + ' ); }'
			);

			// マスが選択状態の時の設定です。
			this.colors.forEach( ( color ) =>
			{
				styles.push( 'div.board > div.' + color.name + ' { background-color: var( ' + color.var + ', ' + color.color + ' ); }' );
			} );

			// マス目を配置します。
			// 面倒なので今持っているマスは全部破棄して、全て新しく作り直します。
			for ( let i = this.board.children.length - 1 ; 0 <= i ; --i ) { this.board.removeChild( this.board.children[ i ] ); }
			for ( let y = 1 ; y <= height ; ++y )
			{
				for ( let x = 1 ; x <= width; ++x )
				{
					const box = document.createElement( 'div' );
					// data-position="x[X座標]y[Y座標]" という値を設定し、見れるようにしておきます。
					// 同時に、これが位置の指定にもなります。
					// ちなみに座標は(1,1)から始まります。理由はボードゲームではあまり0からマスを数えないからです。
					const position = 'x' + x + 'y' + y;
					box.dataset.position = position;

					// 盤面にマスを追加します。
					this.board.appendChild( box );

					// スタイルに表示座標を追加します。
					this.addPieceStyle( styles, position, x, y );
				}
			}

			this.boardStyle.innerHTML = styles.join( '' );
		}

		protected addPieceStyle( styles: string[], position: string, x: number, y: number )
		{
			styles.push(
				'div.board > [ data-position = "' + position + '" ] {' +
				'grid-column: ' + x + '/' + ( x + 1 ) +';grid-row: ' + y + '/' + ( y + 1 ) + ';' +
				'}',
				'::slotted( [ data-position = "' + position + '" ] ) { left: calc( ( 100% ' + ' * ' +
				( x - 1 ) + ' ) / ' + this.width + ' ); top: calc( 100% ' + ' * ' + ( y - 1 ) + ' / ' + this.height + ' ); }'
			);
		}

		// 指定座標のマスを選択状態にします。
		// 座標は1から始まることとします。
		public select( x: number, y: number, ...colors: string[] )
		{
			// 色指定がない場合はデフォルトで色を入れておきます。
			if ( colors.length <= 0 ) { colors.push( this.colors[ 0 ].name ); }

			const box = this.board.querySelector( '[ data-position = "x' + x + 'y' + y + '" ]' );

			// 指定座標が見つかりませんでした。
			if ( !box ) { return false; }

			// 指定座標が見つかったので選択状態にします。
			colors.forEach( ( color ) => { box.classList.add( color ); } );
			return true;
		}

		// 指定座標のマスの選択状態を解除します。ただし座標を指定しない場合はすべて解除します。
		public deselect( x?: number, y?: number, ...colors: string[] )
		{
			// 色指定がない場合は指定可能な色すべてを指定しておきます。
			if ( colors.length <= 0 ) { colors = this.colors.map( ( color ) => { return color.name; } ); }

			if ( x === undefined && y === undefined )
			{
				// すべての選択を解除します。
				let count = 0;
				const children = this.board.children;
				for ( let i = children.length - 1 ; 0 <= i ; --i )
				{
					const box = children[ i ];
					// 選択状態でない場合はスキップします。
					if ( !box.classList.contains( 'on' ) ) { continue; }
					// 選択解除とともに、カウントアップします。
					colors.forEach( ( color ) => { box.classList.remove( color ); } );
					++count;
				}
				return count;
			}

			const box = this.board.querySelector( '[ data-position = "x' + x + 'y' + y + '" ]' );

			// 指定座標が見つかりませんでした。
			if ( !box ) { return 0; }

			// 指定座標が見つかったので選択解除します。
			colors.forEach( ( color ) => { box.classList.remove( color ); } );

			return 1;
		}

		private convertPositiveNumber( value: number|string )
		{
			if ( typeof value !== 'number' )
			{
				// とりあえず数値に直します。
				value = parseInt( value );
			}

			// とりあえず数が多くても困るので、1以上40以下の値域にすることにします。

			// もし40より大きいなら40にする。
			if ( 40 < value ) { return 40; }

			// 1以上なら40以下確定なのでそのまま返す。
			if ( 1 <= value ) { return value; }

			// それ以外は1を返します。
			return 1;
		}

		// widthプロパティの追加。
		// これはこのボードの横のマスの設定になります。
		get width() { return this.convertPositiveNumber( this.getAttribute( 'width' ) || '' ); }
		set width( value ) { this.setAttribute( 'width', this.convertPositiveNumber( value ) + '' ); }

		// width属性が変化した場合の対応。
		private onUpdateWidth( value: string|number )
		{
			// 値チェック
			if ( this.width !== ( typeof value === 'number' ? value : parseInt( value ) ) )
			{
				this.width = <number>value;
				this.updateBoard();
				return;
			}
		}

		// heightプロパティの追加。
		// これはこのボードの横のマスの設定になります。
		get height() { return this.convertPositiveNumber( this.getAttribute( 'height' ) || '' ); }
		set height( value ) { this.setAttribute( 'height', this.convertPositiveNumber( value ) + '' ); }

		// height属性が変化した場合の対応。
		private onUpdateHeight( value: string|number )
		{
			// 値チェック
			if ( this.height !== ( typeof value === 'number' ? value : parseInt( value ) ) )
			{
				this.height = <number>value;
				this.updateBoard();
				return;
			}
		}

		static get observedAttributes() { return [ 'width', 'height' ]; }

		public attributeChangedCallback( attrName: string, oldVal: any , newVal: any )
		{
			// 更新がない場合は何もしないことにします。
			if ( oldVal === newVal ) { return; }

			switch ( attrName )
			{
				case 'width': this.onUpdateWidth( newVal ); break;
				case 'height': this.onUpdateHeight( newVal ); break;
			}
		}
	}, script.dataset.tagname );
} );
