/* 評価ボタン
評価を★で表示するボタンです。
内部的には <favorite-button> を並べて使っています。

使い方：
<rating-stars></rating-stars>
<rating-stars length="LENGTH" rating="RATING"></rating-stars>
* LENGTH
    * 表示する★の数です。省略すると5になります。
    * あまり多くても困るので、内部的に最大値が20になるよう調整されます。
* RATING
    * 評価の数です。1なら★1つです。
const element = new RatingStar();
* element.length: number
    * ★の数です。
    * 代入するとその数だけ星を表示します。
* element.rating
    * 評価数です。
    * 代入するとその評価数にしますが、最大★数を超えると最大星数に調整されます。
* element.addeventListener( 'change', ( this: FavoriteButton, event: Event ) => any );
    * 評価変更時に発生するイベントです。
*/

class RatingStar extends HTMLElement
{
	private static StarTag = 'favorite-button';
	// 今回はタグ名だけでなく、中に使う★のタグ名も指定できるようにします。
	// 第二引数を指定した場合、そのタグが登録されるまで待ちます。
	public static Init( tagname = 'rating-stars', waittag = this.StarTag )
	{
		if ( customElements.get( tagname ) ) { return; }
		// カスタムエレメントが定義されるまで待ちます。
		// 今回は内部で使う <favorite-button> が使えるようになるまで待つ処理となります。
		customElements.whenDefined( waittag ).then( () =>
		{
			this.StarTag = waittag;
			customElements.define( tagname, this );
		} );
	}

	// ★を並べる要素
	private stars: HTMLDivElement;
	constructor()
	{
		super();

		const shadow = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.innerHTML =
		[
			':host { display: block; overflow: hidden; width: fit-content; height: fit-content; }',
			':host > div { display: flex; }',
		].join( '' );

		this.stars = document.createElement( 'div' );

		// ★の数を調整します。
		// まず最大値が設定されていない場合は、デフォルト値5にします。
		if ( !this.hasAttribute( 'length' ) ) { this.length = 5; }
		// ★を並べます。
		this.updateStars();

		shadow.appendChild( style );
		shadow.appendChild( this.stars );
	}

	// ★の数などを調整最新の状態にします。
	private updateStars()
	{
		const stars = this.stars.children;
		const max = this.length;

		// ★が多い場合は削ります。
		for ( let i = stars.length - 1 ; max <= i ; --i ) { this.stars.removeChild( stars[ i ] ); }

		// ★が少ない場合は追加しつつイベントを設定します。
		for ( let i = stars.length; i < max; ++i )
		{
			// ★を生成します。
			const star = this.createStar();

			// 評価値を設定します。
			// 例えば2番目の★には2という値が入っていて、クリック時に評価値を2に設定するという流れで動作します。
			star.dataset.rating = ( i + 1 ) + '';

			// クリック時のイベントを追加します。
			star.addEventListener( 'click', ( event ) =>
			{
				// 評価を設定します。
				this.rating = parseInt( <string>(<HTMLElement>event.target).dataset.rating );
			} );

			this.stars.appendChild( star );
		}

		// 評価が最大値より大きい場合は削ります。
		if ( this.length < this.rating ) { this.rating = this.length; }
	}

	// ★のタグを生成して返します。
	private createStar()
	{
		// customElements.get( タグ名 ) でタグと関連付けられたコンストラクタを取得します。
		// 後はnewすれば要素を作ることができます。
		// undefinedが返ってくる可能性もありますが、すでに定義されていることは customElements.whenDefined() で確認できているので、チェックもなしに使います。
		// 今回は on 属性以外はそんなに変わったところもないので、HTMLElmentを返すという想定にしています。
		const Star = customElements.get( RatingStar.StarTag );
		return <HTMLElement>new Star();
	}

	private convertPositiveNumber( value: number|string )
	{
		if ( typeof value !== 'number' )
		{
			// とりあえず数値に直します。
			value = parseInt( value );
		}

		// とりあえず数が多くても困るので、0以上20以下の値域にすることにします。

		// もし20より大きいなら20にする。
		if ( 20 < value ) { return 20; }
		
		// 0以上なら20以下確定なのでそのまま返す。
		if ( 0 <= value ) { return value; }

		// それ以外は0にする。
		return 0;
	}

	// lengthプロパティの追加。
	// これは★の最大数ということにします。
	get length() { return this.convertPositiveNumber( this.getAttribute( 'length' ) || '' ); }
	set length( value ) { this.setAttribute( 'length', this.convertPositiveNumber( value ) + '' ); }

	// length属性が変化した場合の対応。
	private onUpdateLength( value: string|number )
	{
		this.length = <number>value;
		// 星の数を更新します。
		this.updateStars();
	}

	// ratingプロパティの追加。
	// これは★の数の設定になります。
	get rating() { return this.convertPositiveNumber( this.getAttribute( 'rating' ) || '' ); }
	set rating( value )
	{
		// ★の最大数
		const max = this.length;
		// 設定する評価と★の最大数のうち、小さい方を設定する評価にします。
		const rating = Math.min( this.convertPositiveNumber( value ), max );

		const stars = this.stars.children;
		// ★をつけていきます。
		let i = 0;
		for ( ; i < rating; ++i ) { stars[ i ].setAttribute( 'on', 'on' ); }
		// 不要な★を消していきます。
		for ( ; i < max ; ++i ) { stars[ i ].removeAttribute( 'on' ); }

		// 最後に評価を設定します。
		this.setAttribute( 'rating', rating + '' );
	}

	// rating属性が変化した時の対応です。
	private onUpdateRating( value: string|number )
	{
		this.rating = <number>value;

		// 変更を通知します。
		this.dispatchEvent( new Event( 'change' ) );
	}

	static get observedAttributes() { return [ 'length', 'rating' ]; }

	public attributeChangedCallback( attrName: string, oldVal: any , newVal: any )
	{
		// 更新がない場合は何もしないことにします。
		if ( oldVal === newVal ) { return; }

		switch ( attrName )
		{
			case 'length': this.onUpdateLength( newVal ); break;
			case 'rating': this.onUpdateRating( newVal ); break;
		}
	}
}

( ( script, wc ) =>
{
	if ( document.readyState !== 'loading' ) { return wc.Init( script.dataset.tagname ); }
	document.addEventListener( 'DOMContentLoaded', () => { wc.Init( script.dataset.tagname ); } );
} )( <HTMLScriptElement>document.currentScript, RatingStar );
