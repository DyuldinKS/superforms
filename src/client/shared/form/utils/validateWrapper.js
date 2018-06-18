import { notEmpty } from './validators';

export default function validateWrapper(value, required, validateFn) {
  const errorMessage = notEmpty(value);

  if (errorMessage) {
    if (required) {
      // if value is empty but required return error message
      return errorMessage;
    }
    // if value is empty and not required return valid
    return null;
  }

  // if value not empty use validators
  return validateFn(value);
}
