const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const inspectionsController = require('../controllers/inspections.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validator');
const { validateObjectId } = require('../middleware/validateObjectId');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', inspectionsController.getInspections);
router.post(
  '/',
  authorize(ROLES.ADMIN),
  [
    body('application').notEmpty().withMessage('Application ID is required'),
    body('inspector').notEmpty().withMessage('Inspector ID is required'),
    body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  ],
  validate,
  inspectionsController.createInspection
);
router.get('/:id', validateObjectId('id'), inspectionsController.getInspection);
router.put('/:id', validateObjectId('id'), authorize(ROLES.ADMIN, ROLES.INSPECTOR), inspectionsController.updateInspection);
router.post('/:id/checkin', validateObjectId('id'), authorize(ROLES.INSPECTOR), inspectionsController.checkIn);
router.post('/:id/checklist', validateObjectId('id'), authorize(ROLES.INSPECTOR), inspectionsController.submitChecklist);

module.exports = router;
