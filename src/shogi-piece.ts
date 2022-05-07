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

interface ShogiPieceElement extends HTMLElement {
	piece:
		| '玉'
		| '王'
		| 'king'
		| 'k'
		| '飛'
		| '竜'
		| 'rook'
		| 'r'
		| '角'
		| '馬'
		| 'bishop'
		| 'b'
		| '金'
		| 'gold'
		| 'g'
		| '銀'
		| '全'
		| 'silver'
		| 's'
		| '桂'
		| '圭'
		| 'knight'
		| 'n'
		| '香'
		| '仝'
		| 'lance'
		| 'l'
		| '歩'
		| 'と'
		| 'pawn'
		| 'p';
	enemy: boolean;
	reverse: boolean;
}

((script, init) => {
	if (document.readyState !== 'loading') {
		return init(script);
	}
	document.addEventListener('DOMContentLoaded', () => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	const Pieces: { print: string; enemy?: string; reverse?: string; names: string[] }[] = [
		{ print: '玉', enemy: '王', names: ['king', 'k', '玉'] },
		{ print: '飛', reverse: '竜', names: ['rook', 'r', '飛'] },
		{ print: '角', reverse: '馬', names: ['bishop', 'b', '角'] },
		{ print: '金', names: ['gold', 'g', '金'] },
		{ print: '銀', reverse: '全', names: ['silver', 's', '銀'] },
		{ print: '桂', reverse: '圭', names: ['knight', 'n', '桂'] },
		{ print: '香', reverse: '仝', names: ['lance', 'l', '香'] },
		{ print: '歩', reverse: 'と', names: ['pawn', 'p', '歩'] },
	];

	((component, tagname = 'shogi-piece') => {
		if (customElements.get(tagname)) {
			return;
		}
		customElements.define(tagname, component);
	})(
		class extends HTMLElement implements ShogiPieceElement {
			constructor() {
				super();

				const shadow = this.attachShadow({ mode: 'open' });

				const styles = [
					':host { display: block; width: 2rem; }',
					':host > div { position: relative; text-align: center; width: 100%; height: 100%; }',
					':host > div > svg { display: block; width: 100%; height: 100%; }',
					':host > div > svg .c { display: none; }',
					// 敵側だったときは180度回転します。
					':host( [ enemy ] ) > div { transform: rotate( 180deg ); }',
				];

				// 文字列の動的な拡大縮小のため、SVGで文字と枠を描画し、それを拡大縮小します。
				const frame = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				frame.setAttribute('x', '50%');
				frame.setAttribute('y', '50%');
				frame.setAttribute('text-anchor', 'middle');
				frame.setAttribute('dominant-baseline', 'central');
				frame.setAttribute('fill', 'var( --color )');
				frame.textContent = '☖';

				const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttributeNS(null, 'width', '20px');
				svg.setAttributeNS(null, 'height', '20px');
				svg.setAttributeNS(null, 'viewBox', '0 0 20 20');
				svg.setAttributeNS(null, 'preserveAspectRatio', 'none');
				svg.appendChild(frame);

				const create = (text: string, name: string) => {
					const piece = document.createElementNS('http://www.w3.org/2000/svg', 'text');
					piece.classList.add('c', name);
					piece.textContent = text;
					piece.setAttribute('x', '50%');
					piece.setAttribute('y', '45%');
					piece.setAttribute('text-anchor', 'middle');
					piece.setAttribute('dominant-baseline', 'central');
					piece.setAttribute('font-size', '8');
					piece.setAttribute('fill', 'var( --color )');

					return piece;
				};

				// stylesに各駒のスタイルを追加していきます。
				Pieces.forEach((data) => {
					const basename = data.names[0];
					// 通常の駒
					styles.push(
						data.names.map((name) => {
							return ':host( [ piece = "' + name + '" ] ) .c.' + basename;
						}).join(',') +
							' { display: block; }',
					);
					svg.appendChild(create(data.print, basename));

					// 敵側にいるときだけ特殊な駒の処理
					if (data.enemy) {
						styles.push(
							data.names.map((name) => {
								return ':host( [ piece = "' + name + '" ][ enemy ] ) .c.' + basename;
							}).join(',') +
								' { display: none; }',
							data.names.map((name) => {
								return ':host( [ piece = "' + name + '" ][ enemy ] ) .c.e_' + basename;
							}).join(',') +
								' { display: block; }',
						);
						svg.appendChild(create(data.enemy, 'e_' + basename));
					}

					// 成った時の駒の処理
					if (data.reverse) {
						styles.push(
							data.names.map((name) => {
								return ':host( [ piece = "' + name + '" ][ reverse ] ) .c.' + basename;
							}).join(',') +
								' { display: none; }',
							data.names.map((name) => {
								return ':host( [ piece = "' + name + '" ][ reverse ] ) .c.r_' + basename;
							}).join(',') +
								' { display: block; }',
						);
						svg.appendChild(create(data.reverse, 'r_' + basename));
					}
				});

				const style = document.createElement('style');
				style.innerHTML = styles.join('');

				const contents = document.createElement('div');
				contents.appendChild(svg);

				shadow.appendChild(style);
				shadow.appendChild(contents);
			}

			// プロパティを作ります。
			// const piece = element.place; で駒名を取得できます。
			// 内容的にはpiece属性を読み込んでいるだけです。
			get piece() {
				return <any> this.getAttribute('piece') || '';
			}
			// element.piece = 'king'; で駒を玉にできます。
			// 内容的にはpiece属性に代入した文字列を設定しているだけです。
			set piece(value) {
				this.setAttribute('piece', value);
			}

			// enemyはemeny属性がある場合はtrue、ない場合はfalseを返します。
			get enemy() {
				return this.hasAttribute('enemy');
			}
			// 設定する場合は、それがtrueになるかどうかで追加と削除の適切な方を行います。
			set enemy(value) {
				if (value) {
					// 追加します。
					this.setAttribute('enemy', 'true');
				} else {
					// 削除します。
					this.removeAttribute('enemy');
				}
			}

			// reverseはenemyと同じ挙動です。
			get reverse() {
				return this.hasAttribute('reverse');
			}
			// 設定する場合は、それがtrueになるかどうかで追加と削除の適切な方を行います。
			set reverse(value) {
				if (value) {
					// 追加します。
					this.setAttribute('reverse', 'true');
				} else {
					// 削除します。
					this.removeAttribute('reverse');
				}
			}
		},
		script.dataset.tagname,
	);
});
