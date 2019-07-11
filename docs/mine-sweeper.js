((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => { init(script); });
})(document.currentScript, (script) => {
    class MineSweeper extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML = [
                ':host { display: block; width: 100%; height: fit-content; --mine-flag: "🚩"; }',
                'input { width: 4em; }',
                ':host > div { display: grid; }',
                ':host( [ play ] ) > header > input { pointer-events: none; }',
                ':host( [ game ] ) > div > * { pointer-events: none; }',
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
        initHeader(width, height, bombs) {
            const header = document.createElement('header');
            this.maxbombs = bombs;
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
            const bombs = Math.floor(width * height * 0.5);
            return bombs <= 0 ? 1 : bombs;
        }
        createBlock(x, y) {
            const block = new MineBlock(x, y);
            block.addEventListener('open', (event) => { this.open(event.detail.x, event.detail.y); });
            block.addEventListener('flag', (event) => { this.flag(event.detail.x, event.detail.y); });
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
            for (let y = 0; y < height; ++y) {
                for (let x = 0; x < width; ++x) {
                    this.board.appendChild(this.createBlock(x, y));
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
            const blocks = Array.from(this.board.children).filter((block) => {
                return !block.isOpen();
            });
            for (let i = blocks.length - 1; 0 < i; --i) {
                const r = Math.floor(Math.random() * (i + 1));
                [blocks[i], blocks[r]] = [blocks[r], blocks[i]];
            }
            this.maxbombs = Math.min(parseInt(this.bombs.value), blocks.length);
            for (let b = 0; b < this.maxbombs; ++b) {
                blocks[b].setBomb();
            }
        }
        open(x, y) {
            if (!this.hasAttribute('play')) {
                this.play(x, y);
            }
            const width = parseInt(this.width.value);
            const height = parseInt(this.height.value);
            const blocks = Array.from(this.board.children);
            if (blocks[y * width + x].isBomb()) {
                return this.gameover();
            }
            if (this.countBlock(blocks) === this.maxbombs) {
                return this.gameclear();
            }
            const nobombs = this.getCanOpenBlocks(blocks, x, y, width, height);
            nobombs.push(blocks[y * width + x]);
            nobombs.forEach((block) => {
                block.open(this.countBombs(blocks, block.getX(), block.getY(), width, height));
            });
        }
        flag(x, y) {
            if (!this.hasAttribute('play')) {
                return;
            }
            const flags = this.board.querySelectorAll('[ flag ]:not([ open ])').length;
            const bombs = this.maxbombs - flags;
            this.bombs.value = bombs + '';
        }
        gameover() { this.setAttribute('game', 'over'); }
        gameclear() { this.setAttribute('game', 'clear'); }
        getCanOpenBlocks(blocks, x, y, width, height) {
            const nobombs = [];
            const search = [blocks[y * width + x]];
            do {
                const block = search.shift();
                const x = block.getX();
                const y = block.getY();
                let b = blocks[(y - 1) * width + x];
                if (0 < y && nobombs.indexOf(b) < 0 && !b.isBomb() && !b.isOpen() && !b.hasFlag()) {
                    search.push(b);
                    nobombs.push(b);
                }
                b = blocks[(y + 1) * width + x];
                if (y + 1 < height && nobombs.indexOf(b) < 0 && !b.isBomb() && !b.isOpen() && !b.hasFlag()) {
                    search.push(b);
                    nobombs.push(b);
                }
                b = blocks[y * width + x - 1];
                if (0 < x && nobombs.indexOf(b) < 0 && !b.isBomb() && !b.isOpen() && !b.hasFlag()) {
                    search.push(b);
                    nobombs.push(b);
                }
                b = blocks[y * width + x + 1];
                if (x + 1 < width && nobombs.indexOf(b) < 0 && !b.isBomb() && !b.isOpen() && !b.hasFlag()) {
                    search.push(b);
                    nobombs.push(b);
                }
            } while (0 < search.length);
            return nobombs;
        }
        countBombs(blocks, x, y, width, height) {
            let count = 0;
            const w = Math.min(x + 2, width);
            const h = Math.min(y + 2, height);
            for (let b = Math.max(y - 1, 0); b < h; ++b) {
                for (let a = Math.max(x - 1, 0); a < w; ++a) {
                    if (a === x && b === y) {
                        continue;
                    }
                    if (blocks[b * width + a].isBomb()) {
                        ++count;
                    }
                }
            }
            return count;
        }
        countBlock(blocks) {
            let count = 0;
            blocks.forEach((block) => { if (!block.isOpen()) {
                ++count;
            } });
            return count;
        }
    }
    class MineBlock extends HTMLElement {
        constructor(x, y) {
            super();
            this.bomb = false;
            this.x = x;
            this.y = y;
            this.style.gridColumn = (x + 1) + '/' + (x + 2);
            this.style.gridRow = (y + 1) + '/' + (y + 2);
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML = [
                ':host { display: block; width: 100%; height: fit-content; --m-flag: var( --mine-flag, "🚩" ); --m-bomb: var( --mine-bomb, "💣" ); --f-size: 1rem; }',
                ':host > div { display: block; width: 100%; padding-top: 100%; position: relative; box-sizing: border-box; overflow: hidden; }',
                ':host > div > button { display: block; cursor: pointer; width: 100%; height: 100%; position: absolute; top: 0; left: 0; }',
                ':host([ flag ]) button::before { content: var( --m-flag ); }',
                ':host([ open ]) > div > button { display: none; }',
                ':host([ bombs ]) > div::after { display: block; position: absolute; width: var( --f-size ); height: var( --f-size ); top: 0; bottom: 0; left: 0; right: 0; margin: auto; }',
                ':host([ bombs = "1" ]) > div::after { content: "1"; }',
                ':host([ bombs = "2" ]) > div::after { content: "2"; }',
                ':host([ bombs = "3" ]) > div::after { content: "3"; }',
                ':host([ bombs = "4" ]) > div::after { content: "4"; }',
                ':host([ bombs = "5" ]) > div::after { content: "5"; }',
                ':host([ bombs = "6" ]) > div::after { content: "6"; }',
                ':host([ bombs = "7" ]) > div::after { content: "7"; }',
                ':host([ bombs = "8" ]) > div::after { content: "8"; }',
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
        getX() { return this.x; }
        getY() { return this.y; }
        setBomb() { this.bomb = true; }
        isBomb() { return this.bomb; }
        isOpen() { return this.hasAttribute('open'); }
        hasFlag() { return this.hasAttribute('flag'); }
        open(bombs) {
            this.setAttribute('open', '');
            if (this.isBomb()) {
                this.setAttribute('bombs', 'B');
            }
            if (bombs !== undefined) {
                this.setAttribute('bombs', bombs + '');
            }
            else {
                const event = new CustomEvent('open', { detail: { x: this.x, y: this.y } });
                this.dispatchEvent(event);
            }
        }
        flag() {
            if (this.hasAttribute('flag')) {
                this.removeAttribute('flag');
            }
            else {
                this.setAttribute('flag', '');
            }
            const event = new CustomEvent('flag', { detail: { x: this.x, y: this.y } });
            this.dispatchEvent(event);
        }
    }
    MineBlock.LONGTIME = 500;
    ((tagname = 'mine-sweeper', blocktag = 'mine-block') => {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(blocktag, MineBlock);
        customElements.whenDefined(blocktag).then(() => { customElements.define(tagname, MineSweeper); });
    })(script.dataset.tagname, script.dataset.blockname);
});
