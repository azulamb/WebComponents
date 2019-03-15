class ShogiBoard extends GameBoard {
    static Init(tagname = 'shogi-board') { customElements.define(tagname, this); }
    initBoard() {
        if (!this.hasAttribute('width')) {
            this.width = 9;
        }
        if (!this.hasAttribute('height')) {
            this.height = 9;
        }
        this.colors = [{ name: 'on', var: 'select', color: 'rgba(137, 157, 255, 0.5)' }];
    }
    setPiece(x, y, piece, enemy, reverse) {
        if (typeof piece === 'string') {
            const name = piece;
            piece = new ShogiPiece();
            piece.piece = name;
        }
        if (enemy !== undefined) {
            piece.enemy = !!enemy;
        }
        if (piece !== undefined) {
            piece.reverse = !!reverse;
        }
        piece.dataset.position = 'x' + x + 'y' + y;
        this.appendChild(piece);
    }
    find(x, y) {
        const element = this.querySelector('[ data-position="x' + Math.floor(x) + 'y' + Math.floor(y) + '" ]');
        if (!element || element.tagName !== 'shogi-piece') {
            return null;
        }
        return element;
    }
    move(x, y, mx, my) {
        x = Math.floor(x);
        y = Math.floor(y);
        const piece = this.find(x, y);
        if (!piece) {
            return null;
        }
        mx = Math.floor(mx);
        my = Math.floor(my);
        piece.dataset.position = 'x' + mx + 'y' + my;
        return piece;
    }
    capture(x, y, enemy) {
        this.querySelectorAll('[ data-position="x' + Math.floor(x) + 'y' + Math.floor(y) + '" ]').forEach((piece) => {
            if (piece.enemy === enemy) {
                return;
            }
            piece.enemy = enemy;
            piece.dataset.position = '';
            piece.slot = enemy ? 'top' : 'bottom';
        });
    }
}
((script) => {
    if (document.readyState !== 'loading') {
        return ShogiBoard.Init(script.dataset.tagname);
    }
    document.addEventListener('DOMContentLoaded', () => { ShogiBoard.Init(script.dataset.tagname); });
})(document.currentScript);
