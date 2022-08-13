((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    const tagname = script.dataset.tagname || 'tweet-widget';
    ((component) => {
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
                ':host { display: block; width: 486px; margin: auto; }',
            ].join('');
            const contents = document.createElement('div');
            contents.appendChild(document.createElement('slot'));
            shadow.appendChild(style);
            shadow.appendChild(contents);
            this.update();
        }
        update() {
            this.innerHTML = '';
            if (this.timer) {
                clearTimeout(this.timer);
            }
            if (!this.tweet) {
                return;
            }
            this.timer = setTimeout(() => {
                this.updateTweet();
                this.timer = 0;
            }, 50);
        }
        updateTweet() {
            const blockquote = document.createElement('blockquote');
            blockquote.classList.add('twitter-tweet');
            blockquote.innerHTML = `<p></p><a href="${this.tweet}"></a>`;
            const theme = this.theme;
            if (theme) {
                blockquote.dataset.theme = theme;
            }
            const lang = this.lang;
            if (lang) {
                blockquote.dataset.lang = lang;
            }
            if (this.dnt) {
                blockquote.dataset.dnt = 'true';
            }
            this.appendChild(blockquote);
            setTimeout(() => {
                const url = 'https://platform.twitter.com/widgets.js';
                const scripts = document.head.querySelectorAll(`script[src="${url}"]`);
                for (let i = 0; i < scripts.length; ++i) {
                    document.head.removeChild(scripts[i]);
                }
                const script = document.createElement('script');
                script.async = true;
                script.charset = 'utf-8';
                document.head.appendChild(script);
                script.src = url;
            }, 0);
        }
        tweetURL(value) {
            const url = new URL(value);
            return url.protocol + '//' + url.host + url.pathname;
        }
        get tweet() {
            return this.getAttribute('tweet') || '';
        }
        set tweet(value) {
            try {
                this.setAttribute('tweet', this.tweetURL(value));
            }
            catch (error) {
                this.setAttribute('tweet', '');
            }
        }
        get theme() {
            const theme = this.getAttribute('theme');
            return theme === 'dark' || theme === 'light' ? theme : '';
        }
        set theme(value) {
            if (value === 'dark' || value === 'light') {
                this.setAttribute('theme', value);
            }
            else {
                this.removeAttribute('theme');
            }
        }
        get lang() {
            return this.getAttribute('lang') || '';
        }
        set lang(value) {
            if (value) {
                this.setAttribute('lang', value);
            }
            else {
                this.removeAttribute('lang');
            }
        }
        get dnt() {
            return this.hasAttribute('dnt');
        }
        set dnt(value) {
            if (!value) {
                this.removeAttribute('dnt');
            }
            else {
                this.setAttribute('dnt', '');
            }
        }
        static get observedAttributes() {
            return ['tweet', 'data-theme', 'data-lang', 'data-dnt'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (attrName === 'tweet') {
                if (oldVal !== newVal) {
                    const url = this.tweetURL(newVal);
                    this.tweet = url;
                    this.update();
                    return;
                }
            }
            if (oldVal === newVal) {
                return;
            }
            this.update();
        }
    });
});
