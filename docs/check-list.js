((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => { init(script); });
})(document.currentScript, (script) => {
    class CheckList extends HTMLElement {
        static Init(tagname = 'check-list', itemname = 'check-item') {
            if (customElements.get(tagname)) {
                return;
            }
            CheckItem.Init(itemname);
            this.ITEMNAME = itemname.replace(/[a-z]/g, (c) => { return String.fromCharCode(c.charCodeAt(0) & ~32); });
            customElements.whenDefined(itemname).then(() => {
                customElements.define(tagname, this);
            });
        }
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { display: block; }',
                ].join('');
            const contents = document.createElement('div');
            contents.appendChild(document.createElement('slot'));
            shadow.appendChild(style);
            shadow.appendChild(contents);
        }
        get checked() {
            const list = [];
            this.querySelectorAll('[ checked ]').forEach((item) => {
                if (item.tagName === CheckList.ITEMNAME) {
                    list.push(item);
                }
            });
            return list;
        }
    }
    class CheckItem extends HTMLElement {
        static Init(tagname) {
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
                    ':host { --border: 0.1em solid gray; --check-text: "✔"; display: block; margin: 0 0 0 1em; }',
                    ':host > div { position: relative; }',
                    ':host > div > div { position: absolute; top: 0; right: 100%; width: 1.4em; height: 1.4em; box-sizing: border-box; padding: 0.2em;  user-select: none;  cursor: pointer; }',
                    ':host > div > div::before { display: block; width: 100%; height: 100%; border: var( --border ); box-sizing: border-box; border-radius: 20%; content: ""; }',
                    ':host-context( [ circle ] ) > div > div::before { border-radius: 50%; }',
                    ':host( [ check ] ) > div > div::after { display: block; position: absolute; top: 0; bottom: 0; left: 0; right: 0; text-align: center; content: var( --check-text ); }',
                ].join('');
            const checkbox = document.createElement('div');
            checkbox.addEventListener('click', () => { this.check = !this.check; });
            const contents = document.createElement('div');
            contents.appendChild(checkbox);
            contents.appendChild(document.createElement('slot'));
            shadow.appendChild(style);
            shadow.appendChild(contents);
        }
        get check() { return this.hasAttribute('check'); }
        set check(value) { if (value) {
            this.setAttribute('check', '');
        }
        else {
            this.removeAttribute('check');
        } }
    }
    CheckList.Init(script.dataset.tagname, script.dataset.itemname);
});
