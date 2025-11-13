import React, { useCallback, useEffect, useRef, useState } from "react";
import { newquast, qlipadd, searchbuttonicon } from "../imaUrl";
import ProfileHeader from "../components/ProfileHeader";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Sidebar from "../components/Sidebar";
import { getCity, getCountries, getStates } from "../feature/locationSlice";
import {
  getAllCategories,
  getAllSubcategories,
} from "../feature/categoriesSlice";
import { getAgeRanges } from "../feature/homePage/ageRangeSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { submitNewQast } from "../feature/addpostSlice";
import Select from "react-select";
import { getUsers } from "../feature/userSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import VideoTrimmer from "../components/VideoTrimmer";

const customerSchema = yup.object().shape({
  caption: yup.string().optional(),
  country: yup.string().optional(),
  state: yup.string().optional(),
  city: yup.string().optional(),
  businessType: yup.string().optional(),
  category: yup.string().optional(),
  subCategory: yup.string().optional(),
  ageRange: yup.string().optional(),
  gender: yup.string().optional(),
  businessTags: yup.array().optional(),
  // mediaFiles: yup.array().min(1, "At least one image or video is required"),
  // mediaFiles: yup.array().optional(),
  content: yup.string().optional(),
})

const businessSchema = yup.object().shape({
  caption: yup.string().optional(),
  businesscountry: yup.string().optional(),
  businessstate: yup.string().optional(),
  businesscity: yup.string().optional(),
  businessType: yup.string().optional(),
  category: yup.string().optional(),
  subCategory: yup.string().optional(),
  ageRange: yup.string().optional(),
  // gender: yup.string().optional(),
  // mediaFiles: yup.array().min(1, "At least one image or video is required"),
  // mediaFiles: yup.array().optional(),
  content: yup.string().optional(),
})

const Newquastcommanuser = () => {
  const token = useSelector((state) => state.auth.token);
  const { error } = useSelector((state) => state.newQast);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [accountType, setAccountType] = useState("customer");
  const [selectedCountryLabel, setSelectedCountryLabel] = useState("");
  const [selectedStateLabel, setSelectedStateLabel] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const fileInputRef = React.useRef(null);
  const [profile, setProfile] = useState("");
  const [discountBusinessList, setDiscountBusiness] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false); // Separate loading state for pagination
  const [mediaError, setMediaError] = useState(false);
  const [selectedCityLabel, setSelectedCityLabel] = useState("");
  const [selectionMade, setSelectionMade] = useState(false);
  const [showTextBox, setShowTextBox] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [extraText, setExtraText] = useState("");

  const [showTrimModal, setShowTrimModal] = useState(false);
  const [trimFile, setTrimFile] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);

  const [videoDuration, setVideoDuration] = useState(0);

  const [selectedFilters, setSelectedFilters] = useState({
    country: [],
    state: [],
    city: [],
  });

  // Function to add selection
  const handleSelect = (type, value, label) => {
    if (value && !selectedFilters[type].some((item) => item.value === value)) {
      setSelectedFilters((prev) => ({
        ...prev,
        [type]: [...prev[type], { value, label }],
      }));
    }
  };

  // Function to remove selection
  const handleRemove = (type, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item.value !== value),
    }));
  };

  const {
    ageRanges = [],
    loading: ageRangeLoading = false,
    error: ageRangeError = null,
  } = useSelector((state) => state.ageRange || {});

  const { user } = useSelector((store) => store?.profile);

  const schema = accountType === "customer" ? customerSchema : businessSchema;

  useEffect(() => {
    const userProfile = localStorage.getItem("profile");
    if (user?.role) {
      setProfile(user?.role);
      setAccountType(user?.role);
    } else if (userProfile) {
      setProfile(userProfile);
      setAccountType(userProfile || "customer");
    }
    // setProfile(userProfile);
    // setAccountType(userProfile || "customer");
  }, []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      caption: "",
      country: "",
      businesscountry: "",
      state: "",
      businessstate: "",
      city: "",
      businesscity: "",
      businessType: "",
      category: "",
      subCategory: "",
      ageRange: "",
      gender: "",
      businessTags: [],
      mediaFiles: [],
    },
  });
  const watchedMediaFiles = watch("mediaFiles");
  const watchedCountry = watch(
    accountType === "customer" ? "country" : "businesscountry"
  );
  const watchedState = watch(
    accountType === "customer" ? "state" : "businessstate"
  );
  const watchedCity = watch(
    accountType === "customer" ? "city" : "businesscity"
  );
  const handleAddMediaClick = () => {
    setSelectionMade(true);
    setShowTextBox(false);
    setSelectedMode("media");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // const handleMediaChange = (event) => {
  //   const files = Array.from(event.target.files);
  //   setMediaFiles((prev) => [...prev, ...files]);
  //   setValue("mediaFiles", [...watchedMediaFiles, ...files], {
  //     shouldValidate: true,
  //   });
  // };


  // const handleMediaChange = (event) => {
  //   const files = Array.from(event.target.files);

  //   files.forEach((file) => {
  //     if (file.type.startsWith("video/")) {
  //       // Handle video files → open trimmer
  //       const video = document.createElement("video");
  //       video.preload = "metadata";

  //       video.onloadedmetadata = () => {
  //         window.URL.revokeObjectURL(video.src);

  //         setMediaFiles((prev) => [...prev, file]);
  //         setTrimFile(file);
  //         setCurrentIndex(mediaFiles.length);
  //         setShowTrimModal(true);

  //         // Save video duration for trimming
  //         setVideoDuration(video.duration);
  //       };

  //       video.src = URL.createObjectURL(file);
  //     } else if (file.type.startsWith("image/")) {
  //       // Handle image files → directly push to mediaFiles
  //       setMediaFiles((prev) => [...prev, file]);
  //     } else {
  //       // Optional: Handle unsupported file types
  //       console.warn("Unsupported file type:", file.type);
  //     }
  //   });
  // };


  const handleMediaChange = (event) => {
    const files = Array.from(event.target.files);

    const validFiles = files.filter((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        return true;
      } else {
        toast.error(`Unsupported file type: ${file.name}`);
        return false;
      }
    });

    validFiles.forEach((file, index) => {
      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          // if (video.duration > 180) {
          //   toast.error(`Video ${file.name} exceeds 3-minute limit`);
          //   return;
          // }
          setTrimFile(file);
          setCurrentIndex(mediaFiles.length + index); // Adjust index for multiple files
          setShowTrimModal(true);
          setVideoDuration(video.duration);
        };

        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith("image/")) {
        // Directly add images to mediaFiles
        setMediaFiles((prev) => [...prev, file]);
      }
    });

    // Update react-hook-form field
    setValue("mediaFiles", [...mediaFiles, ...validFiles], {
      shouldValidate: true,
    });
  };


  const handleMenuScrollToBottom = () => {
    if (!isFetching && hasMore) {
      setPage((prevPage) => prevPage + 1); // Increment page
    }
  };

  useEffect(() => {
    const fetchCountries = async () => {
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
            setStates(payload.data.states[0]?.states || []);
            setCities([]);
            setValue(
              accountType === "customer" ? "state" : "businessstate",
              ""
            );
            setValue(accountType === "customer" ? "city" : "businesscity", "");
          }
        } catch (error) {
          console.error("Error fetching states:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStates();
    }
  }, [watchedCountry, dispatch, setValue, accountType]);

  useEffect(() => {
    if (watchedState) {
      const fetchCities = async () => {
        try {
          setLoading(true);
          const { payload } = await dispatch(
            getCity({ setLoading, id: watchedState })
          );
          if (payload?.data?.cities) {
            setCities(payload.data.cities[0]?.cities || []);
            setValue(accountType === "customer" ? "city" : "businesscity", "");
          }
        } catch (error) {
          console.error("Error fetching cities:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCities();
    }
  }, [watchedState, dispatch, setValue, accountType]);

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
    const selectedCategory = watch("category");
    if (selectedCategory) {
      const fetchSubcategories = async () => {
        try {
          setLoading(true);
          const { payload } = await dispatch(
            getAllSubcategories({ setLoading, id: selectedCategory })
          );
          if (payload?.data?.subcategories) {
            setSubcategories(payload.data.subcategories);
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSubcategories();
    }
  }, [watch("category"), dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(getAgeRanges({ token }));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (watchedCountry && countries.length > 0) {
      const selected = countries.find((c) => c._id === watchedCountry);
      if (selected) setSelectedCountryLabel(selected.name);
    }
  }, [watchedCountry, countries]);

  useEffect(() => {
    if (watchedState && states.length > 0) {
      const selected = states.find((s) => s._id === watchedState);
      if (selected) setSelectedStateLabel(selected.name);
    }
  }, [watchedState, states]);

  const getQroffyDiscount = async (pageNum = 1, newSearch = "") => {
    if (isFetching || !hasMore) return; // Prevent multiple fetches or fetching when no more data

    try {
      setIsFetching(true);
      const { payload } = await dispatch(
        getUsers({ token, setLoading, search: newSearch, page: pageNum })
      );
      if (payload?.error === false) {
        const newUsers = payload?.data?.users || [];
        if (newUsers.length === 0 || newUsers.length < 10) {
          setHasMore(false);
        }
        const userData = newUsers.map((user) => ({
          value: user?._id,
          label: user?.businessName,
        }));
        setDiscountBusiness((prev) => [...prev, ...userData]); // Append new users
      } else {
        setHasMore(false);
      }
    } catch (error) {
      setHasMore(false);
      console.error("Error fetching users:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) {
      getQroffyDiscount(page);
    }
  }, [page, token]);

  const handleDataSubmit = async (data) => {
    const formData = new FormData();

    const targeting = {
      countries: [
        accountType === "customer" ? data.country : data.businesscountry,
      ],
      states: [accountType === "customer" ? data.state : data.businessstate],
      cities: [accountType === "customer" ? data.city : data.businesscity],
      businessType: data.businessType,
      businessCategoryId: data.category || null,
      ...(data.subCategory ? { subcategoryId: data.subCategory || null } : {}),
      ageRange: data.ageRange,
      gender: data.gender.toLowerCase(),
    };
    formData.append("targeting", JSON.stringify(targeting));
    formData.append("text", data.caption);
    formData.append("type", "post");
    formData.append("content", data?.content || "");

    if (accountType === "customer") {
      let targets = [];
      data.businessTags.forEach((tag) => {
        targets.push(tag?.value);
      });
      formData.append("tagedUserIds", JSON.stringify(targets));
    } else {
      formData.append("tagedUserIds", JSON.stringify([]));
    }

    formData.append("visibility", "public");

    const videos = mediaFiles.filter((file) => file.type.startsWith("video/"));
    const images = mediaFiles.filter((file) => file.type.startsWith("image/"));

    videos.forEach((file) => formData.append("videos", file));
    images.forEach((file) => formData.append("images", file));

    setLoading(true);
    try {
      const { payload } = await dispatch(submitNewQast({ formData, token }));
      if (payload?.error === false) {
        reset();
        setMediaFiles([]);
        navigate("/home");
      } else {
        toast.error(payload?.message || "Failed to submit post");
      }
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("An error occurred while submitting the post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (watchedCountry && countries.length > 0) {
      const selected = countries.find((c) => c._id === watchedCountry);
      if (selected) {
        setSelectedCountryLabel(selected.name);
        // Add to selectedFilters only if not already present
        handleSelect("country", watchedCountry, selected.name);
      }
    }
  }, [watchedCountry, countries]);

  useEffect(() => {
    if (watchedState && states.length > 0) {
      const selected = states.find((s) => s._id === watchedState);
      if (selected) {
        setSelectedStateLabel(selected.name);
        handleSelect("state", watchedState, selected.name);
      }
    }
  }, [watchedState, states]);

  useEffect(() => {
    if (watchedCity && cities.length > 0) {
      const selected = cities.find((c) => c._id === watchedCity);
      if (selected) {
        setSelectedCityLabel(selected.name);
        handleSelect("city", watchedCity, selected.name);
      }
    }
  }, [watchedCity, cities]);

  const handleAddTextClick = () => {
    setSelectionMade(true);
    setShowTextBox(true);
    setSelectedMode("text");
  }

  return (
    <div>
      {loading && <Loader />}
      <ProfileHeader />
      <main className="wrapper">
        <section className="middle-container">
          <div className="container-fluid">
            <div className="profile-wrapper">
              <div className="row">
                <div className="col-md-3">
                  <Sidebar />
                </div>
                <div className="col-md-9">
                  <div className="profile-wrapper-right">
                    <h3 className="main-heading">New Qast</h3>
                    <form onSubmit={handleSubmit(handleDataSubmit)}>
                      <div className="new-qast-wrap">
                        <div className="new-qast-media-wrap">
                          {mediaFiles.map((file, index) => (
                            <div className="qast-media-box" key={index}>
                              {file.type.startsWith("video") ? (
                                <video controls width="100%" height="189px" style={{ objectFit: "cover" }}>
                                  <source src={URL.createObjectURL(file)} type={file.type} />
                                </video>
                              ) : (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`media-${index}`}
                                  style={{ width: "100%", height: "189px", objectFit: "cover" }}
                                />
                              )}
                            </div>
                          ))}
                          {!selectionMade && (
                            <>
                              <div className="qast-media-box add-media-box" onClick={handleAddMediaClick}>
                                <div className="icon-wrap">
                                  <i><img src={qlipadd} alt="add" /></i>
                                  <span className="label">Add Media</span>
                                </div>
                              </div>

                              <div className="qast-media-box add-media-box" onClick={handleAddTextClick}>
                                <div className="icon-wrap">
                                  <i><img src={qlipadd} alt="add" /></i>
                                  <span className="label">Add Text</span>
                                </div>
                              </div>
                            </>
                          )}
                          {/* {selectionMade && showTextBox && (
                            <div className="qast-media-box text-box">
                              <Controller
                                name="content"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                  <textarea
                                    {...field}
                                    className="form-control"
                                    placeholder="Write text..."
                                    rows={4}
                                    style={{ width: "100%", height: "200px" }}
                                  />
                                )}
                              />
                              {errors.content && (
                                <p className="text-danger">{errors.content.message}</p>
                              )}
                            </div>
                          )} */}
                          {selectionMade && selectedMode === "media" && (
                            <div className="qast-media-box add-media-box" onClick={handleAddMediaClick}>
                              <div className="icon-wrap">
                                <i><img src={qlipadd} alt="add" /></i>
                                <span className="label">Add Media</span>
                              </div>
                            </div>
                          )}
                          {selectionMade && selectedMode === "text" && showTextBox && (
                            <div className="qast-media-box text-box">
                              <Controller
                                name="content"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                  <textarea
                                    {...field}
                                    className="form-control"
                                    placeholder="Write text"
                                    rows={4}
                                    style={{ width: "100%", height: "200px" }}
                                  />
                                )}
                              />
                              {errors.content && (
                                <p className="text-danger">{errors.content.message}</p>
                              )}
                            </div>
                          )}

                          {/* File Input */}
                          <input
                            type="file"
                            accept="image/*,video/*"
                            // multiple
                            ref={fileInputRef} 
                               capture="environment"
                            onChange={handleMediaChange}
                            style={{ display: "none" }}
                          />
                        </div>
                        {/* Validation error if no media selected */}
                        {errors.mediaFiles && (
                          <p className="text-danger mt-2">
                            {errors.mediaFiles.message}
                          </p>
                        )}
                        <div className="add-caption-field">
                          <div className="form-group">
                            <Controller
                              name="caption"
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  className="form-control"
                                  placeholder="Add caption..."
                                />
                              )}
                            />
                            {errors.caption && (
                              <p className="text-danger">
                                {errors.caption.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="targeting-field">
                          <div className="form-group">
                            <label className="form-label">Targeting</label>
                            <div className="selected-tags">
                              {selectedFilters.country.map((item) => (
                                <span key={item.value} className="tag">
                                  {item.label}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleRemove("country", item.value);
                                      setValue(
                                        accountType === "customer"
                                          ? "country"
                                          : "businesscountry",
                                        ""
                                      );
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                              {selectedFilters.state.map((item) => (
                                <span key={item.value} className="tag">
                                  {item.label}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleRemove("state", item.value);
                                      setValue(
                                        accountType === "customer"
                                          ? "state"
                                          : "businessstate",
                                        ""
                                      );
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                              {selectedFilters.city.map((item) => (
                                <span key={item.value} className="tag">
                                  {item.label}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleRemove("city", item.value);
                                      setValue(
                                        accountType === "customer"
                                          ? "city"
                                          : "businesscity",
                                        ""
                                      );
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                          {/* Display selected country, state, city as tags */}
                        </div>
                        <div className="qast-form">
                          {/* <div className="row w-100">
                            <div className="col-lg-3">
                              <div className="form-group form-group-sm">
                                <label
                                  htmlFor={
                                    accountType === "customer"
                                      ? "country"
                                      : "businesscountry"
                                  }
                                  className="form-label"
                                >
                                  Country
                                </label>
                                <Controller
                                  name={
                                    accountType === "customer"
                                      ? "country"
                                      : "businesscountry"
                                  }
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <select {...field} className="form-select">
                                      <option value="">Country</option>
                                      {countries.map((country) => (
                                        <option
                                          key={country._id}
                                          value={country._id}
                                        >
                                          {country.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                                {errors[
                                  accountType === "customer"
                                    ? "country"
                                    : "businesscountry"
                                ] && (
                                    <div className="text-danger">
                                      {
                                        errors[
                                          accountType === "customer"
                                            ? "country"
                                            : "businesscountry"
                                        ].message
                                      }
                                    </div>
                                  )}
                              </div>
                            </div>
                            <div className="col-lg-3">
                              <div className="form-group form-group-sm">
                                <label
                                  htmlFor={
                                    accountType === "customer"
                                      ? "state"
                                      : "businessstate"
                                  }
                                  className="form-label"
                                >
                                  State
                                </label>
                                <Controller
                                  name={
                                    accountType === "customer"
                                      ? "state"
                                      : "businessstate"
                                  }
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <select {...field} className="form-select">
                                      <option value="">State</option>
                                      {states.map((state) => (
                                        <option
                                          key={state._id}
                                          value={state._id}
                                        >
                                          {state.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                                {errors[
                                  accountType === "customer"
                                    ? "state"
                                    : "businessstate"
                                ] && (
                                    <div className="text-danger">
                                      {
                                        errors[
                                          accountType === "customer"
                                            ? "state"
                                            : "businessstate"
                                        ].message
                                      }
                                    </div>
                                  )}
                              </div>
                            </div>
                            <div className="col-lg-3">
                              <div className="form-group form-group-sm">
                                <label
                                  htmlFor={
                                    accountType === "customer"
                                      ? "city"
                                      : "businesscity"
                                  }
                                  className="form-label"
                                >
                                  City
                                </label>
                                <Controller
                                  name={
                                    accountType === "customer"
                                      ? "city"
                                      : "businesscity"
                                  }
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <select {...field} className="form-select">
                                      <option value="">City</option>
                                      {cities.map((city) => (
                                        <option key={city._id} value={city._id}>
                                          {city.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                                {errors[
                                  accountType === "customer"
                                    ? "city"
                                    : "businesscity"
                                ] && (
                                    <div className="text-danger">
                                      {
                                        errors[
                                          accountType === "customer"
                                            ? "city"
                                            : "businesscity"
                                        ].message
                                      }
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div> */} 
                          <div className="row w-100">
                            {/* Country */}
                            <div className="col-lg-3">
                              <div className="form-group form-group-sm">
                                <label
                                  htmlFor={accountType === "customer" ? "country" : "businesscountry"}
                                  className="form-label"
                                >
                                  Country
                                </label>
                                <Controller
                                  name={accountType === "customer" ? "country" : "businesscountry"}
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <select {...field} className="form-select">
                                      <option value="">Country</option>
                                      {countries.map((country) => (
                                        <option key={country._id} value={country._id}>
                                          {country.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                                {errors[accountType === "customer" ? "country" : "businesscountry"] && (
                                  <div className="text-danger">
                                    {errors[accountType === "customer" ? "country" : "businesscountry"].message}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* State (always show, disable if no states) */}
                            <div className="col-lg-3">
                              <div className="form-group form-group-sm">
                                <label
                                  htmlFor={accountType === "customer" ? "state" : "businessstate"}
                                  className="form-label"
                                >
                                  State
                                </label>
                                <Controller
                                  name={accountType === "customer" ? "state" : "businessstate"}
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <select
                                      {...field}
                                      className="form-select"
                                      disabled={states.length === 0} // disable if no state
                                    >
                                      <option value="">State</option>
                                      {states.map((state) => (
                                        <option key={state._id} value={state._id}>
                                          {state.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                                {errors[accountType === "customer" ? "state" : "businessstate"] && (
                                  <div className="text-danger">
                                    {errors[accountType === "customer" ? "state" : "businessstate"].message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-lg-3">
                              <div className="form-group form-group-sm">
                                <label
                                  htmlFor={accountType === "customer" ? "city" : "businesscity"}
                                  className="form-label"
                                >
                                  City
                                </label>
                                <Controller
                                  name={accountType === "customer" ? "city" : "businesscity"}
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <select
                                      {...field}
                                      className="form-select"
                                      disabled={cities.length === 0} // disable if no city
                                    >
                                      <option value="">City</option>
                                      {cities.map((city) => (
                                        <option key={city._id} value={city._id}>
                                          {city.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                                {errors[accountType === "customer" ? "city" : "businesscity"] && (
                                  <div className="text-danger">
                                    {errors[accountType === "customer" ? "city" : "businesscity"].message}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="row">
                            {accountType === "customer" && (
                              <div className="col-md-12">
                                <div className="targeting-field tag-businesses-field-wrap">
                                  <div className="form-group">
                                    <label className="form-label">
                                      Tag Businesses
                                    </label>
                                    <Controller
                                      name="businessTags"
                                      control={control}
                                      defaultValue={[]}
                                      render={({ field }) => (
                                        <Select
                                          {...field}
                                          isMulti
                                          options={discountBusinessList}
                                          onChange={(selected) =>
                                            field.onChange(selected)
                                          }
                                          value={field.value}
                                          className="basic-multi-select"
                                          classNamePrefix="select"
                                          onMenuScrollToBottom={
                                            handleMenuScrollToBottom
                                          }
                                          isLoading={isFetching}
                                        />
                                      )}
                                    />
                                    {errors.businessTags && (
                                      <div className="text-danger">
                                        {errors.businessTags.message}
                                      </div>
                                    )}
                                    {!isFetching &&
                                      discountBusinessList.length === 0 && (
                                        <div className="text-muted">
                                          No businesses found.
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="form-label">
                                  Business Type
                                </label>
                                <Controller
                                  name="businessType"
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <select {...field} className="form-select">
                                      <option value="">Please Select</option>
                                      <option value="Online">Online</option>
                                      <option value="Offline">Offline</option>
                                      <option value="Both">Both</option>
                                    </select>
                                  )}
                                />
                                {errors.businessType && (
                                  <p className="text-danger">
                                    {errors.businessType.message}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="form-label">Category</label>
                                <Controller
                                  name="category"
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <select
                                      {...field}
                                      className="form-select"
                                      disabled={loading}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setValue("subCategory", "");
                                      }}
                                    >
                                      <option value="">Select Category</option>
                                      {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                          {cat.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                                {errors.category && (
                                  <div className="text-danger">
                                    {errors.category.message}
                                  </div>
                                )}
                                {loading && (
                                  <small>Loading categories...</small>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="form-label">
                                  Sub Category
                                </label>
                                <Controller
                                  name="subCategory"
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <select
                                      {...field}
                                      className="form-select"
                                      disabled={
                                        !subcategories.length || loading
                                      }
                                    >
                                      <option value="">
                                        Select Sub Category
                                      </option>
                                      {subcategories.map((subcat) => (
                                        <option
                                          key={subcat._id}
                                          value={subcat._id}
                                        >
                                          {subcat.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                                {errors.subCategory && (
                                  <div className="text-danger">
                                    {errors.subCategory.message}
                                  </div>
                                )}
                                {loading && (
                                  <small>Loading subcategories...</small>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="form-label">Age Range</label>
                                <Controller
                                  name="ageRange"
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <select
                                      {...field}
                                      className="form-select"
                                      disabled={ageRangeLoading}
                                    >
                                      <option value="">Select Age Range</option>
                                      {ageRanges.map((range) => (
                                        <option
                                          key={range._id}
                                          value={`${range.minAge} - ${range.maxAge}`}
                                        >
                                          {`${range.minAge} - ${range.maxAge}`}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                                {errors.ageRange && (
                                  <div className="text-danger">
                                    {errors.ageRange.message}
                                  </div>
                                )}
                                {ageRangeLoading && (
                                  <small>Loading age ranges...</small>
                                )}
                                {ageRangeError && (
                                  <small className="text-danger">
                                    Error: {ageRangeError}
                                  </small>
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
                                <Controller
                                  name="gender"
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <div>
                                      <div className="form-check form-check-inline">
                                        <input
                                          {...field}
                                          className="form-check-input"
                                          type="radio"
                                          id="genderMale"
                                          value="male"
                                          checked={field.value === "male"}
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
                                          {...field}
                                          className="form-check-input"
                                          type="radio"
                                          id="genderFemale"
                                          value="female"
                                          checked={field.value === "female"}
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
                                          {...field}
                                          className="form-check-input"
                                          type="radio"
                                          id="genderOther"
                                          value="Other"
                                          checked={field.value === "Other"}
                                        />
                                        <label
                                          className="form-check-label"
                                          htmlFor="genderOther"
                                        >
                                          Other
                                        </label>
                                      </div>
                                    </div>
                                  )}
                                />
                                {errors.gender && (
                                  <div className="text-danger">
                                    {errors.gender.message}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-12 btn-block">
                            <button type="submit" className="btn btn-primary">
                              {loading ? "Submitting..." : "Submit"}
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

        {showTrimModal && trimFile && (
          <VideoTrimmer
            file={trimFile}
            onTrimComplete={(trimmedFile) => {
              if (trimmedFile) {
                const videoElement = document.createElement("video");
                const objectUrl = URL.createObjectURL(trimmedFile);
                videoElement.preload = "metadata";
                videoElement.src = objectUrl;

                videoElement.onloadedmetadata = () => {
                  // force browser to compute real duration
                  videoElement.currentTime = Number.MAX_SAFE_INTEGER;

                  videoElement.onseeked = () => {
                    URL.revokeObjectURL(objectUrl);

                    if (
                      videoElement.duration === Infinity ||
                      isNaN(videoElement.duration)
                    ) {
                      toast.error("Could not read trimmed video duration. Please try again.");
                      return;
                    }

                    if (videoElement.duration > 180) {
                      toast.error("Trimmed video cannot exceed 3 minutes");
                      return;
                    }

                    if (currentIndex !== null) {
                      const updatedFiles = [...mediaFiles];
                      updatedFiles[currentIndex] = trimmedFile;
                      setMediaFiles(updatedFiles);
                    }
                    setShowTrimModal(false);
                    setTrimFile(null);
                    setCurrentIndex(null);
                  };
                };
              }
            }}
            onCancel={() => {
              setShowTrimModal(false);
              setTrimFile(null);
              setCurrentIndex(null);
            }}
            maxDuration={180}   // ✅ 3 minutes = 180 seconds
            type={'post'}
          />
        )}
      </main>
    </div>
  );
};

export default Newquastcommanuser;
