import { describe, expect, it } from "vitest";
import { canStartMilestoneCheckout, isVerifiedPayment, CASE_FILES_REVIEW } from "@/lib/revenueMilestone";

describe("first revenue milestone gates", () => {
  it("does not sell an archive before contents and paid download are verified", () => {
    expect(canStartMilestoneCheckout()).toBe(false);
  });
  it("keeps Case Files attached to its existing file and price, not Brick Build", () => {
    expect(CASE_FILES_REVIEW.file).toBe("case-files.zip");
    expect(CASE_FILES_REVIEW.stripePriceId).toBe("price_1TePGgQaKvygaDfu3DJTEJm4");
    expect(CASE_FILES_REVIEW.priceCents).toBe(1500);
  });
  it("requires explicit server paid status rather than a return URL", () => {
    expect(isVerifiedPayment({ paid: false, downloads: [] })).toBe(false);
    expect(isVerifiedPayment({ downloads: [{ file: "case-files.zip", label: "Case Files", url: "https://example.com" }] })).toBe(false);
    expect(isVerifiedPayment(null)).toBe(false);
    expect(isVerifiedPayment({ paid: true, downloads: [] })).toBe(true);
  });
});