import URL from './URL';

export default function getPartsFromURL(URLString) {
  const url = URL.parse(URLString);
  const search = URL.parseSearch(url.search);

  return {
    pathname: url.pathname,
    hash: url.hash,
    search,
  };
}
