/** Normalize API/axios/stripe errors for safe React text rendering. */
export function formatApiErrorMessage(
  err: unknown,
  fallback = 'Something went wrong',
): string {
  if (err == null) return fallback;
  if (typeof err === 'string') return err || fallback;

  if (typeof err === 'object') {
    const o = err as Record<string, unknown>;

    if (typeof o.message === 'string' && o.message.trim()) {
      return o.message;
    }

    if (typeof o.message === 'object' && o.message !== null) {
      const nested = formatApiErrorMessage(o.message, '');
      if (nested) return nested;
    }

    if (Array.isArray(o.message)) {
      const parts = o.message
        .map((m) => formatApiErrorMessage(m, ''))
        .filter(Boolean);
      if (parts.length) return parts.join(' · ');
    }

    if (typeof o.error === 'string' && o.error.trim()) {
      return o.error;
    }

    if (typeof o.statusCode === 'number' && typeof o.message === 'string') {
      return o.message;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  const axiosData = (err as { response?: { data?: unknown } })?.response?.data;
  if (axiosData && axiosData !== err) {
    const fromAxios = formatApiErrorMessage(axiosData, '');
    if (fromAxios) return fromAxios;
  }

  return fallback;
}
