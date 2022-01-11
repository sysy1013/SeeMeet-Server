// 필요한 모듈들
const functions = require('firebase-functions'); 
const { Pool, Query } = require('pg');
const dayjs = require('dayjs');
const dotenv = require('dotenv');

// DB Config (유저, 호스트, DB 이름, 패스워드)를 로딩해줍시다.
const dbConfig = require('../config/dbConfig');

dotenv.config(); //dotenv를 사용하기 위한것.

// NODE_ENV라는 글로벌 환경변수를 사용해서, 현재 환경이 어떤 '모드'인지 판별해줍시다.
//local일때 development
let devMode = process.env.NODE_ENV === 'development';


// SQL 쿼리문을 콘솔에 프린트할지 말지 결정해주는 변수를 선언합시다.
// 편의를 위한것. 원래는 안찍어주는데 찍어주는걸 설정해놓은거.
const sqlDebug = true;

// 기본 설정에서는 우리가 실행하게 되는 SQL 쿼리문이 콘솔에 찍히지 않기 때문에,
// pg 라이브러리 내부의 함수를 살짝 손봐서 SQL 쿼리문이 콘솔에 찍히게 만들어 줍시다.
// 아래는 없어도 돌아가지만 sql문을 콘솔에 찍어보기 위한것.
const submit = Query.prototype.submit;
Query.prototype.submit = function () {
    const text = this.text;
    const values = this.values || [];
    const query = text.replace(/\$([0-9]+)/g, (m, v) => JSON.stringify(values[parseInt(v) - 1]));
    // devMode === true 이면서 sqlDebug === true일 때 SQL 쿼리문을 콘솔에 찍겠다는 분기입니다.
    devMode && sqlDebug && console.log(`\n\n[👻 SQL STATEMENT]\n${query}\n_________\n`);
    submit.apply(this, arguments);
};

// 서버가 실행되면 현재 환경이 개발 모드(로컬)인지 프로덕션 모드(배포)인지 콘솔에 찍어줍시다.
console.log(`[🔥DB] ${process.env.NODE_ENV}`);

// 커넥션 풀을 생성해줍니다.
// 커넥션 풀이라는것은 : 클라이언트가 있고 노드 js를 통해서 서버로 가는데, 이때 쿼리를 그냥 요청하면 그다음 clinet 2는 기다려야한다. 이것은 너무 오래걸리기때문에, db와의 연결을 열어놓고 커넥션 풀을 열어서 쿼리를 대여해주고 끝나면 반납하는 형식으로 빠르게 실행시켜준다.

const pool = new Pool({
    ...dbConfig,
    connectionTimeoutMillis: 60 * 1000,
    idleTimeoutMillis: 60 * 1000,
});

// 위에서 생성한 커넥션 풀에서 커넥션을 빌려오는 함수를 정의합니다.
// 기본적으로 제공되는 pool.connect()와 pool.connect().release() 함수에 디버깅용 메시지를 추가하는 작업입니다.
// 그냥 실행은 가능하지만, 얻을수있는건 많이없다.

//let client = pool.connet()
// client.query(`SELECT ~~ `) 했을때 얻어오는 정보가 많지 않음.

const connect = async (req) => {
    const now = dayjs();
    const string =
    !!req && !!req.method
        ? `[${req.method}] ${!!req.user ? `${req.user.id}` : ``} ${req.originalUrl}\n ${!!req.query && `query: ${JSON.stringify(req.query)}`} ${!!req.body && `body: ${JSON.stringify(req.body)}`} ${
            !!req.params && `params ${JSON.stringify(req.params)}`
        }`
        : `request 없음`;
    const callStack = new Error().stack;
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;

    const releaseChecker = setTimeout(() => {
    devMode
        ? console.error('[ERROR] client connection이 15초 동안 릴리즈되지 않았습니다.', { callStack })
        : functions.logger.error('[ERROR] client connection이 15초 동안 릴리즈되지 않았습니다.', { callStack });
    devMode ? console.error(`마지막으로 실행된 쿼리문입니다. ${client.lastQuery}`) : functions.logger.error(`마지막으로 실행된 쿼리문입니다. ${client.lastQuery}`);
  }, 15 * 1000);

    client.query = (...args) => {
        client.lastQuery = args;
        return query.apply(client, args);
    };
    client.release = () => {
    clearTimeout(releaseChecker);
    const time = dayjs().diff(now, 'millisecond');
    if (time > 4000) {
            const message = `[RELEASE] in ${time} | ${string}`;
            devMode && console.log(message);
        }
        client.query = query;
        client.release = release;
        return release.apply(client);
    };
    return client;
};

module.exports = {
    connect,
};