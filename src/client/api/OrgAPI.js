import getURLFromParts from 'shared/router/utils/getURLFromParts';
import { fetch } from './utils/defaultRequest';

class OrgAPI {
  static async create(parentId, payload) {
    const { email, ...info } = payload;

    const data = await fetch('/api/v1/org', {
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
    const data = await fetch(`/api/v1/org/${id}`);
    return data;
  }

  static async getAffiliatedUsers(id, options = {}) {
    const url = getURLFromParts({
      pathname: `/api/v1/org/${id}/users`,
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
      pathname: `/api/v1/org/${id}/orgs`,
      search: {
        search: options.search,
        ...options.filters,
      },
    });

    const data = await fetch(url);
    return data;
  }

  static async getAncestors(id, options = {}) {
    const url = getURLFromParts({
      pathname: `/api/v1/org/${id}/parents`,
      search: options,
    });

    const data = await fetch(url);
    return data;
  }

  static async getForms(id, options = {}) {
    const url = getURLFromParts({
      pathname: `/api/v1/org/${id}/forms`,
      search: {
        search: options.search,
      },
    });

    const data = await fetch(url);
    return data;
  }

  static async setEmail(id, email) {
    const data = await fetch(`/api/v1/org/${id}`, {
      method: 'PATCH',
      body: { email },
    });

    return data;
  }

  static async setActive(id, active) {
    const data = await fetch(`/api/v1/org/${id}`, {
      method: 'PATCH',
      body: { active },
    });

    return data;
  }

  static async updateInfo(id, payload) {
    const data = await fetch(`/api/v1/org/${id}`, {
      method: 'PATCH',
      body: { info: payload },
    });

    return data;
  }
}

export default OrgAPI;
