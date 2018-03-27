export default function createValidation(validators) {
  return function validate(value) {
    for (let i = 0; i < validators.length; i++) {
      const validator = validators[i];
      const res = validator(value);

      if (res !== null) {
        return res;
      }
    }

    return null;
  };
}
