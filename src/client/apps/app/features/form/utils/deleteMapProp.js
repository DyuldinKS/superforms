export default function deleteObjectProp(map, name) {
  const { [name]: disabledOption, ...withoutOption } = map;
  return Object.keys(withoutOption).length
    ? withoutOption
    : null;
};
