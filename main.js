import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'

function companiesHouseFetch(urlSuffix){
    const url = "https://api.company-information.service.gov.uk/"+urlSuffix;
    let key = btoa("api-key-here");
    const options = {
    method: 'GET',
    headers: {
        'Authorization': 'Basic '+key,
        'Content-Type': 'text/json'
        }
    };

    return await fetch(url, options)
    .then( res => res.text() )
    .then( data => console.log(data) );
}

let API_KEY = prompt("Please provide the Companies House api key associated with this site to continue:")

console.log(companiesHouseFetch("company/06638759"));

if (true){
    console.log("should have checked that a fetch to the guild of students returned a hit (or at least, not an auth failed result)")
}