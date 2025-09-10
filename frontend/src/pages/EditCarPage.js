import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditCarPage = () => {
    const { carId } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        make: "",
        model: "",
        price: "",
        year: "",
        kms_driven: "",
        fuel_type: "",
        transmission: "",
        owner: "",
        description: "",
    });
    const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric"];
    const transmissions = ["Automatic", "Manual"];
    const owners = ["1st owner", "2nd owner", "3rd owner", "4th owner", "Beyond 4th owner"]

    useEffect(() => {
        const fetchCar = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/cars/${carId}`);
                setCar(res.data);
                setForm({
                    make: res.data.make || "",
                    model: res.data.model || "",
                    price: res.data.price || "",
                    year: res.data.year || "",
                    kms_driven: res.data.kms_driven || "",
                    fuel_type: res.data.fuel_type || "",
                    transmission: res.data.transmission || "",
                    owner: res.data.owner || "",
                    description: res.data.description || "",
                });
            } catch (err) {
                setError("Failed to load car details.");
            } finally {
                setLoading(false);
            }
        };
        fetchCar();
    }, [carId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        const token = localStorage.getItem("token");
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.put(
                `http://localhost:5000/api/update-cars/${carId}`,
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            navigate(`/car-details/${carId}`);
        } catch (err) {
            setError("Failed to update car details.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-purple-800">Edit Car Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="make" value={form.make} onChange={handleChange} placeholder="Make" className="w-full p-2 border rounded" />
                <input name="model" value={form.model} onChange={handleChange} placeholder="Model" className="w-full p-2 border rounded" />
                <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" className="w-full p-2 border rounded" />
                <input name="year" value={form.year} onChange={handleChange} placeholder="Year" type="number" className="w-full p-2 border rounded" />
                <input name="kms_driven" value={form.kms_driven} onChange={handleChange} placeholder="Kms Driven" type="number" className="w-full p-2 border rounded" />
                <select
                    name="fuel_type"
                    value={form.fuel_type}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                >
                    <option value="">Select Fuel Type</option>
                    {fuelTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <select
                    name="transmission"
                    value={form.transmission}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                >
                    <option value="">Select Transmission</option>
                    {transmissions.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <select
                    name="owner"
                    value={form.owner}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                >
                    <option value="">Select Owner</option>
                    {owners.map(owner => (
                        <option key={owner} value={owner}>{owner}</option>
                    ))}
                </select><textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded" />
                <button type="submit" className="w-full py-2 bg-purple-700 text-white rounded font-semibold hover:bg-purple-800">Save Changes</button>
            </form>
        </div>
    );
};

export default EditCarPage;