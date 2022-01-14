const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const jwtHandlers = require('../../../lib/jwtHandlers');
const { invitationDB } = require('../../../db');

module.exports = async (req, res) => {
  const { invitationId } = req.params;
  const { accesstoken } = req.headers;

  if (!invitationId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  const decodedToken = jwtHandlers.verify(accesstoken);
  const userId = decodedToken.id;

  try {
    client = await db.connect(req);

    const host = await invitationDB.getHostByInvitationId(client, invitationId);
    if (!host) return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_INVITATION));
    const guests = await invitationDB.getGuestByInvitationId(client, invitationId);
    if (host.id == userId) {
      const data = await invitationDB.getInvitationSentById(client, host, guests, invitationId);
      if (!data) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.READ_INVITATION_FAIL));
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_USERS_SUCCESS, data));
    } else {
      const response = await invitationDB.getResponseByUserId(client, userId, invitationId);
      let isResponse = false;
      if (response.length > 0) {
        isResponse = true;
      }
      const data = await invitationDB.getInvitationReceivedById(client, userId, invitationId, isResponse);
      if (!data) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.READ_INVITATION_FAIL));
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_USERS_SUCCESS, { isResponse, ...data, guests }));
    }
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
