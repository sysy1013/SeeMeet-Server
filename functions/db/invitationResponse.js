const _ = require('lodash');
const converSnakeToCamel = require('../lib/convertSnakeToCamel');

const responseInvitation = async (client, userId, invitationId, invitationDateIds) => {
  const responseRows = [];

  for (let invitationDateId of invitationDateIds) {
    const { rows } = await client.query(
      `
        INSERT INTO "invitation_response" (invitation_id, guest_id, invitation_date_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [invitationId, userId, invitationDateId],
    );

    rows[0].responseId = rows[0].id;
    delete rows[0].id;
    const { rows: dateRows } = await client.query(
      `
       SELECT * FROM "invitation_date"
       WHERE id = $1
      `,
      [invitationDateId],
    );

    rows[0].invitationDate = dateRows[0];
    responseRows.push(rows[0]);
  }

  return converSnakeToCamel.keysToCamel(responseRows);
};

module.exports = { responseInvitation };
