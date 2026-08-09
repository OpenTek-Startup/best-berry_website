import { Loader2, AlertTriangle, Inbox } from 'lucide-react';

export function Loading({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-ink-500">
      <Loader2 className="animate-spin mb-3" size={28} />
      <p>{label}</p>
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-berry-600">
      <AlertTriangle className="mb-3" size={28} />
      <p className="font-semibold">{message}</p>
    </div>
  );
}

export function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-ink-500">
      <Inbox className="mb-3" size={28} />
      <p>{label}</p>
    </div>
  );
}
