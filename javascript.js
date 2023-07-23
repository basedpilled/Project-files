
class Map {
    constructor() {
        this.coordinates = [];
        this.businesses = []
        this.map = {}
        this.markers = {}
        this.layer = {}
    }
    setUp(coords) {
        this.coordinates = coords;
        this.map = L.map('map', {
        center: this.coordinates,
        zoom: 11,
        });
        this.layer = L.layerGroup().addTo(this.map); 
        // add openstreetmap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
         minZoom: '15',
        }).addTo(this.map)
        // create and add geolocation marker
        const marker = L.marker(this.coordinates)
        .addTo(this.map)
    }
    addBusinesses(businessArr) {
        this.businesses = businessArr;
        this.addMarkers();
    }
    resetBusinesses() {
        this.layer.clearLayers();
    }
    addMarkers() {
		for (var i = 0; i < this.businesses.length; i++) {
		this.markers = L.marker([
			this.businesses[i].lat,
			this.businesses[i].long,
		])
			.bindPopup(`<p1>${this.businesses[i].name}</p1>`)
			.addTo(this.layer)
		}
	}
}
const myMap = new Map();
async function getFoursquare(business) {
	const options = {
		method: 'GET',
		headers: {
		Accept: 'application/json',
		Authorization: 'fsq3ILd96xaxQ/pdbRFrp9ZWbn8LPYpsOH7BoTngWX8hd9Y='
		}
	}
	let limit = 5
	let latitude = myMap.coordinates[0]
	let longitude = myMap.coordinates[1]
	let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${latitude}%2C${longitude}`, options)
	let data = await response.text()
	let parsedData = JSON.parse(data);
	let businesses = parsedData.results;
	return businesses;
}

async function getCoords(){
	const pos = await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject)
	});
	return [pos.coords.latitude, pos.coords.longitude]
}


window.onload = async () => {
	const coords = await getCoords();
    myMap.setUp(coords);
	myMap.buildMap();
}
document.getElementById('submit').addEventListener('click', async (event) => {
    event.preventDefault();
    if (myMap.businesses.length) {
        myMap.resetBusinesses();
    }
    let business = document.getElementById('business').value;
    const businesses = await getFoursquare(business);
    myMap.addBusinesses(businesses.map(data => {
        return {
            name: data.name,
            lat: data.geocodes.main.latitude,
            long: data.geocodes.main.longitude
        }
    }));

})

