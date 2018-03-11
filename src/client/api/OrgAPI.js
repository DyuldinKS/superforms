import getURLFromParts from 'shared/router/utils/getURLFromParts';
import { fetch } from './utils/defaultRequest';

class OrgAPI {
  static async create(parentId, payload) {
    const { email, ...info } = payload;

    const data = await fetch('/api/v1/orgs', {
      method: 'POST',
      body: {
        parentId,
        email,
        info,
      },
    });

    return data;
  }

  static async get(id) {
    const data = await fetch(`/api/v1/orgs/${id}`);
    return data;
  }

  static async getAffiliatedUsers(id, options = {}) {
    const url = getURLFromParts({
      pathname: `/api/v1/orgs/${id}/users`,
      search: {
        search: options.search,
        ...options.filters,
      },
    });

    const data = await fetch(url);
    return data;
  }

  static async getAffiliatedOrgs(id, options = {}) {
    const url = getURLFromParts({
      pathname: `/api/v1/orgs/${id}/orgs`,
      search: {
        search: options.search,
        ...options.filters,
      },
    });

    const data = await fetch(url);
    return data;
  }

  static async updateInfo(id, payload) {
    const data = await fetch(`/api/v1/orgs/${id}`, {
      method: 'PATCH',
      body: { info: payload },
    });

    return data;
  }
}

export default OrgAPI;
