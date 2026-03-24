const express = require('express');
const router = express.Router();
const nocController = require('../controllers/noc.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validateObjectId } = require('../middleware/validateObjectId');
const { ROLES } = require('../config/constants');

router.get('/verify/:token', nocController.verifyCertificate);

router.use(authenticate);

router.get('/', nocController.getCertificates);
router.post('/issue/:applicationId', validateObjectId('applicationId'), authorize(ROLES.ADMIN), nocController.issueCertificate);
router.get('/:id', validateObjectId('id'), nocController.getCertificate);
router.put('/:id/revoke', validateObjectId('id'), authorize(ROLES.ADMIN), nocController.revokeCertificate);

module.exports = router;
