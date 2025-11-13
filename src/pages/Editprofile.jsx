import { useEffect, useRef, useState } from "react";
import ProfileHeader from "../components/ProfileHeader";
import { profilepic } from "../imaUrl";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, getProfile } from "../feature/profileSlice";
import { getCountries, getStates, getCity } from "../feature/locationSlice";
import { fetchMyBusinessPosts } from "../feature/mybusinesspostSlice";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"];

const schema = yup.object().shape({
  firstName: yup
    .string()
    .matches(/^[A-Za-z]+$/, "First name must contain only letters")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name too long")
    .required("First name is required"),
  lastName: yup
    .string()
    .matches(/^[A-Za-z]+$/, "Last name must contain only letters")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name too long")
    .required("Last name is required"),
  age: yup
    .number()
    .typeError("Age must be a number")
    .required("Age is required")
    .integer("Age must be an integer (no decimals)")
    .min(1, "Minimum 1")
    .max(120, "Maximum 120"),
  gender: yup.string().required("Gender is required"),
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
  username: yup
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(30, "Username too long")
    .required("Username is required"),
});

const Editprofile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const GOOGLE_KEY = import.meta.env.VITE_API_GOOGLE_MAP_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_KEY,
    libraries,
  });

  const { user, error, loading } = useSelector((state) => state.profile || {});
  const {
    totalItems,
    totalFollowers,
    totalFollowings,
    loading: postsLoading,
    error: postsError,
  } = useSelector((state) => state.mybusinessposts || {});
  const {
    totalFollowing,
    loading: followersLoading,
    error: followersError,
  } = useSelector((state) => state.followers || {});
  const token =
    useSelector((state) => state.auth?.token) || localStorage.getItem("token");
  const userId = localStorage.getItem("userId") || user?._id;

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [addressError, setAddressError] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [initialDataLoaded, setInitialDataLoaded] = useState(false); // Changed to initialDataLoaded for consistency
  const autocompleteRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      phoneNumber: "",
      countryCode: "1",
      firstName: "",
      lastName: "",
      age: "",
      gender: "",
      email: "",
      country: "",
      state: "",
      city: "",
      address: "",
      username: "",
    },
    mode: "onChange",
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const watchedAddress = watch("address");

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Fetch countries
  const getCountry = async () => {
    try {
      setLocationLoading(true);
      const { payload } = await dispatch(
        getCountries({ setLoading: setLocationLoading })
      );
      if (payload?.data?.countries) {
        setCountries(payload.data.countries);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Fetch states
  const fetchStates = async (countryName) => {
    try {
      if (!countryName || !countries.length) {
        setStates([]);
        setCities([]);
        setValue("state", "");
        setValue("city", "");
        return [];
      }
      setLocationLoading(true);
      const countryObj = countries.find((c) => c.name === countryName);
      if (countryObj?._id) {
        const { payload } = await dispatch(
          getStates({ id: countryObj._id, setLoading: setLocationLoading })
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
      setLocationLoading(false);
    }
  };

  // Fetch cities
  const fetchCities = async (stateName, statesArray = states) => {
    try {
      if (!stateName || !statesArray.length) {
        setCities([]);
        setValue("city", "");
        return [];
      }
      setLocationLoading(true);
      const stateObj = statesArray.find((s) => s.name === stateName);
      if (stateObj?._id) {
        const { payload } = await dispatch(
          getCity({ id: stateObj._id, setLoading: setLocationLoading })
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
      setLocationLoading(false);
    }
  };

  // Fetch user profile
  const getProfileInfo = async () => {
    if (!token) {
      console.error("No token available, redirecting to login");
      navigate("/login");
      return;
    }
    try {
      await dispatch(getProfile(token)).unwrap();
    } catch (error) {
      console.error("Error fetching profile:", error);
      navigate("/login");
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        if (token) {
          await Promise.all([
            getCountry(),
            getProfileInfo(),
            dispatch(
              fetchMyBusinessPosts({ userId, page: 1, limit: 10, type: "all" })
            ),
          ]);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };

    fetchInitial();
  }, [token, userId, dispatch]);

  // Initialize location data
  useEffect(() => {
    const initializeLocationData = async () => {
      if (!user || !countries.length || initialDataLoaded) return;

      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
      setValue("age", user.age || "");
      setValue("gender", user.gender || "");
      setValue("email", user.email || "");
      setValue("phoneNumber", user.phoneNumber || "");
      setValue("countryCode", user.countryCode?.replace("+", "") || "1");
      setValue("username", user.userName || "");
      setValue("address", user.address || "");
      if (user.googleMapLocation) {
        setCoordinates({
          lat: user.googleMapLocation.lat,
          lng: user.googleMapLocation.long,
        });
      }
      if (user.profilePicture) {
        setImagePreview(`${user.profilePicture}?t=${new Date().getTime()}`);
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
                setValue("city", "");
              }
            }
          } else {
            setValue("state", "");
            setValue("city", "");
          }
        }
        setValue("address", user.address || "");
      } else {
        setValue("address", "");
      }

      trigger([
        "firstName",
        "lastName",
        "age",
        "gender",
        "email",
        "phoneNumber",
        "countryCode",
        "country",
        "state",
        "city",
        "address",
        "username",
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
  }, [selectedCountry, initialDataLoaded, user?.country, setValue, trigger]);

  // Handle state change
  useEffect(() => {
    const handleStateChange = async () => {
      if (!selectedState || !states.length || !initialDataLoaded) return;
      const userState = user?.state?.name || user?.state;
      if (selectedState === userState && cities.length > 0) return;

      setValue("city", "");
      await fetchCities(selectedState);
    };

    handleStateChange();
  }, [selectedState, states, initialDataLoaded, user?.state, setValue]);

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

  // Handle form submission
  const onSubmit = async (data) => {
    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("age", data.age);
    formData.append("gender", data.gender);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("countryCode", `+${data.countryCode}`);
    formData.append("country", data.country);
    formData.append("state", data.state);
    formData.append("city", data.city);
    formData.append("address", data.address);
    formData.append("userName", data.username);
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

    try {
      await dispatch(updateProfile({ data: formData, token })).unwrap();
      await dispatch(getProfile(token));
      navigate("/profile");
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  if (!isLoaded || loading || locationLoading || followersLoading) {
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

  if (error || followersError || postsError) {
    return (
      <div className="alert alert-danger" role="alert">
        Error:{" "}
        {error?.message || followersError || postsError || "Unknown error"}
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
                          <figure>
                            <img
                              src={
                                imagePreview ||
                                (user?.profilePicture
                                  ? `${
                                      user.profilePicture
                                    }?t=${new Date().getTime()}`
                                  : profilepic)
                              }
                              alt="Profile"
                            />
                          </figure>
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
                          <div className="profile-info">
                            <big>{totalItems || 0}</big>
                            <small>Qasts</small>
                          </div>
                          <div
                            className="profile-info"
                            role="button"
                            // onClick={() => navigate("/pingers?tab=pinging")}
                          >
                            <big>{totalFollowings || 0}</big>
                            <small>Pinging</small>
                          </div>
                          <div
                            className="profile-info"
                            role="button"
                            // onClick={() => navigate("/pingers?tab=pingers")}
                          >
                            <big>{totalFollowers || 0}</big>
                            <small>Pingers</small>
                          </div>
                        </div>
                      </div>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="f-name" className="form-label">
                                First Name
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                {...register("firstName")}
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(
                                    /[^A-Za-z]/g,
                                    ""
                                  );
                                  trigger("firstName");
                                }}
                              />
                              <p className="text-danger">
                                {errors.firstName?.message}
                              </p>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="l-name" className="form-label">
                                Last Name
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                {...register("lastName")}
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(
                                    /[^A-Za-z]/g,
                                    ""
                                  );
                                  trigger("lastName");
                                }}
                              />
                              <p className="text-danger">
                                {errors.lastName?.message}
                              </p>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="age" className="form-label">
                                Age
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                {...register("age")}
                                inputMode="numeric"
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                  trigger("age");
                                }}
                              />
                              <p className="text-danger">
                                {errors.age?.message}
                              </p>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group form-group-radio">
                              <label
                                htmlFor="gender"
                                className="form-label w-100"
                              >
                                Gender
                              </label>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value="Male"
                                  {...register("gender")}
                                />
                                <label className="form-check-label">Male</label>
                              </div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value="Female"
                                  {...register("gender")}
                                />
                                <label className="form-check-label">
                                  Female
                                </label>
                              </div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value="Other"
                                  {...register("gender")}
                                />
                                <label className="form-check-label">
                                  Other
                                </label>
                              </div>
                              <p className="text-danger">
                                {errors.gender?.message}
                              </p>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="email01" className="form-label">
                                Email Address
                              </label>
                              <input
                                type="email"
                                className="form-control"
                                {...register("email")}
                                readOnly
                                disabled
                              />
                              <p className="text-danger">
                                {errors.email?.message}
                              </p>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="number" className="form-label">
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
                                    countryCodeEditable={false}
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
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="country" className="form-label">
                                Country
                              </label>
                              <select
                                className="form-select"
                                {...register("country")}
                                disabled={locationLoading}
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
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="state" className="form-label">
                                State
                              </label>
                              <select
                                className="form-select"
                                {...register("state")}
                                disabled={
                                  !selectedCountry ||
                                  states.length === 0 ||
                                  locationLoading
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
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="city" className="form-label">
                                City
                              </label>
                              <select
                                className="form-select"
                                {...register("city")}
                                disabled={
                                  !selectedState ||
                                  cities.length === 0 ||
                                  locationLoading
                                }
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
                                  disabled={!selectedCountry || locationLoading}
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
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="username" className="form-label">
                                Username
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                {...register("username")}
                              />
                              <p className="text-danger">
                                {errors.username?.message}
                              </p>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-12 btn-block p-0">
                              <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={
                                  loading || followersLoading || locationLoading
                                }
                              >
                                {loading || followersLoading || locationLoading
                                  ? "Updating..."
                                  : "Save & Update"}
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
    </div>
  );
};

export default Editprofile;
