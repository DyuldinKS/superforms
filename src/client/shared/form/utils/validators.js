export function notEmpty(value) {
  return (!value || value.length === 0)
    ? 'Необходимо ответить на данный вопрос'
    : null;
}

export function notEmptyOptionOther(map) {
  return (map.other !== undefined && !map.other.length)
    ? 'Не указан свой вариант ответа'
    : null;
}

export function isGreaterOrEqual(min) {
  return value => (
    value >= min
      ? null
      : `Минимальное допустимое значение: ${min}`
  );
}

export function isLesserOrEqual(max) {
  return value => (
    value <= max
      ? null
      : `Максимальное допустимое значение: ${max}`
  );
}

export function isShorterOrEqual(max) {
  return value => (
    value.length < max
      ? null
      : `Максимальная длина допустимой строки: ${max} символов`
  );
}

export function isNumber(value) {
  return /^(\-|\+)?([0-9]+([.,][0-9]+)?)$/.test(value)
    ? null
    : 'Ответ должен быть числом';
}

export function isInteger(value) {
  return /^(\-|\+)?([0-9]+)$/.test(value)
    ? null
    : 'Ответ должен быть целым числом';
}

const propToValidatorMap = {
  integer: isInteger,
  max: isLesserOrEqual,
  maxLength: isShorterOrEqual,
  min: isGreaterOrEqual,
  required: notEmpty,
};

function composeValidatorsByProps(allProps, influencingProps = []) {
  return influencingProps.reduce((acc, propName) => {
    const value = allProps[propName];
    let validator = propToValidatorMap[propName];

    // TODO: delete value as bool strings
    if (
      !value
      || value === 'false'
      || !validator
    ) {
      return acc;
    }

    if (
      typeof value !== 'boolean'
      && value !== 'true'
    ) {
      validator = validator(value);
    }

    acc.push(validator);
    return acc;
  }, []);
}

export default composeValidatorsByProps;
