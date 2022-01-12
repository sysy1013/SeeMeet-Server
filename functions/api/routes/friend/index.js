const express = require('express');
const router = express.Router();

router.get("/list", require('./friendListGET'));
router.get("/search",require('./friendSearchGET'));
router.post("/addFriend",require('./friendAddPOST'));
router.put("/accept",require('./friendAcceptPUT'));
module.exports = router;