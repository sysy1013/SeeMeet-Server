const express = require('express');
const router = express.Router();

router.post('/:invitationId', require('./invitationResponsePOST'));

module.exports = router;
