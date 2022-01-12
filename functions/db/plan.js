const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getMonthPlan = async (client, userId, year, month) => {
  const { rows } = await client.query(
    `
    SELECT plan.id, i.invitation_title, date, start, invitation_date.end
    FROM plan_user_connection pu, "user" u, plan, invitation_date, invitation i
    WHERE pu.user_id=u.id AND pu.plan_id=plan.id AND invitation_date.id=plan.invitation_date_id 
    AND i.id=invitation_date.invitation_id AND
    pu.user_id=$1 AND EXTRACT(YEAR FROM date)=$2 AND EXTRACT(MONTH FROM date)=$3 AND pu.is_deleted=false
    
    `,
    [userId, year, month],
  );
  
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
    return convertSnakeToCamel.keysToCamel(rows);
  }; 

  const get2MonthPlan = async (client, userId, year, month) => {
    const { rows } = await client.query(
      `
      SELECT plan.id, i.invitation_title, date
      FROM plan_user_connection pu, "user" u, plan, invitation_date, invitation i
      WHERE pu.user_id=u.id AND pu.plan_id=plan.id AND invitation_date.id=plan.invitation_date_id 
      AND i.id=invitation_date.invitation_id AND pu.user_id=$1 
      AND EXTRACT(YEAR FROM date)=$2 AND EXTRACT(MONTH FROM date)=$3  
      AND pu.is_deleted=false
      ORDER BY date 
      `,
      [userId, year, month],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  };
  
  const get3MonthPlan = async (client, userId, year, month) => {
    const { rows } = await client.query(
      `
      SELECT plan.id, i.invitation_title, date, start, invitation_date.end
      FROM plan_user_connection pu, "user" u, plan, invitation_date, invitation i
      WHERE pu.user_id=u.id AND pu.plan_id=plan.id AND invitation_date.id=plan.invitation_date_id 
      AND i.id=invitation_date.invitation_id AND pu.user_id=$1 
      AND EXTRACT(YEAR FROM date)=$2 AND EXTRACT(MONTH FROM date)=$3  
      AND pu.is_deleted=false
      ORDER BY date 
      `,
      [userId, year, month],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  };


const getDetailPlan = async (client,  planId) => {
  const { rows } = await client.query(
    `
    SELECT plan.id AS planId, i.id As invitationId, i.invitation_title, i.invitation_desc, date, start, invitation_date.end, i.host_id
    FROM plan, invitation_date, invitation i
    WHERE plan.invitation_date_id=invitation_date.id AND i.id=invitation_date.invitation_id
    AND plan.id=$1
    `,
    [planId],
  );
  //let values = [];
    for (let r of rows) {
      let id = r.invitationid;
      const { rows: user } = await client.query(
        `
                SELECT iu.guest_id AS user_id, u.username
                FROM invitation_user_connection iu, invitation_response, invitation i, "user" u
                WHERE i.id=iu.invitation_id AND i.id=invitation_response.invitation_id AND u.id=iu.guest_id
                AND i.id=$1 AND invitation_response.impossible=true
            `,
        [id],
      );
      r.impossible = user
    }

    let values2 = [];
    for (let r of rows) {
      //   console.log(r);
      let id = r.planid;

      const { rows: user2 } = await client.query(
        `
        SELECT pu.user_id, u.username
        FROM plan_user_connection pu, plan, "user" u
        WHERE plan.id=pu.plan_id AND plan_id=$1
        AND pu.user_id=u.id 
            `,
        [id],
      );
      r.possible = user2
    }
   
  return convertSnakeToCamel.keysToCamel(rows[0]);
}; 


const getDatePlan = async (client, userId, dateId) => {
  // 참여자 userid도 제외했는가?
  const { rows:dateRow } = await client.query(
    `
    SELECT date
    FROM invitation_date
    WHERE id=$1
    `,
    [dateId],
  );
  const date=Object.values(dateRow[0])[0]

  const { rows } = await client.query(
    `
    SELECT i.invitation_title, start, invitation_date.end, plan.id AS planId
    FROM invitation_date, invitation i, plan, plan_user_connection pu
    WHERE invitation_date.date=$1 AND i.id=invitation_date.invitation_id AND invitation_date.id=plan.invitation_date_id
    AND pu.plan_id=plan.id AND pu.user_id=$2
    `,
    [date, userId],
  );

  for (let r of rows) {
    //   console.log(r);
    let id = r.planid;
    const { rows: user } = await client.query(
      `
      SELECT pu.user_id, u.username
      FROM plan_user_connection pu, plan, "user" u
      WHERE plan.id=pu.plan_id AND plan_id=$1
      AND pu.user_id=u.id 
      EXCEPT
      SELECT pu.user_id, u.username
      FROM plan_user_connection pu, plan, "user" u
      WHERE plan.id=pu.plan_id AND plan_id=$1
      AND pu.user_id=u.id AND u.id=$2
      `,
      [id, userId],
    );
    r.users = user
  }
  return convertSnakeToCamel.keysToCamel(rows);
};

const getLastPlan = async (client, userId, date) => {
  const { rows } = await client.query(
    `
    SELECT date
    FROM plan_user_connection pu, plan, invitation_date
    WHERE pu.user_id=$1
    AND invitation_date.id=plan.invitation_date_id AND plan.id=pu.plan_id AND date<=$2 AND pu.is_deleted=false
    ORDER BY date 
    `,
    [userId, date],
  );
  
  if(rows.length==0){
    return convertSnakeToCamel.keysToCamel(rows);
  }
  return convertSnakeToCamel.keysToCamel(rows[rows.length-1]);
};


module.exports = { getMonthPlan, getDetailPlan, getDatePlan, getLastPlan, get2MonthPlan, get3MonthPlan};