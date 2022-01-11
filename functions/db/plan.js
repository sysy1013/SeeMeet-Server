const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getMonthPlan = async (client, userId, month) => {
  const { rows } = await client.query(
    `
    SELECT plan.id, i.invitation_title, i.invitation_desc, date, start, invitation_date.end, i.host_id
    FROM plan_user_connection pu, "user" u, plan, invitation_date, invitation i
    WHERE pu.user_id=u.id AND pu.plan_id=plan.id AND invitation_date.id=plan.invitation_date_id 
    AND i.id=invitation_date.invitation_id AND
    pu.user_id=$1 AND EXTRACT(MONTH FROM date)=$2 AND pu.is_deleted=false
    
    `,
    [userId, month],
  );
  let values = [];
    for (let r of rows) {
      //   console.log(r);
      let id = r.id;
      const { rows: user } = await client.query(
        `
                SELECT pu.user_id, u.username
                FROM plan_user_connection pu, plan, "user" u
                WHERE plan.id=pu.plan_id AND plan_id=$1
                AND pu.user_id=u.id
            `,
        [id],
      );
      r.users = user
    }
    let values2 = [];
    for (let r2 of rows) {
      //   console.log(r);
      let id = r2.id;
      const { rows: user2 } = await client.query(
        `
                SELECT ir.guest_id, u.username
                FROM plan, invitation_date, invitation, invitation_response ir, "user" u
                WHERE plan.invitation_date_id=invitation_date.id AND invitation_date.invitation_id=invitation.id
                AND invitation.id=ir.invitation_id AND u.id=ir.guest_id
                AND plan.id=$1 AND ir.impossible=true AND invitation_date.id=ir.invitation_date_id
                
            `,
        [id],
      );
      r2.impossible = user2
    }



  return convertSnakeToCamel.keysToCamel(rows);
}; 


module.exports = { getMonthPlan};