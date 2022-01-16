const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { planDB } = require('../../../db');
const jwtHandlers=require('../../../lib/jwtHandlers');
module.exports = async (req, res) => {
  //let userId=req.get("id");
  const{accesstoken}=req.headers;
  const { planId } = req.params;
  if (!planId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;
  
  try {
    client = await db.connect(req);
    /*
    const decodedToken=jwtHandlers.verify(accesstoken);
    const userId=decodedToken.id;
    */
    const plan = await planDB.getDetailPlan(client, planId);

    if (!plan) return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_POST));

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ONE_POST_SUCCESS, plan));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};