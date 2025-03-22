
import { useState, useEffect } from "react";
import { Search, Wind, Droplet, Thermometer } from "lucide-react";

function Hero() {
  const weather_api_key = 'a46d7da25bb94fa2a1485912252203';
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (weatherData) {
      console.log('Updated weatherData:', weatherData);
    }
  }, [weatherData]);

  useEffect(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather(`${lat}, ${lon}`);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLoading(false);
      }
    );
  }, []);

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  const fetchWeather = async (query) => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${weather_api_key}&q=${query}`);
      const data = await response.json();
      console.log(data);
      setWeatherData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (location.trim()) {
      fetchWeather(location);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && location.trim()) {
      fetchWeather(location);
    }
  };

  // Function to get background color based on temperature
  const getBackgroundColor = (temp) => {
    if (!temp) return 'bg-blue-100';
    if (temp <= 0) return 'bg-blue-200';
    if (temp <= 10) return 'bg-blue-100';
    if (temp <= 20) return 'bg-green-100';
    if (temp <= 30) return 'bg-yellow-100';
    return 'bg-orange-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">Weather Forecast</h1>
        
        <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
          <div className="relative w-full">
            <input 
              onChange={handleLocationChange}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              type="text"
              name="location"
              placeholder="Enter city name or zip code..."
              value={location}
            />
            <Search className="absolute right-3 top-3 text-gray-400" size={20} />
          </div>
          <button 
            onClick={handleClick}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
          >
            Get Weather
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          weatherData ? (
            <div className={`rounded-xl shadow-lg overflow-hidden ${getBackgroundColor(weatherData.current.temp_c)}`}>
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