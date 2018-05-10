import { fetch } from './utils/defaultRequest';

class FormAPI {
  static async create(payload = {}) {
    if (!payload.scheme) {
      payload.scheme = {};
    }

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

  static async getResponses(id) {
    const data = await fetch(`/api/v1/form/${id}/responses`);
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

  static async collect(id, collecting) {
    const data = await fetch(`/api/v1/form/${id}`, {
      method: 'PATCH',
      body: {
        action: 'collect',
        collecting,
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
