import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCountries, getStates, getCity } from "../feature/locationSlice"; // adjust path if needed
import {
  getAllCategories,
  getAllSubcategories,
} from "../feature/categoriesSlice";
import { getAgeRanges } from "../feature/homePage/ageRangeSlice";
import { fetchFilteredPosts } from "../feature/homePage/homePostslice";
import { getDiscountOffer } from "../feature/homePage/discountSlice.js";
import { useLocation } from "react-router-dom";
const Headersearchfilter = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [targetedGender, setTargetedGender] = useState("");
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedAgeRange, setSelectedAgeRange] = useState("");
  const location = useLocation();
  const discountOffers = useSelector(
    (state) => state.discounts.content?.data?.offers || []
  );
  const discountError = useSelector((state) => state.discounts.error);

  const {
    ageRanges = [],
    loading: ageRangeLoading = false,
    error: ageRangeError = null,
  } = useSelector((state) => state.ageRange || {});
  if (location.pathname !== "/home") {
    return null;
  }

  const handleApplyFilters = async () => {
    const payload = {
      page: "1",
      limit: "10",
      type: "post",
      targetedGender,
      targetedAgeRange: selectedAgeRange,
      discountRanges: selectedDiscounts.join(","),
      targetedCountry: selectedCountry,
      targetedState: selectedState,
      targetedCity: selectedCity,
      categoryId: selectedCategory,
      subCategoryId: selectedSubcategory,
      businessType: businessType,
    };

    Object.keys(payload).forEach((key) => {
      if (!payload[key]) delete payload[key];
    });


    dispatch(fetchFilteredPosts({ token, body: payload }));
    const toastEl = document.getElementById("liveToast");
    const bsToast =
      bootstrap.Toast.getInstance(toastEl) || new bootstrap.Toast(toastEl);
    bsToast.hide();
  };


  const handleClearFilters = () => {
    setSelectedCountry("");
    setSelectedState("");
    setSelectedCity("");
    setStates([]);
    setCities([]);
    setBusinessType("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setTargetedGender("");
    setSelectedDiscounts([]);
    setSelectedAgeRange("");

    dispatch(
      fetchFilteredPosts({
        token,
        body: { page: 1, limit: 10, type: "post" },
      })
    );
    const toastEl = document.getElementById("liveToast");
    const bsToast =
      bootstrap.Toast.getInstance(toastEl) || new bootstrap.Toast(toastEl);
    bsToast.hide();
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const { payload } = await dispatch(getCountries({ setLoading }));
        if (payload?.data?.countries) {
          setCountries(payload.data.countries);
        } else if (payload?.data) {
          setCountries(payload.data);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, [dispatch]);

  useEffect(() => {
    if (selectedCountry) {
      const fetchStates = async () => {
        try {
          setLoading(true);
          const { payload } = await dispatch(
            getStates({ id: selectedCountry, setLoading })
          );
          if (payload?.data?.states) {
            setStates(payload.data.states[0]?.states || []);
            setCities([]);
            setSelectedState("");
            setSelectedCity("");
          } else if (payload?.data) {
            setStates(payload.data[0]?.states || []);
            setCities([]);
            setSelectedState("");
            setSelectedCity("");
          }
        } catch (error) {
          console.error("Error fetching states:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStates();
    }
  }, [selectedCountry, dispatch]);

  useEffect(() => {
    if (selectedState) {
      const fetchCities = async () => {
        try {
          setLoading(true);
          const { payload } = await dispatch(
            getCity({ id: selectedState, setLoading })
          );
          if (payload?.data?.cities) {
            setCities(payload.data.cities[0]?.cities || []);
            setSelectedCity("");
          } else if (payload?.data) {
            setCities(payload.data[0]?.cities || []);
            setSelectedCity("");
          }
        } catch (error) {
          console.error("Error fetching cities:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCities();
    }
  }, [selectedState, dispatch]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { payload } = await dispatch(getAllCategories({ setLoading }));
        if (payload?.data?.categories) {
          setCategories(payload.data.categories);
        } else if (payload?.data) {
          setCategories(payload.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      const fetchSubcategories = async () => {
        try {
          setLoading(true);
          const { payload } = await dispatch(
            getAllSubcategories({ setLoading, id: selectedCategory })
          );
          if (payload?.data?.subcategories) {
            setSubcategories(payload.data.subcategories);
          } else if (payload?.data) {
            setSubcategories(payload.data);
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(getAgeRanges({ token }));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (token) {
      dispatch(getDiscountOffer({ token }));
    }
  }, [dispatch, token]);

  const discountData = useSelector((state) => state.discounts.content);

  const toggleDiscountCollapse = () => {
    setIsDiscountOpen(!isDiscountOpen);
  };

  return (
    <div>
      {/* Header Search Filter */}
      <div className="search-filter-wrap">
        <div className="toast-container position-fixed top-0 end-0 p-3">
          <div
            id="liveToast"
            className="toast"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="toast-header">
              <h6 className="filter-heading">Filter</h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="toast"
                aria-label="Close"
              />
            </div>
            <div className="toast-body">
              <div className="discount-offered-wrap">
                <div className="discount-offer-collapse">
                  <button
                    className="btn btn-link"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseExample"
                    aria-expanded={isDiscountOpen}
                    aria-controls="collapseExample"
                    onClick={toggleDiscountCollapse}
                    style={{ paddingRight: "30px" }}
                  >
                    Discount offered{" "}
                    <i
                      className={`arrow-collapse ${isDiscountOpen ? "arrow-rotate" : ""
                        }`}
                    />
                  </button>
                </div>
                <div className="collapse" id="collapseExample">
                  {isDiscountOpen && discountOffers?.length > 0 && (
                    <div className="card card-body">
                      <div className="row">
                        {/* Left Column */}
                        <div className="col-md-6">
                          {discountOffers
                            .filter((_, index) => index % 2 === 0)
                            .map((range, index) => (
                              <div
                                className="form-group-checkbox"
                                key={`left-${index}`}
                              >
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    value={`${range.minDiscount}-${range.maxDiscount}`}
                                    id={`discount-left-${index}`}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setSelectedDiscounts((prev) =>
                                        e.target.checked
                                          ? [...prev, value]
                                          : prev.filter((v) => v !== value)
                                      );
                                    }}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`discount-left-${index}`}
                                  >
                                    {range.minDiscount}% - {range.maxDiscount}%
                                  </label>
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Right Column */}
                        <div className="col-md-6">
                          {discountOffers
                            .filter((_, index) => index % 2 === 1)
                            .map((range, index) => (
                              <div
                                className="form-group-checkbox"
                                key={`right-${index}`}
                              >
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    value={`${range.minDiscount}-${range.maxDiscount}`}
                                    id={`discount-right-${index}`}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setSelectedDiscounts((prev) =>
                                        e.target.checked
                                          ? [...prev, value]
                                          : prev.filter((v) => v !== value)
                                      );
                                    }}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`discount-right-${index}`}
                                  >
                                    {range.minDiscount}% - {range.maxDiscount}%
                                  </label>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {discountError && (
                    <small className="text-danger">
                      {discountError?.message || "Failed to load discounts"}
                    </small>
                  )}
                </div>
              </div>

              <div className="filter-form-wrap">
                <div className="row g-0 filter-row">
                  {/* Country Dropdown */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <select
                        className="form-select"
                        value={selectedCountry}
                        onChange={(e) => {
                          setSelectedCountry(e.target.value);
                          setSelectedState("");
                          setSelectedCity("");
                        }}
                        style={{ opacity: selectedCountry === "" ? 0.6 : 1 }}
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country._id} value={country._id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* State Dropdown */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <select
                        className="form-select"
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value);
                          setSelectedCity("");
                        }}
                        disabled={!states.length}
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state._id} value={state._id}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* City Dropdown */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <select
                        className="form-select"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        disabled={!cities.length}
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city._id} value={city._id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row g-0 filter-row">
                  {/* Business Type */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <select
                        className="form-select"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                      >
                        <option value="">Business Type</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                  </div>

                  {/* Business Category */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedSubcategory("");
                        }}
                        disabled={loading}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {loading && <small>Loading categories...</small>}
                    </div>
                  </div>

                  {/* Business Subcategory */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <select
                        className="form-select"
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        disabled={!subcategories.length || loading}
                      >
                        <option value="">Select Sub Category</option>
                        {subcategories.map((subcat) => (
                          <option key={subcat._id} value={subcat._id}>
                            {subcat.name}
                          </option>
                        ))}
                      </select>
                      {loading && <small>Loading subcategories...</small>}
                    </div>
                  </div>
                </div>

                <div className="row g-0 filter-row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <select
                        className="form-select"
                        value={selectedAgeRange}
                        onChange={(e) => setSelectedAgeRange(e.target.value)}
                        disabled={ageRangeLoading}
                      >
                        <option value="">Select Age Range</option>
                        {ageRanges.map((range) => (
                          <option
                            key={range._id}
                            value={`${range.minAge}-${range.maxAge}`}
                          >
                            {range.minAge} - {range.maxAge}
                          </option>
                        ))}
                      </select>

                      {ageRangeLoading && <small>Loading age ranges...</small>}
                      {ageRangeError && (
                        <small className="text-danger">
                          {ageRangeError?.message ||
                            "Failed to load age ranges"}
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row g-0 filter-row">
                  <div className="col-md-12">
                    <div className="form-group form-group-radio">
                      <label htmlFor="gender" className="form-label w-100">
                        Gender
                      </label>

                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="gender"
                          id="genderMale"
                          value="male"
                          checked={targetedGender === "male"}
                          onChange={(e) => setTargetedGender(e.target.value)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="genderMale"
                        >
                          Male
                        </label>
                      </div>

                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="gender"
                          id="genderFemale"
                          value="female"
                          checked={targetedGender === "female"}
                          onChange={(e) => setTargetedGender(e.target.value)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="genderFemale"
                        >
                          Female
                        </label>
                      </div>

                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="gender"
                          id="genderOther"
                          value="other"
                          checked={targetedGender === "other"}
                          onChange={(e) => setTargetedGender(e.target.value)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="genderOther"
                        >
                          Other
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12 btn-block">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleApplyFilters}
                    >
                      Apply
                    </button>

                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="btn btn-outline-secondary"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Headersearchfilter;
