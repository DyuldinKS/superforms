import { fetch } from './utils/defaultRequest';

class SessionAPI {
  static async signIn(email, password) {
    const data = await fetch('/api/v1/session', {
      method: 'POST',
      body: { email, password },
    });

    return data;
  }

  static async signOut() {
    const data = await fetch('/api/v1/session', {
      method: 'DELETE',
    });

    return data;
  }
}

export default SessionAPI;
