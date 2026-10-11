import { Router } from 'express';
import { healthController } from '../controllers/HealthController.js';

const router = Router();

router.get('/health', (req, res) => healthController.health(req, res));
router.get('/dev/emails', (req, res) => healthController.getCapturedEmails(req, res));
router.delete('/dev/emails', (req, res) => healthController.clearCapturedEmails(req, res));

export default router;
