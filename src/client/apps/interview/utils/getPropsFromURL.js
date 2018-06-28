import getPartsFromURL from 'shared/router/utils/getPartsFromURL';

export default function getPropsFromURL() {
  const url = window.location.href;
  const parts = getPartsFromURL(url);
  const match = /^\/form\/(\d*)$/.exec(parts.pathname);
  const formId = match[1];

  return {
    formId,
    secret: parts.search.s,
  };
}
