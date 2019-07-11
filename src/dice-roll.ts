/* ダイスロール
指定した目を出す（省略時は1）のと、クリックした後ダイスを回します。

使い方：
<dice-roll></dice-roll>
<dice-roll dice="DICE" style="--size: SIZE;"></dice-roll>
* DICE
    * ダイスの目を設定できます。1～6以外の値を入れた場合は1になります。
* SIZE
    * 駒の大きさです。デフォルトは2remです。
const element = new DiceRoll();
* element.dice: number
    * 現在のダイスの目を1～6の数値で返します。
    * 値を代入するとダイスの目を設定できます。
        * TypeScript上は数値のみですが文字列を与えても適当に変換して、不正な値はすべて1になります。
＊ element.roll(): boolean
    * ダイスロールを開始します。
    * すでにダイスロールされている場合、falseが返されます。
* element.stop(): boolean
    * ダイスロールを停止します。
    * すでに停止している場合、falseが返されます。
* element.addeventListener( 'change', ( this: FavoriteButton, event: Event ) => any );
    * 変更時に発生するイベントです。

ダイスの目は以下のような流れで設定され、通知されます。
element.dice = 2;
↓
element.setAttribute( 'dice', '2' );
↓
attributeChangedCallback()で監視しているので呼び出される
↓
changeイベントの発生
*/

interface DiceRollElement extends HTMLElement
{
	roll(): boolean;
	stop(): boolean;
	min: number;
	max: number;
	dice: number;
}

( ( script, init ) =>
{
	if ( document.readyState !== 'loading' ) { return init( script ); }
	document.addEventListener( 'DOMContentLoaded', () => { init( script ); } );
} )( <HTMLScriptElement>document.currentScript, ( script: HTMLScriptElement ) =>
{
	( ( component, tagname = 'dice-roll' ) =>
	{
		if ( customElements.get( tagname ) ) { return; }
		customElements.define( tagname, component );
	})( class extends HTMLElement implements DiceRollElement
	{

		// ダイスを回しているタイマーです。
		private timer: number = 0;
		// ダイスの出目の最小値です。
		private _min: number = 1;
		// ダイスの出目の最大値です。
		private _max: number = 6;
		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				// スタイルフックを使って大きさを調整できるようにします。
				// ただし今回は色んな所で使うので、--sizeを指定されていた場合はそれを使い、そうでない場合はデフォルト値を使う実装にします。
				// デフォルト値を何度も書くのは嫌なので、外からは--sizeでサイズを送ってもらい、内部では--dice-sizeに代入して使います。ない場合はこの--dice-sizeにデフォルト値が入る仕組みです。
				':host { display: inline-block; cursor: pointer; overflow: hidden; --dice-size: var( --size, 2rem ); width: var( --dice-size ); height: var( --dice-size ); color: var( --color ); }',
				':host > div { text-align: center; }',
				// デフォルトの表示は1のダイスにして、それ以外の2-6は指定された場合に表示するように調整します。
				':host > div::before { content: "⚀"; font-size: var( --dice-size ); line-height: var( --dice-size ); font-family: var( --font ); }',
				':host( [ dice="2" ] ) > div::before { content: "⚁"; }',
				':host( [ dice="3" ] ) > div::before { content: "⚂"; }',
				':host( [ dice="4" ] ) > div::before { content: "⚃"; }',
				':host( [ dice="5" ] ) > div::before { content: "⚄"; }',
				':host( [ dice="6" ] ) > div::before { content: "⚅"; }',
			].join( '' );

			const div = document.createElement( 'div' );
			div.addEventListener( 'click', () =>
			{
				// ダイスの目を回します。ダイスを回し始めた場合は何もしません。
				if ( this.roll() ) { return; }
				// ダイスがすでに転がっていたため、ダイスを止めます。
				this.stop();
			} );

			// 現在の最小値を見てみます。
			if ( this.hasAttribute( 'min' ) )
			{
				// なにか設定されているようなので、最小値を更新してみます。
				this.min = parseInt( this.getAttribute( 'min' ) || '' );
			}

			// 現在の最大値を見てみます。
			if ( this.hasAttribute( 'min' ) )
			{
				// なにか設定されているようなので、最大値を更新してみます。
				this.max = parseInt( this.getAttribute( 'max' ) || '' );
			}

			// 現在のダイスの目を見てみます。
			if ( !this.hasAttribute( 'dice' ) )
			{
				// ダイスの目がない場合は、最小値を設定しておきます。
				this.dice = this._min;
			}

			shadow.appendChild( style );
			shadow.appendChild( div );
		}

		// このメソッドを呼ぶとダイスロールできます。
		// 内部的にはクリックした時にも呼ばれます。
		public roll()
		{
			// ダイスが回っているときには何もしないでfalseを返します。
			if ( this.timer ) { return false; }

			// ダイスを回し始めます。
			this.timer = setInterval( () => { this.setAttribute( 'dice', this.diceRand() ); }, 100 );

			return true;
		}

		// ダイスの目を止めます。
		public stop()
		{
			// タイマーが設定されていない場合は何もせずfalseを返します。
			if ( !this.timer ) { return false; }
			// タイマーを解除します。
			clearInterval( this.timer );
			this.timer = 0;

			// 目押しさせないために、最後に一度だけダイスを転がします。
			this.setAttribute( 'dice', this.diceRand() );

			return true;
		}

		// ダイスの目をランダムに生成します。
		private diceRand() { return Math.floor( Math.random() * ( this._max - this._min + 1 ) + this._min ) + ''; }

		// 文字列か数値を与えることで、1～6の数値を返します。
		private convertDiceNumber( value: string|number )
		{
			if ( typeof( value ) !== 'number' )
			{
				// 数値以外だった場合は、数値に変換します。
				value = parseInt( value );
			}
			// ここに来た時点でvalueは必ず数値です。

			// 数値を整数値に変換します。
			value = Math.floor( value );

			// 値が1～6だった場合にはそのまま返します。
			if ( 1 <= value && value <= 6 ) { return value; }

			// それ以外は全部1にします。
			return 1;
		}

		// 文字列か数値を与えることで、最小値に適した数値を返します。
		private convertMinNumber( value: string|number )
		{
			// 数値を整数値の1～6に変換します。
			value = this.convertDiceNumber( value );

			// 値が1～最大値-1だった場合にはそのまま返します。
			if ( 1 <= value && value <= this._max - 1 ) { return value; }

			// それ以外は全部6にします。
			return 1;
		}

		// 文字列か数値を与えることで、最大値に適した数値を返します。
		private convertMaxNumber( value: string|number )
		{
			// 数値を整数値の1～6に変換します。
			value = this.convertDiceNumber( value );

			// 値が最小値+1～6だった場合にはそのまま返します。
			if ( this._min + 1 <= value && value <= 6 ) { return value; }

			// それ以外は全部6にします。
			return 6;
		}

		// プロパティのminを設定します。
		// minはサイコロの範囲で、絵文字の都合上1～最大値-1まで指定可能です。
		get min() { return this._min; }
		set min( value ) { this._min = this.convertMinNumber( value ); this.setAttribute( 'min', this._min + '' ); }

		// min属性が変化した時の対応です。
		private onUpdateMin( value: string|number )
		{
			// 値チェック
			// 現在の値と新しい値にダイス目線で違いがないか調べます。
			if ( this._min !== ( typeof value === 'number' ? value : parseInt( value ) ) )
			{
				// 値が異なるならセットしてなんとかします。
				this.min = <number>value;
				return;
			}
		}

		// プロパティのmaxを設定します。
		// maxはサイコロの範囲で、絵文字の都合上最小値+1～6まで指定可能です。
		get max() { return this._max;; }
		set max( value ) { this._max = this.convertMaxNumber( value ); this.setAttribute( 'max', this._max + '' ); }

		// min属性が変化した時の対応です。
		private onUpdateMax( value: string|number )
		{
			// 値チェック
			// 現在の値と新しい値にダイス目線で違いがないか調べます。
			if ( this._max !== ( typeof value === 'number' ? value : parseInt( value ) ) )
			{
				// 値が異なるならセットしてなんとかします。
				this.max = <number>value;
				return;
			}
		}

		// プロパティのdiceを設定します。
		// diceには数値もしくは文字列で値を与えると、必ず1～6の数値に変換してダイスの目を設定します。
		// diceに設定した値は、変換された後dice属性に保存されます。
		get dice() { return this.convertDiceNumber( this.getAttribute( 'dice' ) || '' ); }
		set dice( value ) { this.setAttribute( 'dice', this.convertDiceNumber( value ) + '' ); }

		// dice属性が変化した時の対応です。
		private onUpdateDice( value: string|number )
		{
			// ダイスロール中は何もしない。
			if ( this.timer ) { return; }

			// 値チェック
			// 現在の値と新しい値にダイス目線で違いがないか調べます。
			if ( this.dice !== ( typeof value === 'number' ? value : parseInt( value ) ) )
			{
				// 値が異なるならセットしてなんとかします。
				this.dice = <number>value;
				// ちなみに、常に属性変更してしまうと無限ループになるので注意してください。
				// (attributeChangedCallback内や呼ばれる処理では属性変更しないのが安全です。)
				return;
			}

			// ダイスロールしていない+値に不正がない時の変更は通知します。
			this.dispatchEvent( new Event( 'change' ) );
		}

		// 監視する属性を追加します。
		static get observedAttributes() { return [ 'min', 'max', 'dice' ]; }

		// 監視している属性が変化した時の対応です。
		public attributeChangedCallback( attrName: string, oldVal: any , newVal: any )
		{
			// 更新がない場合は何もしないことにします。
			if ( oldVal === newVal ) { return; }

			switch ( attrName )
			{
				case 'min': this.onUpdateMin( newVal ); break;
				case 'max': this.onUpdateMax( newVal ); break;
				case 'dice': this.onUpdateDice( newVal ); break;
			}
		}
	}, script.dataset.tagname );
} );
