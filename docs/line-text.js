((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    ((component, tagname = 'line-text') => {
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
                ':host { display: block; --color: black; --size: 1em; }',
                ':host > div { position: relative; overflow: hidden; display: flex; align-items: center; min-height: 100%; width: 100%; height: 100%; }',
                ':host > div > svg { max-width: 100%; display: block; }',
                ':host > div > span { visibility: hidden; position: absolute; white-space: nowrap; font-size: var( --size ); }',
            ].join('');
            this.str = document.createElement('span');
            this.str.appendChild(document.createElement('slot'));
            this.text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this.text.setAttribute('x', '0');
            this.text.setAttribute('y', '50%');
            this.text.setAttribute('dominant-baseline', 'middle');
            this.text.setAttribute('fill', 'var( --color )');
            this.text.setAttribute('font-size', 'var( --size )');
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.setAttributeNS(null, 'preserveAspectRatio', 'none');
            this.svg.appendChild(this.text);
            const contents = document.createElement('div');
            contents.appendChild(this.str);
            contents.appendChild(this.svg);
            shadow.appendChild(style);
            shadow.appendChild(contents);
            const observer = new MutationObserver((records) => {
                this.update();
            });
            observer.observe(this, { characterData: true, childList: true });
            this.update();
        }
        update() {
            this.text.textContent = this.textContent;
            const width = this.str.offsetWidth;
            const height = this.str.offsetHeight;
            this.svg.setAttributeNS(null, 'width', width + 'px');
            this.svg.setAttributeNS(null, 'height', height + 'px');
            this.svg.setAttributeNS(null, 'viewBox', '0 0 ' + width + ' ' + height);
        }
        static get observedAttributes() {
            return ['style'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            this.update();
        }
    }, script.dataset.tagname);
});
