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
  const { year, month } = req.params;
  if (!year || !month) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;
  
  try {
    client = await db.connect(req);
    const decodedToken=jwtHandlers.verify(accesstoken);
    const userId=decodedToken.id;
    if (!userId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    const plan = await planDB.get2MonthPlan(client, userId, parseInt(year), parseInt(month));
    var alpha=parseInt(month)+1
    
    if(month==12){
      alpha=1
    }
    const plan2 = await planDB.get3MonthPlan(client, userId, parseInt(year), parseInt(alpha));

    const data = [
        ...plan,
        ...plan2,
    
      ];
    if (!plan) return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_POST));
    
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ONE_POST_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};