const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const incidentsController = require('../controllers/incidents.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validator');
const { validateObjectId } = require('../middleware/validateObjectId');
const { ROLES, INCIDENT_SEVERITY } = require('../config/constants');

router.use(authenticate);

router.get('/stats', incidentsController.getIncidentStats);
router.get('/', incidentsController.getIncidents);
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('severity').isIn(Object.values(INCIDENT_SEVERITY)).withMessage('Invalid severity'),
    body('location.coordinates.lat').isNumeric().withMessage('Latitude is required'),
    body('location.coordinates.lng').isNumeric().withMessage('Longitude is required'),
  ],
  validate,
  incidentsController.createIncident
);
router.get('/:id', validateObjectId('id'), incidentsController.getIncident);
router.put('/:id', validateObjectId('id'), authorize(ROLES.ADMIN), incidentsController.updateIncident);
router.post('/:id/updates', validateObjectId('id'), incidentsController.addUpdate);

module.exports = router;
