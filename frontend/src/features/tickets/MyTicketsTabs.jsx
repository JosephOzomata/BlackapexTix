import { Tabs } from "../../components/common/Tabs";

export function MyTicketsTabs({ value, onChange, counts = {} }) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      items={[
        { value: "upcoming", label: "Upcoming", count: counts.upcoming },
        { value: "past", label: "Past", count: counts.past },
        { value: "all", label: "All", count: counts.all },
      ]}
    />
  );
}

export default MyTicketsTabs;