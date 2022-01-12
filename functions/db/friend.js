const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

//친구신청의 경우 일방적으로 내가 다른사람에게 하는것이기 때문에 sender만 받아오기로 함.
const getALLFriendById = async(client,userId)=>{
    const {rows} = await client.query(
        `
        SELECT receiver FROM "friend"
        WHERE sender = $1 AND is_deleted=FALSE
        `,
        [userId]
    )
    return convertSnakeToCamel.keysToCamel(rows);
}
const friendInfo = async(client,userId)=>{
    const {rows}= await client.query
}
//조희의 경우 email을 통해 조회한 email을 통해 user를 검색하는것이기 때문에 아래처럼 작성함.
const searchUser = async(client,email)=>{
    const {rows} = await client.query(
        `
        SELECT * FROM "user" u
        WHERE u.email = $1
        `,
        [email]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

//(친구신청 하는 기능) -> 이건 없어진 기능.. 나중에 사용 가능성있기에 삭제 안함.
const requestAddFriend = async(client,userId,receiver)=>{
    const { rows } = await client.query(
        `
        INSERT INTO "friend"
        (sender,receiver)
        VALUES
        ($1, $2)
        RETURNING *
        `,
        [userId,receiver],
    )
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

//이메일을 입력받았을때 어떤 사람이 친구신청을 보냈는지 알기위해 만든 api (재사용 가능)
const findreceiver = async(client, email)=>{
    const {rows} = await client.query(
        `
        SELECT u.id FROM "user" u
        WHERE u.email = $1
        `,
        [email]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

//(친구 신청이 왔을때 수락하는 기능) -> 이건 없어진 기능.. 나중에 사용 가능성있기에 삭제 안함.
const acceptFriend = async(client,userId,rId)=>{
    const {rows} = await client.query(
        `
        UPDATE "friend"
        SET is_confirm = TRUE, updated_at = now()
        WHERE receiver = $1 AND sender = $2
        RETURNING *
        `,
        [userId,rId],
    )
    return convertSnakeToCamel.keysToCamel(rows[0])
}

//친구 차단 기능
const blockFriend = async (client,userId,rId)=>{
    const {rows} = await client.query(
        `
        UPDATE "friend"
        SET is_deleted = TRUE, updated_at = now()
        WHERE receiver = $1 AND sender = $2
        RETURNING *
        `,
        [userId,rId],
    )
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

const cancelBlockFriend = async (client,userId,rId)=>{
    const {rows} = await client.query(
        `
        UPDATE "friend"
        SET is_deleted = false, updated_at = now()
        WHERE receiver = $1 AND sender = $2
        RETURNING *
        `,
        [userId,rId],
    )
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

module.exports = {getALLFriendById,searchUser,requestAddFriend,findreceiver,acceptFriend,blockFriend,cancelBlockFriend}