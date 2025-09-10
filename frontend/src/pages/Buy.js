import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import CarCard from '../components/CarCard';
import { AuthContext } from "../context/AuthContext";

const Buy = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error("Buy component must be used within an AuthProvider");
    }
    const { user, token } = authContext;

    const [cars, setCars] = useState([]);
    const [likedCarIds, setLikedCarIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [brandSearch, setBrandSearch] = useState("");
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedModels, setSelectedModels] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedKms, setSelectedKms] = useState([]);
    const [selectedFuelTypes, setSelectedFuelTypes] = useState([]);
    const [selectedTransmissions, setSelectedTransmissions] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedOwners, setSelectedOwners] = useState([]); // New state for owners
    const [sortOrder, setSortOrder] = useState("");
    const [activeFilters, setActiveFilters] = useState([]);

    const [availableBrands, setAvailableBrands] = useState([]);
    const [availableModels, setAvailableModels] = useState({}); // To store models grouped by brand
    const [availableOwners, setAvailableOwners] = useState([]); // New state for available owners
    const [availableCities, setAvailableCities] = useState([]); // New state for available cities
    const [expandedBrands, setExpandedBrands] = useState({});

    // Dummy data (already present) - keep these as they are static options
    const yearRanges = [
        { label: `${new Date().getFullYear()} & above`, value: `${new Date().getFullYear()}_above` },
        { label: `${new Date().getFullYear() - 2} & above`, value: `${new Date().getFullYear() - 2}_above` },
        { label: `${new Date().getFullYear() - 4} & above`, value: `${new Date().getFullYear() - 4}_above` },
        { label: `${new Date().getFullYear() - 6} & above`, value: `${new Date().getFullYear() - 6}_above` },
        { label: `${new Date().getFullYear() - 8} & above`, value: `${new Date().getFullYear() - 8}_above` },
        { label: `${new Date().getFullYear() - 10} & above`, value: `${new Date().getFullYear() - 10}_above` },
        { label: `${new Date().getFullYear() - 15} & above`, value: `${new Date().getFullYear() - 15}_above` },
        { label: `Before ${new Date().getFullYear() - 15}`, value: `0_before_${new Date().getFullYear() - 15}` },
    ].filter(range => parseInt(range.value.split('_')[0]) >= 2005 || range.value.includes('before'));

    const kmRanges = [
        { label: "10,000 kms or less", value: "10000" },
        { label: "30,000 kms or less", value: "30000" },
        { label: "50,000 kms or less", value: "50000" },
        { label: "75,000 kms or less", value: "75000" },
        { label: "1,00,000 kms or less", value: "100000" },
        { label: "1,50,000 kms or less", value: "150000" },
        { label: "2,00,000 kms or less", value: "200000" },
    ];
    const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric"];
    const transmissions = ["Automatic", "Manual"];
    useEffect(() => {
    // If not exactly '/buy', redirect to '/buy'
    if (location.pathname !== '/buy') {
        navigate('/buy', { replace: true });
    }
}, [location, navigate]);
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const cityParam = queryParams.get("city");
        const searchParam = queryParams.get("search");
        const fuelTypeParam = queryParams.get("fuelType");
        const brandParam = queryParams.get("brand");
        const ownerParam = queryParams.get("owner");
        const sortParam = queryParams.get("sortBy");
        const urlMinPrice = queryParams.get("minPrice");
        const urlMaxPrice = queryParams.get("maxPrice");

        setSelectedCity(cityParam || "");
        if (brandParam) {
            setSelectedBrands([brandParam]);
            setBrandSearch("");
        } else {
            setSelectedBrands([]);
            setBrandSearch(searchParam || "");
        }
        setSelectedFuelTypes(fuelTypeParam ? [fuelTypeParam] : []);
        setSelectedOwners(ownerParam ? [ownerParam] : []); // Parse owner from URL
        setMinPrice(urlMinPrice || "");
        setMaxPrice(urlMaxPrice || "");
        setSortOrder(sortParam || "");

        // Also update selectedYears, selectedKms, selectedModels, selectedTransmissions,   from URL
        setSelectedYears(queryParams.getAll("year"));
        setSelectedKms(queryParams.getAll("km"));
        setSelectedModels(queryParams.getAll("model"));
        setSelectedTransmissions(queryParams.getAll("transmission"));
    }, [location.search]);

    // Effect to update the list of active filter tags for the UI
    useEffect(() => {
        const currentActiveFilters = [];
        if (selectedCity) { currentActiveFilters.push({ type: 'city', value: selectedCity, label: `City: ${selectedCity}` }); }
        if (minPrice !== "" || maxPrice !== "") { currentActiveFilters.push({ type: 'priceRange', value: `${minPrice}-${maxPrice}`, label: `Price: ₹${minPrice || 'Min'} - ₹${maxPrice || 'Max'}` }); }
        selectedBrands.forEach(brand => currentActiveFilters.push({ type: 'brand', value: brand, label: `Brand: ${brand}` }));
        selectedModels.forEach(model => currentActiveFilters.push({ type: 'model', value: model, label: `Model: ${model}` }));
        // Only show general search tag if no specific brand/model filters are applied
        if (brandSearch && selectedBrands.length === 0 && selectedModels.length === 0) {
            currentActiveFilters.push({ type: 'search', value: brandSearch, label: `Search: "${brandSearch}"` });
        }
        selectedYears.forEach(yearVal => { const range = yearRanges.find(r => r.value === yearVal); if (range) currentActiveFilters.push({ type: 'year', value: yearVal, label: `Year: ${range.label}` }); });
        selectedKms.forEach(kmVal => { const range = kmRanges.find(r => r.value === kmVal); if (range) currentActiveFilters.push({ type: 'kmDriven', value: kmVal, label: `Kms: ${range.label}` }); });
        selectedFuelTypes.forEach(fuelType => currentActiveFilters.push({ type: 'fuelType', value: fuelType, label: `Fuel: ${fuelType}` }));
        selectedTransmissions.forEach(trans => currentActiveFilters.push({ type: 'transmission', value: trans, label: `Transmission: ${trans}` }));
        selectedOwners.forEach(owner => currentActiveFilters.push({ type: 'owner', value: owner, label: `Owner: ${owner}` })); // Add owner filter tag
        setActiveFilters(currentActiveFilters);
    }, [minPrice, maxPrice, brandSearch, selectedBrands, selectedModels, selectedYears,
        selectedKms, selectedFuelTypes, selectedTransmissions, selectedCity,
        selectedOwners, sortOrder, kmRanges, yearRanges
    ]);

    // Main effect for fetching cars from the backend based on filters.
    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (brandSearch) params.append('search', brandSearch);
            if (selectedCity) params.append('city', selectedCity);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            selectedBrands.forEach(brand => params.append('brand', brand));
            selectedModels.forEach(model => params.append('model', model));
            selectedYears.forEach(year => params.append('year', year));
            selectedKms.forEach(km => params.append('kms_driven', km)); // Use kms_driven as per backend
            selectedFuelTypes.forEach(fuel => params.append('fuelType', fuel));
            selectedTransmissions.forEach(trans => params.append('transmission', trans));
            selectedOwners.forEach(owner => params.append('owner', owner)); // Add owner to params

            if (sortOrder && sortOrder !== "") params.append('sortBy', sortOrder);


            try {
                console.log("Buy.js: Fetching cars with params:", params.toString());
                const response = await axios.get(`http://localhost:5000/api/cars`, { params });

                setCars(response.data.cars || []);
                if (response.data.filterOptions.brands) {
                    setAvailableBrands(response.data.filterOptions.brands);
                }
                if (response.data.filterOptions.owners) {
                    setAvailableOwners(response.data.filterOptions.owners);
                }
                if (response.data.filterOptions.cities) {
                    setAvailableCities(response.data.filterOptions.cities);
                }
                const modelsByBrand = {};
                response.data.cars.forEach(car => { // Use fetched cars to derive models
                    if (car.make && car.model) {
                        if (!modelsByBrand[car.make]) {
                            modelsByBrand[car.make] = new Set();
                        }
                        modelsByBrand[car.make].add(car.model);
                    }
                });
                // Convert sets to sorted arrays
                for (const brand in modelsByBrand) {
                    modelsByBrand[brand] = Array.from(modelsByBrand[brand]).sort();
                }
                setAvailableModels(modelsByBrand);

            } catch (err) {
                console.error("Buy.js: Error fetching cars:", err);
                setError("Failed to fetch cars. Please try again later.");
                setCars([]);
            } finally {
                setLoading(false);
            }
        }
        fetchCars();
    }, [
        minPrice, maxPrice, brandSearch, selectedBrands, selectedModels, selectedYears,
        selectedKms, selectedFuelTypes, selectedTransmissions, selectedCity, selectedOwners, sortOrder, navigate, location.search
    ]);
    const handleBrandCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setSelectedBrands(prev => {
            const newBrands = checked ? [...prev, value] : prev.filter(b => b !== value);
            // If a brand is unchecked, uncheck all its models too
            if (!checked) {
                setSelectedModels(prevModels => prevModels.filter(m => !getModelsForBrand(value).includes(m)));
            }
            return newBrands;
        });
    };
    const handleModelCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setSelectedModels(prev => checked ? [...prev, value] : prev.filter(m => m !== value));
    };
    const handleYearChange = (e) => {
        const { value, checked } = e.target;
        setSelectedYears(prev => checked ? [...prev, value] : prev.filter(y => y !== value));
    };
    const handleKmChange = (e) => {
        const { value, checked } = e.target;
        setSelectedKms(prev => checked ? [...prev, value] : prev.filter(k => k !== value));
    };
    const handleFuelTypeChange = (e) => {
        const { value, checked } = e.target;
        setSelectedFuelTypes(prev => checked ? [...prev, value] : prev.filter(f => f !== value));
    };
    const handleTransmissionChange = (e) => {
        const { value, checked } = e.target;
        setSelectedTransmissions(prev => checked ? [...prev, value] : prev.filter(t => t !== value));
    };
    const handleOwnerChange = (e) => {
        const { value, checked } = e.target;
        setSelectedOwners(prev => checked ? [...prev, value] : prev.filter(o => o !== value));
    };
    const handleCityChange = (e) => {
        setSelectedCity(e.target.value);
    };

    const handleClearAllFilters = () => {
        setMinPrice("");
        setMaxPrice("");
        setBrandSearch("");
        setSelectedBrands([]);
        setSelectedModels([]);
        setSelectedYears([]);
        setSelectedKms([]);
        setSelectedFuelTypes([]);
        setSelectedTransmissions([]);
        setSelectedCity("");
        setSelectedOwners([]);
        setSortOrder("");
        setActiveFilters([]);
        navigate('/buy', { replace: true });
    };

    const handleRemoveActiveFilter = (filterToRemove) => {
        switch (filterToRemove.type) {
            case 'priceRange': setMinPrice(""); setMaxPrice(""); break;
            case 'brand': setSelectedBrands(prev => prev.filter(b => b !== filterToRemove.value)); setSelectedModels(prevModels => prevModels.filter(m => !getModelsForBrand(filterToRemove.value).includes(m))); break;
            case 'model': setSelectedModels(prev => prev.filter(m => m !== filterToRemove.value)); break;
            case 'search': setBrandSearch(""); break;
            case 'year': setSelectedYears(prev => prev.filter(y => y !== filterToRemove.value)); break;
            case 'kmDriven': setSelectedKms(prev => prev.filter(k => k !== filterToRemove.value)); break;
            case 'fuelType': setSelectedFuelTypes(prev => prev.filter(f => f !== filterToRemove.value)); break;
            case 'transmission': setSelectedTransmissions(prev => prev.filter(t => t !== filterToRemove.value)); break;
            case 'owner': setSelectedOwners(prev => prev.filter(o => o !== filterToRemove.value)); break; // Remove owner filter
            case 'city': setSelectedCity(""); break;
            default: break;
        }
    };

    // Function to handle liking/unliking a car
    const handleLikeToggle = async (carId) => {
        if (!token || !user?.userId) {
            alert("Please log in to like cars!");
            navigate('/login');
            return;
        }

        const isCurrentlyLiked = likedCarIds.has(carId);

        try {
            if (isCurrentlyLiked) {
                setLikedCarIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(carId);
                    return newSet;
                });
                await authContext.api.delete(`/user/like-car/${carId}`);
            } else {
                setLikedCarIds(prev => {
                    const newSet = new Set(prev).add(carId);
                    return newSet;
                });
                await authContext.api.post(`/user/like-car`, { carId });
            }
        } catch (error) {
            console.error(`Error toggling like for car ${carId}:`, error);
            setLikedCarIds(prev => {
                const newSet = new Set(prev);
                if (isCurrentlyLiked) {
                    newSet.add(carId);
                } else {
                    newSet.delete(carId);
                }
                return newSet;
            });
            alert("Failed to update like status. Please try again.");
        }
    };
    const handleCarClick = (carId) => {
        navigate(`/car-details/${carId}`);
    };
    const toggleBrandExpansion = (brand) => {
        setExpandedBrands(prev => ({ ...prev, [brand]: !prev[brand] }));
    };

    const getModelsForBrand = (brandName) => {
        return availableModels[brandName] || [];
    };

    useEffect(() => {
        const fetchLikedCars = async () => {
            if (!token || !user?.userId) {
                setLikedCarIds(new Set());
                return;
            }
            try {
                const response = await authContext.api.get(`/user/liked-cars`);
                setLikedCarIds(new Set(response.data.map(car => car._id)));
            } catch (error) {
                console.error("Error fetching liked cars for user:", error);
                setLikedCarIds(new Set());
            }
        };
        fetchLikedCars();
    }, [token, user, authContext.api]);

    return (
        <div className="flex flex-col lg:flex-row px-4 py-6 max-w-7xl mx-auto gap-6 font-inter">
            <div className="w-full lg:w-1/4 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-purple-800">Filters</h2>
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">City</h3>
                    <select
                        value={selectedCity}
                        onChange={handleCityChange}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 w-full focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="">Select a City</option>
                        {availableCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
                <hr className="mb-2" />
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Price Range</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md w-1/2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md w-1/2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                </div>
                <hr className="mb-2" />
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Search by Brands & Models</h3>
                    <input
                        type="text" placeholder="e.g., Maruti Swift" value={brandSearch}
                        onChange={(e) => {
                            setBrandSearch(e.target.value);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md w-full mb-3 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>
                <div className="mb-6">
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {availableBrands // Use availableBrands from backend
                            .filter(brand => brand.toLowerCase().includes(brandSearch.toLowerCase()))
                            .map(brand => (
                                <div key={brand} className="mb-2 border-b border-gray-200 pb-2">
                                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleBrandExpansion(brand)}>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox" id={`brand-${brand}`} value={brand}
                                                checked={selectedBrands.includes(brand)}
                                                onChange={handleBrandCheckboxChange}
                                                className="mr-2 rounded-sm text-purple-600 focus:ring-purple-500"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <label htmlFor={`brand-${brand}`} className="text-gray-700 font-medium">{brand}</label>
                                        </div>
                                        <span className="text-gray-500">{expandedBrands[brand] ? '▲' : '▼'}</span>
                                    </div>
                                    {expandedBrands[brand] && (
                                        <div className="ml-6 mt-2">
                                            {getModelsForBrand(brand) // Use getModelsForBrand from availableModels
                                                .filter(model => model.toLowerCase().includes(brandSearch.toLowerCase()))
                                                .map(model => (
                                                    <div key={model} className="flex items-center mb-1">
                                                        <input
                                                            type="checkbox" id={`model-${model}`} value={model}
                                                            checked={selectedModels.includes(model)} onChange={handleModelCheckboxChange}
                                                            className="mr-2 rounded-sm text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <label htmlFor={`model-${model}`} className="text-gray-600">{model}</label>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
                <hr className="mb-2" />
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Owner</h3>
                    {availableOwners.map(owner => (
                        <div key={owner} className="flex items-center mb-2">
                            <input type="checkbox" id={`owner-${owner}`} value={owner} checked={selectedOwners.includes(owner)} onChange={handleOwnerChange} className="mr-2 rounded-sm text-purple-600 focus:ring-purple-500" />
                            <label htmlFor={`owner-${owner}`} className="text-gray-700">{owner}</label>
                        </div>
                    ))}
                </div>
                <hr className="mb-2" />

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Year</h3>
                    {yearRanges.map(range => (
                        <div key={range.value} className="flex items-center mb-2">
                            <input type="checkbox" id={`year-${range.value}`} value={range.value} checked={selectedYears.includes(range.value)} onChange={handleYearChange} className="mr-2 rounded-sm text-purple-600 focus:ring-purple-500" />
                            <label htmlFor={`year-${range.value}`} className="text-gray-700">{range.label}</label>
                        </div>
                    ))}
                </div>
                <hr className="mb-2" />
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Kms Driven</h3>
                    {kmRanges.map(range => (
                        <div key={range.value} className="flex items-center mb-2">
                            <input type="checkbox" id={`km-${range.value}`} value={range.value} checked={selectedKms.includes(range.value)} onChange={handleKmChange} className="mr-2 rounded-sm text-purple-600 focus:ring-purple-500" />
                            <label htmlFor={`km-${range.value}`} className="text-gray-700">{range.label}</label>
                        </div>
                    ))}
                </div>
                <hr className="mb-2" />
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Fuel Type</h3>
                    {fuelTypes.map(type => (
                        <div key={type} className="flex items-center mb-2">
                            <input type="checkbox" id={`fuel-${type}`} value={type} checked={selectedFuelTypes.includes(type)} onChange={handleFuelTypeChange} className="mr-2 rounded-sm text-purple-600 focus:ring-purple-500" />
                            <label htmlFor={`fuel-${type}`} className="text-gray-700">{type}</label>
                        </div>
                    ))}
                </div>
                <hr className="mb-2" />
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Transmission</h3>
                    {transmissions.map(type => (
                        <div key={type} className="flex items-center mb-2">
                            <input type="checkbox" id={`transmission-${type}`} value={type} checked={selectedTransmissions.includes(type)} onChange={handleTransmissionChange} className="mr-2 rounded-sm text-purple-600 focus:ring-purple-500" />
                            <label htmlFor={`transmission-${type}`} className="text-gray-700">{type}</label>
                        </div>
                    ))}
                </div>
                <hr className="mb-2" />
            </div>
            <div className="w-full lg:w-3/4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                    <div className="text-xl font-bold mb-2 sm:mb-0 text-gray-800">
                        cars for sales
                    </div>
                    <div className="flex items-center gap-2">
                        {activeFilters.length > 0 && (
                            <button onClick={handleClearAllFilters} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-200 transition-colors duration-200">
                                Clear All
                            </button>
                        )}
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="">Sort by</option>
                            <option value="lowToHigh">Price: Low to High</option>
                            <option value="highToLow">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {activeFilters.map((filter, index) => (
                            <span
                                key={`${filter.type}-${filter.value}-${index}`}
                                className="flex items-center bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                            >
                                {filter.label}
                                <button
                                    onClick={() => handleRemoveActiveFilter(filter)}
                                    className="ml-2 text-white hover:text-purple-100 focus:outline-none"
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                {loading ? (
                    <p className="text-gray-600 text-center py-10">Loading cars...</p>
                ) : error ? (
                    <p className="text-red-500 text-center py-10">{error}</p>
                ) : cars.length === 0 ? (
                    <p className="text-gray-600">No cars found matching your criteria.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cars.map((car, index) => (
                                <CarCard
                                    key={car._id || `${car.make}-${car.model}-${car.year}-${index}`}
                                    car={car}
                                    onCarClick={() => handleCarClick(car._id)}
                                    isLiked={likedCarIds.has(car._id)}
                                    onLikeToggle={() => handleLikeToggle(car._id)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default Buy;
