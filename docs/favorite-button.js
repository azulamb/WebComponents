class FavoriteButton extends HTMLElement {
    static Init(tagname = 'favorite-button') {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, this);
    }
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML =
            [
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
}
((script, wc) => {
    if (document.readyState !== 'loading') {
        return wc.Init(script.dataset.tagname);
    }
    document.addEventListener('DOMContentLoaded', () => { wc.Init(script.dataset.tagname); });
})(document.currentScript, FavoriteButton);
