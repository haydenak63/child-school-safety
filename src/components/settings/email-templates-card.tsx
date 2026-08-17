import { Card } from "@/components/ui/primitives";
import { listEmailTemplates } from "@/lib/email/templates";

export function EmailTemplatesCard() {
  const templates = listEmailTemplates();

  return (
    <Card radius="tight" className="p-4 sm:rounded-[var(--radius)] sm:p-6">
      <h2 className="text-[15px] font-semibold">Email templates</h2>
      <p className="mt-1 text-[12px] text-ink-muted">
        Halo sends these transactional messages. Copy is branded and not edited here.
      </p>
      <ul className="mt-4 divide-y divide-line">
        {templates.map((template) => (
          <li key={template.id} className="py-3 first:pt-0 last:pb-0">
            <p className="text-[13px] font-semibold">{template.name}</p>
            <p className="mt-1 text-[12px] leading-5 text-ink-muted">{template.description}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
