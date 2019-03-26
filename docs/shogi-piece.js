class ShogiPiece extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const styles = [
            ':host { display: block; --shogi-size: var( --size, 2rem ); width: var( --shogi-size ); height: var( --shogi-size ); line-height: var( --shogi-size ); }',
            ':host > div { position: relative; text-align: center; font-size: var( --shogi-size ); width: 100%; height: 100%; font-size: calc( var( --shogi-size ) / 2 ); }',
            ':host > div::before, :host > div::after { display: block; width: 1em; height: 1em; line-height: 1em; text-align: center; position: absolute; top: 0; bottom: 0; left: 0; right: 0; margin: auto; }',
            ':host > div::before { content: "☖"; font-size: var( --shogi-size ); }',
            ':host > div::after { font-size: calc( var( --shogi-size ) / 2 ); }',
            ':host( [ enemy ] ) > div { transform: rotate( 180deg ); }',
        ];
        ShogiPiece.Pieces.forEach((data) => {
            styles.push(data.names.map((name) => { return ':host( [ piece = "' + name + '" ] ) > div::after'; }).join(',') +
                ' { content: "' + data.print + '"; }');
            if (data.enemy) {
                styles.push(data.names.map((name) => { return ':host( [ piece = "' + name + '" ][ enemy ] ) > div::after'; }).join(',') +
                    ' { content: "' + data.enemy + '"; }');
            }
            if (data.reverse) {
                styles.push(data.names.map((name) => { return ':host( [ piece = "' + name + '" ][ reverse ] ) > div::after'; }).join(',') +
                    ' { content: "' + data.reverse + '"; }');
            }
        });
        const style = document.createElement('style');
        style.innerHTML = styles.join('');
        const div = document.createElement('div');
        div.appendChild(document.createElement('slot'));
        shadow.appendChild(style);
        shadow.appendChild(div);
    }
    static Init(tagname = 'shogi-piece') {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, this);
    }
    get piece() { return this.getAttribute('piece') || ''; }
    set piece(value) { this.setAttribute('piece', value); }
    get enemy() { return this.hasAttribute('enemy'); }
    set enemy(value) {
        if (value) {
            this.setAttribute('enemy', 'true');
        }
        else {
            this.removeAttribute('enemy');
        }
    }
    get reverse() { return this.hasAttribute('reverse'); }
    set reverse(value) {
        if (value) {
            this.setAttribute('reverse', 'true');
        }
        else {
            this.removeAttribute('reverse');
        }
    }
}
ShogiPiece.Pieces = [
    { print: '玉', enemy: '王', names: ['king', 'k', '玉'] },
    { print: '飛', reverse: '竜', names: ['rook', 'r', '飛'] },
    { print: '角', reverse: '馬', names: ['bishop', 'b', '角'] },
    { print: '金', names: ['gold', 'g', '金'] },
    { print: '銀', reverse: '全', names: ['silver', 's', '銀'] },
    { print: '桂', reverse: '圭', names: ['knight', 'n', '桂'] },
    { print: '香', reverse: '仝', names: ['lance', 'l', '香'] },
    { print: '歩', reverse: 'と', names: ['pawn', 'p', '歩'] },
];
((script, wc) => {
    if (document.readyState !== 'loading') {
        return wc.Init(script.dataset.tagname);
    }
    document.addEventListener('DOMContentLoaded', () => { wc.Init(script.dataset.tagname); });
})(document.currentScript, ShogiPiece);
