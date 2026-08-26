import { Badge } from "./Badge";

export function AuditTimeline({ events = [], loading }) {
  if (loading) return <p className="text-sm text-slate-500">Loading timeline...</p>;
  if (!events.length) return <p className="text-sm text-slate-500">No audit events recorded.</p>;

  return (
    <ol className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="relative border-l-2 border-slate-200 pl-4">
          <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-indigo-500" />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{event.action}</Badge>
            <span className="text-xs text-slate-500">
              {event.createdAt ? new Date(event.createdAt).toLocaleString() : "—"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-700">
            {event.actorEmail || event.actorId || "System"}
            {event.aggregateType && ` · ${event.aggregateType}`}
            {event.aggregateId && ` #${event.aggregateId.slice(0, 8)}`}
          </p>
          {event.reason && <p className="mt-1 text-xs text-slate-500">{event.reason}</p>}
        </li>
      ))}
    </ol>
  );
}
