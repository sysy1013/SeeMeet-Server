const _ = require('lodash');
const { host } = require('../config/dbConfig');
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
  // console.log(rows);
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

    // console.log(values);

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

const createInvitation = async (client, userId, guests, invitationTitle, invitationDesc, date, start, end) => {
  const { rows } = await client.query(
    `
      INSERT INTO "invitation" (host_id, invitation_title, invitation_desc, created_at)
      VALUES ($1, $2, $3, now())
      RETURNING *
      `,
    [userId, invitationTitle, invitationDesc],
  );

  const invitationId = rows[0].id;
  const userRows = [];
  for (let guest of guests) {
    const { rows } = await client.query(
      `
      INSERT INTO "invitation_user_connection" (invitation_id, guest_id)
      VALUES ($1, $2)
      `,
      [invitationId, guest.id],
    );

    const { rows: guestRows } = await client.query(
      `
      SELECT id, username FROM "user"
      WHERE id = $1
      AND is_deleted = FALSE
      `,
      [guest.id],
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

const getGuestByInvitationId = async (client, invitationId) => {
  const { rows } = await client.query(
    `
    SELECT "user".id, "user".username FROM "invitation_user_connection", "user"
    WHERE invitation_user_connection.guest_id = "user".id
    AND invitation_user_connection.invitation_id = $1
    `,
    [invitationId],
  );

  return converSnakeToCamel.keysToCamel(rows);
};

const getHostByInvitationId = async (client, invitationId) => {
  const { rows } = await client.query(
    `
      SELECT "user".id, "user".username FROM "invitation", "user"
      WHERE invitation.host_id = "user".id
      AND invitation.id = $1
      AND invitation.is_deleted = FALSE
    `,
    [invitationId],
  );

  return converSnakeToCamel.keysToCamel(rows[0]);
};

const getInvitationSentById = async (client, host, guests, invitationId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "invitation"
    WHERE id=$1
    AND is_deleted=FALSE
    `,
    [invitationId],
  );

  const newRows = { ...rows[0], host };
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
};

const getInvitationReceivedById = async (client, userId, invitationId, isResponse) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "invitation"
    WHERE id = $1
    AND is_deleted=FALSE
    `,
    [invitationId],
  );
  const { rows: dateRows } = await client.query(
    `
    SELECT * FROM "invitation_date"
    WHERE invitation_id = $1
    `,
    [invitationId],
  );

  const newDateRows = converSnakeToCamel.keysToCamel(dateRows);

  if (!isResponse) {
    return converSnakeToCamel.keysToCamel({ invitation: rows[0], invitationDates: dateRows });
  } else {
    for (let row of newDateRows) {
      let dateId = row.id;
      const { rows: responseRows } = await client.query(
        `
        SELECT * FROM "invitation_response"
        WHERE invitation_date_id = $1
        AND guest_id = $2
        `,
        [dateId, userId],
      );
      if (responseRows.length > 0) {
        row.isSelected = true;
      } else {
        row.isSelected = false;
      }
    }
    return converSnakeToCamel.keysToCamel({ invitation: rows[0], invitationDates: newDateRows });
  }
};

const getResponseByUserId = async (client, userId, invitationId) => {
  const { rows: responseRows } = await client.query(
    `
    SELECT * FROM invitation_response
    WHERE guest_id = $1
    AND invitation_id = $2
    `,
    [userId, invitationId],
  );

  return converSnakeToCamel.keysToCamel(responseRows);
};

const confirmInvitation = async (client, host, invitationId, selectGuests, guests, dateId) => {
  const { rows } = await client.query(
    `
    UPDATE "invitation" 
    SET is_confirmed = true
    WHERE id = $1
    AND is_deleted = false
    RETURNING *
    `,
    [invitationId],
  );

  const newRows = { ...rows[0], host };
  //1. plan에 추가
  const { rows: planRows } = await client.query(
    `
      INSERT INTO plan (invitation_date_id)
      VALUES ($1)
      RETURNING *
      `,
    [dateId],
  );

  const planId = planRows[0].id;
  //2. plan user connection에 해당 guest 추가
  for (let guest of selectGuests) {
    const { rows } = await client.query(
      `
      INSERT INTO "plan_user_connection" (user_id, plan_id)
      VALUES ($1, $2)
      `,
      [guest.id, planId],
    );
  }
  //3. plan user connection에 해당 user 추가
  const { rows: userPlanRows } = await client.query(
    `
    INSERT INTO "plan_user_connection" (user_id, plan_id)
    VALUES ($1, $2)
    `,
    [host.id, planId],
  );
  //4. invitation에 해당하는 guest 중 해당 dateId에 응답안한 유저는 해당 dateId에 impossible을 추가
  for (let guest of guests) {
    const { rows: responseRows } = await client.query(
      `
      SELECT * FROM "invitation_response"
      WHERE guest_id = $1
      AND invitation_date_id = $2
      `,
      [guest.id, dateId],
    );
    if (responseRows.length == 0) {
      const { rows: impossibleUserRows } = await client.query(
        `
          INSERT INTO invitation_response (invitation_id, guest_id, invitation_date_id)
          VALUES ($1, $2, $3)
        `,
        [invitationId, guest.id, dateId],
      );
    }
  }

  const { rows: dateRows } = await client.query(
    `
    SELECT * FROM invitation_date
    WHERE id = $1
    `,
    [dateId],
  );

  const newDateRows = { ...dateRows[0], guest: selectGuests };

  return converSnakeToCamel.keysToCamel({ invitation: newRows, invitationDate: newDateRows, plan: planRows[0] });
};

const cancleInvitation = async (client, invitationId) => {
  const { rows } = await client.query(
    `
    UPDATE "invitation" 
    SET is_cancled = true
    WHERE id = $1
    RETURNING *
    `,
    [invitationId],
  );

  return converSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getAllInvitation,
  createInvitation,
  getHostByInvitationId,
  getGuestByInvitationId,
  getInvitationSentById,
  getInvitationReceivedById,
  getResponseByUserId,
  confirmInvitation,
  cancleInvitation,
};
