class MineSweeper extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML = [
            ':host { display: block; width: 100%; height: fit-content; --mine-flag: "🚩"; }',
            'input { width: 4em; }',
            ':host( [ play ] ) > header > input { pointer-events: none; }',
            ':host > div { display: grid; }',
        ].join('');
        this.boardStyle = document.createElement('style');
        const width = parseInt(this.getAttribute('width') || '');
        const height = parseInt(this.getAttribute('height') || '');
        const bombs = parseInt(this.getAttribute('bombs') || '');
        shadow.appendChild(style);
        shadow.appendChild(this.boardStyle);
        shadow.appendChild(this.initHeader(0 < width ? width : 9, 0 < height ? height : 9, 0 < bombs ? bombs : 0));
        shadow.appendChild(this.initBoard());
        this.reset();
    }
    static Init(tagname = 'mine-sweeper', block = MineSweeper.Block) {
        MineSweeper.Block = block;
        MineBlock.Init(block);
        customElements.whenDefined(block).then(() => { customElements.define(tagname, this); });
    }
    initHeader(width, height, bombs) {
        const header = document.createElement('header');
        function createNumInput(value) {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = value + '';
            return input;
        }
        function createTextElement(text) {
            const span = document.createElement('span');
            span.textContent = text;
            return span;
        }
        if (bombs <= 0) {
            bombs = this.calcBombs(width, height);
        }
        this.width = createNumInput(width);
        this.height = createNumInput(height);
        this.bombs = createNumInput(bombs);
        header.appendChild(createTextElement('Size:'));
        header.appendChild(this.width);
        header.appendChild(createTextElement('x'));
        header.appendChild(this.height);
        header.appendChild(createTextElement('💣'));
        header.appendChild(this.bombs);
        return header;
    }
    initBoard() {
        this.board = document.createElement('div');
        return this.board;
    }
    calcBombs(width, height) {
        const bombs = Math.floor(width * height * 0.3);
        return bombs <= 0 ? 1 : bombs;
    }
    createBlock(x, y) {
        const block = new (customElements.get(MineSweeper.Block))(x, y);
        block.addEventListener('open', (event) => { this.open(event.x, event.y); });
        return block;
    }
    updateBoard() {
        const width = parseInt(this.width.value);
        const height = parseInt(this.height.value);
        for (let i = this.board.children.length - 1; 0 <= i; --i) {
            this.board.removeChild(this.board.children[i]);
        }
        const styles = [
            'div.board { ' +
                'grid-template-columns: ' + Array(width).fill('1fr').join(' ') + '; ' +
                'grid-template-rows: ' + Array(height).fill('1fr').join(' ') + ';' +
                ' }',
        ];
        const blocks = [];
        for (let y = 1; y <= height; ++y) {
            for (let x = 1; x <= width; ++x) {
                const block = this.createBlock(x, y);
                blocks.push(block);
                this.board.appendChild(block);
            }
        }
        this.boardStyle.innerHTML = styles.join('');
    }
    reset() {
        this.removeAttribute('play');
        this.updateBoard();
    }
    play(x, y) {
        this.setAttribute('play', '');
    }
    open(x, y) {
        if (!this.hasAttribute('play')) {
            this.play(x, y);
        }
    }
}
MineSweeper.Block = 'mine-block';
class MineBlock extends HTMLElement {
    constructor(x, y) {
        super();
        this.bomb = false;
        this.x = x;
        this.y = y;
        this.style.gridColumn = x + '/' + (x + 1);
        this.style.gridRow = y + '/' + (y + 1);
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML = [
            ':host { display: block; width: 100%; height: fit-content; --m-flag: var( --mine-flag, "🚩" ); }',
            ':host > div { display: block; width: 100%; padding-top: 100%; position: relative; box-sizing: border-box; overflow: hidden; }',
            ':host > div > button { display: block; cursor: pointer; width: 100%; height: 100%; position: absolute; top: 0; left: 0; }',
            ':host([ flag ]) button:before { content: var( --m-flag ); }',
            ':host([ open ]) > div > button { display: none; }',
        ].join('');
        const block = document.createElement('button');
        let timer = 0;
        block.addEventListener('mousedown', (event) => {
            if (event.button === 2) {
                clearTimeout(timer);
                timer = 0;
                return this.flag();
            }
            timer = setTimeout(() => { timer = 0; this.flag(); }, MineBlock.LONGTIME);
        });
        block.addEventListener('mouseup', (event) => {
            event.preventDefault();
            if (timer === 0) {
                return;
            }
            this.open();
            clearTimeout(timer);
            timer = 0;
        });
        block.addEventListener('contextmenu', (event) => { event.preventDefault(); });
        const panel = document.createElement('div');
        panel.appendChild(block);
        shadow.appendChild(style);
        shadow.appendChild(panel);
    }
    static Init(tagname = 'mine-block') { customElements.define(tagname, this); }
    getX() { return this.x; }
    getY() { return this.y; }
    setBomb() { this.bomb = true; }
    isBomb() { return this.bomb; }
    open() {
        this.setAttribute('open', '');
        const event = new CustomEvent('open', { detail: { x: this.x, y: this.y } });
        this.dispatchEvent(event);
    }
    flag() {
        if (this.hasAttribute('flag')) {
            this.removeAttribute('flag');
        }
        else {
            this.setAttribute('flag', '');
        }
    }
}
MineBlock.LONGTIME = 500;
((script) => {
    if (document.readyState !== 'loading') {
        return MineSweeper.Init(script.dataset.tagname, script.dataset.blockname);
    }
    document.addEventListener('DOMContentLoaded', () => { MineSweeper.Init(script.dataset.tagname, script.dataset.blockname); });
})(document.currentScript);
