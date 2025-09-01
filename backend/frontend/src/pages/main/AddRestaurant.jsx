import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { createRestaurant } from "../../services/restaurentServices";

export default function AddRestaurant() {
  const countries = [
    { code: "LK", name: "Sri Lanka", dial_code: "+94", flag: "🇱🇰" },
    { code: "US", name: "United States", dial_code: "+1", flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", dial_code: "+44", flag: "🇬🇧" },
    { code: "CA", name: "Canada", dial_code: "+1", flag: "🇨🇦" },
    { code: "AU", name: "Australia", dial_code: "+61", flag: "🇦🇺" },
    { code: "IN", name: "India", dial_code: "+91", flag: "🇮🇳" },
    { code: "DE", name: "Germany", dial_code: "+49", flag: "🇩🇪" },
    { code: "FR", name: "France", dial_code: "+33", flag: "🇫🇷" },
    { code: "IT", name: "Italy", dial_code: "+39", flag: "🇮🇹" },
    { code: "JP", name: "Japan", dial_code: "+81", flag: "🇯🇵" },
  ];

  const [formData, setFormData] = useState({
    streetAddress: "",
    zipcode: "",
    city: "",
    state: "",
    floorSuite: "",
    storeName: "",
    brandName: "",
    businessType: "",
    phoneNumber: "",
    countryCode: "LK",
  });

  const [image, setImage] = useState(null); // New state for image file
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Store selected image file
  };

  const handleCountrySelect = (countryCode) => {
    setFormData((prevData) => ({
      ...prevData,
      countryCode: countryCode,
    }));
    setShowCountryDropdown(false);
  };

  const selectedCountry =
    countries.find((country) => country.code === formData.countryCode) ||
    countries[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      let fullPhoneNumber = formData.phoneNumber;
      if (formData.phoneNumber && !formData.phoneNumber.startsWith("+")) {
        fullPhoneNumber = `${selectedCountry.dial_code} ${formData.phoneNumber}`;
      }

      const restaurantData = new FormData(); // Use FormData for multipart/form-data
      restaurantData.append("streetAddress", formData.streetAddress);
      restaurantData.append("zipcode", formData.zipcode);
      restaurantData.append("city", formData.city);
      restaurantData.append("state", formData.state);
      restaurantData.append("floorSuite", formData.floorSuite);
      restaurantData.append("storeName", formData.storeName);
      restaurantData.append("brandName", formData.brandName);
      restaurantData.append("businessType", formData.businessType);
      restaurantData.append("phoneNumber", fullPhoneNumber);
      restaurantData.append("countryCode", formData.countryCode);
      if (image) {
        restaurantData.append("image", image); // Append image file
      }

      const result = await createRestaurant(restaurantData);
      console.log("Restaurant created:", result);
      setSubmitSuccess(true);

      setFormData({
        streetAddress: "",
        zipcode: "",
        city: "",
        state: "",
        floorSuite: "",
        storeName: "",
        brandName: "",
        businessType: "",
        phoneNumber: "",
        countryCode: "LK",
      });
      setImage(null); // Reset image state
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        error.response?.data?.error || "Failed to create restaurant"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "peer h-12 w-full rounded-lg text-gray-900 ring-2 ring-gray-300 px-4 focus:ring-gray-600 focus:outline-none transition-all";
  const labelClasses = "block text-gray-900 font-medium mb-2 text-base";

  return (
    <div className="flex flex-col justify-center items-center max-w-lg mx-auto p-6 bg-white">
      {submitSuccess && (
        <div className="w-full mb-4 p-4 bg-green-100 text-green-800 rounded">
          Restaurant added successfully!
        </div>
      )}

      {submitError && (
        <div className="w-full mb-4 p-4 bg-red-100 text-red-800 rounded">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div>
          <label className={labelClasses}>Business type</label>
          <div className="relative">
            <select
              name="businessType"
              className={`${inputClasses} appearance-none`}
              value={formData.businessType}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="restaurant">Restaurant</option>
              <option value="convenience">Convenience store</option>
              <option value="grocery">Grocery store</option>
              <option value="specialty">Specialty food store</option>
              <option value="liquor">Liquor store</option>
              <option value="florist">Florist</option>
              <option value="pharmacy">Pharmacy</option>
            </select>
            <ChevronDown
              className="absolute right-4 top-3 text-gray-500 pointer-events-none"
              size={20}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Mobile phone number</label>
          <div className="flex relative">
            <div className="relative">
              <button
                type="button"
                className="flex items-center justify-center h-full rounded-l-lg p-3 border-2 border-r-0 border-gray-300 min-w-24"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              >
                <span className="mr-2 text-base">{selectedCountry.flag}</span>
                <span className="mr-1">{selectedCountry.dial_code}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showCountryDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto bg-white border-2 border-gray-300 rounded-lg z-10">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      className="flex items-center w-full p-2 hover:bg-gray-100 text-left"
                      onClick={() => handleCountrySelect(country.code)}
                    >
                      <span className="mr-2">{country.flag}</span>
                      <span>{country.name}</span>
                      <span className="ml-auto text-gray-500">
                        {country.dial_code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="tel"
              name="phoneNumber"
              className="flex-1 p-3 rounded-r-lg text-base border-2 border-gray-300 focus:border-gray-600 focus:outline-none"
              placeholder="Phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Restaurant Image (Optional)</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="w-full p-3 rounded-lg text-gray-900 ring-2 ring-gray-300 focus:ring-gray-600 focus:outline-none transition-all"
            onChange={handleImageChange}
          />
        </div>

        <div>
          <label className={labelClasses}>Street address</label>
          <input
            type="text"
            name="streetAddress"
            className={inputClasses}
            value={formData.streetAddress}
            onChange={handleChange}
            placeholder="123 Main Street"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Zipcode</label>
            <input
              type="text"
              name="zipcode"
              className={inputClasses}
              value={formData.zipcode}
              onChange={handleChange}
              placeholder="10001"
              required
            />
          </div>
          <div>
            <label className={labelClasses}>City</label>
            <input
              type="text"
              name="city"
              className={inputClasses}
              value={formData.city}
              onChange={handleChange}
              placeholder="New York"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Floor / Suite (Optional)</label>
            <input
              type="text"
              name="floorSuite"
              className={inputClasses}
              value={formData.floorSuite}
              onChange={handleChange}
              placeholder="Floor 2, Suite 201"
            />
          </div>
          <div>
            <label className={labelClasses}>State</label>
            <input
              type="text"
              name="state"
              className={inputClasses}
              value={formData.state}
              onChange={handleChange}
              placeholder="NY"
              required
            />
          </div>
        </div>
        <div>
          <label className={labelClasses}>Store name</label>
          <input
            type="text"
            name="storeName"
            className={inputClasses}
            placeholder="Example: Sam's Pizza (123 Main street)"
            value={formData.storeName}
            onChange={handleChange}
            required
          />
          <p className="text-sm mt-2 text-gray-500">
            This is how your store will appear in the app.
          </p>
        </div>

        <div>
          <label className={labelClasses}>Brand name</label>
          <input
            type="text"
            name="brandName"
            className={inputClasses}
            placeholder="Example: Sam's Pizza"
            value={formData.brandName}
            onChange={handleChange}
            required
          />
          <p className="text-sm mt-2 text-gray-500">
            We'll use this to help organize information that is shared across
            stores, such as menus.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded-md font-medium text-base mt-6 hover:bg-gray-800 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>

        <div className="text-sm mt-4">
          By clicking &quot;Submit&quot;, you agree to
          <a href="#" className="underline font-medium hover:text-gray-700">
            {" "}
            Uber Eats Merchant Terms and Conditions{" "}
          </a>
          and acknowledge you have read the
          <a href="#" className="underline font-medium hover:text-gray-700">
            {" "}
            Privacy Notice
          </a>
          .
        </div>
      </form>
    </div>
  );
}
