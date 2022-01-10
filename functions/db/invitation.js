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

module.exports = { getAllInvitation };
