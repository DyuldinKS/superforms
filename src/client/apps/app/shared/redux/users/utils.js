import NAME from './constants';

export function getFormsListId(userId) {
  return `${NAME}-${userId}-forms`;
}
