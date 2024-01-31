import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import * as Papa from 'papaparse';

/*

What does it need to do?

* Takes your CSV file full of company data as an input
* For each line in the CSV, it searches up that company name on companies house using the companies house API
* It then returns a new CSV featuring the company names, in the same order, as well as the updated data received from the API (e.g. dissolved or active, postcode, address)
* Should also take the opportunity to ping the nominatim openstreetmap api with the address, to get automatic lat/long coordinates

*/

const API_KEY = prompt("Please provide the Companies House API key associated with the website this program is hosted on to continue.")

let existingCsvUploader = document.getElementById("existing-csv-file-upload");
let informationObtainedFromCompaniesHouse = [];

async function companiesHouseFetch(urlSuffix){
    const url = "https://api.company-information.service.gov.uk/"+urlSuffix;
    let key = btoa(API_KEY);
    const options = {
    method: 'GET',
    headers: {
        'Authorization': 'Basic '+key,
        'Content-Type': 'text/json'
        }
    };

    return await fetch(url, options)
    .then( res => res.text() )
    .then( data => {console.log(data); informationObtainedFromCompaniesHouse.push(data)});
}

alert("On the following screen, please upload the existing CSV that you want to update with new values. The leftmost column will be treated as the name. In fact, it'll ONLY read the leftmost column.");

existingCsvUploader.addEventListener("change", () => {loadCSV(existingCsvUploader.files[0])});

function loadCSV(file){
    // Parse the CSV content
    const results = Papa.parse(file,{
        header:true,
        complete: function (results) {
            onCSVloadComplete(results);
        }
    });
}

function onCSVloadComplete(results){
    console.log(results)

    let targetNumber = Object.keys(results.data[0]).length;

    Object.keys(results.data[0]).forEach(async (cell)=>{
       await pingCompaniesHouseForInformationRelatingToABusinessCalled(cell);
       if (informationObtainedFromCompaniesHouse.length == targetNumber){
            console.log("Finished?")
       }
    })
}

async function pingCompaniesHouseForInformationRelatingToABusinessCalled(businessName){
    await companiesHouseFetch("advanced-search/companies?company_name_includes="+businessName);
}

"https://nominatim.openstreetmap.org/search?q=135+pilkington+avenue,+birmingham&format=json&polygon=1&addressdetails=1"