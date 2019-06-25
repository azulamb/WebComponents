((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => { init(script); });
})(document.currentScript, (script) => {
    ((component, tagname = 'scroll-box') => {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class ScrollBox extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { --back: rgba( 0, 0, 0, 0.8 ); --front: #a0a0a0; display: block; width: 100%; height: fit-content; overflow: auto; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }',
                    ':host::-webkit-scrollbar { overflow: hidden; width: 5px; height: 5px; background: var( --back ); border-radius: 3px; }',
                    ':host::-webkit-scrollbar-button { display: none; }',
                    ':host::-webkit-scrollbar-thumb { overflow: hidden; border-radius: 3px; background: var( --front ); }',
                    ':host::-webkit-scrollbar-corner { overflow: hidden; border-radius: 3px; background: var( --front ); }',
                ].join('');
            shadow.appendChild(style);
            shadow.appendChild(document.createElement('slot'));
        }
    }, script.dataset.tagname);
});
