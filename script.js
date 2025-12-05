/* -------------------------
   1. Firebase 초기 설정
-------------------------- */

// 여기에 Firebase 콘솔에서 복사한 config 붙여넣기
const firebaseConfig = {
  apiKey: "AIzaSyCo0eAyu6iaqSxd0zCCYKgc9tjrLsJUIvo",
  authDomain: "manitto3-e0164.firebaseapp.com",
  databaseURL: "https://manitto3-e0164-default-rtdb.firebaseio.com",
  projectId: "manitto3-e0164",
  storageBucket: "manitto3-e0164.firebasestorage.app",
  messagingSenderId: "97931219910",
  appId: "1:97931219910:web:4ad27aae6fef4b6024d8c7"
}

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* -------------------------
   2. 모바일 체크
-------------------------- */
if (!/Mobi|Android/i.test(navigator.userAgent)) {
    document.getElementById("mobile-warning").style.display = "block";
    document.getElementById("app").style.display = "none";
}

/* -------------------------
   3. 로그인
-------------------------- */

let myCode = "";
let myName = "";
let myTarget = "";

async function login() {
    myCode = document.getElementById("codeInput").value;

    if (myCode.length !== 4) {
        alert("4자리 코드를 입력하세요.");
        return;
    }

    const doc = await db.collection("participants").doc(myCode).get();

    if (!doc.exists) {
        alert("존재하지 않는 코드입니다.");
        return;
    }

    myName = doc.data().name;
    myTarget = doc.data().matched_to;

    document.getElementById("login-section").style.display = "none";
    document.getElementById("main-section").style.display = "block";
    document.getElementById("welcome").innerText = `${myName}님 환영합니다`;
}

/* -------------------------
   4. 내 마니또 확인
-------------------------- */
function showMatch() {
    const box = document.getElementById("match-section");
    box.style.display = "block";

    if (!myTarget) {
        box.innerHTML = "<b>아직 매칭되지 않았습니다.</b>";
        return;
    }

    box.innerHTML = `<b>당신의 마니또는: ${myTarget}</b>`;
}

/* -------------------------
   5. 메시지함 보기
-------------------------- */
async function showMessages() {
    const box = document.getElementById("messages-section");
    box.style.display = "block";
    
    box.innerHTML = "<b>메시지 불러오는 중...</b>";

    const q1 = db.collection("messages").where("to", "==", myName);
    const q2 = db.collection("messages").where("from", "==", myName);

    const r1 = await q1.get();
    const r2 = await q2.get();

    let html = "<h3>받은 메시지</h3>";
    r1.forEach(doc => {
        html += `<div> - ${doc.data().text}</div>`;
    });

    html += "<h3>보낸 메시지</h3>";
    r2.forEach(doc => {
        html += `<div> - ${doc.data().text}</div>`;
    });

    box.innerHTML = html;
}

/* -------------------------
   6. 메시지 보내기
-------------------------- */
async function sendMessage() {
    if (!myTarget) {
        alert("매칭되지 않아 메시지를 보낼 수 없습니다.");
        return;
    }

    const text = document.getElementById("messageInput").value;

    if (!text.trim()) return;

    await db.collection("messages").add({
        from: myName,
        to: myTarget,
        text: text,
        time: Date.now()
    });

    alert("메시지 전송 완료!");
    document.getElementById("messageInput").value = "";
}

/* -------------------------
   7. 운영자 랜덤 매칭 함수
-------------------------- */

async function runMatching() {
    const snap = await db.collection("participants").get();
    let arr = [];

    snap.forEach(doc => {
        arr.push({ code: doc.id, ...doc.data() });
    });

    let shuffled = [...arr].sort(() => Math.random() - 0.5);

    for (let i = 0; i < arr.length; i++) {
        const giver = arr[i];
        const receiver = shuffled[(i + 1) % arr.length];

        await db.collection("participants").doc(giver.code).update({
            matched_to: receiver.name
        });
    }

    alert("랜덤 매칭 완료!");
}
/* -------------------------
   6-1. 메시지 보내기 화면 열기
-------------------------- */
function showSend() {
    document.getElementById("send-section").style.display = "block";
    document.getElementById("messages-section").style.display = "none";
    document.getElementById("match-section").style.display = "none";
}

