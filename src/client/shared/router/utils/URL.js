class URL {
  constructor() {
    // running on Node.js?
    this.isNode = typeof window === 'undefined';
    this.url = this.isNode ? require('url') : null;
  }

  parse(URLString) {
    if (this.isNode) {
      return this.url.parse(URLString);
    }

    const url = document.createElement('a');
    url.href = URLString;
    return url;
  }

  parseSearch(queryString) {
    const search = {};

    if (!queryString || queryString.length === 0) {
      return search;
    }

    const pairs = (
      queryString[0] === '?' ?
        queryString.substr(1) :
        queryString
    ).split('&');

    pairs.forEach((pair) => {
      const [key, value] = pair.split('=');
      search[decodeURIComponent(key)] = decodeURIComponent(value);
    });

    return search;
  }
}

export default new URL();
