export default function getSubpath(fullPath, rootPath) {
  const sub = fullPath.slice(rootPath.length);
  return sub === '' ?
    undefined :
    sub;
}
