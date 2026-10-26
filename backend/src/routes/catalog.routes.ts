import { Router } from "express";
import {
  generateVendorMatrixCsv,
  VENDOR_PLATFORMS,
} from "../services/catalog.service";

export const catalogRouter = Router();

catalogRouter.get("/vendors", (req, res) => {
  const { vpc, onPrem, hipaa, pqc, sortBy = "latency" } = req.query;

  let filtered = [...VENDOR_PLATFORMS];

  if (vpc === "true") {
    filtered = filtered.filter((v) =>
      v.deploymentModels.includes("Dedicated VPC")
    );
  }
  if (onPrem === "true") {
    filtered = filtered.filter((v) =>
      v.deploymentModels.includes("On-Prem / Self-Hosted")
    );
  }
  if (hipaa === "true") {
    filtered = filtered.filter((v) => v.hipaaCompliant);
  }
  if (pqc === "true") {
    filtered = filtered.filter((v) => v.pqcReady);
  }

  if (sortBy === "latency") {
    filtered.sort((a, b) => a.medianLatencyMs - b.medianLatencyMs);
  } else if (sortBy === "accuracy") {
    filtered.sort(
      (a, b) =>
        Number.parseFloat(b.toolCallingAccuracy) -
        Number.parseFloat(a.toolCallingAccuracy)
    );
  } else if (sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  res.status(200).json({
    count: filtered.length,
    platforms: filtered,
  });
});

catalogRouter.get("/vendors/export.csv", (_req, res) => {
  const csv = generateVendorMatrixCsv(VENDOR_PLATFORMS);
  const dateStamp = new Date().toISOString().slice(0, 10);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="axiom_studio_ai_vendor_matrix_${dateStamp}.csv"`
  );
  res.status(200).send(csv);
});
