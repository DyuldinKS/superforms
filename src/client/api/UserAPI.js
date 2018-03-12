import { fetch } from './utils/defaultRequest';

class UserAPI {
  static async create(orgId, payload) {
    const { email, role, ...info } = payload;

    const data = await fetch('/api/v1/user', {
      method: 'POST',
      body: {
        orgId,
        email,
        role,
        info,
      },
    });

    return data;
  }

  static async get(id) {
    const data = await fetch(`/api/v1/user/${id}`);
    return data;
  }

  static async orderPasswordRecovery(email) {
    const data = await fetch('/api/v1/user/password', {
      method: 'PUT',
      body: { email, reset: true },
    });

    return data;
  }

  static async setRole(id, role) {
    const data = await fetch(`/api/v1/user/${id}`, {
      method: 'PATCH',
      body: { role },
    });

    return data;
  }

  static async updateInfo(id, payload) {
    const data = await fetch(`/api/v1/user/${id}`, {
      method: 'PATCH',
      body: { info: payload },
    });

    return data;
  }
}

export default UserAPI;
