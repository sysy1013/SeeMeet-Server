const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getMonthPlan = async (client, userId, month) => {
  const { rows } = await client.query(
    `
    SELECT plan.id, i.invitation_title, date, start, invitation_date.end
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
    [planId,],
  );
  let values = [];
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
    function comparer(otherArray){
      return function(current){
        return otherArray.filter(function(other){
          return other.value == current.value && other.display == current.display
        }).length == 0;
      }
    }
    
   
  return convertSnakeToCamel.keysToCamel(rows);
}; 


    




module.exports = { getMonthPlan, getDetailPlan};