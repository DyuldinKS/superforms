const baseFields = [
  'description',
  'itemType',
  'required',
  'title',
  'type',
];

export default function dropSpecificFields(item) {
  return baseFields.reduce((acc, field) => {
    if (item[field]) {
      acc[field] = item[field];
    }
    return acc;
  }, {});
}
