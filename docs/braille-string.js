((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    const Table = {};
    function AddTable(lang, table) {
        Table[lang] = table;
    }
    AddTable('en', {});
    window[script.dataset.addfunc || 'AddBrailleString'] = AddTable;
    ((component, tagname = 'braille-string') => {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class BrailleString extends HTMLElement {
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
            const observer = new MutationObserver((mutations) => {
                this.update();
            });
            observer.observe(this, { childList: true });
            this.update();
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
            const table = Table[lang];
            if (!table) {
                this.contents.innerHTML = '';
                return;
            }
            const strings = Array.from(this.textContent || '');
            this.contents.textContent = strings.map((char) => {
                return this.numToBraille(table[char] || 0);
            }).join('');
        }
        static get observedAttributes() {
            return ['lang'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            this.update();
        }
    }, script.dataset.tagname);
});
