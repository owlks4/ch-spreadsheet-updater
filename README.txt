# CH Spreadsheet Updater

* Takes a CSV file with company names in the leftmost column as an input
* For each line in the CSV, it searches up that company name on companies house, using the companies house API
* It then returns a new CSV featuring the company names, in the same order, as well as the updated data received from the API (e.g. dissolved or active, postcode, address)
* Should also take the opportunity to ping the nominatim openstreetmap api with the address, to get automatic lat/long coordinates