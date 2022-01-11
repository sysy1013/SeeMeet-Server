const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getMonth = async (client, userId, month) => {
  const { rows } = await client.query(
    `
    SELECT * FROM plan_user_connection, "user", plan, invitation_data
    WHERE plan_user_connection=user AND plan_user_connection=plan AND invitation_data.id=plan.invitaion_data_id
    "user".id=$1 AND EXTRACT(MONTH FROM inviation_data.date)=$2  
    `,
    [userId, month],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};


//
//숫자로 변환해서,,,20210201<현재값<20210203==month면 허락

module.exports = { getMonth,};