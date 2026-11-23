import axios from 'axios';

const BASE_URL = "https://geocoding-api.open-meteo.com/v1/search"

export async function searchCityApi(city : String){
    const response = await axios.get (BASE_URL, {
        params: {
            name: city,
            count: 1,
            language: 'es',
            format: 'json'
        }

    });
    return response.data;

}