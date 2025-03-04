import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Storefront as StorefrontIcon,
    ShowChart as ShowChartIcon,
    Description as DescriptionIcon,
    BookOnline as BookOnlineIcon,
    CardMembership as CardMembershipIcon,
    GridViewRounded as GridViewRoundedIcon,
    SettingsSharp as SettingsSharpIcon,
    Headphones as HeadphonesIcon,
    FindInPage as FindInPageIcon,
    People as PeopleIcon, // Import PeopleIcon
    EventAvailable as EventAvailableIcon,
    AccountBalanceWallet,
} from "@mui/icons-material";
import Logo from "../../assets/header_crm_logo.webp";
import { CardGiftcard as CardGiftcardIcon } from "@mui/icons-material";

const NavItem = ({ to, icon: Icon, label, disabled, isActive, onClick }) => {
    const disabledStyle = disabled ? "pointer-events-none opacity-50" : "";

    return (
        <div
            className={`icon-container ${disabledStyle}`}
            title={disabled ? "Not permitted" : ""}
        >
            <Link
                to={to}
                className={`nav-link ${
                    isActive
                        ? "bg-blue-500 text-white shadow-md"
                        : "text-black hover:bg-blue-500 hover:text-white"
                } flex items-center p-4 w-58 h-14 rounded-md transition-all ease-in-out`}
                onClick={onClick}
            >
                <Icon style={{ fontSize: 27, margin: "5px" }} />
                <span className="icon-text ml-2 text-sm">{label}</span>
            </Link>
        </div>
    );
};

const SupportButton = ({ sname, branchName }) => {
    return (
        <Link
            to={`/${sname}/${branchName}/help`}
            style={{ textDecoration: "none" }}
        >
            <button className="bg-[#5570F1] text-white w-[200px] h-[45px]  rounded-[5px] cursor-pointer  px-5 py-2.5 text-lg  flex items-center justify-center">
                <div className="space-x-4 ">
                    <HeadphonesIcon />
                    <span className="text-black font-inter text-sm">Help</span>
                </div>
            </button>
        </Link>
    );
};

const SettingsButton = ({ userType, sname, branchName }) => {
    return (
        <>
            {userType === "staff" || userType === "vendor" ? (
                <button className="pointer-events-none opacity-50 bg-[#5570F1] text-white w-[200px] h-[45px]  rounded-[5px] cursor-pointer  px-5 py-2.5 text-lg font-montserrat flex items-center justify-center">
                    <span className="text-black font-inter text-sm">
                        Settings
                    </span>
                </button>
            ) : (
                <Link
                    to={`/${sname}/${branchName}/settings`}
                    style={{ textDecoration: "none" }}
                >
                    <button className="bg-[#5570F1] text-white w-[200px] h-[45px]  rounded-[5px] cursor-pointer  px-5 py-2.5 text-lg font-montserrat flex items-center justify-center ">
                        <div className="space-x-4">
                            <SettingsSharpIcon />
                            <span className="text-black font-inter text-sm">
                                Settings
                            </span>
                        </div>
                    </button>
                </Link>
            )}
        </>
    );
};

const VertNav = ({ sidebarOpen, toggleSidebar }) => {
    const [activeLink, setActiveLink] = useState("");
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);

    const branchName = localStorage.getItem("branch_name");
    const branchId = localStorage.getItem("branch_id");
    const sname = localStorage.getItem("s-name");
    const userType = localStorage.getItem("type");

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const handleLinkClick = useCallback(
        (link, to) => {
            setActiveLink(link);
            navigate(to);

            if (isMobile && typeof toggleSidebar === "function") {
                toggleSidebar();
            }
        },
        [navigate, toggleSidebar, isMobile]
    );

    return (
        <div
            className={` ${
                sidebarOpen ? "open" : ""
            } h-[68rem] top-0 left-0 flex flex-col justify-start bg-white absolute p-5 z-50 shadow-lg gap-0 transition-all duration-300 lg:block md:w-[298px] lg:w-[300px]  ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <img src={Logo} alt="Swalook Logo" className="w-40 h-40 mb-5" />
            <div className="nav-items flex flex-col gap-6 mt-2 mb-5 overflow-y-auto mx-8 ">
                <NavItem
                    to={`/${sname}/${branchName}/dashboard`}
                    icon={GridViewRoundedIcon}
                    label="Dashboard"
                    isActive={activeLink === "dashboard"}
                    onClick={() =>
                        handleLinkClick(
                            "dashboard",
                            `/${sname}/${branchName}/dashboard`
                        )
                    }
                />
                <NavItem
                    to={`/${sname}/${branchName}/appointment`}
                    icon={BookOnlineIcon}
                    label="Appointments"
                    isActive={activeLink === "appointments"}
                    onClick={() =>
                        handleLinkClick(
                            "appointments",
                            `/${sname}/${branchName}/appointment`
                        )
                    }
                />
                {/* <NavItem
                    to={`/${sname}/${branchName}/inquiries`}
                    icon={FindInPageIcon}
                    label="Inquiries"
                    isActive={activeLink === "inquiries"}
                    onClick={() =>
                        handleLinkClick(
                            "inquiries",
                            `/${sname}/${branchName}/inquiries`
                        )
                    }
                /> */}
                <NavItem
                    to={`/${sname}/${branchName}/generatebill`}
                    icon={DescriptionIcon}
                    label="Invoices"
                    isActive={activeLink === "invoices"}
                    onClick={() =>
                        handleLinkClick(
                            "invoices",
                            `/${sname}/${branchName}/generatebill`
                        )
                    }
                />
                <NavItem
                    to={`/${sname}/${branchName}/analysis`}
                    icon={ShowChartIcon}
                    label="Analysis"
                    disabled={userType === "staff"}
                    isActive={activeLink === "analysis"}
                    onClick={() =>
                        handleLinkClick(
                            "analysis",
                            `/${sname}/${branchName}/analysis`
                        )
                    }
                />
                <NavItem
                    to={`/${sname}/${branchName}/inventory`}
                    icon={StorefrontIcon}
                    label="Inventory"
                    disabled={userType === "staff"}
                    isActive={activeLink === "inventory"}
                    onClick={() =>
                        handleLinkClick(
                            "inventory",
                            `/${sname}/${branchName}/inventory`
                        )
                    }
                />
                {/* <NavItem
          to={`/${sname}/${branchName}/clp`}
          icon={CardMembershipIcon}
          label="Customers"
          disabled={userType === "staff"}
          isActive={activeLink === "customers"}
          onClick={() =>
            handleLinkClick("customers", `/${sname}/${branchName}/clp`)
          }
        /> */}

                {userType !== "staff" && (
                    <NavItem
                        to={`/${sname}/${branchName}/staff`}
                        icon={PeopleIcon}
                        label="Staff"
                        isActive={activeLink === "staff"}
                        onClick={() =>
                            handleLinkClick(
                                "staff",
                                `/${sname}/${branchName}/staff`
                            )
                        }
                    />
                )}
                <NavItem
                    to={`/${sname}/${branchName}/attendance`}
                    icon={EventAvailableIcon}
                    label="Attendance"
                    isActive={activeLink === "attendance"}
                    onClick={() =>
                        handleLinkClick(
                            "attendance",
                            `/${sname}/${branchName}/attendance`
                        )
                    }
                />
                <NavItem
                    to={`/${sname}/${branchName}/expense`}
                    icon={AccountBalanceWallet}
                    label="Expense"
                    isActive={activeLink === "expense"}
                    onClick={() =>
                        handleLinkClick(
                            "expense",
                            `/${sname}/${branchName}/expense`
                        )
                    }
                />
                <NavItem
                    to={`/${sname}/${branchName}/customer-loyality`}
                    icon={CardGiftcardIcon}
                    label="Customer Loyality"
                    disabled={userType === "staff"}
                    isActive={activeLink === "customer-loyality"}
                    onClick={() =>
                        handleLinkClick(
                            "customer-loyality",
                            `/${sname}/${branchName}/customer-loyality`
                        )
                    }
                />
            </div>

            {/* Buttons placed outside the nav-items div to avoid repetition */}
            <div className="flex flex-col items-center  justify-center mt-4 gap-2">
                <SupportButton sname={sname} branchName={branchName} />
                <SettingsButton
                    userType={userType}
                    sname={sname}
                    branchName={branchName}
                />
            </div>
        </div>
    );
};

export default VertNav;
