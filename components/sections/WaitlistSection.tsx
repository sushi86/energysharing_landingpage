import { SectionReveal } from "@/components/ui/SectionReveal";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { ConsumerForm } from "@/components/forms/ConsumerForm";
import { ProducerForm } from "@/components/forms/ProducerForm";

export function WaitlistSection() {
  return (
    <section id="warteliste" className="bg-primary-pale/40 px-6 py-16 md:py-30">
      <div className="mx-auto max-w-2xl">
        <SectionReveal>
          <h2 className="text-center">Sei dabei — als Einer der Ersten</h2>
          <p className="mt-4 text-center text-lg text-primary-dark/80">
            Trag dich ein — du gehst damit keine Verpflichtung ein. Wir melden uns, wenn es losgeht.
          </p>
        </SectionReveal>

        <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-dark/10 md:p-10">
          <TabSwitcher
            syncWithHash
            tabs={[
              {
                id: "producer",
                label: <span>☀️ Ich habe eine Solaranlage</span>,
                content: <ProducerForm />,
              },
              {
                id: "consumer",
                label: <span>⚡ Ich möchte günstigeren Strom</span>,
                content: <ConsumerForm />,
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
