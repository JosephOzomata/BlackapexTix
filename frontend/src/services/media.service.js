import { db, delay } from "../mocks/database";
import { ERROR_CODES, makeSuccess, makeError } from "../utils/errorCodes";
import { uid } from "../utils/ids";
import { UPLOADS } from "../constants/config";

/**
 * Media service — simulated flyer uploads.
 */

export const mediaService = {
  async uploadFlyer(file, { eventId, onProgress } = {}) {
    if (!file) return makeError(ERROR_CODES.VALIDATION_ERROR, "No file provided.");
    if (!UPLOADS.acceptedImageTypes.includes(file.type)) {
      return makeError(
        ERROR_CODES.VALIDATION_ERROR,
        "Unsupported file type. Please upload a JPG, PNG, WEBP, or AVIF image."
      );
    }
    if (file.size > UPLOADS.maxFileSizeMb * 1024 * 1024) {
      return makeError(
        ERROR_CODES.VALIDATION_ERROR,
        `File is too large. Maximum size is ${UPLOADS.maxFileSizeMb}MB.`
      );
    }

    const totalDuration = UPLOADS.mockUploadDurationMs;
    const steps = 20;
    const stepMs = Math.floor(totalDuration / steps);
    for (let i = 0; i <= steps; i++) {
      if (onProgress) onProgress(Math.round((i / steps) * 100));
      await new Promise((r) => setTimeout(r, stepMs));
    }

    const objectUrl = URL.createObjectURL(file);

    return makeSuccess({
      id: uid("media"),
      eventId: eventId ?? null,
      url: objectUrl,
      previewUrl: objectUrl,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      isPrimary: false,
      order: 0,
      uploadedAt: new Date().toISOString(),
    });
  },

  async removeFlyer(mediaId, { eventId } = {}) {
    await delay(140, 280);
    return makeSuccess({ mediaId, eventId });
  },

  async setPrimary(organizerId, eventId, mediaId) {
    await delay(160, 320);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    event.media = (event.media ?? []).map((m) => ({
      ...m,
      isPrimary: m.id === mediaId,
    }));
    return makeSuccess({ media: event.media });
  },

  async reorderMedia(organizerId, eventId, orderedIds) {
    await delay(160, 320);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    event.media = orderedIds
      .map((id, index) => {
        const m = event.media.find((x) => x.id === id);
        return m ? { ...m, order: index } : null;
      })
      .filter(Boolean);
    return makeSuccess({ media: event.media });
  },
};

export default mediaService;