((script, wc) => {
    if (document.readyState !== 'loading') {
        return wc.Init(script.dataset.tagname);
    }
    document.addEventListener('DOMContentLoaded', () => { wc.Init(script.dataset.tagname); });
})(document.currentScript, class extends HTMLElement {
    static Init(tagname = 'html-code') { if (customElements.get(tagname)) {
        return;
    } customElements.define(tagname, this); }
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML =
            [
                ':host { display: block; width: 100%; height: fit-content; margin: 0.5rem 0; }',
                ':host > div { width: 100%; display: flex; justify-content: space-between; }',
                ':host > div > * { width: 49%; margin: 0; padding: 0.5em; box-sizing: border-box; border-radius: 0.5rem; border: 1px solid gray; }',
                'pre { margin: 0; overflow: auto; }',
            ].join('');
        const contents = document.createElement('div');
        const view = document.createElement('div');
        const slot = document.createElement('slot');
        view.appendChild(slot);
        const source = document.createElement('div');
        const pre = document.createElement('pre');
        this.code = document.createElement('code');
        pre.append(this.code);
        source.appendChild(pre);
        this.updateCode();
        if (this.hasAttribute('change') && this.children[0]) {
            this.children[0].addEventListener('change', (event) => { console.log(event); });
        }
        contents.appendChild(view);
        contents.appendChild(source);
        shadow.appendChild(style);
        shadow.appendChild(contents);
    }
    updateCode() {
        this.code.textContent = this.innerHTML.replace(/\=\"\"/g, '');
    }
});
