((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    ((component, tagname = 'favorite-button') => {
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
                ':host { display: inline-block; cursor: pointer; }',
                ':host > div { color: var( --color, orange ); }',
                ':host > div::before { content: "☆"; }',
                ':host( [ on ] ) > div::before { content: "★"; }',
            ].join('');
            const div = document.createElement('div');
            div.addEventListener('click', () => {
                this.toggleAttribute('on');
                this.dispatchEvent(new Event('change'));
            });
            shadow.appendChild(style);
            shadow.appendChild(div);
        }
    }, script.dataset.tagname);
});
