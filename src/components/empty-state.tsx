import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <div className="mx-auto mb-4 w-fit rounded-full border border-[color:var(--card-border)] p-3">
          <Inbox className="h-5 w-5 text-[color:var(--muted)]" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--muted)]">{description}</p>
        {actionLabel ? (
          <Button className="mt-5" variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
