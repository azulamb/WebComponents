class MorseCode extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML =
            [
                ':host { display: inline-block; --short: "・"; --long: "－"; }',
            ].join('');
        this.contents = document.createElement('div');
        shadow.appendChild(style);
        shadow.appendChild(this.contents);
        const observer = new MutationObserver((mutations) => { this.update(); });
        observer.observe(this, { childList: true });
        this.update();
    }
    static Init(tagname = 'morse-code') {
        if (customElements.get(tagname)) {
            return;
        }
        this.AddTable('en', { S: '000', s: '000', O: '111', o: '111' });
        customElements.define(tagname, this);
    }
    static AddTable(lang, table) {
        this.Table[lang] = table;
    }
    convert(code, s, l) {
        return code.replace(/0/g, s).replace(/1/g, l);
    }
    update() {
        const lang = this.getAttribute('lang') || 'en';
        const table = MorseCode.Table[lang];
        if (!table) {
            this.contents.innerHTML = '';
            return;
        }
        const strings = Array.from(this.textContent || '');
        const s = this.getAttribute('short') || this.style.getPropertyValue('--short') || '・';
        const l = this.getAttribute('long') || this.style.getPropertyValue('--long') || '－';
        this.contents.textContent = strings.map((char) => { return this.convert(table[char] || '', s, l); }).join('');
    }
    static get observedAttributes() { return ['short', 'lang', 'style']; }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (oldVal === newVal) {
            return;
        }
        this.update();
    }
}
MorseCode.Table = {};
((script, wc) => {
    if (document.readyState !== 'loading') {
        return wc.Init(script.dataset.tagname);
    }
    document.addEventListener('DOMContentLoaded', () => { wc.Init(script.dataset.tagname); });
})(document.currentScript, MorseCode);
