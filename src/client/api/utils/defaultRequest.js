class NetworkError extends Error {
  constructor(response, message = 'Unknown error') {
    super(message);
    this.name = 'Network Error';
    this.status = response.status;
    this.statusText = response.statusText;
  }
}

export const init = {
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  credentials: 'same-origin',
};

export async function fetch(url, options = {}) {
  if (options.body) {
    options.body = JSON.stringify(options.body);
  }

  const response = await window.fetch(url, {
    ...init,
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new NetworkError(response, message);
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return data;
}
