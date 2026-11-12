# Architecture rules
- Use the shared revenue milestone availability gate for new public checkout entry points; Stripe catalog existence alone does not prove fulfillment.
- Keep historical fulfillment separate from new-sale availability, and require explicit server-verified paid status before showing downloads or recording purchases.
- Render Episode 01 through the shared entry episode component on home and Chronicles so missing audio is handled consistently without substituting unrelated samples.