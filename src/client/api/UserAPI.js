import { fetch } from './utils/defaultRequest';

class UserAPI {
  static async create(cheifOrgId, payload) {
    const data = await fetch('/api/v1/users', {
      method: 'POST',
      body: {
        orgId: cheifOrgId,
        ...payload,
      },
    });

    return data;
  }

  static async get(id) {
    const data = await fetch(`/api/v1/users/${id}`);
    return data;
  }

  static async setRole(id, role) {
    const data = await fetch(`/api/v1/users/${id}`, {
      method: 'PATCH',
      body: { role },
    });

    return data;
  }

  static async updateInfo(id, payload) {
    const data = await fetch(`/api/v1/users/${id}`, {
      method: 'PATCH',
      body: payload,
    });

    return data;
  }
}

export default UserAPI;
