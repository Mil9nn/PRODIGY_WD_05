import { useState, useEffect } from "react";
import { Search, Wind, Droplet, Thermometer, MapPin, Sunrise, Sunset, ChevronLeft, ChevronRight } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';

function Hero() {
    const weather_api_key = import.meta.env.VITE_WEATHER_API_KEY;
    const [location, setLocation] = useState("");
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tempUnit, setTempUnit] = useState("C"); // C for Celsius, F for Fahrenheit
    const [activeDay, setActiveDay] = useState(0);
    const [darkMode, setDarkMode] = useState(false);

    // Check for dark mode preference on load
    useEffect(() => {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(isDark);
    }, []);

    // Handle temperature unit toggle
    const toggleTempUnit = () => {
        setTempUnit(tempUnit === "C" ? "F" : "C");
    };

    // Convert temperature based on selected unit
    const convertTemp = (temp) => {
        if (tempUnit === "F") {
            return Math.round((temp * 9 / 5) + 32);
        }
        return Math.round(temp);
    };

    // Add a function to handle getting the user's current location
    const handleGetCurrentLocation = () => {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${weather_api_key}&q=${lat},${lon}&days=7&aqi=no&alerts=no`);
                    const data = await response.json();
                    console.log(data);
                    setWeatherData(data);
                    toast.success("Found your location!");
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching weather data:", error);
                    toast.error("Error fetching weather data");
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Error getting location:", error);
                setLoading(false);
                toast.error("Unable to get your location. Please enter a location manually.");
            }
        );
    };

    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleClick();
        }
    };

    const handleClick = async () => {
        if (!location.trim()) {
            toast.warning("Please enter a location");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${weather_api_key}&q=${location}&days=7&aqi=no&alerts=no`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            setWeatherData(data);
            toast.success(`Weather data loaded for ${data.location.name}`);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to get weather data. Please check the location and try again.");
        } finally {
            setLoading(false);
        }
    };

    // Format time from API (converts "2023-05-21 13:00" to "1 PM")
    const formatTime = (timeStr) => {
        const date = new Date(timeStr);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    };

    // Format date (converts "2023-05-21" to "Mon, 21 May")
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const handleVoiceSearch = () => {
        // Check if the browser supports speech recognition
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error("Speech recognition not supported in your browser");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.continuous = false;

        // Show toast when listening starts
        const toastId = toast.info("🎤 Listening for voice input...", {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
        });

        recognition.start();

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            console.log("Recognized speech:", speechResult);

            // Remove "Listening" toast and show recognized speech
            toast.dismiss(toastId);
            toast.success(`Searching for: "${speechResult}"`);

            setLocation(speechResult);
            // Wait a moment before triggering the search to allow the state to update
            setTimeout(() => handleClick(), 500);
        };

        recognition.onerror = (event) => {
            toast.dismiss(toastId);
            toast.error(`Speech recognition error: ${event.error}`);
        };

        recognition.onend = () => {
            // Clear the toast if recognition ends without results
            toast.dismiss(toastId);
        };
    };

    // Navigate days in forecast
    const navigateDay = (direction) => {
        if (direction === 'next' && activeDay < weatherData.forecast.forecastday.length - 1) {
            setActiveDay(activeDay + 1);
        } else if (direction === 'prev' && activeDay > 0) {
            setActiveDay(activeDay - 1);
        }
    };

    // Toggle dark/light mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Get background gradient based on time and weather condition
    const getBackgroundClass = () => {
        if (!weatherData) return darkMode ? "bg-gradient-to-br from-gray-900 to-indigo-900" : "bg-gradient-to-br from-blue-100 to-purple-100";

        const condition = weatherData.current.condition.text.toLowerCase();
        const isDay = weatherData.current.is_day === 1;

        if (darkMode) {
            return "bg-gradient-to-br from-gray-900 to-indigo-900";
        }

        if (condition.includes("rain") || condition.includes("drizzle")) {
            return isDay ? "bg-gradient-to-br from-blue-200 to-gray-300" : "bg-gradient-to-br from-blue-900 to-gray-800";
        } else if (condition.includes("cloud")) {
            return isDay ? "bg-gradient-to-br from-blue-100 to-gray-200" : "bg-gradient-to-br from-gray-800 to-blue-900";
        } else if (condition.includes("sun") || condition.includes("clear")) {
            return isDay ? "bg-gradient-to-br from-blue-100 to-yellow-100" : "bg-gradient-to-br from-indigo-900 to-purple-900";
        } else {
            return isDay ? "bg-gradient-to-br from-blue-100 to-purple-100" : "bg-gradient-to-br from-gray-800 to-blue-900";
        }
    };

    return (
        <div className={`min-h-screen ${getBackgroundClass()} p-4 md:p-8 flex flex-col items-center justify-center transition-colors duration-300`}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={darkMode ? "dark" : "light"}
            />

            <div className="w-full max-w-3xl mx-auto">
                {/* Header with toggle switch */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-3xl md:text-4xl font-bold text-center ${darkMode ? "text-white" : "text-gray-800"}`}>
                        Weather Forecast
                    </h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTempUnit}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${darkMode
                                ? "bg-gray-700 text-white hover:bg-gray-600"
                                : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"}`}
                        >
                            °{tempUnit}
                        </button>
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-full cursor-pointer ${darkMode
                                ? "bg-gray-700 text-yellow-300"
                                : "bg-blue-100 text-gray-800"}`}
                        >
                            {darkMode ? "☀️" : "🌙"}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
                    <div className="relative w-full">
                        <input
                            onChange={handleLocationChange}
                            onKeyPress={handleKeyPress}
                            className={`w-full px-4 py-3 pr-10 rounded-lg transition-all ${darkMode
                                ? "bg-gray-800 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                                : "border border-[#006980] focus:ring-blue-500 focus:border-blue-500"}`}
                            type="text"
                            name="location"
                            placeholder="Enter city name or zip code..."
                            value={location}
                        />
                        <Search className={`absolute right-3 top-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`} size={20} />
                    </div>
                    <button
                        onClick={handleClick}
                        className="w-full md:w-auto px-6 py-3 bg-[#006980] cursor-pointer text-white font-medium rounded-full shadow hover:bg-[#00546a] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
                    >
                        Fetch
                    </button>
                    <button
                        className="flex gap-1 items-center justify-center w-full md:w-auto px-6 py-3 bg-[#8800ff] cursor-pointer text-white font-medium rounded-full shadow hover:bg-[#b700ff] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
                        onClick={handleVoiceSearch}
                    >
                        <span className="font-semibold mr-1">Voice</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
                            <path d="M17 7V11C17 13.7614 14.7614 16 12 16C9.23858 16 7 13.7614 7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7Z" stroke="#fff" strokeWidth="1.5" />
                            <path d="M20 11C20 15.4183 16.4183 19 12 19M12 19C7.58172 19 4 15.4183 4 11M12 19V22M12 22H15M12 22H9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Location button */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={handleGetCurrentLocation}
                        className="flex items-center gap-2 px-6 py-2 bg-[#166b7e] text-white font-medium rounded-full shadow hover:bg-[#0d5563] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-all cursor-pointer"
                    >
                        <MapPin size={18} />
                        Use My Current Location
                    </button>
                </div>

                {loading ? (
                    <div className={`flex flex-col items-center justify-center p-12 rounded-xl shadow-lg ${darkMode ? "bg-gray-800 bg-opacity-60" : "bg-white bg-opacity-80"}`}>
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Loading weather data...</p>
                    </div>
                ) : (
                    weatherData ? (
                        <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? "bg-gray-800 bg-opacity-90" : "bg-white bg-opacity-90"}`}>
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row items-center justify-between">
                                    <div className="text-center md:text-left mb-4 md:mb-0">
                                        <h2 className={`text-2xl md:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                            {weatherData.location.name}
                                        </h2>
                                        <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                                            {weatherData.location.region && `${weatherData.location.region}, `}{weatherData.location.country}
                                        </p>
                                        <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>

                                    <div className="flex items-center">
                                        <img
                                            src={`https:${weatherData.current.condition.icon}`}
                                            alt={weatherData.current.condition.text}
                                            className="w-16 h-16"
                                        />
                                        <div className="ml-2 text-center">
                                            <p className={`text-4xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                {convertTemp(weatherData.current.temp_c)}°{tempUnit}
                                            </p>
                                            <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                                                {weatherData.current.condition.text}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sun times row */}
                                <div className={`flex justify-between items-center mt-6 p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                                    <div className="flex items-center">
                                        <Sunrise size={20} className="text-yellow-500 mr-2" />
                                        <div>
                                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Sunrise</p>
                                            <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                {weatherData.forecast.forecastday[0].astro.sunrise}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Sunset size={20} className="text-orange-500 mr-2" />
                                        <div>
                                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Sunset</p>
                                            <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                {weatherData.forecast.forecastday[0].astro.sunset}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div className={`p-4 rounded-lg shadow flex items-center ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                                        <Thermometer size={24} className="text-red-500 mr-3" />
                                        <div>
                                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Feels Like</p>
                                            <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                {convertTemp(weatherData.current.feelslike_c)}°{tempUnit}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`p-4 rounded-lg shadow flex items-center ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                                        <Droplet size={24} className="text-blue-500 mr-3" />
                                        <div>
                                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Humidity</p>
                                            <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                {weatherData.current.humidity}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`p-4 rounded-lg shadow flex items-center ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                                        <Wind size={24} className="text-blue-400 mr-3" />
                                        <div>
                                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Wind Speed</p>
                                            <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                {weatherData.current.wind_kph} km/h
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`rounded-xl shadow-lg p-8 text-center ${darkMode ? "bg-gray-800 bg-opacity-80" : "bg-white bg-opacity-80"}`}>
                            <Search size={48} className={`mx-auto mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                            <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                                No weather data available. Enter a location and click Get Weather
                            </p>
                        </div>
                    )
                )}
            </div>

            {weatherData && weatherData.forecast ? (
                <div className="mt-6 w-full max-w-3xl">
                    {/* Weekly Forecast */}
                    <div>
                        <h2 className={`text-xl font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>
                            7-Day Forecast
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                            {weatherData.forecast.forecastday.map((day, index) => (
                                <div
                                    key={index}
                                    onClick={() => setActiveDay(index)}
                                    className={`p-3 rounded-lg shadow text-center cursor-pointer transition-all ${activeDay === index
                                        ? (darkMode ? "bg-indigo-900" : "bg-blue-100")
                                        : (darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white bg-opacity-90 hover:bg-opacity-100")
                                        }`}
                                >
                                    <p className={`text-sm font-medium ${darkMode ? (activeDay === index ? "text-white" : "text-gray-400") : (activeDay === index ? "text-blue-600" : "text-gray-500")}`}>
                                        {formatDate(day.date)}
                                    </p>
                                    <img
                                        src={`https:${day.day.condition.icon}`}
                                        alt={day.day.condition.text}
                                        className="w-12 h-12 mx-auto my-1"
                                    />
                                    <div className="flex justify-center gap-2 text-sm">
                                        <span className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                                            {convertTemp(day.day.maxtemp_c)}°
                                        </span>
                                        <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                                            {convertTemp(day.day.mintemp_c)}°
                                        </span>
                                    </div>
                                    <div className={`text-xs mt-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>
                                        {day.day.daily_chance_of_rain > 20 ? `${day.day.daily_chance_of_rain}% 💧` : ""}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Hourly Forecast */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                {activeDay === 0 ? "Today's Forecast" : `Forecast for ${formatDate(weatherData.forecast.forecastday[activeDay].date)}`}
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigateDay('prev')}
                                    disabled={activeDay === 0}
                                    className={`p-1 rounded ${darkMode
                                        ? "bg-gray-700 text-white disabled:bg-gray-800 disabled:text-gray-600"
                                        : "bg-white text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"} ${activeDay === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => navigateDay('next')}
                                    disabled={activeDay === weatherData.forecast.forecastday.length - 1}
                                    className={`p-1 rounded ${darkMode
                                        ? "bg-gray-700 text-white disabled:bg-gray-800 disabled:text-gray-600"
                                        : "bg-white text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"} ${activeDay === weatherData.forecast.forecastday.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {weatherData.forecast.forecastday[activeDay].hour
                                .filter((_, index) => index % 3 === 0) // Show every 3 hours
                                .map((hour, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg shadow text-center transition-all hover:shadow-md ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white bg-opacity-90 hover:bg-opacity-100"}`}
                                    >
                                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            {formatTime(hour.time)}
                                        </p>
                                        <img
                                            src={`https:${hour.condition.icon}`}
                                            alt={hour.condition.text}
                                            className="w-10 h-10 mx-auto my-1"
                                        />
                                        <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                            {convertTemp(hour.temp_c)}°{tempUnit}
                                        </p>
                                        <div className={`text-xs mt-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>
                                            {hour.chance_of_rain > 0 ? `${hour.chance_of_rain}% 💧` : ""}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default Hero;