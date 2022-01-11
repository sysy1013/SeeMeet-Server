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

    row.guests = values;
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

module.exports = { getAllInvitation, createInvitation };
