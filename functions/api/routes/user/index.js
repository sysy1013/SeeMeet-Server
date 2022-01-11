const express = require('express');
const router = express.Router();


router.delete('/:userId', require('./userDELETE'));
module.exports = router;