const express = require('express');
const router = express.Router();

router.get('/list', require('./invitationListGET'));
router.post('/', require('./invitationPOST'));
router.get('/:invitationId', require('./invitationGET'));

module.exports = router;
