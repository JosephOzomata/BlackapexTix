const now = Date.now();
const ago = (mins) => new Date(now - mins * 60 * 1000).toISOString();

const notifications = [
  {
    id: "ntf_8001",
    userId: "usr_3001",
    type: "PAYMENT_CONFIRMED",
    title: "Payment confirmed",
    message: "Your payment for ECLIPSE — Beach Rave was confirmed. Tickets are ready.",
    link: "/my-tickets",
    read: false,
    createdAt: ago(30),
  },
  {
    id: "ntf_8002",
    userId: "usr_3001",
    type: "TICKETS_ISSUED",
    title: "Your tickets are ready",
    message: "2 tickets for ECLIPSE — Beach Rave have been issued to your account.",
    link: "/my-tickets",
    read: false,
    createdAt: ago(28),
  },
  {
    id: "ntf_8003",
    userId: "usr_1002",
    type: "TICKET_SALES_MILESTONE",
    title: "Sales milestone reached",
    message: "ECLIPSE — Beach Rave just crossed 500 tickets sold.",
    link: "/organizer/events/evt_3001",
    read: false,
    createdAt: ago(120),
  },
  {
    id: "ntf_8004",
    userId: "usr_2002",
    type: "SCANNER_INVITED",
    title: "New scanner invitation",
    message: "You've been invited to scan Comedy Untamed on 14 March.",
    link: "/scanner",
    read: false,
    createdAt: ago(2 * 24 * 60),
  },
  {
    id: "ntf_8005",
    userId: "usr_1002",
    type: "EVENT_PUBLISHED",
    title: "Event published",
    message: "Lagos Jazz Nights is now live and visible to customers.",
    link: "/organizer/events/evt_3002",
    read: true,
    createdAt: ago(5 * 24 * 60),
  },
];

export default notifications;