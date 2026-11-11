/**
 * 지역 물류산업 AX 수요조사 — 구글 Apps Script
 * 하는 일: (1) 구글 시트에 응답 저장  (2) 응답자에게 감사 메일  (3) 담당자에게 알림 메일
 * 물류기업·ICT기업 설문 모두 이 스크립트 하나로 처리 (시트 탭이 설문별로 자동 생성됨)
 *
 * 설치: 구글 시트 → 확장 프로그램 → Apps Script → 이 코드 붙여넣기 → 저장
 *       → 배포 → 새 배포 → 유형: 웹 앱 / 실행: 나 / 액세스: 모든 사용자 → 배포
 *       → 나오는 웹 앱 URL을 assets/js/data.js 의 endpoint 에 붙여넣기
 */

const CONFIG = {
  ADMIN_EMAIL: '',                 // 알림 받을 메일 (비워 두면 스크립트 소유자 계정으로 발송)
  SENDER_NAME: 'DICIA 지역 물류산업 AX 수요조사',
  REPLY_TO: 'yhj@daraebiz.com',    // 응답자가 '답장'하면 받을 주소
  HOST: '대전정보문화산업진흥원',
  AGENCY: '㈜다래전략사업화센터 대전지사',
  CONTACT_PHONE: '042-716-7084',
  CONTACT_EMAIL: 'yhj@daraebiz.com',
  SEND_THANKS: true,               // 응답자 감사 메일
  SEND_ADMIN: true,                // 담당자 알림 메일
  NO_PREFIX: { '물류기업': 'LG', 'ICT기업': 'IT' },  // 접수번호 앞글자
};

/* ---------------------------------------------------------------- */

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const data = JSON.parse(e.postData.contents);
    if (!data || !data.survey || !Array.isArray(data.fields)) throw new Error('잘못된 요청');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getSheet_(ss, data.survey, data.fields);
    const now = new Date();
    const at = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy.MM.dd HH:mm');
    const seq = Math.max(sheet.getLastRow(), 1);                     // 머리글 제외 순번
    const no = (CONFIG.NO_PREFIX[data.survey] || 'SV') + '-' + Utilities.formatDate(now, 'Asia/Seoul', 'MMdd') + '-' + String(seq).padStart(3, '0');

    /* 머리글 기준으로 값 배치 (새 문항이 생기면 열 자동 추가) */
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const map = { '접수번호': no, '제출일시': at, '안내 수신': data.notice ? '동의' : '미동의', '접속 페이지': data.page || '' };
    data.fields.forEach(f => { map[f.label] = f.value; });
    Object.keys(map).forEach(label => {
      if (header.indexOf(label) === -1) {
        header.push(label);
        sheet.getRange(1, header.length).setValue(label);
        styleHeader_(sheet);
      }
    });
    const row = header.map(h => safe_(map[h]));
    const r = sheet.getLastRow() + 1;
    sheet.getRange(r, 1, 1, row.length).setNumberFormat('@').setValues([row]);
    lock.releaseLock();

    /* 메일 */
    let mail = false;
    if (CONFIG.SEND_THANKS && isEmail_(data.email)) {
      try {
        MailApp.sendEmail({
          to: data.email,
          subject: '[' + CONFIG.HOST + '] ' + (data.title || '수요조사') + ' 응답이 접수되었습니다',
          htmlBody: thanksHtml_(data, no, at),
          name: CONFIG.SENDER_NAME,
          replyTo: CONFIG.REPLY_TO,
        });
        mail = true;
      } catch (err) { console.error('감사 메일 실패', err); }
    }
    if (CONFIG.SEND_ADMIN) {
      try {
        const admin = CONFIG.ADMIN_EMAIL || Session.getEffectiveUser().getEmail();
        MailApp.sendEmail({
          to: admin,
          subject: '[수요조사·' + data.survey + '] 신규 응답 ' + no + ' — ' + (data.company || '') + ' (누적 ' + (sheet.getLastRow() - 1) + '건)',
          htmlBody: adminHtml_(data, no, at, ss.getUrl() + '#gid=' + sheet.getSheetId(), sheet.getLastRow() - 1),
          name: CONFIG.SENDER_NAME,
          replyTo: isEmail_(data.email) ? data.email : CONFIG.REPLY_TO,
        });
      } catch (err) { console.error('알림 메일 실패', err); }
    }
    return json_({ ok: true, no: no, at: at, mail: mail });
  } catch (err) {
    try { lock.releaseLock(); } catch (e2) {}
    console.error(err);
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet() { return json_({ ok: true, service: 'survey', time: new Date().toISOString() }); }

/* ---------------------------------------------------------------- */

function getSheet_(ss, name, fields) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    const head = ['접수번호', '제출일시'].concat(fields.map(f => f.label), ['안내 수신', '접속 페이지']);
    sh.getRange(1, 1, 1, head.length).setValues([head]);
    styleHeader_(sh);
    sh.setFrozenRows(1);
    sh.setFrozenColumns(3);
  }
  return sh;
}
function styleHeader_(sh) {
  sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold').setBackground('#0d1117').setFontColor('#ffffff').setWrap(true).setVerticalAlignment('middle');
}
function safe_(v) {           // 수식 주입 방지
  v = v == null ? '' : String(v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function isEmail_(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '')); }
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------------- 응답자 감사 메일 ---------------- */
function thanksHtml_(d, no, at) {
  const F = "font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic','맑은 고딕',sans-serif;";
  const who = esc_([d.company, d.name].filter(Boolean).join(' ')) + (d.position ? ' ' + esc_(d.position) : '') + '님';

  const summary = (d.summary || []).map(sec => {
    const rows = sec.items.map(it =>
      '<tr><td style="' + F + 'padding:9px 0;border-top:1px solid #eef0f3;font-size:13px;color:#8a929e;width:38%;vertical-align:top;">' +
      '<span style="color:#d9901a;font-weight:700;">' + esc_(it.no) + '</span>&nbsp; ' + esc_(it.q) + '</td>' +
      '<td style="' + F + 'padding:9px 0 9px 12px;border-top:1px solid #eef0f3;font-size:13px;color:#1b1f26;font-weight:600;vertical-align:top;">' + esc_(it.a || '-') + '</td></tr>').join('');
    return '<tr><td colspan="2" style="' + F + 'padding:18px 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;color:#1b1f26;">' +
      esc_(sec.key) + '. ' + esc_(sec.title) + '</td></tr>' + rows;
  }).join('');

  const steps = [
    ['01', '응답 분석', '물류 현장의 업무 현황과 디지털 전환 수요를 분석합니다.'],
    ['02', '사업 기획 반영', '분석 결과를 ’27년 ICT기업 서비스 개발·실증 지원사업 기획에 반영합니다.'],
    ['03', '사업 안내', d.notice ? '사업 공고가 나오면 이 메일 주소로 가장 먼저 안내해 드립니다.' : '사업 공고는 대전정보문화산업진흥원 누리집에서 확인하실 수 있습니다.'],
  ].map(s =>
    '<tr><td style="padding:0 0 14px;vertical-align:top;width:44px;">' +
    '<div style="' + F + 'width:32px;height:32px;line-height:32px;border-radius:16px;background:#fff4e0;color:#d9901a;font-size:12px;font-weight:800;text-align:center;">' + s[0] + '</div></td>' +
    '<td style="' + F + 'padding:4px 0 14px;vertical-align:top;"><div style="font-size:14px;font-weight:700;color:#1b1f26;">' + s[1] + '</div>' +
    '<div style="font-size:13px;color:#6b7380;line-height:1.6;margin-top:2px;">' + s[2] + '</div></td></tr>').join('');

  return '<!doctype html><html><body style="margin:0;padding:0;background:#f2f3f5;">' +
  '<div style="display:none;max-height:0;overflow:hidden;">' + who + ', 수요조사 응답이 정상 접수되었습니다. 접수번호 ' + no + '</div>' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f3f5;"><tr><td align="center" style="padding:32px 12px;">' +
  '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;">' +

  /* 머리 */
  '<tr><td style="background:#07090d;padding:0;">' +
    '<div style="height:4px;background:#ffb547;font-size:0;line-height:0;">&nbsp;</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="' + F + 'padding:34px 36px 38px;">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#ffb547;">DAEJEON LOGISTICS · AX SURVEY</div>' +
      '<div style="font-size:28px;line-height:1.35;font-weight:800;color:#ffffff;margin-top:14px;letter-spacing:-0.5px;">응답해 주셔서<br>감사합니다</div>' +
      '<div style="font-size:14px;line-height:1.7;color:#a6afbc;margin-top:14px;">' + who + ', ' + esc_(d.title || '수요조사') + (d.audience ? '(' + esc_(d.audience) + ')' : '') + ' 응답이 정상 접수되었습니다.</div>' +
    '</td></tr></table>' +
  '</td></tr>' +

  /* 접수 정보 */
  '<tr><td style="padding:28px 36px 0;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6e8ec;border-radius:12px;">' +
    '<tr><td style="' + F + 'padding:16px 18px;width:50%;border-right:1px solid #e6e8ec;"><div style="font-size:12px;color:#8a929e;">접수번호</div><div style="font-size:16px;font-weight:800;color:#1b1f26;margin-top:3px;">' + no + '</div></td>' +
    '<td style="' + F + 'padding:16px 18px;"><div style="font-size:12px;color:#8a929e;">접수일시</div><div style="font-size:16px;font-weight:800;color:#1b1f26;margin-top:3px;">' + at + '</div></td></tr></table>' +
  '</td></tr>' +

  /* 본문 */
  '<tr><td style="' + F + 'padding:26px 36px 4px;font-size:14px;line-height:1.8;color:#3b414b;">' +
    '바쁘신 가운데 시간을 내어 주셔서 감사합니다. 보내주신 의견은 대전 물류 현장에 실제로 필요한 기술과 서비스를 찾는 데 소중하게 쓰겠습니다.' +
  '</td></tr>' +

  /* 다음 단계 */
  '<tr><td style="padding:22px 36px 6px;">' +
    '<div style="' + F + 'font-size:12px;font-weight:800;letter-spacing:1.5px;color:#d9901a;margin-bottom:14px;">WHAT\'S NEXT</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + steps + '</table>' +
  '</td></tr>' +

  /* 응답 요약 */
  '<tr><td style="padding:10px 36px 8px;">' +
    '<div style="background:#f7f8fa;border-radius:12px;padding:6px 20px 14px;">' +
    '<div style="' + F + 'font-size:12px;font-weight:800;letter-spacing:1.5px;color:#d9901a;padding-top:16px;">MY RESPONSE</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + summary + '</table></div>' +
  '</td></tr>' +

  /* 문의 */
  '<tr><td style="' + F + 'padding:22px 36px 30px;font-size:13px;line-height:1.8;color:#6b7380;">' +
    '응답 내용 수정이나 문의 사항은 이 메일에 회신하시거나 아래 연락처로 알려 주십시오.<br>' +
    '<b style="color:#1b1f26;">T.</b> ' + CONFIG.CONTACT_PHONE + '&nbsp;&nbsp;<b style="color:#1b1f26;">E.</b> <a href="mailto:' + CONFIG.CONTACT_EMAIL + '" style="color:#d9901a;text-decoration:none;">' + CONFIG.CONTACT_EMAIL + '</a>' +
  '</td></tr>' +

  /* 바닥 */
  '<tr><td style="' + F + 'background:#07090d;padding:20px 36px;font-size:12px;line-height:1.8;color:#6f7a89;">' +
    '<span style="color:#a6afbc;">주관</span> ' + CONFIG.HOST + '<br><span style="color:#a6afbc;">조사기관</span> ' + CONFIG.AGENCY +
  '</td></tr>' +

  '</table></td></tr></table></body></html>';
}

/* ---------------- 담당자 알림 메일 ---------------- */
function adminHtml_(d, no, at, sheetUrl, total) {
  const F = "font-family:'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo',sans-serif;";
  const rows = d.fields.map((f, i) =>
    '<tr style="background:' + (i % 2 ? '#ffffff' : '#f7f8fa') + ';"><td style="' + F + 'padding:8px 12px;font-size:12px;color:#6b7380;width:34%;vertical-align:top;">' + esc_(f.label) + '</td>' +
    '<td style="' + F + 'padding:8px 12px;font-size:13px;color:#1b1f26;font-weight:600;">' + esc_(f.value || '-') + '</td></tr>').join('');
  return '<div style="' + F + 'max-width:640px;margin:0 auto;">' +
    '<div style="background:#07090d;color:#fff;padding:18px 20px;border-radius:12px 12px 0 0;border-top:4px solid #ffb547;">' +
      '<div style="font-size:11px;letter-spacing:1.5px;color:#ffb547;font-weight:700;">NEW RESPONSE · ' + esc_(d.survey) + '</div>' +
      '<div style="font-size:19px;font-weight:800;margin-top:6px;">' + esc_(d.company) + ' · ' + esc_(d.name) + ' ' + esc_(d.position || '') + '</div>' +
      '<div style="font-size:12px;color:#a6afbc;margin-top:6px;">' + no + ' · ' + at + ' · 누적 ' + total + '건</div></div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6e8ec;border-top:0;">' + rows + '</table>' +
    '<div style="padding:16px 0;"><a href="' + sheetUrl + '" style="display:inline-block;background:#ffb547;color:#1b1200;font-weight:700;font-size:13px;padding:10px 18px;border-radius:999px;text-decoration:none;">구글 시트에서 전체 응답 보기</a></div></div>';
}

/* 설치 직후 1회 실행: 메일 권한 승인 + 미리보기 메일을 내 계정으로 발송 */
function testMail() {
  const me = Session.getEffectiveUser().getEmail();
  const d = {
    survey: '물류기업', title: '지역 물류산업 AX 수요조사', audience: '물류기업용',
    company: '㈜테스트물류', name: '홍길동', position: '팀장', email: me, notice: true,
    fields: [{ label: '기업명', value: '㈜테스트물류' }, { label: 'A1. 업종', value: '물류업' }],
    summary: [{ key: 'A', title: '물류업무 현황', items: [{ no: 'A-1', q: '업종', a: '물류업' }, { no: 'A-2', q: '수행 물류업무', a: '운송·배차, 창고·보관' }] }],
  };
  MailApp.sendEmail({ to: me, subject: '[미리보기] 감사 메일', htmlBody: thanksHtml_(d, 'LG-1111-001', '2026.11.11 15:00'), name: CONFIG.SENDER_NAME });
  MailApp.sendEmail({ to: me, subject: '[미리보기] 담당자 알림', htmlBody: adminHtml_(d, 'LG-1111-001', '2026.11.11 15:00', SpreadsheetApp.getActiveSpreadsheet().getUrl(), 1), name: CONFIG.SENDER_NAME });
}
