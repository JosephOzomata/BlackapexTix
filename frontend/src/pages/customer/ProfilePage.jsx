import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User2, Mail, Phone, Lock, Save } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Avatar } from "../../components/common/Avatar";
import { Card, CardBody, CardHeader } from "../../components/common/Card";
import { Switch } from "../../components/common/Switch";
import { FormError } from "../../components/forms/FormError";
import { customersService } from "../../services/customers.service";
import { useAuthStore } from "../../stores/authStore";
import { useToast } from "../../hooks/useToast";
import { useSeo } from "../../hooks/useSeo";
import { queryKeys } from "../../queryClient";
import { zFullName, zOptionalPhone } from "../../utils/validators";

const profileSchema = z.object({
  fullName: zFullName,
  phone: zOptionalPhone,
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function ProfilePage() {
  useSeo({ title: "Account" });
  const toast = useToast();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);

  const { data } = useQuery({
    queryKey: ["me", "profile"],
    queryFn: () => customersService.getProfile(),
  });
  const user = data?.data?.user;

  const profileForm = useForm({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName ?? "",
        phone: user.phone ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const updateProfile = useMutation({
    mutationFn: (values) => customersService.updateProfile(values),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Profile updated");
        if (user) setUser({ ...user, ...profileForm.getValues() });
        queryClient.invalidateQueries({ queryKey: queryKeys.me });
      } else {
        profileForm.setError("root", { message: res.message });
      }
    },
  });

  const changePassword = useMutation({
    mutationFn: (values) => customersService.changePassword(values),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Password updated");
        passwordForm.reset();
      } else {
        passwordForm.setError("root", { message: res.message });
      }
    },
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Account" subtitle="Manage your profile and security." />

      <Card>
        <CardBody className="pt-5">
          <div className="flex items-center gap-4">
            <Avatar src={user?.avatarUrl} name={user?.fullName} size="xl" />
            <div className="min-w-0">
              <p className="text-lg font-semibold text-foreground truncate">
                {user?.fullName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Profile"
          subtitle="Update your contact details."
          icon={<User2 size={18} />}
        />
        <CardBody>
          <form
            onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))}
            className="space-y-4"
          >
            <Input
              label="Full name"
              leftIcon={<User2 size={14} />}
              error={profileForm.formState.errors.fullName?.message}
              {...profileForm.register("fullName")}
            />
            <Input
              label="Email"
              leftIcon={<Mail size={14} />}
              value={user?.email ?? ""}
              disabled
              hint="Contact support to change your email address."
            />
            <Input
              label="Phone"
              leftIcon={<Phone size={14} />}
              error={profileForm.formState.errors.phone?.message}
              {...profileForm.register("phone")}
            />
            {profileForm.formState.errors.root && (
              <FormError>{profileForm.formState.errors.root.message}</FormError>
            )}
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={updateProfile.isPending}
                leftIcon={<Save size={14} />}
              >
                Save changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Security"
          subtitle="Change your password."
          icon={<Lock size={18} />}
        />
        <CardBody>
          <form
            onSubmit={passwordForm.handleSubmit((v) => changePassword.mutate(v))}
            className="space-y-4"
          >
            <Input
              label="Current password"
              type="password"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register("currentPassword")}
            />
            <Input
              label="New password"
              type="password"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register("newPassword")}
            />
            <Input
              label="Confirm new password"
              type="password"
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register("confirmPassword")}
            />
            {passwordForm.formState.errors.root && (
              <FormError>{passwordForm.formState.errors.root.message}</FormError>
            )}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="outline"
                loading={changePassword.isPending}
              >
                Update password
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Notifications" subtitle="Choose what you'd like to hear about." />
        <CardBody className="space-y-4">
          <Switch
            label="Email notifications"
            description="Order confirmations, ticket updates, and receipts."
            checked={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.checked)}
          />
          <Switch
            label="Push notifications"
            description="Real-time updates for events you've bought tickets to."
            checked={notifyPush}
            onChange={(e) => setNotifyPush(e.target.checked)}
          />
        </CardBody>
      </Card>
    </div>
  );
}