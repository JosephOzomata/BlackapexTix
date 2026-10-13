import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Ticket, Mail, Lock, User2, Phone, UserPlus } from "lucide-react";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { FormError } from "../../components/forms/FormError";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";
import { ROLE_HOME } from "../../constants/roles";
import { zEmail, zFullName, zOptionalPhone, zPassword } from "../../utils/validators";

const schema = z
  .object({
    fullName: zFullName,
    email: zEmail,
    phone: zOptionalPhone,
    password: zPassword,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  useSeo({ title: "Create your account" });
  const navigate = useNavigate();
  const toast = useToast();
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ confirmPassword, ...values }) => {
    const res = await signUp(values);
    if (res.success) {
      toast.success("Account created!");
      const role = res.data?.user?.role;
      navigate(ROLE_HOME[role] ?? ROUTES.home, { replace: true });
    } else {
      setError("root", { message: res.message ?? "Could not create account." });
    }
  };

  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Ticket size={20} className="text-white" />
          </span>
          <span className="font-extrabold text-xl">TicketHub</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buy tickets, save events, and access My Tickets.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input
              label="Full name"
              placeholder="e.g. Ada Obi"
              leftIcon={<User2 size={14} />}
              error={errors.fullName?.message}
              required
              {...register("fullName")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={14} />}
              error={errors.email?.message}
              required
              {...register("email")}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+234 800 000 0000"
              leftIcon={<Phone size={14} />}
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              leftIcon={<Lock size={14} />}
              error={errors.password?.message}
              hint="Include an uppercase, lowercase, and number"
              required
              {...register("password")}
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              leftIcon={<Lock size={14} />}
              error={errors.confirmPassword?.message}
              required
              {...register("confirmPassword")}
            />

            {errors.root && <FormError>{errors.root.message}</FormError>}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isSubmitting}
              leftIcon={<UserPlus size={16} />}
            >
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to={ROUTES.login} className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}