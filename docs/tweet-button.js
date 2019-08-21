((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => { init(script); });
})(document.currentScript, (script) => {
    const TWEET_URL = 'https://twitter.com/intent/tweet';
    ((component, tagname = 'tweet-button') => {
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
                    ':host { --padding: 0.1rem 0.4rem; --color: white; display: inline-block; background-color: #1da1f2; color: var( --color ); box-sizing: border-box; border-radius: 0.2rem; overflow: hidden; transition: background-color 0.2s; font-weight: 500; font: normal normal normal 11px/18px "Helvetica Neue",Arial,sans-serif; }',
                    ':host( :hover ) { background-color: #1a91da; }',
                    ':host( [ disable ] ) > a { user-select: none; pointer: cursor; }',
                    ':host( [ noicon ] ) svg { display: none; }',
                    ':host > a { display: flex; justify-content: center; align-items: center; box-sizing: border-box; text-decoration: none; color: inherit; width: 100%; height: 100%; padding: var( --padding ); }',
                    'svg{ width: auto; height: 1rem; }',
                    ':host( :not( :empty ) ) svg { margin-right: 0.2rem; }',
                ].join('');
            this.link = document.createElement('a');
            if (this.hasAttribute('target')) {
                this.link.target = this.getAttribute('target') || '';
            }
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttributeNS(null, 'd', 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z');
            path.style.fill = 'var( --color )';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttributeNS(null, 'width', '24px');
            svg.setAttributeNS(null, 'height', '24px');
            svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
            svg.appendChild(path);
            this.link.appendChild(svg);
            this.link.appendChild(document.createElement('slot'));
            this.update();
            shadow.appendChild(style);
            shadow.appendChild(this.link);
        }
        update() {
            const params = new URLSearchParams();
            if (this.text) {
                params.append('text', this.text);
            }
            if (this.url) {
                params.append('url', this.url);
            }
            const hashtags = this.hashtags();
            if (0 < hashtags.length) {
                params.append('hashtags', hashtags.join(','));
            }
            if (this.via) {
                params.append('via', this.via);
            }
            if (this.in_reply_to) {
                params.append('in_reply_to', this.in_reply_to);
            }
            const related = this.related();
            if (0 < related.length) {
                params.append('related', related.join(','));
            }
            if (this.lang) {
                params.append('lang', this.lang);
            }
            const url = new URL(TWEET_URL);
            url.search = params.toString();
            this.link.href = url.toString();
        }
        twitterArray(data) {
            return data.split(',').filter((v) => { return !!v; });
        }
        get target() { return this.link.target; }
        set target(value) {
            this.link.target = value || '';
            this.setAttribute('target', this.link.target);
        }
        get text() { return this.getAttribute('text') || ''; }
        set text(value) { this.setAttribute('text', value || ''); this.update(); }
        get url() { return this.getAttribute('url') || ''; }
        set url(value) { this.setAttribute('url', value || ''); this.update(); }
        hashtags(...values) {
            if (values.length === 0) {
                return this.twitterArray(this.getAttribute('hashtags') || '');
            }
            this.setAttribute('hashtags', values.join(','));
            this.update();
        }
        get via() { return this.getAttribute('via') || ''; }
        set via(value) { this.setAttribute('via', (value || '').replace(/^\@+/, '')); this.update(); }
        get in_reply_to() { return this.getAttribute('in_reply_to') || ''; }
        set in_reply_to(value) {
            try {
                this.setAttribute('in_reply_to', new URL(value).pathname.replace(/^.+\/([0-9]+)$/, '$1'));
            }
            catch (error) {
                this.setAttribute('in_reply_to', (value || '').replace(/[^0-9]+/g, ''));
            }
            this.update();
        }
        related(user1, user2) {
            if (user1 === undefined) {
                return this.twitterArray(this.getAttribute('related') || '');
            }
            const users = [];
            if (user1) {
                users.push(user1.replace(/^\@+/, ''));
            }
            if (user2) {
                users.push(user2.replace(/^\@+/, ''));
            }
            this.setAttribute('related', users.join(','));
            this.update();
        }
        static get observedAttributes() { return ['lang']; }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            this.update();
        }
    }, script.dataset.tagname);
});
