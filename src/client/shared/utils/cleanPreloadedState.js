// deletes preloaded state from global var and HTML markup
export default function cleanPreloadedState() {
  delete window.PRELOADED_STATE;

  const node = document.getElementById('preloadedState');
  if (node && node.tagName === 'SCRIPT' && node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
