const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { invitationDB } = require('../../../db');

module.exports = async (req, res) => {
  const userId = req.get('userId');
  const { guestIds, invitationTitle, invitationDesc, date, start, end } = req.body;

  if (!guestIds || !invitationTitle || !invitationDesc || !date || !start || !end) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  if (!(date.length == start.length) && !(date.length == end.length)) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const data = await invitationDB.createInvitation(client, userId, guestIds, invitationTitle, invitationDesc, date, start, end);
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_USERS_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
