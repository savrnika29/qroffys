import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getCity, getCountries, getStates } from "../feature/locationSlice";
import {
  getAllCategories,
  getAllSubcategories,
} from "../feature/categoriesSlice";
import { signUp } from "../feature/auth/authSlice";
import Loader from "../components/Loader";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

const customerSchema = yup.object().shape({
  firstName: yup
    .string()
    .test(
      "no-digits",
      "First name must contain only characters (no numbers)",
      (value) => !/\d/.test(value)
    )
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name too long")
    .required("First name is required"),
  lastName: yup
    .string()
    .test(
      "no-digits",
      "Last name must contain only characters (no numbers)",
      (value) => !/\d/.test(value)
    )
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name too long")
    .required("Last name is required"),
  age: yup
    .number()
    .typeError("Age must be a number")
    .required("Age is required")
    .integer("Age must be an integer (no decimals)")
    .min(1, "Minimum 1")
    .max(100, "Maximum 100"),
  gender: yup.string().required("Gender is required"),
  email: yup
    .string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email must be valid (e.g., user@example.com)"
    )
    .required("Email is required"),
  mobNumber: yup
    .string()
    .required("Phone is required")
    .test(
      "is-valid-phone",
      "Phone number must be valid digits after country code",
      (value) => {
        if (!value) return false;
        const trimmed = value.replace(/\D/g, "");
        return trimmed.length > 4;
      }
    ),
  countryCode: yup.string().required("Country code is required"),
  country: yup.string().required("Country is required"),
  state: yup.string().optional(),
  city: yup.string().optional(),
  address: yup.string().required("Address is required"),
  username: yup
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(30, "Username too long")
    .required("Username is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password too long"),
  agree: yup.boolean().oneOf([true], "You must agree to terms"),
});

const businessSchema = yup.object().shape({
  businesscountry: yup.string().required("Country is required"),
  businessstate: yup.string().optional(),
  businesscity: yup.string().optional(),
  businessType: yup.string().required("Business type is required"),
  businessCategory: yup.string().required("Business category is required"),
  businessSubCategory: yup.string(),
  businessName: yup
    .string()
    .test(
      "no-digits",
      "Business name must contain only characters (no numbers)",
      (value) => !/\d/.test(value)
    )
    .min(2, "Business name must be at least 2 characters")
    .required("Business name is required"),
  businessaddress: yup.string().required("Address is required"),
  businessmobNumber: yup
    .string()
    .required("Phone is required")
    .test(
      "is-valid-phone",
      "Phone number must be valid digits after country code",
      (value) => {
        if (!value) return false;
        const trimmed = value.replace(/\D/g, "");
        return trimmed.length > 4;
      }
    ),
  businesscountryCode: yup.string().required("Country code is required"),
  businessemail: yup
    .string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email must be valid (e.g., user@example.com)"
    )
    .required("Email is required"),
   businessdiscount: yup
    .number()
    .typeError("Discount must be a valid number")
    .max(100, "Maximum discount is 100")
    .test(
      "max-2-decimals",
      "Only up to 2 decimal places are allowed",
      (value) => {
        if (value === undefined || value === null) return true;
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      }
    ),
  businessagree: yup.boolean().oneOf([true], "You must agree to terms"),
  businessusername: yup
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(30, "Username too long")
    .required("Username is required"),
  businesspassword: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password too long"),
});

const libraries = ["places"];
const Signup = () => {
  const GOOGLE_KEY = import.meta.env.VITE_API_GOOGLE_MAP_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_KEY,
    libraries,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [customerStates, setCustomerStates] = useState([]);
  const [customerCities, setCustomerCities] = useState([]);
  const [businessStates, setBusinessStates] = useState([]);
  const [businessCities, setBusinessCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [accountType, setAccountType] = useState("customer");
  const schema = accountType === "customer" ? customerSchema : businessSchema;
  const [addressError, setAddressError] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      mobNumber: "",
      countryCode: "1",
      businessmobNumber: "",
      businesscountryCode: "1",
    },
  });

  const watchedCountry = watch(
    accountType === "customer" ? "country" : "businesscountry"
  );
  const watchedCustomerState = watch("state");
  const watchedBusinessState = watch("businessstate");
  const watchedCategory = watch("businessCategory");
  const watchedAddress = watch(
    accountType === "customer" ? "address" : "businessaddress"
  );
  const customerAutocompleteRef = useRef(null);
  const businessAutocompleteRef = useRef(null);

  useEffect(() => {
    if (accountType === "customer") {
      setBusinessStates([]);
      setBusinessCities([]);
      setValue("businessstate", "");
      setValue("businesscity", "");
      setValue("businessaddress", "");
    } else {
      setCustomerStates([]);
      setCustomerCities([]);
      setValue("state", "");
      setValue("city", "");
      setValue("address", "");
    }
    setCoordinates({ lat: null, lng: null });
  }, [accountType, setValue]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const { payload } = await dispatch(getCountries({ setLoading }));
        if (payload?.data?.countries) {
          setCountries(payload.data.countries);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, [dispatch]);

  useEffect(() => {
    if (watchedCountry) {
      const fetchStates = async () => {
        try {
          setLoading(true);
          const { payload } = await dispatch(
            getStates({ setLoading, id: watchedCountry })
          );
          if (payload?.data?.states) {
            const statesData = payload.data.states[0]?.states || [];
            if (accountType === "customer") {
              setCustomerStates(statesData);
              setCustomerCities([]);
              setValue("state", "");
              setValue("city", "");
            } else {
              setBusinessStates(statesData);
              setBusinessCities([]);
              setValue("businessstate", "");
              setValue("businesscity", "");
            }
            setValue(
              accountType === "customer" ? "address" : "businessaddress",
              ""
            );
            setCoordinates({ lat: null, lng: null });
            trigger(accountType === "customer" ? "address" : "businessaddress");
          }
        } catch (error) {
          console.error("Error fetching states:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStates();
    }
  }, [watchedCountry, dispatch, setValue, accountType, trigger]);

  useEffect(() => {
    if (watchedCustomerState && accountType === "customer") {
      const fetchCities = async () => {
        try {
          setLoading(true);
          const { payload } = await dispatch(
            getCity({ setLoading, id: watchedCustomerState })
          );
          if (payload?.data?.cities) {
            setCustomerCities(payload.data.cities[0]?.cities || []);
            setValue("city", "");
          }
        } catch (error) {
          console.error("Error fetching cities:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCities();
    }
  }, [watchedCustomerState, dispatch, setValue, accountType]);

  useEffect(() => {
    if (watchedBusinessState && accountType === "business") {
      const fetchCities = async () => {
        try {
          setLoading(true);
          const { payload } = await dispatch(
            getCity({ setLoading, id: watchedBusinessState })
          );
          if (payload?.data?.cities) {
            setBusinessCities(payload.data.cities[0]?.cities || []);
            setValue("businesscity", "");
          }
        } catch (error) {
          console.error("Error fetching cities:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCities();
    }
  }, [watchedBusinessState, dispatch, setValue, accountType]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { payload } = await dispatch(getAllCategories({ setLoading }));
        if (payload?.data?.categories) {
          setCategories(payload.data.categories);
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
    if (watchedCategory) {
      const fetchSubcategories = async () => {
        try {
          setLoading(true);
          const { payload } = await dispatch(
            getAllSubcategories({ setLoading, id: watchedCategory })
          );
          if (payload?.data?.subcategories) {
            setSubcategories(payload.data.subcategories);
            setValue("businessSubCategory", "");
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSubcategories();
    }
  }, [watchedCategory, dispatch, setValue]);

  const onSubmit = async (data) => {
    if (!loading) {
      try {
        let payload;
        if (accountType === "customer") {
          const country = countries.find((c) => c._id === data.country);
          const state = customerStates.find((s) => s._id === data.state);
          const city = customerCities.find((c) => c._id === data.city);
          payload = {
            firstName: data.firstName,
            lastName: data.lastName,
            age: data.age,
            gender: data.gender,
            email: data.email,
            phoneNumber: data.mobNumber.replace(`+${data.countryCode}`, ""),
            countryCode: data.countryCode,
            country: country?.name || "",
            state: state?.name || "",
            city: city?.name || "",
            address: data.address,
            userName: data.username,
            password: data.password,
            role: "customer",
            isAgreedToTerms: data.agree,
            ...(coordinates?.lat && {
              googleMapLocation: {
                lat: coordinates.lat,
                long: coordinates.lng,
              },
            }),
          };
        } else {
          const country = countries.find((c) => c._id === data.businesscountry);
          const state = businessStates.find(
            (s) => s._id === data.businessstate
          );
          const city = businessCities.find((c) => c._id === data.businesscity);
          payload = {
            businessName: data.businessName,
            businessType: data.businessType,
            categoryId: data?.businessCategory || "",
            ...(data?.businessSubCategory && {
              subCategoryId: data.businessSubCategory || "",
            }),
            email: data.businessemail,
            phoneNumber: data.businessmobNumber.replace(
              `+${data.businesscountryCode}`,
              ""
            ),
            countryCode: data.businesscountryCode,
            country: country?.name || "",
            state: state?.name || "",
            city: city?.name || "",
            address: data.businessaddress,
            discountPercentage: data.businessdiscount,
            role: "business",
            isAgreedToTerms: data.businessagree,
            userName: data.businessusername,
            password: data.businesspassword,
            ...(coordinates?.lat && {
              googleMapLocation: {
                lat: coordinates.lat,
                long: coordinates.lng,
              },
            }),
          };
        }

        const res = await dispatch(signUp({ payload: payload, setLoading }));
        if (res?.payload?.error === false) {
          reset();
          setCoordinates({ lat: null, lng: null });
          navigate("/login");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };

  const onCustomerPlaceChanged = () => {
    const autocomplete = customerAutocompleteRef.current;
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCoordinates({ lat, lng });
        setValue("address", place.formatted_address || "");
        trigger("address");
        setAddressError("");
      } else {
        setAddressError("Please select a valid address from the suggestions");
      }
    }
  };

  const onBusinessPlaceChanged = () => {
    const autocomplete = businessAutocompleteRef.current;
    if (autocomplete) {
      const place = autocomplete.getPlace();

      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCoordinates({ lat, lng });
        setValue("businessaddress", place.formatted_address || "");
        trigger("businessaddress");
        setAddressError("");
      } else {
        setAddressError("Please select a valid address from the suggestions");
      }
    }
  };

  useEffect(() => {
    if (watchedCountry) {
      setAddressError("");
    } else if (watchedAddress) {
      setAddressError("Please select country first");
      setValue(accountType === "customer" ? "address" : "businessaddress", "");
      setCoordinates({ lat: null, lng: null });
      trigger(accountType === "customer" ? "address" : "businessaddress");
    }
  }, [watchedAddress, watchedCountry, setValue, trigger, accountType]);

  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading Google Maps API...</div>;
  }

  return (
    <div>
      <main className="wrapper">
        {loading && <Loader />}
        <section className="middle-container">
          <section className="login-wrapper signup-page-wrapper">
            <div className="container">
              <div className="row text-center">
                <div className="col-md-12">
                  <h3 className="main-heading">Sign Up</h3>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="signup-wrapper">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group form-group-radio account-type-group">
                          <label className="form-label w-100">
                            Account Type
                          </label>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              style={{ cursor: "pointer" }}
                              type="radio"
                              name="accountType"
                              id="accountCustomer"
                              value="customer"
                              checked={accountType === "customer"}
                              onChange={(e) => {
                                setAccountType(e.target.value);
                                reset();
                                setCoordinates({ lat: null, lng: null });
                              }}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="accountCustomer"
                            >
                              Customer
                            </label>
                          </div>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              style={{ cursor: "pointer" }}
                              name="accountType"
                              id="accountBusiness"
                              value="business"
                              checked={accountType === "business"}
                              onChange={(e) => {
                                setAccountType(e.target.value);
                                reset();
                                setCoordinates({ lat: null, lng: null });
                              }}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="accountBusiness"
                            >
                              Business
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      {accountType === "customer" && (
                        <div
                          className="signup-customer animated fadeIn"
                          id="customer-form"
                        >
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="f-name" className="form-label">
                                  First Name
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="f-name"
                                  {...register("firstName")}
                                  onInput={(e) => {
                                    e.target.value = e.target.value.replace(
                                      /[^a-zA-Z]/g,
                                      ""
                                    );
                                    trigger("firstName");
                                  }}
                                />
                                {errors.firstName && (
                                  <div style={{ color: "red" }}>
                                    {errors.firstName.message}
                                  </div>
                                )}
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
                                  id="l-name"
                                  {...register("lastName")}
                                  onInput={(e) => {
                                    e.target.value = e.target.value.replace(
                                      /[^a-zA-Z]/g,
                                      ""
                                    );
                                    trigger("lastName");
                                  }}
                                />
                                {errors.lastName && (
                                  <div style={{ color: "red" }}>
                                    {errors.lastName.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="age" className="form-label">
                                  Age
                                </label>
                                <input
                                  type="number"
                                  className="form-control"
                                  id="age"
                                  {...register("age")}
                                  step="1"
                                  onInput={(e) => {
                                    e.target.value = e.target.value.replace(
                                      /\./g,
                                      ""
                                    );
                                    trigger("age");
                                  }}
                                />
                                {errors.age && (
                                  <div style={{ color: "red" }}>
                                    {errors.age.message}
                                  </div>
                                )}
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
                                {["Male", "Female", "Other"].map((g) => (
                                  <div
                                    key={g}
                                    className="form-check form-check-inline"
                                  >
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      value={g}
                                      {...register("gender")}
                                      id={`radio-${g}`}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor={`radio-${g}`}
                                    >
                                      {g}
                                    </label>
                                  </div>
                                ))}
                                {errors.gender && (
                                  <div
                                    style={{ color: "red", marginTop: "29px" }}
                                  >
                                    {errors.gender.message}
                                  </div>
                                )}
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
                                  id="email01"
                                  {...register("email")}
                                />
                                {errors.email && (
                                  <div style={{ color: "red" }}>
                                    {errors.email.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group mob-number">
                                <label
                                  htmlFor="mobNumber"
                                  className="form-label"
                                >
                                  Phone Number
                                </label>
                                <Controller
                                  name="mobNumber"
                                  control={control}
                                  defaultValue=""
                                  rules={{ required: true }}
                                  render={({ field }) => (
                                    <PhoneInput
                                      country={"us"}
                                      value={field.value}
                                      onChange={(value, country) => {
                                        field.onChange(value);
                                        setValue(
                                          "countryCode",
                                          country.dialCode
                                        );
                                        trigger(["mobNumber", "countryCode"]);
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
                                      renderDropdown={(
                                        items,
                                        selectedItem,
                                        isOpen,
                                        handleItemClick
                                      ) => (
                                        <div style={{ display: "block" }}>
                                          {items.map((item) => (
                                            <div
                                              key={item.dialCode}
                                              onClick={() =>
                                                handleItemClick(item)
                                              }
                                              style={{
                                                padding: "5px",
                                                cursor: "pointer",
                                              }}
                                            >
                                              +{item.dialCode}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    />
                                  )}
                                />
                                {errors.mobNumber && (
                                  <div style={{ color: "red" }}>
                                    {errors.mobNumber.message}
                                  </div>
                                )}
                                {errors.countryCode && (
                                  <div style={{ color: "red" }}>
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
                                >
                                  <option value="">Select country</option>
                                  {countries.map((country) => (
                                    <option
                                      key={country._id}
                                      value={country._id}
                                    >
                                      {country.name}
                                    </option>
                                  ))}
                                </select>
                                {errors.country && (
                                  <div style={{ color: "red" }}>
                                    {errors.country.message}
                                  </div>
                                )}
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
                                  disabled={customerStates.length === 0}
                                >
                                  <option value="">Select state</option>
                                  {customerStates.map((state) => (
                                    <option key={state._id} value={state._id}>
                                      {state.name}
                                    </option>
                                  ))}
                                </select>
                                {errors.state && (
                                  <div style={{ color: "red" }}>
                                    {errors.state.message}
                                  </div>
                                )}
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
                                  disabled={customerCities.length === 0}
                                >
                                  <option value="">Select city</option>
                                  {customerCities.map((city) => (
                                    <option key={city._id} value={city._id}>
                                      {city.name}
                                    </option>
                                  ))}
                                </select>
                                {errors.city && (
                                  <div style={{ color: "red" }}>
                                    {errors.city.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="address01"
                                  className="form-label"
                                >
                                  Address
                                </label>
                                <Autocomplete
                                  key={`customer-autocomplete-${watchedCountry}`}
                                  types={["address"]}
                                  onLoad={(autocomplete) => {
                                    customerAutocompleteRef.current =
                                      autocomplete;
                                  }}
                                  onPlaceChanged={onCustomerPlaceChanged}
                                  restrictions={{
                                    country: watchedCountry
                                      ? countries
                                          .find((c) => c._id === watchedCountry)
                                          ?.code?.toLowerCase()
                                      : undefined,
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
                                    id="address01"
                                    {...register("address")}
                                    placeholder="Enter address"
                                    disabled={!watchedCountry}
                                  />
                                </Autocomplete>
                                {addressError && (
                                  <div style={{ color: "red" }}>
                                    {addressError}
                                  </div>
                                )}
                                {errors.address && (
                                  <div style={{ color: "red" }}>
                                    {errors.address.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="username"
                                  className="form-label"
                                >
                                  Username
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="username"
                                  {...register("username")}
                                />
                                {errors.username && (
                                  <div style={{ color: "red" }}>
                                    {errors.username.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="password"
                                  className="form-label"
                                >
                                  Password
                                </label>
                                <input
                                  type="password"
                                  className="form-control"
                                  id="password"
                                  {...register("password")}
                                />
                                {errors.password && (
                                  <div style={{ color: "red" }}>
                                    {errors.password.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group-checkbox">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    {...register("agree")}
                                  />
                                  <label className="form-check-label">
                                    I agree to{" "}
                                    <a
                                      className="form-check-label"
                                      href="/terms"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                      }}
                                    >
                                      terms & conditions
                                    </a>
                                  </label>
                                  {errors.agree && (
                                    <div style={{ color: "red" }}>
                                      {errors.agree.message}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {accountType === "business" && (
                        <div
                          className="signup-business animated fadeIn"
                          id="business-form"
                        >
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="businesscountry"
                                  className="form-label"
                                >
                                  Country
                                </label>
                                <select
                                  className="form-select"
                                  {...register("businesscountry")}
                                >
                                  <option value="">Select country</option>
                                  {countries.map((country) => (
                                    <option
                                      key={country._id}
                                      value={country._id}
                                    >
                                      {country.name}
                                    </option>
                                  ))}
                                </select>
                                {errors.businesscountry && (
                                  <div style={{ color: "red" }}>
                                    {errors.businesscountry.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="businessstate"
                                  className="form-label"
                                >
                                  State
                                </label>
                                <select
                                  className="form-select"
                                  {...register("businessstate")}
                                  disabled={businessStates.length === 0}
                                >
                                  <option value="">Select state</option>
                                  {businessStates.map((state) => (
                                    <option key={state._id} value={state._id}>
                                      {state.name}
                                    </option>
                                  ))}
                                </select>
                                {errors.businessstate && (
                                  <div style={{ color: "red" }}>
                                    {errors.businessstate.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="businesscity"
                                  className="form-label"
                                >
                                  City
                                </label>
                                <select
                                  className="form-select"
                                  {...register("businesscity")}
                                  disabled={businessCities.length === 0}
                                >
                                  <option value="">Select city</option>
                                  {businessCities.map((city) => (
                                    <option key={city._id} value={city._id}>
                                      {city.name}
                                    </option>
                                  ))}
                                </select>
                                {errors.businesscity && (
                                  <div style={{ color: "red" }}>
                                    {errors.businesscity.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group form-group-radio">
                                <label
                                  htmlFor="businessType"
                                  className="form-label w-100"
                                >
                                  Business Type
                                </label>
                                {["Online", "Offline", "Both"].map((g) => (
                                  <div
                                    key={g}
                                    className="form-check form-check-inline"
                                  >
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      value={g}
                                      {...register("businessType")}
                                      id={`radio-${g}`}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor={`radio-${g}`}
                                    >
                                      {g}
                                    </label>
                                  </div>
                                ))}
                                {errors.businessType && (
                                  <div
                                    style={{ color: "red", marginTop: "29px" }}
                                  >
                                    {errors.businessType.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="businessCategory"
                                  className="form-label"
                                >
                                  Business Category
                                </label>
                                <select
                                  className="form-select"
                                  {...register("businessCategory")}
                                >
                                  <option value="">Select category</option>
                                  {categories.map((category) => (
                                    <option
                                      key={category._id}
                                      value={category._id}
                                    >
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                                {errors.businessCategory && (
                                  <div style={{ color: "red" }}>
                                    {errors.businessCategory.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="businessSubCategory"
                                  className="form-label"
                                >
                                  Business Sub-Category
                                </label>
                                <select
                                  className="form-select"
                                  {...register("businessSubCategory")}
                                >
                                  <option value="">Select sub-category</option>
                                  {subcategories.map((subcategory) => (
                                    <option
                                      key={subcategory._id}
                                      value={subcategory._id}
                                    >
                                      {subcategory.name}
                                    </option>
                                  ))}
                                </select>
                                {errors.businessSubCategory && (
                                  <div style={{ color: "red" }}>
                                    {errors.businessSubCategory.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="bname" className="form-label">
                                  Business Name
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="bname"
                                  {...register("businessName")}
                                  onInput={(e) => {
                                    e.target.value = e.target.value.replace(
                                      /[^a-zA-Z\s]/g,
                                      ""
                                    );
                                    trigger("businessName");
                                  }}
                                />
                                {errors.businessName && (
                                  <div style={{ color: "red" }}>
                                    {errors.businessName.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="businessaddress"
                                  className="form-label"
                                >
                                  Address
                                </label>
                                <Autocomplete
                                  key={`business-autocomplete-${watchedCountry}`}
                                  types={["address"]}
                                  onLoad={(autocomplete) => {
                                    businessAutocompleteRef.current =
                                      autocomplete;
                                  }}
                                  onPlaceChanged={onBusinessPlaceChanged}
                                  restrictions={{
                                    country: watchedCountry
                                      ? countries
                                          .find((c) => c._id === watchedCountry)
                                          ?.code?.toLowerCase()
                                      : undefined,
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
                                    id="businessaddress"
                                    {...register("businessaddress")}
                                    placeholder="Enter address"
                                    disabled={!watchedCountry}
                                  />
                                </Autocomplete>
                                {addressError && (
                                  <div style={{ color: "red" }}>
                                    {addressError}
                                  </div>
                                )}
                                {errors.businessaddress && (
                                  <div style={{ color: "red" }}>
                                    {errors.businessaddress.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group mob-number">
                                <label
                                  htmlFor="businessmobNumber"
                                  className="form-label"
                                >
                                  Phone Number
                                </label>
                                <Controller
                                  name="businessmobNumber"
                                  control={control}
                                  defaultValue=""
                                  rules={{ required: true }}
                                  render={({ field }) => (
                                    <PhoneInput
                                      country={"us"}
                                      value={field.value}
                                      onChange={(value, country) => {
                                        field.onChange(value);
                                        setValue(
                                          "businesscountryCode",
                                          country.dialCode
                                        );
                                        trigger([
                                          "businessmobNumber",
                                          "businesscountryCode",
                                        ]);
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
                                      renderDropdown={(
                                        items,
                                        selectedItem,
                                        isOpen,
                                        handleItemClick
                                      ) => (
                                        <div style={{ display: "block" }}>
                                          {items.map((item) => (
                                            <div
                                              key={item.dialCode}
                                              onClick={() =>
                                                handleItemClick(item)
                                              }
                                              style={{
                                                padding: "5px",
                                                cursor: "pointer",
                                              }}
                                            >
                                              +{item.dialCode}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    />
                                  )}
                                />
                                {errors.businessmobNumber && (
                                  <div style={{ color: "red" }}>
                                    {errors.businessmobNumber.message}
                                  </div>
                                )}
                                {errors.businesscountryCode && (
                                  <div style={{ color: "red" }}>
                                    {errors.businesscountryCode.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="businessemail"
                                  className="form-label"
                                >
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  className="form-control"
                                  id="businessemail"
                                  {...register("businessemail")}
                                />
                                {errors.businessemail && (
                                  <div style={{ color: "red" }}>
                                    {errors.businessemail.message}
                                  </div>
                                )}
                              </div>
                            </div>
                               <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="businessdiscount"
                                  className="form-label"
                                >
                                  Discount Percentage Offer
                                </label>
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
                                        e.target.value = `${whole}.${decimal.slice(0, 2)}`;
                                      }
                                    }
                                  }}
                                />


                                {errors.businessdiscount && (
                                  <div style={{ color: "red" }}>
                                    {errors.businessdiscount.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="businessusername"
                                  className="form-label"
                                >
                                  Username
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="businessusername"
                                  {...register("businessusername")}
                                />
                                {errors.businessusername && (
                                  <div style={{ color: "red" }}>
                                    {errors.businessusername.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label
                                  htmlFor="businesspassword"
                                  className="form-label"
                                >
                                  Password
                                </label>
                                <input
                                  type="password"
                                  className="form-control"
                                  id="businesspassword"
                                  {...register("businesspassword")}
                                />
                                {errors.businesspassword && (
                                  <div style={{ color: "red" }}>
                                    {errors.businesspassword.message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group-checkbox">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    {...register("businessagree")}
                                  />
                                  <label
                                    className="form-check-label"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      window.open("/terms", "_blank")
                                    }
                                  >
                                    I agree to{" "}
                                    <a
                                      className="form-check-label"
                                      href="/terms"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                      }}
                                    >
                                      terms & conditions
                                    </a>
                                  </label>
                                  {errors.businessagree && (
                                    <div style={{ color: "red" }}>
                                      {errors.businessagree.message}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="row">
                        <div className="col-md-12 btn-block">
                          <button className="btn btn-primary" type="submit">
                            Sign Up
                          </button>
                        </div>
                      </div>
                    </form>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="signup-text">
                          Already have an account? <a href="/login">Sign In</a>
                        </div>
                      </div>
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

export default Signup;
