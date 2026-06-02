import { z } from "zod";

// Minimal request-boundary validation. The mock "fail" sentinel address is
// allowed so the partial-failure path can be demoed without a real key.
const addressSchema = z
  .string()
  .refine((a) => /^0x[a-fA-F0-9]{40}$/.test(a) || a.toLowerCase().includes("fail"), {
    message: "Invalid EVM address",
  });

export const portfolioBodySchema = z.object({
  wallets: z
    .array(
      z.object({
        address: addressSchema,
        label: z.string().trim().max(40).optional(),
      }),
    )
    .min(1, "Provide at least one wallet"),
  chainIds: z.array(z.number().int().positive()).optional(),
});

export const transactionsQuerySchema = z.object({
  address: addressSchema,
});

export type PortfolioBody = z.infer<typeof portfolioBodySchema>;
