import { z } from "zod";

export const loginSchema = z
  .object({
    role: z.enum(["customer", "supplier"]),
    customerId: z.string().uuid().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.role === "customer" && !value.customerId) {
      ctx.addIssue({
        code: "custom",
        path: ["customerId"],
        message: "Select a customer account.",
      });
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;

export type LoginState = {
  error: string | null;
};
