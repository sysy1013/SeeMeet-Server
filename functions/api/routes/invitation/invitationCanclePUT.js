const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { invitationDB } = require('../../../db');
const { send } = require('../../../lib/slack');

module.exports = async (req, res) => {
  const { invitationId } = req.params;

  if (!invitationId) {
    await send(`
      req.originalURL: ${req.originalUrl}
      invitationId: ${invitationId}
    `);
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);
    const invitation = await invitationDB.getInvitationById(client, invitationId);
    if (!invitation) return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_INVITATION));
    if (invitation.isConfirmed || invitation.isCancled) {
      await send(`
        req.originalURL: ${req.originalUrl}
        isConfirmed: ${invitation.isConfirmed}
        isCancled: ${invitation.isCancled}
      `);
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_CONFIRM));
    }
    const data = await invitationDB.cancleInvitation(client, invitationId);
    if (!data) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVITATION_CANCLE_FAIL));
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.INVITATION_CANCLE_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    await send(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
