/**
 * Scanner assignments. Scanner permission is EVENT-SPECIFIC — a scanner
 * for event A does not automatically gain access to event B.
 */
const scanners = [
  {
    id: "scn_9001",
    eventId: "evt_3001",
    scannerUserId: "usr_2001",
    scannerEmail: "scanner1@tickethub.ng",
    scannerName: "Kelechi Nnamdi",
    invitedByUserId: "usr_1002",
    status: "ACTIVE",
    invitedAt: "2026-01-05T10:00:00.000Z",
    acceptedAt: "2026-01-05T12:30:00.000Z",
    checkInsCount: 47,
    lastActiveAt: "2026-02-14T23:45:00.000Z",
  },
  {
    id: "scn_9002",
    eventId: "evt_3001",
    scannerUserId: "usr_2002",
    scannerEmail: "scanner2@tickethub.ng",
    scannerName: "Bola Adeyemi",
    invitedByUserId: "usr_1002",
    status: "ACTIVE",
    invitedAt: "2026-01-05T10:00:00.000Z",
    acceptedAt: "2026-01-05T13:00:00.000Z",
    checkInsCount: 22,
    lastActiveAt: "2026-02-14T23:50:00.000Z",
  },
  {
    id: "scn_9003",
    eventId: "evt_3008",
    scannerUserId: "usr_2001",
    scannerEmail: "scanner1@tickethub.ng",
    scannerName: "Kelechi Nnamdi",
    invitedByUserId: "usr_1002",
    status: "ACTIVE",
    invitedAt: "2025-12-20T10:00:00.000Z",
    acceptedAt: "2025-12-20T11:00:00.000Z",
    checkInsCount: 380,
    lastActiveAt: "2026-01-01T05:30:00.000Z",
  },
  {
    id: "scn_9004",
    eventId: "evt_3006",
    scannerUserId: "usr_2002",
    scannerEmail: "scanner2@tickethub.ng",
    scannerName: "Bola Adeyemi",
    invitedByUserId: "usr_1002",
    status: "INVITED",
    invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: null,
    checkInsCount: 0,
    lastActiveAt: null,
  },
];

export default scanners;