//const tilesProvider = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
//const tilesProvider = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
const tilesProvider = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
let lugaresInfo=[]
let myMap 
const dibujarMapa=(obj) =>{
    arrC = []
    myMap = L.map('myMap').setView(obj,15)

    L.tileLayer(tilesProvider,{
        maxZoom: 20
    }).addTo(myMap)
    arrC.push({
        latLng:L.latLng(obj.lat,obj.lon),
        name: "origen"
        })
    lugaresInfo.forEach(element=>{
        arrC.push({
            latLng:L.latLng(element.posicion.lat, element.posicion.lng),
            name: element.nombre
                });
    });
    
    let ruta = L.Routing.control({
        waypoints: arrC,
        lineOptions:{
            styles:[{color: 'yellow', opacity: 0.15, weight: 8}, {color: 'white', opacity: 0.6, weight: 4}, {color: 'Green', opacity: 2, weight: 2.3}],
            addWaypoints: false
        },
        showAlternatives: true,
        altLineOptions:{
            styles:[{color: 'yellow', opacity: 0.15, weight: 8}, {color: 'white', opacity: 0.6, weight: 4}, {color: 'yellow', opacity: 2, weight: 9}],
            addWaypoints: false
        },
    })
    ruta.addTo(myMap);
 
    lugaresInfo.forEach(element=>{
        let markerO = L.marker(element.posicion).addTo(myMap);
        markerO.bindPopup(element.nombre).openPopup();
    });
    let markerO = L.marker(obj).addTo(myMap)
    markerO.bindPopup("origen").openPopup();
    myMap.panTo(obj);
}

const conseguirlugares = () =>{
    var data = {
        "Estado": "Puebla",
        "Municipio": "Puebla de Zaragoza",
        "Colonia": "CENTRO",
        "Tipo": "OXXO",
        "Ubicacion":"HEROICA PUEBLA DE ZARAGOZA, Puebla, PUEBLA"
    };
    fetch('http://localhost:8010/proxy',{
        method: 'POST', // or 'PUT'
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers:{
          'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(lugares =>{
            lugares.forEach(lugar =>{
                let lugarInfo = {
                    posicion:{
                        lat: parseFloat(lugar.Latitud,10), 
                        lng: parseFloat(lugar.Longitud,10)
                    },
                    nombre: lugar.Negocio
                    }
                lugaresInfo.push(lugarInfo)
            })
            let origen={
                lat:19.043658,  
                lon:-98.199083 
            };
            console.log(obtRuta(origen).then((data)=>console.log(data)));
            dibujarMapa(origen);
        })
}
//funcion que consigue la ruta mas corta
async function obtRuta(origen){
    var minimo;
    var router = L.Routing.osrmv1();
    lugaresInfo.forEach(async (element, index) => {
        var valor
        waypoints = [{ latLng: L.latLng(origen.lat, origen.lon) }, { latLng: L.latLng(element.posicion.lat, element.posicion.lng) }]
        router.route(waypoints, async function distancias(err, routes) {
            if (err) {
                alert('Ha ocurrido un error' + err)
            }
            else{
                valor = await (routes[0].summary.totalDistance)
                if (index == 0)
                    minimo = valor
                if (valor < minimo) {
                    minimo = valor
                    console.log("nuevo minimo:" + minimo + "\nLugar:" + element.nombre)
                }
                console.log(valor)
            }
        })
    })
    console.log(minimo);
    return new Promise((resolve,reject)=>{
        setTimeout(() => {
            resolve(minimo);
        },2000)
    })    
}


conseguirlugares()