# survey

다래전략사업화센터 대전지사 설문·수요조사 페이지 모음

## 구조
기관/설문/ 폴더 하나가 설문 페이지 하나 (index.html + assets)
기관/apps-script/Code.gs — 해당 기관 설문 공용 Apps Script (구글 시트 저장·감사 메일·담당자 알림)

## 설문 목록
| 폴더 | 설문 | 주소 |
|---|---|---|
| dicia/logistics | DICIA 지역 물류산업 AX 수요조사 (물류기업용) | https://darae-daejeon.github.io/survey/dicia/logistics/ |

## 새 설문 추가
기존 설문 폴더 복사 → assets/js/data.js 문항·survey 값·endpoint 수정
같은 기관이면 같은 Apps Script URL 사용 (시트 탭이 survey 값으로 자동 분리)

## Apps Script 설치
구글 시트 → 확장 프로그램 → Apps Script → Code.gs 붙여넣기 → testMail 실행(권한 승인·미리보기 메일)
→ 배포 → 새 배포 → 웹 앱 / 실행: 나 / 액세스: 모든 사용자 → URL을 data.js endpoint에 입력
Code.gs 수정 후에는 배포 관리 → 기존 배포 편집 → 새 버전으로 재배포 (URL 유지)
