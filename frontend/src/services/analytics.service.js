import { db, delay } from "../mocks/database";
import { ERROR_CODES, makeSuccess, makeError } from "../utils/errorCodes";
import {
  revenueSeries,
  categoryBreakdown,
  checkinProgress,
  organizerOverview,
} from "../mocks/analytics";

export const analyticsService = {
  async organizerOverview(organizerId) {
    await delay(240, 480);
    const stats = organizerOverview(organizerId);
    const series = revenueSeries({ organizerId, days: 30 });

    const recentTransactions = [...db.transactions]
      .filter((t) => {
        const e = db.getEventById(t.eventId);
        return e?.organizerId === organizerId;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    return makeSuccess({ stats, series, recentTransactions });
  },

  async eventAnalytics(organizerId, eventId, { days = 30 } = {}) {
    await delay(260, 520);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);

    return makeSuccess({
      revenue: revenueSeries({ eventId, days }),
      categories: categoryBreakdown(eventId),
      checkin: checkinProgress(eventId),
      stats: event.stats ?? {},
    });
  },
};

export default analyticsService;