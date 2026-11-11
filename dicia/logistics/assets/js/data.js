/* =========================================================
   설문 데이터 — 문항을 바꿀 때는 이 파일만 고치면 됨
   (ICT기업용은 이 파일을 복사해 survey/sections만 바꾸면 그대로 재사용)
   ========================================================= */
window.SURVEY = {
  /* 구글 Apps Script 웹 앱 주소 (비워 두면 시험 모드: 저장·메일 없이 화면만 동작) */
  endpoint: "https://script.google.com/macros/s/AKfycbyZHUQzZwRYSls5Zbbk8Wv8Tp5uEYgVoeWAK41FtANM17U9eZgjxPYcO_DASMv1k9Kx/exec",

  /* 구글 시트 탭 이름이자 메일 제목 구분값 */
  survey: "물류기업",

  /* 응답 마감 (한국 시간, 비워 두면 마감 없음) 예: "2026-12-05T18:00:00+09:00" */
  deadline: "2026-12-10T19:00:00+09:00",

  title: "지역 물류산업 AX 수요조사",
  audience: "물류기업용",
  host: "대전정보문화산업진흥원",
  agency: "㈜다래전략사업화센터 대전지사",
  contactPhone: "042-716-7084",
  contactEmail: "yhj@daraebiz.com",
  minutes: 5,

  intro: [
    "본 조사는 대전정보문화산업진흥원(DICIA)의 지역 물류산업 AX 전환 및 스마트물류 지원사업 기획을 위한 수요조사입니다.",
    "대전 지역 기업의 물류업무 현황과 디지털 전환 애로, ICT기업이 제안하는 서비스의 도입·실증 의향을 파악하고자 합니다. 조사 결과는 물류 현장 수요에 맞는 대전 ICT기업의 서비스 개발·실증을 지원하는 ’27년 사업 기획의 기초자료로 활용합니다.",
  ],

  /* 개인정보 수집·이용 동의 문구 (필수 동의) */
  privacy: {
    items: "기업명, 소속부서, 성명, 직위, 휴대전화, 이메일",
    purpose: "수요조사 결과 분석, 응답 확인 연락, ’27년 사업 안내(안내 수신 동의 시)",
    period: "조사 및 사업 기획·안내 종료 시까지 보관 후 파기",
    refuse: "동의를 거부할 수 있으며, 거부 시 설문 참여가 제한됩니다.",
  },

  /* 작성자 정보 */
  info: [
    { id: "company",  label: "기업명",   required: true,  placeholder: "㈜ 대전물류", auto: "organization" },
    { id: "dept",     label: "소속부서", required: false, placeholder: "물류운영팀", auto: "off" },
    { id: "name",     label: "성명",     required: true,  placeholder: "홍길동", auto: "name" },
    { id: "position", label: "직위",     required: true,  placeholder: "팀장", auto: "organization-title" },
    { id: "phone",    label: "휴대전화", required: true,  placeholder: "010-0000-0000", type: "tel", auto: "tel" },
    { id: "email",    label: "E-mail",   required: true,  placeholder: "name@company.com", type: "email", auto: "email" },
  ],

  /* 설문 영역 — type: single(1개) / multi(복수) / max: 최대 선택 수
     옵션 etc:true → 직접 입력칸, none:true → 선택 시 다른 항목 해제 */
  sections: [
    {
      key: "A", title: "물류업무 현황",
      questions: [
        { id: "A1", short: "업종", title: "귀사의 업종을 선택해 주십시오.", type: "single", options: [
          { label: "물류업", desc: "운송·택배·창고 등" },
          { label: "제조업", desc: "자사 물류 운영" },
          { label: "도소매·전자상거래" },
          { label: "기타", etc: true },
        ]},
        { id: "A2", short: "수행 물류업무", title: "귀사가 수행하고 있는 물류업무는 무엇입니까?", type: "multi", options: [
          { label: "운송·배차" }, { label: "창고·보관" }, { label: "입출고·재고관리" }, { label: "분류·포장" },
          { label: "배송" }, { label: "택배" }, { label: "기타", etc: true },
        ]},
        { id: "A3", short: "업무 관리 방식", title: "물류업무를 현재 어떤 방식으로 관리하고 있습니까?", type: "multi", options: [
          { label: "종이·수기" },
          { label: "엑셀 등 문서프로그램" },
          { label: "업무관리 시스템", desc: "WMS·TMS·ERP 등" },
          { label: "기타", etc: true },
        ]},
      ],
    },
    {
      key: "B", title: "디지털 전환 애로",
      questions: [
        { id: "B1", short: "개선 필요 분야", title: "현재 가장 개선이 필요한 물류업무 분야는 무엇입니까?", type: "multi", max: 2, options: [
          { label: "계획·운영 최적화", desc: "배차·경로·재고 등" },
          { label: "현장작업 자동화", desc: "분류·검수·포장 등" },
          { label: "안전·설비 관리", desc: "위험·이상 감지" },
          { label: "사무업무 자동화", desc: "문서 입력·반복 업무" },
          { label: "기타", etc: true },
          { label: "현재 개선이 필요한 업무 없음", none: true },
        ]},
        { id: "B2", short: "도입 시 어려움", title: "디지털·AI 기술 도입을 검토할 때 가장 큰 어려움은 무엇입니까?", type: "multi", max: 2, options: [
          { label: "비용 부담" },
          { label: "기술·데이터 문제", desc: "자료 부족·시스템 연동·보안" },
          { label: "운영 부담", desc: "담당 인력·교육·업무 변경" },
          { label: "필요성·효과 불확실", desc: "기존 방식으로 충분한 경우 포함" },
          { label: "기타", etc: true },
          { label: "어려움 없음", none: true },
        ]},
        { id: "B3", short: "과제 주관 의향", title: "귀사의 업무 애로를 ICT기업과 함께 해결하는 과제가 추진된다면 과제를 주관(신청)할 의향이 있습니까?", type: "single", options: [
          { label: "있음" }, { label: "조건에 따라 검토" }, { label: "없음" },
        ]},
      ],
    },
    {
      key: "C", title: "ICT기업 제안 서비스 도입 의향",
      lead: "대전 ICT기업이 물류기업에 필요한 서비스를 직접 개발해 제안하는 과제를 검토하고 있습니다. 개발된 서비스는 희망하는 물류기업 현장에서 시범 적용(실증)하는 방안을 검토하고 있습니다.",
      note: "아래는 실증사업에서 현장 검증을 마친 주요 기술입니다.",
      questions: [
        { id: "C1", short: "관심 기술", title: "ICT기업이 아래 기술이나 관련 서비스를 제안한다면 관심 있는 것을 선택해 주십시오.", type: "multi", tech: true, options: [
          { label: "전기설비 이상 감지",     desc: "전력·온도 센서 데이터 기반 설비 이상 징후 실시간 감지 및 경보", icon: "bolt" },
          { label: "작업자 위험 예방",       desc: "영상·센서 기반 위험 행동·위험구역 접근 감지 및 경보", icon: "shield" },
          { label: "생성형 AI 포장·견적",    desc: "물품 정보 기반 포장재·포장 방식 추천 및 견적 자동 산출", icon: "box" },
          { label: "이송로봇(AMR)",          desc: "작업장 내 물품 자율 이송", icon: "robot" },
          { label: "스마트태그·ESL",         desc: "전자 태그 기반 위치·재고 정보 표시 및 관리", icon: "tag" },
          { label: "물량 예측 모델",         desc: "처리 이력 기반 일별·시간대별 물량 예측", icon: "chart" },
          { label: "인적·물적자원 예측 모델", desc: "예측 물량 기반 필요 인력·설비 산정", icon: "people" },
          { label: "실시간 차량관제",        desc: "차량 위치·운행 상태 실시간 모니터링", icon: "truck" },
          { label: "관심 있는 기술 없음", none: true },
        ]},
        { id: "C2", short: "실증 의향", title: "ICT기업이 개발한 서비스를 귀사 현장에 시범 적용(실증)할 의향이 있습니까?", type: "single", options: [
          { label: "있음" }, { label: "조건에 따라 검토" }, { label: "없음" },
        ]},
        { id: "C3", short: "제공 가능 데이터", title: "ICT기업의 서비스 개발을 위해 비식별 처리 후 제공할 수 있는 데이터는 무엇입니까?", type: "multi", options: [
          { label: "물량·입출고" }, { label: "차량 운행" }, { label: "설비·센서" }, { label: "작업 인력" },
          { label: "기타", etc: true }, { label: "제공 곤란", none: true },
        ]},
      ],
    },
    {
      key: "D", title: "사업 안내",
      questions: [
        { id: "D1", short: "사업 안내 수신", title: "’27년 사업 공고·안내를 받으시겠습니까?", type: "single", options: [
          { label: "동의", desc: "작성자 정보의 E-mail로 안내" }, { label: "미동의" },
        ]},
      ],
    },
  ],
};
