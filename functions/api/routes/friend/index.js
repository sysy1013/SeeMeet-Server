const express = require('express');
const router = express.Router();

router.get("/list", require('./friendListGET'));
router.get("/search",require('./friendSearchGET'));
router.post("/addFriend",require('./friendAddPOST'));
module.exports = router;