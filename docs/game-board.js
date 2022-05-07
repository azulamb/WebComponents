((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    ((component, tagname = 'game-board') => {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends HTMLElement {
        constructor() {
            super();
            this.colors = [{ name: 'on', var: 'select', color: 'rgba(137, 157, 255, 0.5)' }];
            const shadow = this.attachShadow({ mode: 'open' });
            this.boardStyle = document.createElement('style');
            this.board = document.createElement('div');
            this.board.classList.add('board');
            this.initBoard();
            const style = document.createElement('style');
            style.innerHTML = [
                ':host { display: block; overflow: hidden; width: 100%; height: fit-content; --border-color: var( --border, black ); }',
                ':host > div.main { width: 100%; padding: 100% 0 0; position: relative; overflow: hidden; }',
                ':host > div.top, :host > div.bottom { position: relative; width: 100%; height: fit-content; }',
                ':host > div.top {}',
                ':host > div.bottom {}',
                ':host > div > div { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }',
                'div.board { display: grid; box-sizing: border-box; border: 1px solid var( --border-color ); }',
                'div.board > div { width: 100%; height: 100%; border-right: 1px solid var( --border-color ); border-bottom: 1px solid var( --border-color ); }',
                '::slotted( :not( [slot] ) ) { position: absolute; transition: top 0.5s, left 0.5s; }',
                '::slotted( [slot] ) { display: inline-block; }',
            ].join('');
            this.updateBoard();
            const contents = document.createElement('div');
            contents.classList.add('contents');
            contents.appendChild(document.createElement('slot'));
            const main = document.createElement('div');
            main.classList.add('main');
            main.appendChild(this.board);
            main.appendChild(contents);
            const top = document.createElement('div');
            top.classList.add('top');
            const topslot = document.createElement('slot');
            topslot.name = 'top';
            top.appendChild(topslot);
            const bottom = document.createElement('div');
            bottom.classList.add('bottom');
            const bottomslot = document.createElement('slot');
            bottomslot.name = 'bottom';
            bottom.appendChild(bottomslot);
            shadow.appendChild(style);
            shadow.appendChild(this.boardStyle);
            shadow.appendChild(top);
            shadow.appendChild(main);
            shadow.appendChild(bottom);
        }
        initBoard() {
            if (!this.hasAttribute('width')) {
                this.width = 8;
            }
            if (!this.hasAttribute('height')) {
                this.height = 8;
            }
            this.colors = [{ name: 'on', var: 'select', color: 'rgba(137, 157, 255, 0.5)' }];
        }
        updateBoard() {
            const width = this.width;
            const height = this.height;
            const styles = [];
            styles.push(':host > div.main { padding: calc( 100% * ' + height + ' / ' + width + ' ) 0 0; }', 'div.board { ' +
                'grid-template-columns: ' + Array(width).fill('1fr').join(' ') + '; ' +
                'grid-template-rows: ' + Array(height).fill('1fr').join(' ') + ';' +
                ' }', '::slotted( :not[ slot ] ) { width: calc( 100% / ' + width + ' ); height: calc( 100% / ' + height + ' ); }');
            this.colors.forEach((color) => {
                styles.push('div.board > div.' + color.name + ' { background-color: var( ' + color.var + ', ' + color.color + ' ); }');
            });
            for (let i = this.board.children.length - 1; 0 <= i; --i) {
                this.board.removeChild(this.board.children[i]);
            }
            for (let y = 1; y <= height; ++y) {
                for (let x = 1; x <= width; ++x) {
                    const box = document.createElement('div');
                    const position = 'x' + x + 'y' + y;
                    box.dataset.position = position;
                    this.board.appendChild(box);
                    this.addPieceStyle(styles, position, x, y);
                }
            }
            this.boardStyle.innerHTML = styles.join('');
        }
        addPieceStyle(styles, position, x, y) {
            styles.push('div.board > [ data-position = "' + position + '" ] {' +
                'grid-column: ' + x + '/' + (x + 1) + ';grid-row: ' + y + '/' + (y + 1) + ';' +
                '}', '::slotted( [ data-position = "' + position + '" ] ) { left: calc( ( 100% ' + ' * ' +
                (x - 1) + ' ) / ' + this.width + ' ); top: calc( 100% ' + ' * ' + (y - 1) + ' / ' + this.height + ' ); }');
        }
        select(x, y, ...colors) {
            if (colors.length <= 0)
                colors.push(this.colors[0].name);
            const box = this.board.querySelector('[ data-position = "x' + x + 'y' + y + '" ]');
            if (!box) {
                return false;
            }
            colors.forEach((color) => {
                box.classList.add(color);
            });
            return true;
        }
        deselect(x, y, ...colors) {
            if (colors.length <= 0) {
                colors = this.colors.map((color) => {
                    return color.name;
                });
            }
            if (x === undefined && y === undefined) {
                let count = 0;
                const children = this.board.children;
                for (let i = children.length - 1; 0 <= i; --i) {
                    const box = children[i];
                    if (!box.classList.contains('on')) {
                        continue;
                    }
                    colors.forEach((color) => {
                        box.classList.remove(color);
                    });
                    ++count;
                }
                return count;
            }
            const box = this.board.querySelector('[ data-position = "x' + x + 'y' + y + '" ]');
            if (!box) {
                return 0;
            }
            colors.forEach((color) => {
                box.classList.remove(color);
            });
            return 1;
        }
        convertPositiveNumber(value) {
            if (typeof value !== 'number') {
                value = parseInt(value);
            }
            if (40 < value) {
                return 40;
            }
            if (1 <= value) {
                return value;
            }
            return 1;
        }
        get width() {
            return this.convertPositiveNumber(this.getAttribute('width') || '');
        }
        set width(value) {
            this.setAttribute('width', this.convertPositiveNumber(value) + '');
        }
        onUpdateWidth(value) {
            if (this.width !== (typeof value === 'number' ? value : parseInt(value))) {
                this.width = value;
                this.updateBoard();
                return;
            }
        }
        get height() {
            return this.convertPositiveNumber(this.getAttribute('height') || '');
        }
        set height(value) {
            this.setAttribute('height', this.convertPositiveNumber(value) + '');
        }
        onUpdateHeight(value) {
            if (this.height !== (typeof value === 'number' ? value : parseInt(value))) {
                this.height = value;
                this.updateBoard();
                return;
            }
        }
        static get observedAttributes() {
            return ['width', 'height'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            switch (attrName) {
                case 'width':
                    this.onUpdateWidth(newVal);
                    break;
                case 'height':
                    this.onUpdateHeight(newVal);
                    break;
            }
        }
    }, script.dataset.tagname);
});
