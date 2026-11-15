/* =========================================================
   설문 데이터 — ICT기업용
   물류기업용(dicia/logistics/assets/js/data.js)과 같은 구조
   추가 항목: eyebrow·headline(시작 화면 문구), info.wide(입력칸 한 줄 전체),
             q.help(문항 보조 설명), type "text"(서술형, required:false면 선택 응답)
   ========================================================= */
window.SURVEY = {
  /* 구글 Apps Script 웹 앱 주소 (비워 두면 시험 모드) */
  endpoint: "https://script.google.com/macros/s/AKfycbyZHUQzZwRYSls5Zbbk8Wv8Tp5uEYgVoeWAK41FtANM17U9eZgjxPYcO_DASMv1k9Kx/exec",

  /* 구글 시트 탭 이름이자 메일 제목 구분값 */
  survey: "ICT기업",

  /* 응답 마감 (한국 시간) */
  deadline: "2026-11-27T18:00:00+09:00",

  title: "지역 물류산업 AX 수요조사",
  audience: "ICT기업용",
  host: "대전정보문화산업진흥원",
  agency: "㈜다래전략사업화센터 대전지사",
  contactPhone: "042-716-7084",
  contactEmail: "yhj@daraebiz.com",
  minutes: 5,

  eyebrow: "’27년 신규사업 기획 수요조사 · ICT기업용",
  headline: "귀사 기술로 해결할 수 있는<br><em>현장 문제</em>를 알려 주십시오",

  intro: [
    "대전정보문화산업진흥원(DICIA)의 ’27년 신규사업 기획을 위한 ICT기업 수요조사입니다.",
    "귀사의 보유 기술, 적용 가능한 산업 분야, 필요한 지원을 여쭙니다. 응답 내용은 대전 ICT기업의 서비스 개발·실증 지원사업 기획에 반영합니다.",
  ],

  privacy: {
    items: "기업명, 소속부서, 성명, 직위, 휴대전화, 이메일",
    purpose: "수요조사 결과 분석, 응답 확인 연락, ’27년 사업 안내(안내 수신 동의 시)",
    period: "조사 및 사업 기획·안내 종료 시까지 보관 후 파기",
    refuse: "동의를 거부할 수 있으며, 거부 시 설문 참여가 제한됩니다.",
  },

  info: [
    { id: "company",  label: "기업명",   required: true,  placeholder: "㈜ 대전소프트", auto: "organization" },
    { id: "dept",     label: "소속부서", required: false, placeholder: "기술연구소", auto: "off" },
    { id: "name",     label: "성명",     required: true,  placeholder: "홍길동", auto: "name" },
    { id: "position", label: "직위",     required: true,  placeholder: "책임연구원", auto: "organization-title" },
    { id: "phone",    label: "휴대전화", required: true,  placeholder: "010-0000-0000", type: "tel", auto: "tel" },
    { id: "email",    label: "E-mail",   required: true,  placeholder: "name@company.com", type: "email", auto: "email" },
    { id: "field",    label: "주요 사업 분야",     required: true, placeholder: "예: 산업용 AI 영상분석 소프트웨어 개발", wide: true, auto: "off" },
    { id: "product",  label: "주요 제품 및 서비스", required: true, placeholder: "예: 설비 이상 감지 솔루션, 공정 모니터링 플랫폼", wide: true, auto: "off" },
  ],

  sections: [
    {
      key: "A", title: "기업 현황",
      questions: [
        { id: "A1", short: "종업원 규모", title: "귀사의 종업원 규모는 어떻게 됩니까?", type: "single", options: [
          { label: "10인 미만" }, { label: "10~49인" }, { label: "50~99인" }, { label: "100인 이상" },
        ]},
        { id: "A2", short: "보유 ICT 기술", title: "귀사가 보유한 주요 ICT 기술 분야는 무엇입니까?", type: "multi", options: [
          { label: "AI·머신러닝 및 지능형 분석" },
          { label: "산업데이터 수집·가공·분석 및 플랫폼" },
          { label: "IoT·센서 및 실시간 모니터링" },
          { label: "로봇·자율이동 및 자동화" },
          { label: "디지털 트윈 및 시뮬레이션" },
          { label: "AI 영상분석 및 지능형 검사" },
          { label: "물류·운송·통합관제 시스템" },
          { label: "기타", etc: true },
        ]},
      ],
    },
    {
      key: "B", title: "기존 사업 연계성",
      lead: "대전시와 과학기술정보통신부 지원으로 ’24.5.~’26.12. 「대전 스마트물류 기술실증화 사업」을 추진했습니다. 우정사업본부 중부권광역우편물류센터를 실증처로 스마트물류 플랫폼, 물류 자동화기기, 데이터 기반 신서비스를 개발·검증했습니다.",
      note: "아래 B-2는 이 사업에서 개발한 주요 기술입니다.",
      questions: [
        { id: "B1", short: "기존 사업 인지도", title: "「대전 스마트물류 기술실증화 사업」에 대한 인지도 및 참여 경험은 어떠하십니까?", type: "single", options: [
          { label: "사업 참여 경험 있음" },
          { label: "사업 내용 및 성과를 알고 있음" },
          { label: "사업명 및 일부 내용만 알고 있음" },
          { label: "잘 모름" },
        ]},
        { id: "B2", short: "연계 가능 기술", title: "아래 기술 중 귀사 기술과 연계하거나 다른 산업에 적용할 수 있는 것을 선택해 주십시오.", type: "multi", tech: true, options: [
          { label: "물류데이터 플랫폼·개방 데이터", desc: "물류 데이터 표준화·품질관리 및 데이터 개방 포털", icon: "db" },
          { label: "물량 예측 모델",         desc: "처리 이력 기반 일별·시간대별 물량 예측", icon: "chart" },
          { label: "인적·물적자원 예측 모델", desc: "예측 물량 기반 필요 인력·설비 산정", icon: "people" },
          { label: "실시간 차량관제",        desc: "차량 위치·운행 상태 실시간 모니터링", icon: "truck" },
          { label: "소화물 자동인입·자동구분기", desc: "소화물 자동 투입 및 개인별 자동 분류", icon: "sort" },
          { label: "이송로봇(AMR)",          desc: "작업장 내 물품 자율 이송", icon: "robot" },
          { label: "스마트태그·ESL",         desc: "전자 태그 기반 위치·재고 정보 표시 및 관리", icon: "tag" },
          { label: "전기설비 이상 감지",     desc: "전력·온도 센서 데이터 기반 설비 이상 징후 실시간 감지 및 경보", icon: "bolt" },
          { label: "작업자 위험 예방",       desc: "영상·센서 기반 위험 행동·위험구역 접근 감지 및 경보", icon: "shield" },
          { label: "생성형 AI 포장·견적",    desc: "물품 정보 기반 포장재·포장 방식 추천 및 견적 자동 산출", icon: "box" },
          { label: "연계 가능한 기술 없음", none: true },
        ]},
      ],
    },
    {
      key: "C", title: "대전 전략산업 연계",
      questions: [
        { id: "C1", short: "적용 산업", title: "귀사의 기술·제품·서비스를 적용하거나 사업화할 수 있는 분야는 무엇입니까?", type: "multi", options: [
          { label: "방산우주",         desc: "위성·발사체·방산 부품" },
          { label: "차세대반도체",     desc: "반도체 소재·부품·장비" },
          { label: "첨단바이오",       desc: "의약품·의료기기·진단" },
          { label: "테크아트·콘텐츠",  desc: "실감 콘텐츠·미디어아트" },
          { label: "물류·유통",        desc: "운송·창고·택배·유통" },
          { label: "기타", etc: true },
        ]},
        { id: "C2", short: "개선 가능 업무", title: "귀사 기술로 개선할 수 있는 기업 운영 업무 영역은 무엇입니까?", type: "multi", options: [
          { label: "구매·자재 관리",   desc: "발주, 입고, 재고" },
          { label: "생산 관리",        desc: "생산계획, 공정, 생산실적" },
          { label: "품질 관리",        desc: "검사, 불량, 품질 이력" },
          { label: "설비 관리",        desc: "예방보전, 고장·이상 감지" },
          { label: "물류 관리",        desc: "입출고, 보관, 출하·운송" },
          { label: "영업·판매 관리",   desc: "수주, 납기, 고객 관리" },
          { label: "인사·노무 관리",   desc: "인력 배치, 근태, 작업 안전" },
          { label: "회계·원가 관리",   desc: "비용 집계, 원가 분석" },
          { label: "경영정보 관리",    desc: "실적 집계, 의사결정 지원" },
          { label: "기타", etc: true },
        ]},
        { id: "C3", short: "전략산업 물류 서비스", title: "전략산업 현장의 보관·운송 문제 중 귀사 기술로 지원할 수 있는 서비스는 무엇입니까?", type: "multi",
          help: "방산우주·반도체·바이오 등 전략산업은 제품 특성상 보관·운송 조건이 까다롭습니다. (예: 반도체 무진동 운송, 바이오 온습도 관리)", options: [
          { label: "운송 중 화물 상태 감시",   desc: "진동·온습도·충격 실시간 측정" },
          { label: "특수 차량 배차·운송 관제", desc: "무진동·항온 차량 등" },
          { label: "부품·소재 이력 추적",      desc: "입출고·보관 이력, 인증 관리" },
          { label: "보관 환경 모니터링",       desc: "항온·항습·청정도" },
          { label: "조달·재고 예측",           desc: "부품·소재 수급 예측" },
          { label: "공급망 데이터 통합",       desc: "제조부터 유통까지 데이터 연계" },
          { label: "기타", etc: true },
          { label: "해당 없음", none: true },
        ]},
      ],
    },
    {
      key: "D", title: "지원 수요",
      questions: [
        { id: "D1", short: "필요 지원", title: "신규사업 추진 시 귀사가 필요로 하는 주요 지원은 무엇입니까?", type: "multi", options: [
          { label: "기술개발 및 기존 제품·서비스 고도화" },
          { label: "산업데이터 확보·연계 및 AI 모델 개발" },
          { label: "실증환경 및 테스트베드 제공" },
          { label: "수요기업 발굴 및 실증처 연계" },
          { label: "시제품 제작 및 성능검증" },
          { label: "인증·시험평가 및 기술검증" },
          { label: "수요기업 구매·도입 및 사업화 연계" },
          { label: "투자유치 및 판로개척" },
          { label: "기타", etc: true },
        ]},
        { id: "D2", short: "자유 의견", title: "대전 전략산업과 연계해 새로 개발하거나 실증하고 싶은 기술·제품·서비스, 또는 신규사업에 대한 의견을 자유롭게 작성해 주십시오.", type: "text", required: false,
          placeholder: "예: 바이오 의약품 운송 중 온도 이탈을 실시간 감지·경보하는 서비스 실증 희망" },
      ],
    },
    {
      key: "E", title: "참여 의향 및 안내",
      questions: [
        { id: "E1", short: "참여 의향", title: "관련 신규사업이 추진될 경우 참여할 의향이 있습니까?", type: "single", options: [
          { label: "있음" }, { label: "조건에 따라 검토" }, { label: "없음" },
        ]},
        { id: "E2", short: "사업 안내 수신", title: "’27년 사업 공고·안내를 받으시겠습니까?", type: "single", options: [
          { label: "동의", desc: "작성자 정보의 E-mail로 안내" }, { label: "미동의" },
        ]},
      ],
    },
  ],
};
