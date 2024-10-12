function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('메뉴')
    .addItem('대형카페 찾아보기', 'showDistrictSelector')
    .addToUi();
}

function showDistrictSelector() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('DistrictSelector')
      .setWidth(300)
      .setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '행정구 선택');
}

// Map district to URLs
var districtUrls = {
  "종로구": "https://data.seoul.go.kr/dataList/OA-18677/S/1/datasetView.do",
  "중구": "https://data.seoul.go.kr/dataList/OA-18678/S/1/datasetView.do",
  "용산구": "https://data.seoul.go.kr/dataList/OA-18679/S/1/datasetView.do",
  "성동구": "https://data.seoul.go.kr/dataList/OA-18680/S/1/datasetView.do",
  "광진구": "https://data.seoul.go.kr/dataList/OA-18681/S/1/datasetView.do",
  "동대문구": "https://data.seoul.go.kr/dataList/OA-18682/S/1/datasetView.do",
  "중랑구": "https://data.seoul.go.kr/dataList/OA-18683/S/1/datasetView.do",
  "성북구": "https://data.seoul.go.kr/dataList/OA-18684/S/1/datasetView.do",
  "강북구": "https://data.seoul.go.kr/dataList/OA-18685/S/1/datasetView.do",
  "도봉구": "https://data.seoul.go.kr/dataList/OA-18686/S/1/datasetView.do",
  "노원구": "https://data.seoul.go.kr/dataList/OA-18687/S/1/datasetView.do",
  "은평구": "https://data.seoul.go.kr/dataList/OA-18688/S/1/datasetView.do",
  "서대문구": "https://data.seoul.go.kr/dataList/OA-18689/S/1/datasetView.do",
  "마포구": "https://data.seoul.go.kr/dataList/OA-18690/S/1/datasetView.do",
  "양천구": "https://data.seoul.go.kr/dataList/OA-18691/S/1/datasetView.do",
  "강서구": "https://data.seoul.go.kr/dataList/OA-18692/S/1/datasetView.do",
  "구로구": "https://data.seoul.go.kr/dataList/OA-18693/S/1/datasetView.do",
  "금천구": "https://data.seoul.go.kr/dataList/OA-18694/S/1/datasetView.do",
  "영등포구": "https://data.seoul.go.kr/dataList/OA-18695/S/1/datasetView.do",
  "동작구": "https://data.seoul.go.kr/dataList/OA-18696/S/1/datasetView.do",
  "관악구": "https://data.seoul.go.kr/dataList/OA-18697/S/1/datasetView.do",
  "서초구": "https://data.seoul.go.kr/dataList/OA-18698/S/1/datasetView.do",
  "강남구": "https://data.seoul.go.kr/dataList/OA-18699/S/1/datasetView.do",
  "송파구": "https://data.seoul.go.kr/dataList/OA-18700/S/1/datasetView.do",
  "강동구": "https://data.seoul.go.kr/dataList/OA-18701/S/1/datasetView.do"
};


https://datafile.seoul.go.kr/bigfile/iot/sheet/json/download.do

// Function to fetch and scrape data based on the selected district
function fetchData(district) {
  var url = districtUrls[district];
  if (!url) {
    Logger.log("Invalid district selected.");
    return;
  }
  
  // Log or fetch data using the URL for the selected district
  Logger.log("Fetching data for: " + district + " from URL: " + url);
  fetchAndFilterSeoulData(url);
}


function fetchAndFilterSeoulData() {
  var url = "https://data.seoul.go.kr/dataList/OA-18701/S/1/datasetView.do"
  // Extract infId from the URL using regex
  var infId = url.match(/OA-\d+/)[0]; // This will extract something like 'OA-18700'
  const fetchUrl = "https://datafile.seoul.go.kr/bigfile/iot/sheet/json/download.do"
  console.log(infId)
  var options = {
    "method" : "post",
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-site",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    },
    "payload": {
      "srvType": "S",
      "infId": infId,
      "serviceKind": "1",
      "pageNo": "1",
      "ssUserId": "SAMPLE_VIEW",
      // "strWhere": " AND OPNSFTEAMCODE = 3230000",
      "strOrderby": "",
      "filterCol": "필터선택",
      "txtFilter": ""
    },
    "muteHttpExceptions": true
  };
  
  try {
    var response = UrlFetchApp.fetch(fetchUrl, options);
    console.log(response.getContentText())
    var jsonData = JSON.parse(response.getContentText());
    console.log(jsonData)

    // Check if the data object exists and apply filters
    if (jsonData && jsonData.DATA) {
      var filteredData = jsonData.DATA
        .filter(isOperating) // Filter for businesses that are '영업'
        .filter(isCafe) // Filter for '커피숍'
        .filter(isSiteAreaGreaterThan140) // Filter for site area greater than 140
        .filter(isBusinessNameValid); // Filter to exclude specific business names

      
      writeToSheet(filteredData); // Write the filtered data to Google Sheets
    } else {
      Logger.log("No data found.");
    }
    
  } catch (error) {
    Logger.log("Error fetching data: " + error);
  }
}

// Modular filter functions
function isOperating(item) {
  return item.dtlstatenm === "영업";
}

function isCafe(item) {
  return item.uptaenm === "커피숍";
}

function isSiteAreaGreaterThan140(item) {
  return parseFloat(item.sitearea) > 140;
}


function isBusinessNameValid(item) {
  var excludeNames = ["스타벅스", "파스쿠찌", "투썸플레이스", "탐앤탐스", "PC"];
  return !excludeNames.some(function(name) {
    return item.bplcnm.includes(name);
  });
}

// Write the filtered data to Google Sheets
function writeToSheet(filteredData) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  
  // Clear the previous content in the sheet
  sheet.clear();
  
  // Add headers to the first row
  var headers = ["사업장명", "영업상태", "업태구분명", "소재지면적", "전화번호", "주소"];
  sheet.appendRow(headers);

  // Write the filtered data to the sheet
  filteredData.forEach(function(item) {
    sheet.appendRow([item.bplcnm, item.dtlstatenm, item.uptaenm, item.sitearea, item.sitetel, item.sitewhladdr]);
  });
}
