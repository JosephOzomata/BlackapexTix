import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Building2, Mail, Phone, Globe } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Textarea } from "../../components/common/Textarea";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { FormError } from "../../components/forms/FormError";
import { organizersService } from "../../services/organizers.service";
import { useToast } from "../../hooks/useToast";
import { useSeo } from "../../hooks/useSeo";
import { queryKeys } from "../../queryClient";

const schema = z.object({
  businessName: z.string().min(2, "Business name is required").max(120),
  description: z.string().max(800).optional().or(z.literal("")),
  contactEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  contactPhone: z.string().max(30).optional().or(z.literal("")),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

export default function OrganizerProfilePage() {
  useSeo({ title: "Organizer Profile" });
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["organizer", "me"],
    queryFn: () => organizersService.getMyProfile(),
  });
  const org = data?.data?.organizer;

  const form = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (org) form.reset(org);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.id]);

  const update = useMutation({
    mutationFn: (values) => organizersService.updateMyProfile(values),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Profile updated");
        queryClient.invalidateQueries({ queryKey: ["organizer", "me"] });
      } else {
        form.setError("root", { message: res.message });
      }
    },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Organizer Profile"
        subtitle="Your public organizer identity on TicketHub."
        actions={
          org?.status === "VERIFIED" ? (
            <Badge tone="success">Verified</Badge>
          ) : (
            <Badge tone="warning">{org?.status ?? "Pending"}</Badge>
          )
        }
      />

      <form onSubmit={form.handleSubmit((v) => update.mutate(v))} className="space-y-6">
        <Card>
          <CardHeader
            title="Business information"
            subtitle="This appears on your public organizer page."
            icon={<Building2 size={18} />}
          />
          <CardBody className="space-y-4">
            <Input
              label="Business name"
              error={form.formState.errors.businessName?.message}
              required
              {...form.register("businessName")}
            />
            <Textarea
              label="Description"
              rows={4}
              showCount
              maxLength={800}
              error={form.formState.errors.description?.message}
              {...form.register("description")}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Contact" subtitle="How customers and the platform reach you." />
          <CardBody className="space-y-4">
            <Input
              label="Email"
              type="email"
              leftIcon={<Mail size={14} />}
              error={form.formState.errors.contactEmail?.message}
              {...form.register("contactEmail")}
            />
            <Input
              label="Phone"
              type="tel"
              leftIcon={<Phone size={14} />}
              error={form.formState.errors.contactPhone?.message}
              {...form.register("contactPhone")}
            />
            <Input
              label="Website"
              leftIcon={<Globe size={14} />}
              error={form.formState.errors.website?.message}
              {...form.register("website")}
            />
          </CardBody>
        </Card>

        {form.formState.errors.root && (
          <FormError>{form.formState.errors.root.message}</FormError>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={update.isPending} leftIcon={<Save size={14} />}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}