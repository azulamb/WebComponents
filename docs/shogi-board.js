document.addEventListener('DOMContentLoaded', () => { ShogiBoard.Init(); });
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
        piece.dataset.position = 'x' + (x - 1) + 'y' + (y - 1);
        this.appendChild(piece);
    }
}
