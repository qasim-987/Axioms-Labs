import { Request, Response, Router } from "express";
import { z } from "zod";
import {
  addFollowupNote,
  getInquiry,
  INQUIRY_STATUSES,
  listInquiries,
  setInquiryStatus,
  verifyStaffToken,
  type StaffIdentity,
} from "../services/staff.service";
import { createRateLimiter } from "../middleware/rateLimiter";

/**
 * Private staff dashboard API. Every route verifies a Supabase Auth JWT and
 * the STAFF_EMAILS allowlist server-side - the frontend gate is UX only.
 */
export const staffRouter = Router();

const staffLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  keyPrefix: "staff_api",
});

async function requireStaff(req: Request, res: Response): Promise<StaffIdentity | null> {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    res.status(401).json({ success: false, code: "unauthorized", error: "Staff sign-in required." });
    return null;
  }
  const identity = await verifyStaffToken(token);
  if (!identity) {
    res.status(401).json({ success: false, code: "unauthorized", error: "Staff sign-in required." });
    return null;
  }
  return identity;
}

const noteSchema = z.object({ body: z.string().trim().min(1).max(2000) });
const statusSchema = z.object({
  status: z.enum(["new", "contacted", "under_discussion", "closed"]),
});

staffRouter.get("/staff/inquiries", staffLimiter, async (req: Request, res: Response) => {
  const identity = await requireStaff(req, res);
  if (!identity) return;
  try {
    res.json({ success: true, inquiries: await listInquiries() });
  } catch (err) {
    console.error(JSON.stringify({ event: "STAFF_LIST_FAILED" }));
    res.status(502).json({ success: false, code: "storage_failed", error: "Could not load inquiries." });
  }
});

staffRouter.get("/staff/inquiries/:id", staffLimiter, async (req: Request, res: Response) => {
  const identity = await requireStaff(req, res);
  if (!identity) return;
  try {
    const detail = await getInquiry(req.params.id);
    if (!detail) {
      res.status(404).json({ success: false, code: "not_found", error: "Inquiry not found." });
      return;
    }
    res.json({ success: true, inquiry: detail });
  } catch (err) {
    console.error(JSON.stringify({ event: "STAFF_DETAIL_FAILED" }));
    res.status(502).json({ success: false, code: "storage_failed", error: "Could not load the inquiry." });
  }
});

staffRouter.post("/staff/inquiries/:id/notes", staffLimiter, async (req: Request, res: Response) => {
  const identity = await requireStaff(req, res);
  if (!identity) return;
  const parsed = noteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, code: "invalid_note", error: "Note text is required (max 2000 chars)." });
    return;
  }
  try {
    await addFollowupNote(req.params.id, identity.email, parsed.data.body);
    console.log(JSON.stringify({ event: "STAFF_NOTE_ADDED", inquiryId: req.params.id, author: identity.email }));
    res.json({ success: true });
  } catch (err) {
    console.error(JSON.stringify({ event: "STAFF_NOTE_FAILED", inquiryId: req.params.id }));
    res.status(502).json({ success: false, code: "storage_failed", error: "Could not save the note." });
  }
});

staffRouter.patch("/staff/inquiries/:id", staffLimiter, async (req: Request, res: Response) => {
  const identity = await requireStaff(req, res);
  if (!identity) return;
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, code: "invalid_status", error: `Status must be one of: ${INQUIRY_STATUSES.join(", ")}.` });
    return;
  }
  try {
    await setInquiryStatus(req.params.id, parsed.data.status);
    console.log(JSON.stringify({ event: "STAFF_STATUS_SET", inquiryId: req.params.id, status: parsed.data.status, author: identity.email }));
    res.json({ success: true, status: parsed.data.status });
  } catch (err) {
    console.error(JSON.stringify({ event: "STAFF_STATUS_FAILED", inquiryId: req.params.id }));
    res.status(502).json({ success: false, code: "storage_failed", error: "Could not update the status." });
  }
});
