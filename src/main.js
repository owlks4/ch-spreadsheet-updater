import './style.css'
import viteLogo from '/vite.svg'
import * as Papa from 'papaparse';

/*

What does it need to do?

* Takes your CSV file full of company names as an input
* It then looks these up in a CSV that you obtained from Companies House (it doesn't use the API because the API frequently refused to cooperate)
* It then returns a new CSV featuring these company names, in the same order, as well as the updated data received from the Companies House CSV (e.g. dissolved or active, postcode, address)
* Entries found in the Companies House CSV that are not present in the one the user is updating will also be added as skeleton entries
* Should also take the opportunity to ping the nominatim openstreetmap api with the address of each company entry, to get automatic lat/long coordinates

*/

let csvUploader = document.getElementById("csv-file-upload");
csvUploader.addEventListener("change", () => {setErrorMessage(""); setPositiveMessage("Now click the 'proceed' button.")});
let loadedCsvData = [];
let companiesHouseData = null;
let instructionsDOMElement = document.getElementById("instructions");
let curStepDOMElement = document.getElementById("cur-step");
let errorMessage = document.getElementById("error-message");
let positiveMessage = document.getElementById("positive-message");

let proceedButton = document.getElementById("proceed-button");
proceedButton.addEventListener("click",()=>{
    if (csvUploader.files == null || csvUploader.files.length == 0){
        setErrorMessage("You can't proceed to the next step because<br>you haven't uploaded a CSV file!");
    } else {
        loadCSV(csvUploader.files[0], false);
        curInstruction++; //this doesn't get checked for sanity here, but it does get checked in updateCurStepDOMElement, so it's ok.
        csvUploader.files = null;
        csvUploader.value = null;
        updateCurStepDOMElement();
        setPositiveMessage("Thanks. The step has advanced and the URL has changed.<br>Now please do it again with the new URL above.")
    }
});

let searchURLPrefix = "https://find-and-update.company-information.service.gov.uk/advanced-search/get-results?";

let requiredPostcodes = ["B10","B11","B25","B26","B27"];

let instructionsCycle = [];
let curInstruction = 0;

let d = new Date();
let year = d.getFullYear();
let month = d.getMonth();
let day = d.getDate();

let midpoint_year = 2022;
let sixteenHundredToMidpoint = "&incorporationFromDay=1&incorporationFromMonth=1&incorporationFromYear=1600&incorporationToDay=1&incorporationToMonth=1&incorporationToYear="+midpoint_year+"&status=active&sicCodes=&dissolvedFromDay=&dissolvedFromMonth=&dissolvedFromYear=&dissolvedToDay=&dissolvedToMonth=&dissolvedToYear="
let midpointToToday = "&incorporationFromDay=1&incorporationFromMonth=1&incorporationFromYear="+midpoint_year+"&incorporationToDay="+day+"&incorporationToMonth="+month+"&incorporationToYear="+year+"&status=active&sicCodes=&dissolvedFromDay=&dissolvedFromMonth=&dissolvedFromYear=&dissolvedToDay=&dissolvedToMonth=&dissolvedToYear="

requiredPostcodes.forEach((postcode) => {
    addToInstructions("("+postcode + ", active, incorporated pre-"+midpoint_year+")", searchURLPrefix + "\companyNameIncludes=&companyNameExcludes=&registeredOfficeAddress="+postcode+sixteenHundredToMidpoint)
    addToInstructions("("+postcode + ", active, incorporated "+midpoint_year+"-present)", searchURLPrefix + "\companyNameIncludes=&companyNameExcludes=&registeredOfficeAddress="+postcode+midpointToToday)
});

function addToInstructions(smallDesc,url){
    instructionsCycle.push("<span class='smallDesc'>"+smallDesc+"</span><br><br>Go to the URL below, click the big green 'Download results' button,<br>then come back here and upload the CSV you just obtained.<br><br><a href="+url+" target='_blank'><strong>Click here to go to the step "+(instructionsCycle.length+1)+" URL</strong></a>")
}

updateCurStepDOMElement();

function updateCurStepDOMElement(){
    if (curInstruction == instructionsCycle.length){
        setPositiveMessage("");
        alert("Finished! Now ask if they have an existing spreadsheet that they want to append this information to as new columns on the right - but they don't have to.");
        let userPresentedExistingSpreadsheet = false;
        let combinedCsv = null;
        if (userPresentedExistingSpreadsheet){
            alert("Deal with the existing spreadsheet here! Somehow!");
        } else {
            combinedCsv = [];
            loadedCsvData.forEach((csv)=>{
                csv.data.forEach((row)=>{
                    combinedCsv.push(row);
                })
            });
            setPositiveMessage("All done! You should now immediately be prompted to download a new, combined CSV.")
            downloadAsFile(Papa.unparse(combinedCsv), "text/plain", "combined.csv");
        }
    
    } else {
        curStepDOMElement.innerHTML = "Step "+(curInstruction+1)+" of "+instructionsCycle.length;
        instructionsDOMElement.innerHTML = instructionsCycle[curInstruction];
    }
}

function setPositiveMessage(msg){
    positiveMessage.innerHTML = msg;
    errorMessage.innerHTML = "";
}

function setErrorMessage(msg){
    errorMessage.innerHTML = msg;
    positiveMessage.innerHTML = "";
}

function downloadAsFile(data, type, name) {
    let blob = new Blob([data], {type});
    let url = window.URL.createObjectURL(blob);
    let anchor = document.createElement("a");
    anchor.download = name;
    anchor.href = url;
    anchor.click();
    window.URL.revokeObjectURL(url);
}

function loadCSV(file){
    // Parse the CSV content
    const results = Papa.parse(file,{
        header:true,
        complete: function (results) {
                loadedCsvData.push(results);
        }
    });
}

function onCSVloadComplete(){

    let d = csvData.data;
    
    for (let i = 0; i < d.length; i++){
        let row = d[i];
        console.log(row[Object.keys(row)[0]]);
        let companiesHouseEquivalent = getCompaniesHouseDataCompanyWithName(row[Object.keys(row)[0]]);
        if (companiesHouseEquivalent != null){
             row["company_status_"+(year)] = companiesHouseEquivalent["company_status"];
        }
        d[i] = row;
    }

    csvData.data = d;

    let outputCSVtext = Papa.unparse(csvData.data);
    console.log(outputCSVtext)

    alert("And then look at nominatim too, to get the latlong");  //https://nominatim.openstreetmap.org/search?q=135+pilkington+avenue,+birmingham&format=json&polygon=1&addressdetails=1
}

function getCompaniesHouseDataCompanyWithName(name){
    let d = companiesHouseData.data;

    for (let i = 0; i < d.length; i++){
        let row = d[i];
        let companyName = row["company_name"];
        console.log("...why doesn't this return *any* hits at all? Is there really no overlap? Does the TEED spreadsheet really not include any dissolved B25 businesses (which is what the current companies house test data is?)")
        if (companyName == name){
            return row;
        }
    }
    return null;
}