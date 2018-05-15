import { fetch } from './utils/defaultRequest';

class ResponseAPI {
  static async create(formId, secret, response = {}) {
    const payload = {
      formId,
      secret,
      items: response,
    };

    const data = await fetch('/api/v1/response', {
      method: 'POST',
      body: payload,
    });
    return data;
  }

  static async get(id) {
    const data = await fetch(`/api/v1/response/${id}`);
    return data;
  }
}

export default ResponseAPI;
