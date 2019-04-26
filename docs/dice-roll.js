((script, wc) => {
    if (document.readyState !== 'loading') {
        return wc.Init(script.dataset.tagname);
    }
    document.addEventListener('DOMContentLoaded', () => { wc.Init(script.dataset.tagname); });
})(document.currentScript, class extends HTMLElement {
    constructor() {
        super();
        this.timer = 0;
        this._min = 1;
        this._max = 6;
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML =
            [
                ':host { display: inline-block; cursor: pointer; overflow: hidden; --dice-size: var( --size, 2rem ); width: var( --dice-size ); height: var( --dice-size ); color: var( --color ); }',
                ':host > div { text-align: center; }',
                ':host > div::before { content: "⚀"; font-size: var( --dice-size ); line-height: var( --dice-size ); font-family: var( --font ); }',
                ':host( [ dice="2" ] ) > div::before { content: "⚁"; }',
                ':host( [ dice="3" ] ) > div::before { content: "⚂"; }',
                ':host( [ dice="4" ] ) > div::before { content: "⚃"; }',
                ':host( [ dice="5" ] ) > div::before { content: "⚄"; }',
                ':host( [ dice="6" ] ) > div::before { content: "⚅"; }',
            ].join('');
        const div = document.createElement('div');
        div.addEventListener('click', () => {
            if (this.roll()) {
                return;
            }
            this.stop();
        });
        if (this.hasAttribute('min')) {
            this.min = parseInt(this.getAttribute('min') || '');
        }
        if (this.hasAttribute('min')) {
            this.max = parseInt(this.getAttribute('max') || '');
        }
        if (!this.hasAttribute('dice')) {
            this.dice = this._min;
        }
        shadow.appendChild(style);
        shadow.appendChild(div);
    }
    static Init(tagname = 'dice-roll') {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, this);
    }
    roll() {
        if (this.timer) {
            return false;
        }
        this.timer = setInterval(() => { this.setAttribute('dice', this.diceRand()); }, 100);
        return true;
    }
    stop() {
        if (!this.timer) {
            return false;
        }
        clearInterval(this.timer);
        this.timer = 0;
        this.setAttribute('dice', this.diceRand());
        return true;
    }
    diceRand() { return Math.floor(Math.random() * (this._max - this._min + 1) + this._min) + ''; }
    convertDiceNumber(value) {
        if (typeof (value) !== 'number') {
            value = parseInt(value);
        }
        value = Math.floor(value);
        if (1 <= value && value <= 6) {
            return value;
        }
        return 1;
    }
    convertMinNumber(value) {
        value = this.convertDiceNumber(value);
        if (1 <= value && value <= this._max - 1) {
            return value;
        }
        return 1;
    }
    convertMaxNumber(value) {
        value = this.convertDiceNumber(value);
        if (this._min + 1 <= value && value <= 6) {
            return value;
        }
        return 6;
    }
    get min() { return this._min; }
    set min(value) { this._min = this.convertMinNumber(value); this.setAttribute('min', this._min + ''); }
    onUpdateMin(value) {
        if (this._min !== (typeof value === 'number' ? value : parseInt(value))) {
            this.min = value;
            return;
        }
    }
    get max() { return this._max; ; }
    set max(value) { this._max = this.convertMaxNumber(value); this.setAttribute('max', this._max + ''); }
    onUpdateMax(value) {
        if (this._max !== (typeof value === 'number' ? value : parseInt(value))) {
            this.max = value;
            return;
        }
    }
    get dice() { return this.convertDiceNumber(this.getAttribute('dice') || ''); }
    set dice(value) { this.setAttribute('dice', this.convertDiceNumber(value) + ''); }
    onUpdateDice(value) {
        if (this.timer) {
            return;
        }
        if (this.dice !== (typeof value === 'number' ? value : parseInt(value))) {
            this.dice = value;
            return;
        }
        this.dispatchEvent(new Event('change'));
    }
    static get observedAttributes() { return ['min', 'max', 'dice']; }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (oldVal === newVal) {
            return;
        }
        switch (attrName) {
            case 'min':
                this.onUpdateMin(newVal);
                break;
            case 'max':
                this.onUpdateMax(newVal);
                break;
            case 'dice':
                this.onUpdateDice(newVal);
                break;
        }
    }
});
