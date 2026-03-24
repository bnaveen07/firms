const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const applicationsController = require('../controllers/applications.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validator');
const { validateObjectId } = require('../middleware/validateObjectId');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/stats', authorize(ROLES.ADMIN), applicationsController.getApplicationStats);
router.get('/', applicationsController.getApplications);
router.post(
  '/',
  [
    body('propertyName').trim().notEmpty().withMessage('Property name is required'),
    body('propertyType').notEmpty().withMessage('Property type is required'),
    body('address.street').notEmpty().withMessage('Street address is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.state').notEmpty().withMessage('State is required'),
    body('address.zipCode').notEmpty().withMessage('ZIP code is required'),
  ],
  validate,
  applicationsController.createApplication
);
router.get('/:id', validateObjectId('id'), applicationsController.getApplication);
router.put('/:id', validateObjectId('id'), applicationsController.updateApplication);
router.post('/:id/submit', validateObjectId('id'), applicationsController.submitApplication);
router.put('/:id/review', validateObjectId('id'), authorize(ROLES.ADMIN), applicationsController.reviewApplication);

module.exports = router;
