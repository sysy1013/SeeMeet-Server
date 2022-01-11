const express = require('express');
const router = express.Router();

router.get("/:userId/list", require('./friendListGET'));
module.exports = router;