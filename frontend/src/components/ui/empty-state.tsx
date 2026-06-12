import { Card, CardContent } from "./card";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        <h3 className="font-semibold text-zinc-950">{title}</h3>
        <p className="mt-2 text-sm text-zinc-500">{message}</p>
      </CardContent>
    </Card>
  );
}

