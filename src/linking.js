// Deep linking config voor React Navigation.
// Vangt zowel het custom scheme (ctftimetable://) als universal links
// (https://timetable.cafetheaterfestival.nl/?performance=X#Event) op.

const prefixes = [
    'ctftimetable://',
    'https://timetable.cafetheaterfestival.nl',
];

export const linking = {
    prefixes,
    config: {
        screens: {
            Home: '',
            Timetable: 'event/:event',
            BlockTimetable: 'event/:event/blocks',
            Favorites: 'favorites',
            Routes: 'routes',
            Settings: 'settings',
            PerformanceDetail: 'performance/:id',
            RouteDetail: 'route/:id',
        },
    },
    // De webversie gebruikt ?performance=X#EventName ipv path params.
    // We mappen die naar de PerformanceDetail route.
    async getInitialURL() {
        const { Linking } = require('react-native');
        const url = await Linking.getInitialURL();
        return rewriteWebUrl(url);
    },
    subscribe(listener) {
        const { Linking } = require('react-native');
        const sub = Linking.addEventListener('url', ({ url }) => {
            const rewritten = rewriteWebUrl(url);
            if (rewritten) listener(rewritten);
        });
        return () => sub.remove();
    },
};

/** Zet een webversie-URL (?performance=X#Event) om naar onze deep link. */
function rewriteWebUrl(url) {
    if (!url) return url;
    try {
        const u = new URL(url);
        const perfId = u.searchParams.get('performance');
        if (perfId) {
            return `ctftimetable://performance/${perfId}`;
        }
    } catch (_) { /* ongeldige URL, originele teruggeven */ }
    return url;
}
