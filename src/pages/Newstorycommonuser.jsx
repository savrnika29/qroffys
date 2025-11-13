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
  businessTags: yup
    .array()
    // .min(1, "At least one business must be selected")
    .optional(),
});

const businessSchema = yup.object().shape({
  caption: yup
    .string()
    .optional(""),
  businesscountry: yup.string().optional(),
  businessstate: yup.string().optional(),
  businesscity: yup.string().optional(),
  businessType: yup.string().optional(),
  category: yup.string().optional(),
  subCategory: yup.string().optional(),
  ageRange: yup.string().optional(),
  gender: yup.string().optional(),
});

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

  const [selectedCityLabel, setSelectedCityLabel] = useState(""); // Add state for city label

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

  const schema = accountType === "customer" ? customerSchema : businessSchema;

  useEffect(() => {
    const userProfile = localStorage.getItem("profile");
    setProfile(userProfile);
    setAccountType(userProfile || "customer"); // Dynamically set accountType
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
    },
  });

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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // const handleMediaChange = (e) => {
  //   const files = Array.from(e.target.files);

  //   // Check if trying to add multiple files
  //   if (files.length > 1) {
  //     setMediaError("Please upload only 1 story video at a time.");
  //     return;
  //   }

  //   // Check if already have a video and trying to add another
  //   if (mediaFiles.length > 0 && files.length > 0) {
  //     setMediaError("Only 1 story video is allowed. Please remove the existing video first.");
  //     return;
  //   }

  //   // Check if file is video
  //   if (files[0] && !files[0].type.startsWith("video")) {
  //     setMediaError("Please upload only video files for stories.");
  //     return;
  //   }

  //   // If all validations pass
  //   if (files.length === 1) {
  //     setMediaFiles([files[0]]); // Only allow 1 file
  //     setMediaError(""); // Clear any previous errors
  //   }
  // };



  const handleMediaChange = (event) => {
    const files = Array.from(event.target.files);
    const videoFiles = files.filter((file) => file.type.startsWith("video/"));

    if (videoFiles.length < files.length) {
      toast.warn("Only video files are allowed");
    }

    if (videoFiles.length > 0) {
      videoFiles.forEach((file) => {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);

          setMediaFiles((prev) => [...prev, file]);
          setTrimFile(file);
          setCurrentIndex(mediaFiles.length);
          setShowTrimModal(true);

          // save original duration for validation
          setVideoDuration(video.duration);
        };

        video.src = URL.createObjectURL(file);
      });
    }
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
    if (mediaFiles.length === 0) {
      // toast.error("Please add at least one image or video to post.");
      setMediaError(true);
      return;
    }

    setMediaError(false);

    const formData = new FormData();

    const targeting = {
      countries: [
        accountType === "customer" ? data.country : data.businesscountry,
      ],
      states: [accountType === "customer" ? data.state : data.businessstate],
      cities: [accountType === "customer" ? data.city : data.businesscity],
      businessType: data.businessType,
      businessCategoryId: data.category || null,
      subcategoryId: data.subCategory || null,
      ageRange: data.ageRange,
      gender: data.gender.toLowerCase(),
    };
    formData.append("targeting", JSON.stringify(targeting));
    formData.append("text", data.caption);
    formData.append("type", "story");

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
  }, [watchedCity, cities]); // ✅ Use watchedCity instead of watch function

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
                    <h3 className="main-heading">New Qlip</h3>
                    <form onSubmit={handleSubmit(handleDataSubmit)}>
                      <div className="new-qast-wrap">
                        <div className="new-qast-media-wrap">
                          {mediaFiles.map((file, index) => (
                            <div className="qast-media-box" key={index}>
                              {file.type.startsWith("video") ? (
                                <video
                                  controls
                                  width="100%"
                                  height="auto"
                                  style={{
                                    maxHeight: "200px",
                                    objectFit: "cover",
                                  }}
                                >
                                  <source
                                    src={URL.createObjectURL(file)}
                                    type={file.type}
                                  />
                                  Your browser does not support the video tag.
                                </video>
                              ) : (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`media-${index}`}
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                            </div>
                          ))}

                          {/* Add Media Button */}
                          {mediaFiles.length === 0 && (
                            <>
                              {/* Add Media Button */}
                              <div
                                className="qast-media-box add-media-box"
                                onClick={handleAddMediaClick}
                              >
                                <div className="icon-wrap">
                                  <i>
                                    <img src={qlipadd} alt="add" />
                                  </i>
                                  <span className="label">Add Media</span>
                                </div>
                              </div>

                              {/* File Input */}
                              <input
                                type="file"
                                accept="video/*"
                                ref={fileInputRef}
                                onChange={handleMediaChange}
                                style={{ display: "none" }}
                              />
                            </>
                          )}

                        </div>
                        {/* Validation error if no media selected */}
                        {mediaError && (
                          <p className="text-danger mt-2">
                            At least one video is required.
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
                        <div className="qast-form">
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
      </main>

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
                // force browser to calculate real duration
                videoElement.currentTime = Number.MAX_SAFE_INTEGER;

                videoElement.onseeked = () => {
                  // revoke blob URL after duration is resolved
                  URL.revokeObjectURL(objectUrl);

                  if (
                    videoElement.duration === Infinity ||
                    isNaN(videoElement.duration)
                  ) {
                    toast.error(
                      "Could not read trimmed video duration. Please try again."
                    );
                    return;
                  }

                  if (videoElement.duration > 19) {
                    toast.error("Trimmed video cannot exceed 18 seconds");
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
          maxDuration={19}
          type='story'
        />
      )}
    </div>
  );
};

export default Newquastcommanuser;
