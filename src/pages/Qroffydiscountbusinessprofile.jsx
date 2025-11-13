import { useCallback, useEffect, useRef, useState } from "react";
import ProfileHeader from "../components/ProfileHeader";
import Sidebar from "../components/Sidebar";
import { imagebanner } from "../imaUrl";
import { useDispatch, useSelector } from "react-redux";
import { getUsers } from "../feature/userSlice";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

const Qroffydiscountbusinessprofile = () => {
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [discountBusinessList, setDiscountBusiness] = useState([]);
  const { token } = useSelector((store) => store?.auth);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store?.profile);

  const getQroffyDiscount = async (pageNum = 1, newSearch = search) => {
    try {
      const { payload } = await dispatch(
        getUsers({ token, setLoading, search: newSearch, page: pageNum })
      );

      if (payload?.error === false) {
        const newUsers = payload?.data?.users || [];

        if (newUsers.length === 0 || newUsers.length < 10) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (pageNum === 1) {
          setDiscountBusiness(newUsers);
        } else {
          setDiscountBusiness((prev) => [...prev, ...newUsers]);
        }
      } else {
        setHasMore(false);
        setDiscountBusiness([]);
      }
    } catch (error) {
      setHasMore(false);
    }
  };

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    if (token) {
      getQroffyDiscount(page);
    }
  }, [page, token]);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    setHasMore(true);
    await getQroffyDiscount(1, value); // fetch immediately on search
  };

  return (
    <div>
      <>
        <ProfileHeader />
        <main className="wrapper">
          <section className="middle-container">
            {loading && <Loader />}
            <div className="container-fluid">
              <div className="profile-wrapper">
                <div className="row">
                  <div className="col-lg-3 col-md-4">
                    <Sidebar />
                  </div>
                  <div className="col-lg-9 col-md-8">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="qroffy-discount-wrap">
                          <h3 className="main-heading">Qroffy Discounts</h3>

                          <div className="input-border-wrap">
                            <input
                              id="chat-enter"
                              type="text"
                              className="form-control"
                              placeholder="Search"
                              value={search}
                              onChange={handleSearchChange}
                            />
                          </div>

                          <ul className="qroffy-discount-list">
                            {discountBusinessList?.map((list, index) => {
                              const isLast =
                                index === discountBusinessList.length - 1;
                              const initial =
                                list?.businessName?.charAt(0).toUpperCase() ||
                                "N";

                              const colorClasses = [
                                "purplebg",
                                "dustyrosebg",
                                "rosewoodbg",
                                "mistgreenbg",
                                "blushpinkbg",
                              ];

                              const randomBgClass =
                                colorClasses[
                                Math.floor(
                                  Math.random() * colorClasses.length
                                )
                                ];

                              return (
                                <li
                                  key={list._id || index}
                                  ref={isLast ? lastElementRef : null}
                                  style={{ cursor: "pointer" }}
                                >
                                  <button
                                    className="discount-card"
                                    onClick={() =>
                                      navigate(
                                        `/commanuserviewbusiness/${list._id}`
                                      )
                                    }
                                  >
                                    {list?.profilePicture ? (
                                      <img
                                        src={`${list.profilePicture}`}
                                        alt={list.businessName}
                                        className="profile-image"
                                      />
                                    ) : (
                                      <i
                                        className={`initial-card ${randomBgClass}`}
                                      >
                                        {initial}
                                      </i>
                                    )}
                                  </button>
                                  <span className="label">
                                    {list?.businessName
                                      ?.charAt(0)
                                      .toUpperCase() +
                                      list?.businessName
                                        ?.slice(1)
                                        .toLowerCase()}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>

                          {loading && (
                            <div className="row text-center mt-3">
                              <div className="col-md-12">
                                <h6 className="text-muted">Loading more...</h6>
                              </div>
                            </div>
                          )}

                          {hasMore && !loading && (
                            <div className="row text-center mt-3">
                              <div className="col-md-12">
                                <h6 className="text-muted">
                                  Scroll to load more...
                                </h6>
                              </div>
                            </div>
                          )}

                          {/* {!hasMore && !loading && discountBusinessList.length > 0 && (
                            <div className="row text-center mt-3">
                              <div className="col-md-12">
                                <p className="text-muted">
                                  No more qroffy discounts available
                                </p>
                              </div>
                            </div>
                          )} */}

                          {!loading && discountBusinessList.length === 0 && (
                            <div className="row text-center mt-3">
                              <div className="col-md-12">
                                <p className="text-muted">No results found</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    </div>
  );
};

export default Qroffydiscountbusinessprofile;
