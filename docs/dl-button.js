((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    ((component, tagname = 'dl-button') => {
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
                ':host { --text: "Download"; --disabled-color: rgba( 0, 0, 0, 0.3 ); display: inline-block; cursor: pointer; border-radius: 0.2rem; border: 1px solid gray; overflow: hidden; }',
                ':host > div { position: relative; width: 100%; height: 100%; box-sizing: border-box; padding: 0.4em 1.2em; display: flex; flex-direction: column; justify-content: center; align-items: center; }',
                ':host > div > a { display: block; text-decoration: none; border: 0; position: absolute; top: 0; left: 0; width: 100%; height: 100%; }',
                ':host( :empty ) > div::before { content: var( --text ); display: inline; }',
                ':host( [ disabled ] ) { cursor: auto; }',
                ':host( [ disabled ] ) > div::after { content: ""; display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: var( --disable-color ); }',
                ':host( [ disabled ] ) > div > a { display: none; }',
            ].join('');
            this.button = document.createElement('a');
            this.setDLAttribute('download');
            this.setDLAttribute('src', 'href');
            const contents = document.createElement('div');
            contents.appendChild(document.createElement('slot'));
            contents.appendChild(this.button);
            shadow.appendChild(style);
            shadow.appendChild(contents);
        }
        setDLAttribute(key, write) {
            if (!write)
                write = key;
            const value = this.getAttribute(key) || '';
            if (this.button.getAttribute(write) === value) {
                return;
            }
            this.button.setAttribute(write, value);
        }
        static get observedAttributes() {
            return ['download', 'src'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            switch (attrName) {
                case 'download':
                    return this.setDLAttribute('download');
                case 'src':
                    return this.setDLAttribute('src', 'href');
            }
        }
    }, script.dataset.tagname);
});
