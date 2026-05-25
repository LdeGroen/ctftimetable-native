// API laag voor de CTF backend (Laravel).
// Geen Appwrite-compatibility shim — directe REST calls.

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://backend.cafetheaterfestival.nl';

export const COLLECTIONS = {
    COMPANIES: 'companies',
    PERFORMANCES: 'performances',
    LOCATIONS: 'locations',
    EXECUTIONS: 'executions',
    EVENTS: 'events',
    MARKETING: 'marketing',
    ROUTES: 'routes',
    NOTIFICATIONS: 'notificaties',
};

const REQUEST_TIMEOUT_MS = 15000;

async function apiFetch(path, { signal } = {}) {
    // Per-request timeout via AbortController.
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    // Als de aanroeper ook een signal meegeeft, abort ook bij hun signal.
    if (signal) {
        signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    try {
        const res = await fetch(`${API_URL}${path}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        });
        clearTimeout(timerId);
        if (!res.ok) {
            const err = new Error(`HTTP ${res.status}`);
            err.status = res.status;
            throw err;
        }
        return res.json();
    } catch (err) {
        clearTimeout(timerId);
        throw err;
    }
}

/**
 * Fetch alle documenten van een collectie. De Laravel backend serveert max 5000
 * per pagina, dus voor de meeste collecties is dat één call.
 */
export async function fetchAllDocuments(resource, { perPage = 5000, signal } = {}) {
    const MAX_PAGES = 20;
    let documents = [];
    let page = 1;
    let response;

    do {
        const params = new URLSearchParams({
            per_page: String(perPage),
            page: String(page),
        });
        response = await apiFetch(`/api/public/${resource}?${params}`, { signal });
        const docs = Array.isArray(response?.data) ? response.data : [];
        documents.push(...docs);
        page++;
        if (docs.length < perPage) break;
    } while (page <= MAX_PAGES);

    return documents;
}

export { apiFetch };
