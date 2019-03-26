class BrailleString extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML = [
            ':host { display: inline-block; }',
        ].join('');
        this.contents = document.createElement('div');
        shadow.appendChild(style);
        shadow.appendChild(this.contents);
        const observer = new MutationObserver((mutations) => { this.update(); });
        observer.observe(this, { childList: true });
        this.update();
    }
    static Init(tagname = 'braille-string') {
        if (customElements.get(tagname)) {
            return;
        }
        this.AddTable('en', {});
        customElements.define(tagname, this);
    }
    static AddTable(lang, table) {
        this.Table[lang] = table;
    }
    numToBraille(bnum) {
        const str = [];
        do {
            const b = bnum & 0x1F;
            str.push(String.fromCodePoint(b + 0x2800));
            bnum >>= 6;
        } while (0 < bnum);
        return str.join('');
    }
    update() {
        const lang = this.getAttribute('lang') || 'en';
        const table = BrailleString.Table[lang];
        if (!table) {
            this.contents.innerHTML = '';
            return;
        }
        const strings = Array.from(this.textContent || '');
        this.contents.textContent = strings.map((char) => { return this.numToBraille(table[char] || 0); }).join('');
    }
    static get observedAttributes() { return ['lang']; }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (oldVal === newVal) {
            return;
        }
        this.update();
    }
}
BrailleString.Table = {};
((script, wc) => {
    if (document.readyState !== 'loading') {
        return wc.Init(script.dataset.tagname);
    }
    document.addEventListener('DOMContentLoaded', () => { wc.Init(script.dataset.tagname); });
})(document.currentScript, BrailleString);
