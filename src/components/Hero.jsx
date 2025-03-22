import { useState, useEffect } from "react";
import { Search, Wind, Droplet, Thermometer } from "lucide-react";

function Hero() {
    const weather_api_key = '67c9ae2007f14a9b9d7123803252203';
    const [location, setLocation] = useState("");
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Remove the automatic geolocation request on component mount
    // useEffect(() => {
    //     setLoading(true);
    //     navigator.geolocation.getCurrentPosition(async (position) => {
    //         let lat = position.coords.latitude;
    //         let lon = position.coords.longitude;
    //         const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${weather_api_key}&q=${lat},${lon}`);
    //         console.log(response);
    //     })
    // }, [])

    // Add a function to handle getting the user's current location
    const handleGetCurrentLocation = () => {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${weather_api_key}&q=${lat},${lon}`);
                    const data = await response.json();
                    setWeatherData(data);
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching weather data:", error);
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Error getting location:", error);
                setLoading(false);
                alert("Unable to get your location. Please enter a location manually.");
            }
        );
    };

    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };

    const handleClick = async () => {
        if (!location.trim()) {
            alert("Please enter a location");
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${weather_api_key}&q=${location}`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            setWeatherData(data);
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to get weather data. Please check the location and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">Weather Forecast</h1>
                
                <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
                    <div className="relative w-full">
                        <input 
                            onChange={handleLocationChange}
                            className="w-full px-4 py-3 pr-10 rounded-lg border border-[#006980] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            type="text"
                            name="location"
                            placeholder="Enter city name or zip code..."
                            value={location}
                        />
                        <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                    </div>
                    <button 
                        onClick={handleClick}
                        className="w-full md:w-auto px-6 py-3 bg-[#006980] cursor-pointer text-white font-medium rounded-lg shadow hover:bg-[#770080] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
                    >
                        Get Weather
                    </button>
                </div>
                
                {/* Add a button for getting current location */}
                <div className="flex justify-center mb-6">
                    <button 
                        onClick={handleGetCurrentLocation}
                        className="px-6 py-2 bg-[#166b7e] text-white font-medium rounded-lg shadow hover:bg-[#770080] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-all cursor-pointer"
                    >
                        Use My Current Location
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    weatherData ? (
                        <div className="rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row items-center justify-between">
                                    <div className="text-center md:text-left mb-4 md:mb-0">
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{weatherData.location.name}</h2>
                                        <p className="text-gray-600">{weatherData.location.country}</p>
                                        <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <img 
                                            src={`https:${weatherData.current.condition.icon}`} 
                                            alt={weatherData.current.condition.text}
                                            className="w-16 h-16"
                                        />
                                        <div className="ml-2 text-center">
                                            <p className="text-4xl font-bold text-gray-800">{weatherData.current.temp_c}°C</p>
                                            <p className="text-gray-600">{weatherData.current.condition.text}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                    <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow flex items-center">
                                        <Thermometer size={24} className="text-red-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Feels Like</p>
                                            <p className="font-semibold text-gray-800">{weatherData.current.feelslike_c}°C</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow flex items-center">
                                        <Droplet size={24} className="text-blue-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Humidity</p>
                                            <p className="font-semibold text-gray-800">{weatherData.current.humidity}%</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow flex items-center">
                                        <Wind size={24} className="text-blue-400 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Wind Speed</p>
                                            <p className="font-semibold text-gray-800">{weatherData.current.wind_kph} km/h</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white bg-opacity-80 rounded-xl shadow-lg p-8 text-center">
                            <Search size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">No weather data available. Enter a location and click Get Weather</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default Hero;