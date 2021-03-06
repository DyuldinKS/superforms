import { fetch } from './utils/defaultRequest';

class RecipientAPI {
  static async setEmail(id, email) {
    const data = await fetch(`/api/v1/recipient/${id}`, {
      method: 'PATCH',
      body: { email },
    });

    return data;
  }

  static async setActive(id, active) {
    const data = await fetch(`/api/v1/recipient/${id}`, {
      method: 'PATCH',
      body: { active },
    });

    return data;
  }
}

export default RecipientAPI;
