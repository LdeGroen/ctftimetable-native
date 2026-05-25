// Data-laag — haalt alle collecties op uit de Laravel backend en bouwt
// het uiteindelijke timetable-array op. Dezelfde logica als de webversie,
// maar gebruikt `id` ipv `$id` (geen Appwrite-shim).

import { COLLECTIONS, fetchAllDocuments } from './api';
import { parseDateForSorting } from './utils';

/**
 * Haalt alle data op en bouwt de timetable structuur:
 * { performances, eventInfoMap, uniqueEvents, routes, notifications }
 */
export async function fetchAndBuildTimetable({ signal } = {}) {
    const [
        companies,
        performances,
        locations,
        executions,
        events,
        marketing,
        routesRaw,
        notificationsRaw,
    ] = await Promise.all([
        fetchAllDocuments(COLLECTIONS.COMPANIES, { signal }),
        fetchAllDocuments(COLLECTIONS.PERFORMANCES, { signal }),
        fetchAllDocuments(COLLECTIONS.LOCATIONS, { signal }),
        fetchAllDocuments(COLLECTIONS.EXECUTIONS, { signal }),
        fetchAllDocuments(COLLECTIONS.EVENTS, { signal }),
        fetchAllDocuments(COLLECTIONS.MARKETING, { signal }),
        fetchAllDocuments(COLLECTIONS.ROUTES, { signal }),
        fetchAllDocuments(COLLECTIONS.NOTIFICATIONS, { signal }),
    ]);

    const visibleEvents = events.filter(e => e.InApp === true);

    const companiesMap = new Map(companies.map(c => [String(c.id), c]));
    const performancesMap = new Map(performances.map(p => [String(p.id), p]));
    const locationsMap = new Map(locations.map(l => [String(l.id), l]));
    const executionsMap = new Map(executions.map(e => [String(e.id), e]));
    const marketingMap = new Map(marketing.map(m => [String(m.PerformanceId), m]));
    const eventIdToNameMap = new Map(visibleEvents.map(e => [String(e.id), e.Name]));

    const parsedRoutes = routesRaw.map(r => ({
        id: String(r.id),
        event: eventIdToNameMap.get(String(r.Event)) || r.Event,
        title: r.Titel,
        titleEng: r.TitelENG,
        text: r.Tekst,
        textEng: r.TekstENG,
        image: r.Afbeelding,
        executionIds: r.Uitvoeringen || [],
        dates: r.Datum || [],
        code: r.Code,
    }));

    const parsedNotifications = notificationsRaw.map(n => ({
        id: String(n.id),
        text_nl: n.tekstNL,
        text_en: n.TekstENG,
        date: n.date,
        openInBrowser: n.openInBrowser,
        url: n.url,
    }));

    const allParsedData = [];
    const eventInfoMap = {};
    const visiblePerformances = performances.filter(p => p.InApp === true);
    const visiblePerformanceIds = new Set(visiblePerformances.map(p => String(p.id)));
    const visibleEventsMap = new Map(visibleEvents.map(e => [String(e.id), e]));
    const performanceEventPairsWithExecutions = new Set();

    // 1. Voorstellingen die aan een uitvoering (executie) hangen
    visibleEvents.forEach(eventDoc => {
        eventInfoMap[eventDoc.Name] = {
            sponsorLogo: eventDoc.sponsorLogoUrl,
            mapUrl: eventDoc.mapUrl,
            dateString: null,
        };

        const executionIds = eventDoc.executionIds || [];
        if (!Array.isArray(executionIds)) return;

        executionIds.forEach(executionId => {
            const execution = executionsMap.get(String(executionId));
            if (!execution) return;

            const performance = performancesMap.get(String(execution.performanceId));
            if (!performance || !visiblePerformanceIds.has(String(performance.id))) return;

            const marketingInfo = marketingMap.get(String(performance.id)) || {};
            const company = companiesMap.get(String(performance.companyId));
            const location = locationsMap.get(String(execution.locationId));
            if (!location) return;

            const dateTime = new Date(execution.DateTime);
            const validDate = !isNaN(dateTime.getTime());
            const dateString = validDate
                ? `${String(dateTime.getDate()).padStart(2, '0')}-${String(dateTime.getMonth() + 1).padStart(2, '0')}-${dateTime.getFullYear()}`
                : 'N/A';
            const timeString = validDate
                ? `${String(dateTime.getHours()).padStart(2, '0')}:${String(dateTime.getMinutes()).padStart(2, '0')}`
                : 'N/A';

            if (validDate) {
                const current = eventInfoMap[eventDoc.Name].dateString
                    ? parseDateForSorting(eventInfoMap[eventDoc.Name].dateString)
                    : null;
                if (!current || dateTime < current) {
                    eventInfoMap[eventDoc.Name].dateString = dateString;
                }
            }

            performanceEventPairsWithExecutions.add(`${eventDoc.id}-${performance.id}`);

            allParsedData.push({
                id: String(execution.id),
                eventId: String(eventDoc.id),
                originalPerformanceId: String(performance.id),
                locationId: String(location.id),
                date: dateString,
                time: timeString,
                artist: company?.Name ?? 'Onbekend',
                title: performance.Title,
                location: location.Name,
                url: performance.meerInfoUrl,
                event: eventDoc.Name,
                googleMapsUrl: location.googleMapsUrl,
                pwycLink: performance.pwycLink,
                mapNumber: location.locationNumber,
                mapImageUrl: eventDoc.mapUrl,
                genre: performance.genre,
                isCalmRoute: execution.quietRoute,
                crowdLevel: execution.expectedCrowd,
                isTryOut: execution.TryOut,
                artistImageUrl: performance.imageUrl || company?.imageUrl || null,
                safetyInfo: {
                    wheelchairAccessible: location.isWheelchairAccessible,
                    suitableForChildren: performance.isChildFriendly,
                    dutchLanguage: performance.isDutchLanguage,
                    englishLanguage: performance.isEnglishLanguage,
                    dialogueFree: performance.isDialogueFree,
                    diningFacility: location.hasDining,
                    hasNGT: execution.hasNgt,
                },
                marketingVoorstellingNL: marketingInfo.VoorstellingstekstNL,
                marketingVoorstellingENG: marketingInfo.VoorstellingstekstENG,
                marketingBioNL: marketingInfo.BioNL,
                marketingBioENG: marketingInfo.BioENG,
                marketingAfbeelding1: marketingInfo.Afbeelding1,
                marketingAfbeelding2: marketingInfo.Afbeelding2,
                marketingCredits: marketingInfo.Credits,
                similarRaw: performance.LijktOp || [],
                differentRaw: performance.LijktNietOp || [],
                nearbyLocationId: location.InDeBuurt || null,
            });
        });
    });

    // 2. Voorstellingen zonder uitvoering ("Algemeen")
    visiblePerformances.forEach(perf => {
        const linkedEventIds = Array.isArray(perf.eventIds) ? perf.eventIds : [];
        linkedEventIds.forEach(eventId => {
            const eventDoc = visibleEventsMap.get(String(eventId));
            if (!eventDoc) return;
            if (performanceEventPairsWithExecutions.has(`${eventId}-${perf.id}`)) return;

            const company = companiesMap.get(String(perf.companyId));
            const marketingInfo = marketingMap.get(String(perf.id)) || {};

            allParsedData.push({
                id: `general-${perf.id}-${eventId}`,
                eventId: String(eventDoc.id),
                originalPerformanceId: String(perf.id),
                locationId: 'general',
                date: 'Algemeen',
                time: null,
                artist: company?.Name ?? 'Onbekend',
                title: perf.Title,
                location: 'Zie info',
                url: perf.meerInfoUrl,
                event: eventDoc.Name,
                googleMapsUrl: null,
                pwycLink: perf.pwycLink,
                mapNumber: null,
                mapImageUrl: eventDoc.mapUrl,
                genre: perf.genre,
                isCalmRoute: false,
                crowdLevel: null,
                isTryOut: false,
                artistImageUrl: perf.imageUrl || company?.imageUrl || null,
                safetyInfo: {
                    wheelchairAccessible: false,
                    diningFacility: false,
                    suitableForChildren: perf.isChildFriendly,
                    dutchLanguage: perf.isDutchLanguage,
                    englishLanguage: perf.isEnglishLanguage,
                    dialogueFree: perf.isDialogueFree,
                    hasNGT: false,
                },
                marketingVoorstellingNL: marketingInfo.VoorstellingstekstNL,
                marketingVoorstellingENG: marketingInfo.VoorstellingstekstENG,
                marketingBioNL: marketingInfo.BioNL,
                marketingBioENG: marketingInfo.BioENG,
                marketingAfbeelding1: marketingInfo.Afbeelding1,
                marketingAfbeelding2: marketingInfo.Afbeelding2,
                marketingCredits: marketingInfo.Credits,
                similarRaw: perf.LijktOp || [],
                differentRaw: perf.LijktNietOp || [],
                nearbyLocationId: null,
            });
        });
    });

    // 3. Verberg voorstellingen die meer dan 45 min geleden zijn afgelopen.
    const cutoffTime = new Date(Date.now() - 45 * 60 * 1000);
    const filtered = allParsedData.filter(item => {
        if (item.date === 'Algemeen') return true;
        if (!item.date || !item.time || item.date === 'N/A' || item.time === 'N/A') return true;
        const perfDate = parseDateForSorting(item.date);
        if (isNaN(perfDate.getTime())) return true;
        const [h, m] = item.time.split(':');
        perfDate.setHours(h, m, 0, 0);
        return perfDate >= cutoffTime;
    });

    // 4. Sorteer unieke events op vroegste startdatum.
    const uniqueEvents = visibleEvents
        .map(e => e.Name)
        .sort((a, b) =>
            (parseDateForSorting(eventInfoMap[a]?.dateString) || 0) -
            (parseDateForSorting(eventInfoMap[b]?.dateString) || 0)
        );

    return {
        performances: filtered,
        eventInfoMap,
        uniqueEvents,
        routes: parsedRoutes,
        notifications: parsedNotifications,
    };
}
