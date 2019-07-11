((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => { init(script); });
})(document.currentScript, (script) => {
    ((component, tagname = 'hide-box') => {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { --open-text: "Open"; --close-text: "Close"; display: block; height: fit-content; font-size: 1rem; border: 1px solid gray; --height: 1.5rem; }',
                    ':host > div { padding: var( --height ) 0 0; position: relative; overflow: hidden; height: 0; }',
                    ':host > div > a { display: block; position: absolute; left: 0; top: 0; width: 100%; height: var( --height ); line-height: var( --height ); cursor: pointer; text-align: center; }',
                    ':host > div > a::before { content: var( --open-text ); text-decoration: none; }',
                    ':host( [ show ] ) > div { height: fit-content; }',
                    ':host( [ show ] ) > div > a::before { content: var( --close-text ); }',
                ].join('');
            const link = document.createElement('a');
            link.appendChild(document.createElement('slot'));
            link.children[0].setAttribute('name', 'button');
            link.addEventListener('click', () => { this.toggle(); });
            const contents = document.createElement('div');
            contents.appendChild(link);
            contents.appendChild(document.createElement('slot'));
            shadow.appendChild(style);
            shadow.appendChild(contents);
        }
        toggle() {
            if (this.hasAttribute('show')) {
                this.removeAttribute('show');
                this.dispatchEvent(new Event('close'));
            }
            else {
                this.setAttribute('show', '');
                this.dispatchEvent(new Event('open'));
            }
        }
    }, script.dataset.tagname);
});
