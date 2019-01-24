document.addEventListener('DOMContentLoaded', () => { FavoriteButton.Init(); });
class FavoriteButton extends HTMLElement {
    static Init(tagname = 'favorite-button') {
        customElements.define(tagname, this);
    }
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
}
