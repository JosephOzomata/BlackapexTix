import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, Send } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Input } from "../../components/common/Input";
import { Textarea } from "../../components/common/Textarea";
import { Button } from "../../components/common/Button";
import { FormError } from "../../components/forms/FormError";
import { useToast } from "../../hooks/useToast";
import { useSeo } from "../../hooks/useSeo";
import { APP } from "../../constants/config";
import { zEmail, zFullName } from "../../utils/validators";

const schema = z.object({
  fullName: zFullName,
  email: zEmail,
  subject: z.string().min(4, "Add a short subject").max(120),
  message: z.string().min(20, "Please give us a bit more detail").max(2000),
});

export default function ContactPage() {
  useSeo({ title: "Contact" });
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Message sent — we'll be in touch shortly.");
    reset();
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        subtitle="Questions, feedback, or press — we'd love to hear from you."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-border bg-card p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full name"
              required
              error={errors.fullName?.message}
              {...register("fullName")}
            />
            <Input
              label="Email"
              type="email"
              required
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
          <Input
            label="Subject"
            required
            error={errors.subject?.message}
            {...register("subject")}
          />
          <Textarea
            label="Message"
            rows={6}
            required
            showCount
            maxLength={2000}
            error={errors.message?.message}
            {...register("message")}
          />
          {errors.root && <FormError>{errors.root.message}</FormError>}
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting} rightIcon={<Send size={14} />}>
              Send message
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Direct contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Support</p>
                  <a
                    href={`mailto:${APP.supportEmail}`}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {APP.supportEmail}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${APP.supportPhone}`}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {APP.supportPhone}
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}