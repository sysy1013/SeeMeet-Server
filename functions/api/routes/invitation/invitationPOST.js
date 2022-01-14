const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { invitationDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers');

module.exports = async (req, res) => {
  const { accesstoken } = req.headers;
  const { guests, invitationTitle, invitationDesc, date, start, end } = req.body;

  if (!guests || !invitationTitle || !invitationDesc || !date || !start || !end) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  if (!(date.length == start.length) && !(date.length == end.length)) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const decodedToken = jwtHandlers.verify(accesstoken);
    const userId = decodedToken.id;

    if (!userId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

    const invitation = await invitationDB.createInvitation(client, guests, invitationTitle, invitationDesc);
    const invitationId = invitation.id;
    const userConnection = await invitationDB.createInvitationUserConnection(client, invitationId, guests);
    if (userConnection.length == 0) {
      return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER));
    }
    const dates = await invitationDB.createInvitationDate(client, invitationId, date, start, end);
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.INVITATION_SUCCESS, { invitation, guests, dates }));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
