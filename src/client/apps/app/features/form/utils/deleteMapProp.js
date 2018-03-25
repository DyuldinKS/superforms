export default function deleteObjectProp(map, name) {
  if (!map) return null;
  const { [name]: disabledOption, ...withoutOption } = map;
  return Object.keys(withoutOption).length
    ? withoutOption
    : null;
}
