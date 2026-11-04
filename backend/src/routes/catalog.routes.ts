import { Router } from "express";
import {
  STUDIO_LOCATIONS,
  STUDIO_SERVICES,
} from "../services/catalog.service";

export const catalogRouter = Router();

catalogRouter.get("/services", (_req, res) => {
  res.status(200).json({
    studio: "Axioms Lab",
    locations: STUDIO_LOCATIONS,
    count: STUDIO_SERVICES.length,
    services: STUDIO_SERVICES,
  });
});
