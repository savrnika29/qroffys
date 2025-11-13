import React, { useEffect, useRef, useState } from "react";
import { profilepic3 } from "../imaUrl";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import ProfileHeader from "../components/ProfileHeader";
import { getProfile, updateProfile } from "../feature/profileSlice";
import { getCountries, getStates, getCity } from "../feature/locationSlice";
import { fetchPingers } from "../feature/followersSlice";
import { fetchMyBusinessPosts } from "../feature/mybusinesspostSlice";
import LocationModal from "../model/LocationModel";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"];

const schema = yup.object().shape({
  businessname: yup
    .string()
    .test(
      "no-digits",
      "Business name must contain only characters (no numbers)",
      (value) => !/\d/.test(value)
    )
    .min(2, "Business name must be at least 2 characters")
    .required("Business name is required"),
  businesstype: yup.string().required("Business type is required"),
  email: yup
    .string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email must be valid (e.g., user@example.com)"
    )
    .required("Email is required"),
  phoneNumber: yup
    .string()
    .required("Phone is required")
    .matches(/^\d+$/, "Phone must be numeric")
    .min(4, "Phone must be at least 4 digits")
    .max(14, "Phone must be at most 14 digits"),
  countryCode: yup.string().required("Country code is required"),
  country: yup.string().required("Country is required"),
  state: yup.string().optional(""),
  city: yup.string().optional(""),
  address: yup.string().required("Address is required"),
  businessdiscount: yup
    .number()
    .typeError("Please add at least 0.5% or above")
    .min(0.5, "Please add at least 0.5% or above")
    .max(100, "Maximum discount is 100")
    .test(
      "max-2-decimals",
      "Only up to 2 decimal places are allowed",
      (value) => {
        if (value === undefined || value === null) return true;
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      }
    )
    .required("Please add at least 0.5% or above"),
});

const Viewbusinesseditprofile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const GOOGLE_KEY = import.meta.env.VITE_API_GOOGLE_MAP_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_KEY,
    libraries,
  });

  const {
    user,
    loading: profileLoading,
    error: profileError,
  } = useSelector((state) => state.profile || {});
  const {
    totalFollowers,
    totalFollowing,
    loading: followerLoading,
    error: followerError,
  } = useSelector((state) => state.followers || {});

  const {
    totalItems: totalQasts, // Use totalItems or totalFilteredItems as qast count
    loading: postsLoading,
    error: postsError,
  } = useSelector((state) => state.mybusinessposts || {});
  const { error: locationError } = useSelector((state) => state.location || {});
  const token =
    useSelector((state) => state.auth?.token) || localStorage.getItem("token");

  // Local state
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const autocompleteRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      phoneNumber: "",
      countryCode: "1",
      businessname: "",
      businesstype: "",
      email: "",
      country: "",
      state: "",
      city: "",
      address: "",
      businessdiscount: "",
    },
    mode: "onChange",
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const watchedAddress = watch("address");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const getCountry = async () => {
    try {
      setLoading(true);
      const { payload } = await dispatch(getCountries({ setLoading }));
      if (payload?.data?.countries) {
        setCountries(payload.data.countries);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async (countryName) => {
    try {
      if (!countryName || !countries.length) {
        setStates([]);
        setCities([]);
        setValue("state", "");
        setValue("city", "");
        return [];
      }
      setLoading(true);
      const countryObj = countries.find((c) => c.name === countryName);
      if (countryObj?._id) {
        const { payload } = await dispatch(
          getStates({ id: countryObj._id, setLoading })
        );
        const fetchedStates =
          payload?.data?.states?.[0]?.states || payload?.data?.states || [];
        setStates(fetchedStates);
        return fetchedStates;
      }
      return [];
    } catch (error) {
      console.error("Error fetching states:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch cities based on state ID
  const fetchCities = async (stateName, statesArray = states) => {
    try {
      if (!stateName || !statesArray.length) {
        setCities([]);
        setValue("city", "");
        return [];
      }
      setLoading(true);
      const stateObj = statesArray.find((s) => s.name === stateName);
      if (stateObj?._id) {
        const { payload } = await dispatch(
          getCity({ id: stateObj._id, setLoading })
        );
        const fetchedCities =
          payload?.data?.cities?.[0]?.cities || payload?.data?.cities || [];
        setCities(fetchedCities);
        return fetchedCities;
      }
      return [];
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch followers and following counts
  const getPingersInfo = async () => {
    try {
      if (token && user?._id) {
        await dispatch(
          fetchPingers({
            token,
            userId: user._id,
            type: "list",
            page: 1,
            search: "",
          })
        );
      }
    } catch (error) {
      console.error("Error fetching pingers:", error);
    }
  };

  // Fetch qast count
  const getQastsInfo = async () => {
    try {
      if (token && user?._id) {
        await dispatch(
          fetchMyBusinessPosts({
            userId: user._id,
            page: 1,
            limit: 10, // Adjust limit as needed
            type: "all", // Adjust type as per your API requirements
          })
        );
      }
    } catch (error) {
      console.error("Error fetching qasts:", error);
    }
  };

  // Initial data fetch
  // useEffect(() => {
  //   if (token) {
  //     getCountry();
  //     dispatch(getProfile(token));
  //     getPingersInfo();
  //     getQastsInfo(); // Fetch qast count
  //   }
  // }, [token, dispatch]);
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        if (token) {
          await Promise.all([
            dispatch(getProfile(token)),
            getCountry(),
            getPingersInfo(),
            getQastsInfo(),
          ]);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
      } finally {
        setPageLoading(false); // ✅ only once, stops full page spinner
      }
    };

    fetchInitial();
  }, [token, dispatch]);

  // Main effect to handle initial data population and location cascade
  useEffect(() => {
    const initializeLocationData = async () => {
      if (!user || !countries.length || initialDataLoaded) return;

      setValue("businessname", user.businessName || "");
      setValue("businesstype", user.businessType?.toLowerCase() || "");
      setValue("email", user.email || "");
      setValue("phoneNumber", user.phoneNumber || "");
      setValue("countryCode", user.countryCode?.replace("+", "") || "1");
      setValue("address", user.address || "");
      setValue("businessdiscount", user.discountPercentage || "");
      if (user.googleMapLocation) {
        setCoordinates({
          lat: user.googleMapLocation.lat,
          lng: user.googleMapLocation.long,
        });
      }
      if (user.profilePicture) {
        setImagePreview(`${user.profilePicture}`);
      }

      const userCountry = user.country?.name || user.country;
      const userState = user.state?.name || user.state;
      const userCity = user.city?.name || user.city;

      if (userCountry) {
        setValue("country", userCountry);
        const fetchedStates = await fetchStates(userCountry);
        if (userState && fetchedStates.length > 0) {
          const stateExists = fetchedStates.some((s) => s.name === userState);
          if (stateExists) {
            setValue("state", userState);
            const fetchedCities = await fetchCities(userState, fetchedStates);
            if (userCity && fetchedCities.length > 0) {
              const cityExists = fetchedCities.some((c) => c.name === userCity);
              if (cityExists) {
                setValue("city", userCity);
              } else {
                console.warn(
                  `User's city "${userCity}" not found in available cities`
                );
                setValue("city", "");
              }
            }
          } else {
            console.warn(
              `User's state "${userState}" not found in available states`
            );
            setValue("state", "");
            setValue("city", "");
          }
        }
        setValue("address", user.address || "");
      } else {
        setValue("address", "");
      }
      trigger([
        "businessname",
        "businesstype",
        "email",
        "phoneNumber",
        "countryCode",
        "country",
        "state",
        "city",
        "address",
        "businessdiscount",
      ]);
      setInitialDataLoaded(true);
    };

    initializeLocationData();
  }, [user, countries, setValue, trigger, initialDataLoaded]);

  // Handle country change
  useEffect(() => {
    const handleCountryChange = async () => {
      if (!selectedCountry || !initialDataLoaded) return;
      const userCountry = user?.country?.name || user?.country;
      if (selectedCountry === userCountry) return;
      setValue("state", "");
      setValue("city", "");
      setCities([]);
      setValue("address", "");
      setCoordinates({ lat: null, lng: null });
      trigger("address");
      await fetchStates(selectedCountry);
    };

    handleCountryChange();
  }, [selectedCountry, initialDataLoaded, user?.country]);

  // Handle state change
  useEffect(() => {
    const handleStateChange = async () => {
      if (!selectedState || !states.length || !initialDataLoaded) return;
      const userState = user?.state?.name || user?.state;
      if (selectedState === userState && !cities.length) {
      } else if (selectedState === userState && cities.length > 0) {
        return;
      }

      setValue("city", "");
      await fetchCities(selectedState);
    };

    handleStateChange();
  }, [selectedState, states, initialDataLoaded, setValue, trigger]);

  const onPlaceChanged = () => {
    const autocomplete = autocompleteRef.current;
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCoordinates({ lat, lng });
        setValue("address", place.formatted_address || watchedAddress);
        trigger("address");
        setAddressError("");
      }
    }
  };

  // Map business type for API
  const mapBusinessType = (value) => {
    const mapping = {
      online: "Online",
      offline: "Offline",
      both: "Both",
    };
    return mapping[value] || value;
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("businessName", data.businessname);
      formData.append("businessType", mapBusinessType(data.businesstype));
      formData.append("country", data.country);
      formData.append("state", data.state);
      formData.append("city", data.city);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("countryCode", `+${data.countryCode}`);
      formData.append("address", data.address);
      formData.append("email", data.email);
      formData.append("discountPercentage", Number(data.businessdiscount));
      if (coordinates?.lat && coordinates?.lng) {
        formData.append(
          "googleMapLocation",
          JSON.stringify({
            lat: coordinates.lat,
            long: coordinates.lng,
          })
        );
      }
      if (profileImage) {
        formData.append("images", profileImage);
      }

      setLoading(true);
      await dispatch(updateProfile({ data: formData, token })).unwrap();
      await dispatch(getProfile(token));
      navigate("/mybusinessprofile");
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirection = () => {
    setIsLocationModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsLocationModalOpen(false);
  };

  useEffect(() => {
    if (!selectedCountry && watchedAddress) {
      setAddressError("Please select a country first");
      setValue("address", "");
      setCoordinates({ lat: null, lng: null });
      trigger("address");
    } else {
      setAddressError("");
    }
  }, [selectedCountry, watchedAddress, setValue, trigger]);

  // Business data for the modal
  const businessData = {
    businessName:
      user?.businessName || watch("businessname") || "Business Location",
    address: user?.address || watch("address") || "Address not available",
    latitude: coordinates?.lat || user?.googleMapLocation?.lat || 48.6705,
    longitude: coordinates?.lng || user?.googleMapLocation?.long || 11.0997,
  };

  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading Google Maps API...</div>;
  }

  // Loading state
  if (loading || profileLoading || followerLoading || pageLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "200px" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (profileError || locationError || followerError) {
    return (
      <div className="alert alert-danger" role="alert">
        Error:{" "}
        {profileError ||
          locationError ||
          followerError ||
          "Unable to load data"}
      </div>
    );
  }

  return (
    <div>
      <ProfileHeader />
      <main className="wrapper">
        <section className="middle-container">
          <section className="login-wrapper edit-profile-wrap">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="signup-wrapper">
                    <div className="signup-customer edit-profile-wrap">
                      <div className="view-account-header">
                        <div className="edit-profile-pic">
                          {imagePreview || user?.profilePicture ? (
                            <figure>
                              <img
                                src={
                                  imagePreview ||
                                  `${user?.profilePicture}` ||
                                  profilepic3
                                }
                                alt="profile"
                              />
                            </figure>
                          ) : (
                            <div className="business-avatar edit-profile-pic">
                              <span>
                                {(user?.businessName)
                                  .split(" ")
                                  .map((w) => w.charAt(0).toUpperCase())
                                  .join("")}
                              </span>
                            </div>
                          )}
                          <input
                            type="file"
                            id="profileImageInput"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                          />
                          <label
                            htmlFor="profileImageInput"
                            className="btn btn-outline-secondary"
                            style={{ cursor: "pointer" }}
                          >
                            Edit Photo
                          </label>
                        </div>
                        <div className="profile-header-info">
                          <div
                            className="profile-info"
                            role="button"
                            // onClick={() => navigate("/pingers?tab=pingers")}
                          >
                            <big>
                              {followerLoading ? "..." : totalFollowers}
                            </big>
                            <small>Pingers</small>
                          </div>
                          <div
                            className="profile-info"
                            role="button"
                            // onClick={() => navigate("/pingers?tab=pinging")}
                          >
                            <big>
                              {followerLoading ? "..." : totalFollowing}
                            </big>
                            <small>Pinging</small>
                          </div>
                          <div className="profile-info">
                            <big>{postsLoading ? "..." : totalQasts}</big>
                            <small>Qasts</small>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="row">
                          {/* Business Name */}
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="b-name" className="form-label">
                                Business Name
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                {...register("businessname")}
                                onInput={(e) => {
                                  // e.target.value = e.target.value.replace(
                                  //   /\d/g,
                                  //   ""
                                  // );
                                  e.target.value = e.target.value
                                    .replace(/[^A-Za-z ]/g, "")
                                    .replace(/\s+/g, " ");
                                  trigger("businessname");
                                }}
                              />
                              <p className="text-danger">
                                {errors.businessname?.message}
                              </p>
                            </div>
                          </div>

                          {/* Business Type */}
                          <div className="col-md-6">
                            <div className="form-group form-group-radio">
                              <label
                                htmlFor="gender"
                                className="form-label w-100"
                              >
                                Business Type
                              </label>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value="online"
                                  {...register("businesstype")}
                                />
                                <label className="form-check-label">
                                  Online
                                </label>
                              </div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value="offline"
                                  {...register("businesstype")}
                                />
                                <label className="form-check-label">
                                  Offline
                                </label>
                              </div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value="both"
                                  {...register("businesstype")}
                                />
                                <label className="form-check-label">Both</label>
                              </div>
                              <p className="text-danger">
                                {errors.businesstype?.message}
                              </p>
                            </div>
                          </div>

                          {/* Country */}
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="country" className="form-label">
                                Country
                              </label>
                              <select
                                className="form-select"
                                {...register("country")}
                              >
                                <option value="">Select the country</option>
                                {countries?.map((c) => (
                                  <option key={c._id || c.code} value={c.name}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                              <p className="text-danger">
                                {errors.country?.message}
                              </p>
                            </div>
                          </div>

                          {/* State */}
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label">State</label>
                              <select
                                className="form-select"
                                {...register("state")}
                                disabled={
                                  !selectedCountry || states.length === 0
                                }
                              >
                                <option value="">Select the state</option>
                                {states?.map((s) => (
                                  <option key={s._id} value={s.name}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                              <p className="text-danger">
                                {errors.state?.message}
                              </p>
                            </div>
                          </div>
                          {/* City */}
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label">City</label>
                              <select
                                className="form-select"
                                {...register("city")}
                                disabled={!selectedState || cities.length === 0}
                              >
                                <option value="">Select the city</option>
                                {cities?.map((c) => (
                                  <option key={c._id} value={c.name}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                              <p className="text-danger">
                                {errors.city?.message}
                              </p>
                            </div>
                          </div>

                          {/* Phone Number */}
                          <div className="col-md-6">
                            <div className="form-group">
                              <label
                                htmlFor="phoneNumber"
                                className="form-label"
                              >
                                Phone Number
                              </label>
                              <Controller
                                name="phoneNumber"
                                control={control}
                                render={({ field }) => (
                                  <PhoneInput
                                    country={"us"}
                                    value={field.value}
                                    onChange={(value, country) => {
                                      field.onChange(value);
                                      setValue("countryCode", country.dialCode);
                                      trigger(["phoneNumber", "countryCode"]);
                                    }}
                                    inputClass="form-control"
                                    enableSearch
                                    inputStyle={{
                                      width: "100%",
                                      border: "none",
                                    }}
                                    dropdownStyle={{ display: "block" }}
                                    buttonStyle={{
                                      padding: "0 5px",
                                      border: "none",
                                      background: "transparent",
                                    }}
                                    // countryCodeEditable={false}
                                    disableDropdown={false}
                                  />
                                )}
                              />
                              {errors.phoneNumber && (
                                <div className="text-danger">
                                  {errors.phoneNumber.message}
                                </div>
                              )}
                              {errors.countryCode && (
                                <div className="text-danger">
                                  {errors.countryCode.message}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Address */}
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="address01" className="form-label">
                                Address
                              </label>
                              <Autocomplete
                                key={`autocomplete-${
                                  selectedCountry || "none"
                                }`}
                                types={["address"]}
                                onLoad={(autocomplete) => {
                                  autocompleteRef.current = autocomplete;
                                  if (selectedCountry) {
                                    const countryObj = countries.find(
                                      (c) => c.name === selectedCountry
                                    );
                                    if (countryObj?.code) {
                                      autocomplete.setOptions({
                                        componentRestrictions: {
                                          country:
                                            countryObj.code.toLowerCase(),
                                        },
                                      });
                                    }
                                  }
                                }}
                                onPlaceChanged={onPlaceChanged}
                                restrictions={{
                                  country: selectedCountry
                                    ? countries
                                        .find((c) => c.name === selectedCountry)
                                        ?.code?.toLowerCase() || ""
                                    : "",
                                }}
                                fields={[
                                  "formatted_address",
                                  "address_components",
                                  "geometry.location",
                                ]}
                              >
                                <input
                                  type="text"
                                  className="form-control"
                                  {...register("address")}
                                  placeholder="Enter address"
                                  disabled={!selectedCountry}
                                />
                              </Autocomplete>
                              {addressError && (
                                <p className="text-danger">{addressError}</p>
                              )}
                              <p className="text-danger">
                                {errors.address?.message}
                              </p>
                            </div>
                          </div>

                          {/* Email */}
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="email01" className="form-label">
                                Email Address
                              </label>
                              <input
                                type="email"
                                className="form-control"
                                {...register("email")}
                                readOnly // Add this to make the field non-editable
                                disabled
                              />
                              <p className="text-danger">
                                {errors.email?.message}
                              </p>
                            </div>
                          </div>

                          {/* Discount */}
                          <div className="col-md-6">
                            <div className="form-group">
                              <label
                                htmlFor="discount-percentage-offered"
                                className="form-label"
                              >
                                Discount Percentage Offered
                              </label>
                              {/* <input
                                type="number"
                                className="form-control"
                                {...register("businessdiscount")}
                                step="any"
                                onWheel={(e) => e.target.blur()}
                              /> */}
                              <input
                                type="number"
                                className="form-control"
                                id="businessdiscount"
                                {...register("businessdiscount")}
                                step="0.01"
                                min="0"
                                max="100"
                                onInput={(e) => {
                                  const value = e.target.value;

                                  // If the value includes a decimal point
                                  if (value.includes(".")) {
                                    const [whole, decimal] = value.split(".");
                                    // Truncate decimal part to 2 digits only
                                    if (decimal.length > 2) {
                                      e.target.value = `${whole}.${decimal.slice(
                                        0,
                                        2
                                      )}`;
                                    }
                                  }
                                }}
                              />
                              <p className="text-danger">
                                {errors.businessdiscount?.message}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="row">
                            <div className="col-md-12 btn-block view-account-btns">
                              <a
                                className="btn btn-dark"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate("/languagesetting?section=billing");
                                }}
                              >
                                Add Card Detail{" "}
                                <i className="icon-right-white" />
                              </a>
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleGetDirection} // Updated to trigger modal
                              >
                                <i className="map-icon" /> Get Direction
                              </button>
                            </div>
                          </div>

                          {/* Submit Button */}
                          <div className="row">
                            <div className="col-md-12 btn-block p-0">
                              <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                              >
                                {loading ? "Saving..." : "Save & Update"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={handleCloseModal}
        businessData={businessData}
      />
    </div>
  );
};

export default Viewbusinesseditprofile;
