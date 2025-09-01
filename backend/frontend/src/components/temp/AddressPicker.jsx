import { useState } from "react";
import addressData from "./addressData.json"; // Adjust path as needed

const AddressPicker = () => {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const provinces = selectedRegion
    ? addressData.regions.find((r) => r.id === parseInt(selectedRegion))
        ?.provinces || []
    : [];
  const districts = selectedProvince
    ? provinces.find((p) => p.id === parseInt(selectedProvince))?.districts ||
      []
    : [];
  const cities = selectedDistrict
    ? districts.find((d) => d.id === parseInt(selectedDistrict))?.cities || []
    : [];

  return (
    <form className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <label
          htmlFor="region"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Region
        </label>
        <select
          id="region"
          value={selectedRegion}
          onChange={(e) => {
            setSelectedRegion(e.target.value);
            setSelectedProvince("");
            setSelectedDistrict("");
            setSelectedCity("");
          }}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">Select Region</option>
          {addressData.regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="province"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Province
        </label>
        <select
          id="province"
          value={selectedProvince}
          onChange={(e) => {
            setSelectedProvince(e.target.value);
            setSelectedDistrict("");
            setSelectedCity("");
          }}
          disabled={!selectedRegion}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">Select Province</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="district"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          District
        </label>
        <select
          id="district"
          value={selectedDistrict}
          onChange={(e) => {
            setSelectedDistrict(e.target.value);
            setSelectedCity("");
          }}
          disabled={!selectedProvince}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="city"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          City
        </label>
        <select
          id="city"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          disabled={!selectedDistrict}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
};

export default AddressPicker;
