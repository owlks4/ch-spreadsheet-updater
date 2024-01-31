import './style.css'
import javascriptLogo from './javascript.svg'
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

let existingCsvUploader = document.getElementById("existing-csv-file-upload");
let companiesHouseCsvUploader = document.getElementById("companies-house-csv-file-upload");
companiesHouseCsvUploader.style = "display:none;"
let csvData = null;
let companiesHouseData = null;

let curDate = new Date().getFullYear();

alert("On the following screen, please upload the existing CSV that you want to update with new values. The leftmost column will be treated as the name. In fact, it'll ONLY read the leftmost column.");

existingCsvUploader.addEventListener("change", () => {loadCSV(existingCsvUploader.files[0], false)});


function loadCSV(file, isCH){
    // Parse the CSV content
    const results = Papa.parse(file,{
        header:true,
        complete: function (results) {
            if (isCH){
                companiesHouseData = results;
                onCSVloadComplete();
            }
            else {
                csvData = results;
                existingCsvUploader.style = "display:none;"
                companiesHouseCsvUploader.style = ""
                alert("Now please upload a CSV downloaded from the advanced search page on the Companies House website.\n\nRemember that advanced search results clip at 5000 entries, so if your CSV only has 5000 entries, it means some results may have been clipped.");
                companiesHouseCsvUploader.addEventListener("change", () => {loadCSV(companiesHouseCsvUploader.files[0], true)});
            }
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
             row["company_status_"+(curDate)] = companiesHouseEquivalent["company_status"];
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