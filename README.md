


# 서울 대형 카페 검색 앱 (Google Apps Script)

이 Google Apps Script는 서울의 다양한 구에 위치한 대형 카페를 쉽게 검색하고, 필터링된 데이터를 Google Sheets에 기록하는 기능을 제공합니다. 사용자는 원하는 행정구를 선택하여, 영업 중인 면적 140m² 이상의 카페를 찾아볼 수 있습니다.


## 데모

![image](https://github.com/user-attachments/assets/d9cb8bf3-e2e2-4654-9fde-bda984e89cd3)


## 주요 기능

- **구 선택**: 사용자는 서울시의 다양한 행정구 중 하나를 선택하여, 해당 구에 위치한 대형 카페 데이터를 조회할 수 있습니다.
- **데이터 필터링**: 
  - 영업 중인 카페 (`영업 상태`가 "영업"인 경우)
  - 업태 구분이 `커피숍`인 경우
  - 소재지 면적이 140m² 이상인 경우
  - 특정 브랜드 카페 제외 (스타벅스, 파스쿠찌, 투썸플레이스, 탐앤탐스, PC방)
- **데이터 기록**: 필터링된 데이터는 Google Sheets의 "Sheet1"에 기록됩니다. 기존 데이터는 자동으로 삭제되고 새로운 데이터가 추가됩니다.

## 사용 방법

1. Google 스프레드시트에서 **메뉴 > 대형카페 찾아보기**를 클릭합니다.
2. 팝업창에서 서울시의 구를 선택한 후 **선택 완료** 버튼을 클릭합니다.
3. 선택한 구에 맞는 데이터를 서울시 오픈 데이터 포털에서 자동으로 검색하여 필터링된 데이터를 Google Sheets에 기록합니다.

## 스크립트 설명

### 1. 메뉴 생성

```javascript
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('메뉴')
    .addItem('대형카페 찾아보기', 'showDistrictSelector')
    .addToUi();
}
```

앱이 실행되면, 스프레드시트 상단에 `메뉴` 항목이 생성되고, 해당 메뉴를 클릭하면 `대형카페 찾아보기` 옵션을 선택할 수 있습니다.

### 2. 팝업창에서 구 선택

팝업창에서는 사용자가 서울시의 구를 선택할 수 있도록 도와줍니다.

```javascript
function showDistrictSelector() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('DistrictSelector')
      .setWidth(300)
      .setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '행정구 선택');
}
```

팝업창에서는 사용자가 구를 선택하고 `선택 완료` 버튼을 누르면, 선택한 구의 데이터가 불러와집니다.

### 3. 데이터 조회 및 필터링

선택한 구에 맞는 데이터를 서울시 데이터 포털에서 불러와서 필터링합니다. 필터링 조건은 다음과 같습니다:
- 영업 중인 카페
- 소재지 면적이 140m² 이상인 카페
- 특정 브랜드 카페는 제외

```javascript
function fetchData(district) {
  var url = districtUrls[district];
  if (!url) {
    Logger.log("Invalid district selected.");
    return;
  }
  
  Logger.log("Fetching data for: " + district + " from URL: " + url);
  fetchAndFilterSeoulData(url);
}
```

### 4. 필터링된 데이터 Google Sheets에 기록

필터링된 데이터를 Google Sheets에 기록합니다.

```javascript
function writeToSheet(filteredData) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  
  // 기존 데이터 삭제
  sheet.clear();
  
  // 헤더 추가
  var headers = ["사업장명", "영업상태", "업태구분명", "소재지면적", "전화번호", "주소"];
  sheet.appendRow(headers);

  // 필터링된 데이터 추가
  filteredData.forEach(function(item) {
    sheet.appendRow([item.bplcnm, item.dtlstatenm, item.uptaenm, item.sitearea, item.sitetel, item.sitewhladdr]);
  });
}
```

## 활용데이터

- 서울시 데이터광장의 공공데이터 : https://data.seoul.go.kr/dataList/OA-18698/S/1/datasetView.do
