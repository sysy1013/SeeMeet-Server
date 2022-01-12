const _ = require('lodash');
const convertSnakeToCamel = require("../lib/convertSnakeToCamel");

const deleteUser = async (client,userId)=>{
    const {rows} = await client.query(
        `UPDATE "user" u
        SET is_deleted = TRUE, updated_at = now()
        WHERE id = $1
        RETURNING *
        `,
        [userId],
    )
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

const addUser = async(client, email, username,gender,birth,id_Firebase)=>{
    const {rows} = await client.query(
        `
        INSERT INTO "user" 
        (email,username,gender,birth,id_Firebase)
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [email, username, gender,birth, id_Firebase],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

const getUserByIdFirebase= async (client, idFirebase)=>{
    const {rows}= await client.query(
        `
        SELECT * FROM "user" u
        WHERE id_firebase = $1
        AND is_deleted = FALSE
        `,
        [idFirebase],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserinfoByuserIds = async (client,userIds)=>{
    const{rows}= await client.query(
        `
        SELECT u.id,u.username,u.email FROM "user" u
        WHERE id IN(${userIds.join()})
        AND is_deleted = FALSE
        `,
    );
    return convertSnakeToCamel.keysToCamel(rows);
}
module.exports = {deleteUser,addUser,getUserByIdFirebase,getUserinfoByuserIds};