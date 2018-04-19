import { fetch } from './utils/defaultRequest';

class FormAPI {
  static async create(payload = {}) {
    const data = await fetch('/api/v1/form', {
      method: 'POST',
      body: payload,
    });
    return data;
  }

  static async get(id) {
    const data = await fetch(`/api/v1/form/${id}`);
    return data;
  }

  static async update(id, payload = {}) {
    const data = await fetch(`/api/v1/form/${id}`, {
      method: 'PATCH',
      body: {
        action: 'update',
        ...payload,
      },
    });
    return data;
  }

  static async send(id, settings) {
    const data = await fetch(`/api/v1/form/${id}`, {
      method: 'PATCH',
      body: {
        action: 'send',
        settings,
      },
    });
    return data;
  }

  static async remove(id) {
    const data = await fetch(`/api/v1/form/${id}`, {
      method: 'PATCH',
      body: { action: 'delete' },
    });
    return data;
  }
}

export default FormAPI;
