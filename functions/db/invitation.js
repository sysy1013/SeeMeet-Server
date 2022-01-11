const _ = require('lodash');
const converSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllInvitation = async (client, userId) => {
  const { rows } = await client.query(
    `
            SELECT * FROM "invitation" i
            WHERE host_id = $1 
            AND is_deleted = FALSE
            AND is_confirmed = FALSE
        `,
    [userId],
  );
  console.log(rows);
  let newRows;

  for (let row of rows) {
    let id = row.id;

    const { rows: guestIdRows } = await client.query(
      `
            SELECT guest_id FROM "invitation_user_connection"
            WHERE invitation_id = $1
        `,
      [id],
    );

    // console.log(guestRows);
    let values = [];
    for (let r of guestIdRows) {
      //   console.log(r);
      let id = r.guest_id;
      const { rows: guest } = await client.query(
        `
                SELECT id, username FROM "user"
                WHERE id = $1
                AND is_deleted = FALSE
            `,
        [id],
      );

      values.push(guest[0]);
    }

    console.log(values);

    row.guests = values;
  }

  const { rows: confirmedRows } = await client.query(
    `
        SELECT id, invitation_title, is_cancled FROM "invitation"
        WHERE host_id = $1
        AND is_confirmed = true
        AND is_deleted = false
      `,
    [userId],
  );

  for (let row of confirmedRows) {
    let id = row.id;

    const { rows: guestIdRows } = await client.query(
      `
            SELECT guest_id FROM "invitation_user_connection"
            WHERE invitation_id = $1
        `,
      [id],
    );

    // console.log(guestRows);
    let values = [];
    for (let r of guestIdRows) {
      //   console.log(r);
      let id = r.guest_id;
      const { rows: guest } = await client.query(
        `
                SELECT id, username FROM "user"
                WHERE id = $1
                AND is_deleted = FALSE
            `,
        [id],
      );

      values.push(guest[0]);
    }

    const { rows: planRows } = await client.query(
      `
      SELECT plan.id FROM "plan", "invitation_date"
      WHERE invitation_date.id = plan.invitation_date_id
      AND invitation_date.invitation_id=$1
      `,
      [id],
    );

    row.guests = values;
    row.planId = planRows[0].id;
  }

  const data = { invitations: rows, confirmedAndCanceld: confirmedRows };

  return converSnakeToCamel.keysToCamel(data);
};

const createInvitation = async (client, userId, guestIds, invitationTitle, invitationDesc, date, start, end) => {
  const { rows } = await client.query(
    `
      INSERT INTO "invitation" (host_id, invitation_title, invitation_desc, created_at)
      VALUES ($1, $2, $3, now())
      RETURNING *
      `,
    [userId, invitationTitle, invitationDesc],
  );

  const invitationId = rows[0].id;
  console.log('rows.id' + rows[0].id);
  const userRows = [];
  for (let guestId of guestIds) {
    const { rows } = await client.query(
      `
      INSERT INTO "invitation_user_connection" (invitation_id, guest_id)
      VALUES ($1, $2)
      `,
      [invitationId, guestId],
    );

    const { rows: guestRows } = await client.query(
      `
      SELECT id, username FROM "user"
      WHERE id = $1
      AND is_deleted = FALSE
      `,
      [guestId],
    );
    userRows.push(guestRows);
  }

  const invitationDates = [];
  for (let i = 0; i < date.length; i++) {
    let curDate = date[i];
    let curStart = start[i];
    let curEnd = end[i];
    const { rows: dateRows } = await client.query(
      `
      INSERT INTO "invitation_date" (invitation_id, "date", "start", "end")
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [invitationId, curDate, curStart, curEnd],
    );
    invitationDates.push(dateRows);
  }

  const data = { ...rows[0], guests: userRows, invitationDates: invitationDates };

  return converSnakeToCamel.keysToCamel(data);
};

const getInvitationById = async (client, userId, invitationId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "invitation"
    WHERE id=$1
    AND is_deleted=FALSE
    `,
    [invitationId],
  );

  const newRows = converSnakeToCamel.keysToCamel(rows[0]);

  const { rows: hostRows } = await client.query(
    `
    SELECT id, username FROM "user"
    WHERE id = $1
    AND is_deleted=FALSE
    `,
    [userId],
  );
  newRows.host = hostRows[0];
  const hostId = newRows.hostId;
  delete newRows.hostId;

  const { rows: guestIdRows } = await client.query(
    `
    SELECT guest_id FROM "invitation_user_connection"
    WHERE invitation_id = $1
    `,
    [invitationId],
  );

  const newGuestIdRows = converSnakeToCamel.keysToCamel(guestIdRows);
  const guests = [];

  //보낸 요청 조회
  if (hostId == userId) {
    for (let row of newGuestIdRows) {
      const guestId = row.guestId;
      const { rows: guestRows } = await client.query(
        `
          SELECT id, username FROM "user"
          WHERE id = $1
          `,
        [guestId],
      );

      guests.push(guestRows[0]);
    }

    for (let guest of guests) {
      let guestId = guest.id;
      const { rows: responseRows } = await client.query(
        `
        SELECT guest_id FROM "invitation_response"
        WHERE invitation_id = $1
        AND guest_id = $2
        `,
        [invitationId, guestId],
      );
      if (responseRows.length > 0) {
        guest.isResponse = true;
      } else {
        guest.isResponse = false;
      }
    }

    newRows.guests = guests;
    const { rows: dateRows } = await client.query(
      `
      SELECT * FROM "invitation_date"
      WHERE invitation_id = $1
      `,
      [invitationId],
    );

    for (let row of dateRows) {
      let dateId = row.id;
      const { rows: responseRows } = await client.query(
        `
        SELECT "user".id, username FROM "invitation_response", "user"
        WHERE "user".id = invitation_response.guest_id 
        AND invitation_response.invitation_id=$1 
        AND invitation_response.invitation_date_id = $2
        `,
        [invitationId, dateId],
      );
      row.respondent = responseRows;
    }

    const data = { invitation: newRows, invitationDates: dateRows };

    return converSnakeToCamel.keysToCamel(data);
  } else {
    //받은 요청 조회

    const { rows: dateRows } = await client.query(
      `
          SELECT * FROM "invitation_date"
          WHERE invitation_id = $1
          `,
      [invitationId],
    );

    const data = { invitation: newRows, guests, invitationDates: dateRows };

    return converSnakeToCamel.keysToCamel(data);
  }
};

module.exports = { getAllInvitation, createInvitation, getInvitationById };
