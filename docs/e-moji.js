((script, init) => {
    const id = script.dataset.tagname || 'e-moji';
    if (customElements.get(id)) {
        return;
    }
    if (!document.getElementById(id)) {
        const style = document.createElement('style');
        style.textContent = `@font-face { font-family: "Emoji"; src: url( ${script.dataset.emoji || 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/fonts/NotoColorEmoji.ttf'} ); }@font-face { font-family: "Blank"; src: url( ${script.dataset.blank || 'https://raw.githubusercontent.com/adobe-fonts/adobe-blank/master/AdobeBlank.ttf'} ); }`;
        style.id = id;
        document.head.appendChild(style);
    }
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    ((component, tagname = 'e-moji') => {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML = [
                ':host { display: inline-block; --size: 1rem; --transform: none; }',
                ':host > div { font-family: Emoji, Blank; width: var( --size ); height: var( --size ); overflow: hidden; }',
                ':host > div > svg { width: 100%; height: 100%; display: block; transform: var( --transform ); }',
            ].join('');
            this.text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this.text.setAttribute('x', '0');
            this.text.setAttribute('y', '50%');
            this.text.style.fontSize = '16px';
            this.text.setAttribute('dominant-baseline', 'central');
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttributeNS(null, 'width', '20');
            svg.setAttributeNS(null, 'height', '20');
            svg.setAttributeNS(null, 'viewBox', '0 0 20 20');
            svg.appendChild(this.text);
            const contents = document.createElement('div');
            contents.appendChild(svg);
            this.update();
            shadow.appendChild(style);
            shadow.appendChild(contents);
        }
        get value() {
            return this.getAttribute('value') || '';
        }
        set value(value) {
            this.setAttribute('value', value);
        }
        get skin() {
            const s = parseInt(this.getAttribute('skin') || '') || 0;
            return 1 <= s && s <= 5 ? s : 0;
        }
        set skin(value) {
            if (typeof value !== 'number') {
                value = parseInt(value + '') || 0;
            }
            const num = Math.floor(value);
            if (!num) {
                this.removeAttribute('skin');
                return;
            }
            if (1 <= num && num <= 5) {
                this.setAttribute('skin', num + '');
                return;
            }
        }
        static get observedAttributes() {
            return ['value', 'skin'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            this.update();
        }
        update() {
            const skin = ((skin) => {
                if (!skin) {
                    return '';
                }
                return String.fromCodePoint(127994 + skin);
            })(this.skin);
            this.text.textContent = this.value + skin;
        }
    }, script.dataset.tagname);
});
