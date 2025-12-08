/* -----------------------------
    요소 선택
----------------------------- */
const akTrigger = document.getElementById('ink-trigger-ak');
const seonChar1 = document.getElementById('선');
const seonChar2 = document.getElementById('선1');
const inkOverlay = document.getElementById('ink-overlay');
const chars = document.querySelectorAll('.char');
const msg = document.getElementById('final-message');
const msg2 = document.getElementById('final-message2');

let gravityMode = false;
let overlayDone = false;

const protectedChars = ['선', '선1'];

/* -----------------------------
    원래 위치 저장
----------------------------- */
chars.forEach(char => {
    const rect = char.getBoundingClientRect();
    char.dataset.origX = rect.left;
    char.dataset.origY = rect.top;
});


/* -----------------------------
    악 클릭 → 오버레이 활성화
----------------------------- */
akTrigger.addEventListener('click', () => {
    // compute seon center so message vertically aligns with the '선' glyph
    const rect = seonChar1.getBoundingClientRect();
    const seonCenterY = rect.top + rect.height / 2;

    msg.style.opacity = 1;
    msg.style.zIndex = 99999;
    msg.style.position = "fixed";
    // put the message just to the right of the seon glyph, vertically centered
    msg.style.left = (rect.right + 40) + "px";
    msg.style.top = (seonCenterY + 10) + "px";

    // use viewport-relative font so GitHub deploy and local scale match better
    msg.style.fontSize = "1.2vw";
    msg.style.lineHeight = "1.6";
    msg.style.color = "white";
    // translateY(-50%) to vertically center at the top value
    msg.style.transform = "translateY(-50%) scale(0.8)";

    inkOverlay.classList.add("active");
    inkOverlay.style.pointerEvents = "none";
    seonChar1.classList.add("highlight-white");
    seonChar2.classList.add("highlight-white");
    akTrigger.classList.add("active-hide");

    overlayDone = true;

    /* ---- 10초 후 자동 중력 종료 ---- */
    setTimeout(() => {
        gravityMode = false;
        alignToOriginal();
        msg.style.opacity = 0;
        msg2.style.opacity = 0;
    }, 10000);
});


/* -----------------------------
    선 클릭 → 화면 초기화
----------------------------- */
seonChar1.addEventListener("click", resetScreen);
seonChar2.addEventListener("click", resetScreen);

function resetScreen() {
    inkOverlay.classList.remove("active");
    inkOverlay.style.pointerEvents = "auto";
    gravityMode = false;

    seonChar1.classList.remove("highlight-white");
    seonChar2.classList.remove("highlight-white");
    akTrigger.classList.remove("active-hide");

    chars.forEach(char => {
        const rect = char.getBoundingClientRect();
        const dx = char.dataset.origX - rect.left;
        const dy = char.dataset.origY - rect.top;
        char.style.transition = "transform 1.5s ease-out";
        char.style.transform = `translate(${dx}px, ${dy}px) rotate(0deg) scale(1)`;
    });

    msg.style.opacity = 0;
    msg.style.zIndex = -1;
    msg2.style.opacity = 0;
}


/* -----------------------------
    마우스 이동 → 중력 + 문장
----------------------------- */
document.addEventListener("mousemove", (e) => {
    if (!overlayDone) return;

    // 검은 화면일 때는 아무것도 움직이지 않음
    if (inkOverlay.classList.contains("active")) {
        gravityMode = false;
        return;
    }

    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const vw = window.innerWidth;

    /* -----------------------------
         선 근처 → 정렬
    ----------------------------- */
    if (isNearSeon(mouseX, mouseY)) {
        alignToOriginal();
        msg.style.opacity = 0;
        msg2.style.opacity = 0;
        gravityMode = false;
        return;
    }

    gravityMode = true;

    /* -----------------------------
        중력 효과 적용
    ----------------------------- */
    chars.forEach(char => {
        if (protectedChars.includes(char.id)) {
            char.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)";
            return;
        }

        const c = char.getBoundingClientRect();
        const cx = c.left + c.width / 2;
        const cy = c.top + c.height / 2;

        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let force = 1 / (dist * 0.00045);
        if (force > 2.8) force = 2.8;

        const angle = Math.atan2(dy, dx);
        const swirlOffset = 120;

        const swirlAngle = angle + (Math.random() * 2.8 - 1.4);
        const chaosX = (Math.random() - 0.5) * 180;
        const chaosY = (Math.random() - 0.5) * 180;

        const moveX = dx * force + Math.cos(swirlAngle) * swirlOffset + chaosX * 0.4;
        const moveY = dy * force + Math.sin(swirlAngle) * swirlOffset + chaosY * 0.4;

        const rotate = (Math.random() * 140 - 70);
        const scale = 0.75 + Math.random() * 0.55;

        char.style.zIndex = Math.floor(Math.random() * 5000);
        char.style.transform =
            `translate(${moveX}px, ${moveY}px) rotate(${rotate}deg) scale(${scale})`;
    });

    /* -----------------------------
        메시지 업데이트
    ----------------------------- */

    // 왼쪽으로 드래그하면 → 오른쪽에 msg2
    if (mouseX < vw * 0.3) {
        const rectSeon = seonChar1.getBoundingClientRect();
        const seonCenterY = rectSeon.top + rectSeon.height / 2;

        msg2.innerHTML =
            "초자연이 개입하는 경우가 아니라면,<br>모든 일은 중력에 따라 일어난다고 예상해야 한다.";
        msg2.style.opacity = 1;

        msg2.style.position = "fixed";
        msg2.style.left = "72%";           // keep at right side
        msg2.style.top = (seonCenterY - 40) + "px"; // align vertically with '선'
        msg2.style.color = "black";
        msg2.style.fontSize = "1.2vw";
        msg2.style.lineHeight = "1.6";
        msg2.style.transform = "translateY(-50%) scale(0.8)";

        msg.style.opacity = 0;
        return;
    }

    // 오른쪽으로 드래그하면 → 왼쪽에 msg
    if (mouseX > vw * 0.3) {
        const rectSeon = seonChar1.getBoundingClientRect();
        const seonCenterY = rectSeon.top + rectSeon.height / 2;

        msg.innerHTML = "우리가 저급하다고 지칭하는 것은<br>모두 중력의 현상이다.";
        msg.style.opacity = 1;
        msg2.style.opacity = 0;

        msg.style.position = "fixed";
        msg.style.left = '12%';              // move further left (mirroring msg2 offset)
        msg.style.top = seonCenterY + "px";  // keep height aligned
        msg.style.color = "black";
        msg.style.fontSize = "1.2vw";          // smaller text
        msg.style.lineHeight = "1.6";
        msg.style.transform = "translateY(-50%) scale(0.8)";

        return;
    }

    // 중앙 영역에서는 사라짐
    msg.style.opacity = 0;
    msg2.style.opacity = 0;
});


/* -----------------------------
    보조 함수들
----------------------------- */
function alignToOriginal() {
    chars.forEach(char => {
        const rect = char.getBoundingClientRect();
        const dx = char.dataset.origX - rect.left;
        const dy = char.dataset.origY - rect.top;

        char.style.transition = "transform 1.2s ease-out";
        char.style.transform = `translate(${dx}px, ${dy}px) rotate(0deg) scale(1)`;
    });
}

function isNearSeon(x, y) {
    const rect = seonChar1.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    return Math.sqrt(dx * dx + dy * dy) < 150;
}