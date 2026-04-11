import { Router } from "express"
import { healthCheck, ping } from "../controllers/healthcheck.controller.js"

const router = Router()

router.route("/").get(healthCheck)
router.route("/ping").get(ping)
export default router
