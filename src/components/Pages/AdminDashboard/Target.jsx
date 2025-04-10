import { useEffect, useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    Target,
    Users,
    Home,
    ChevronLeft,
    Calendar,
} from "lucide-react";
import config from "../../../config";
import { format, subMonths, addMonths } from "date-fns";

export default function TargetProgressCard() {
    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");
    const userType = "none";
    const isAdmin = userType === "admin";

    const [selectedTarget, setSelectedTarget] = useState("Overall Target");
    const [overallTarget, setOverallTarget] = useState(0);
    const [serviceTarget, setServiceTarget] = useState(0);
    const [productTarget, setProductTarget] = useState(0);
    const [membershipCouponTarget, setMembershipCouponTarget] = useState(0);
    const [staffTargets, setStaffTargets] = useState([]);
    const [branchTargets, setBranchTargets] = useState([]);
    const [branchRevenues, setBranchRevenues] = useState([]);
    const [totalProgress, setTotalProgress] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [branchName, setBranchName] = useState("");

    const targetOptions = ["Overall Target", "Branch Target"];

    const getIconForOption = (option) => {
        switch (option) {
            case "Overall Target":
                return <Target size={16} className="mr-2 text-indigo-600" />;
            case "Branch Target":
                return <Home size={16} className="mr-2 text-amber-600" />;
            default:
                return null;
        }
    };

    const fetchTargetData = async () => {
        try {
            const year = format(selectedMonth, "yyyy");
            const month = format(selectedMonth, "MM");

            const apiUrl = `${config.apiUrl}/api/swalook/sales-targets/?branch_name=${bid}&type=${userType}&year=${year}&month=${month}`;

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok)
                throw new Error(`Fetch failed: ${response.statusText}`);

            const data = await response.json();

            // --- Reset state ---
            setBranchRevenues([]);
            setBranchTargets([]);
            setStaffTargets([]);
            setServiceTarget(0);
            setProductTarget(0);
            setMembershipCouponTarget(0);
            setOverallTarget(0);
            setTotalProgress(0);

            // --- Admin path ---
            if (userType === "admin") {
                if (data.branch_revenue) setBranchRevenues(data.branch_revenue);

                if (Array.isArray(data.list) && data.list.length > 0) {
                    setBranchTargets(data.list);

                    const cumulative = data.list.reduce(
                        (acc, branch) => ({
                            total_service_target:
                                acc.total_service_target +
                                (branch.total_service_target || 0),
                            total_product_target:
                                acc.total_product_target +
                                (branch.total_product_target || 0),
                            total_membership_coupon_target:
                                acc.total_membership_coupon_target +
                                (branch.total_membership_coupon_target || 0),
                            total_overall_target:
                                acc.total_overall_target +
                                (branch.total_overall_target || 0),
                        }),
                        {
                            total_service_target: 0,
                            total_product_target: 0,
                            total_membership_coupon_target: 0,
                            total_overall_target: 0,
                        }
                    );

                    setServiceTarget(cumulative.total_service_target);
                    setProductTarget(cumulative.total_product_target);
                    setMembershipCouponTarget(
                        cumulative.total_membership_coupon_target
                    );
                    setOverallTarget(cumulative.total_overall_target);

                    const totalProgressValue =
                        data.branch_revenue?.reduce(
                            (sum, branch) => sum + (branch.monthly_total || 0),
                            0
                        ) || 0;
                    setTotalProgress(totalProgressValue);
                }

                if (Array.isArray(data.staff_targets_by_branch)) {
                    setStaffTargets(data.staff_targets_by_branch);
                }
            }

            // --- User/None path ---
            else if (Array.isArray(data.list)) {
                let totalService = 0;
                let totalProduct = 0;
                let totalCoupon = 0;
                let totalOverall = 0;
                let allStaffTargets = [];
                let branchName = "This Branch";

                const staffRevenue =
                    data.staff_revenue?.branches?.[0]?.staff_data || [];

                data.list.forEach((branch) => {
                    totalService += branch.service_target || 0;
                    totalProduct += branch.product_target || 0;
                    totalCoupon += branch.membership_coupon_target || 0;
                    totalOverall += branch.overall_target || 0;

                    branchName = branch.branch_name || "This Branch";

                    try {
                        const parsedStaffTargets = JSON.parse(
                            branch.staff_targets.replace(/'/g, '"')
                        );
                        const staffWithRevenue = parsedStaffTargets.map(
                            (staff) => {
                                const matchedRevenue = staffRevenue.find(
                                    (rev) =>
                                        rev.staff_name
                                            .replace(/\s|\)/g, "")
                                            .toLowerCase() ===
                                        staff.staff_name
                                            .replace(/\s|\)/g, "")
                                            .toLowerCase()
                                );

                                return {
                                    id: staff.staff,
                                    name: staff.staff_name,
                                    target: parseFloat(staff.staff_target) || 0,
                                    commissionCap:
                                        parseFloat(staff.commission_cap) || 0,
                                    achieved: matchedRevenue?.total_sales || 0,
                                    invoices:
                                        matchedRevenue?.total_invoices || 0,
                                    remaining:
                                        (parseFloat(staff.staff_target) || 0) -
                                        (matchedRevenue?.total_sales || 0),
                                };
                            }
                        );

                        allStaffTargets = [
                            ...allStaffTargets,
                            ...staffWithRevenue,
                        ];
                    } catch (err) {
                        console.warn("Failed to parse staff_targets:", err);
                    }
                });

                setBranchName(branchName);
                setServiceTarget(totalService);
                setProductTarget(totalProduct);
                setMembershipCouponTarget(totalCoupon);
                setOverallTarget(totalOverall);

                const totalProgressValue =
                    data.branch_revenue?.reduce(
                        (sum, branch) => sum + (branch.monthly_total || 0),
                        0
                    ) || 0;
                setTotalProgress(totalProgressValue);
                setStaffTargets(allStaffTargets);
            }
        } catch (error) {
            console.error("Error fetching target data:", error);
        }
    };

    useEffect(() => {
        fetchTargetData();
    }, [selectedMonth]);

    const formatCurrency = (value) =>
        typeof value === "number" && !isNaN(value)
            ? value.toLocaleString()
            : "0";

    const getBranchProgress = (branchName) => {
        const branch = branchRevenues.find((b) => b.branch_name === branchName);
        return branch?.monthly_total || 0;
    };

    const handleMonthChange = (direction) => {
        setSelectedMonth((prev) =>
            direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
        );
    };

    const progressPercent = overallTarget
        ? Math.min((totalProgress / overallTarget) * 100, 100)
        : 0;

    return (
        <div className="p-6 bg-white rounded-[2.5rem] shadow-md border border-indigo-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-indigo-900">
                    Target Progress
                </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleMonthChange("prev")}
                        className="text-indigo-500 hover:text-indigo-700"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="px-3 py-1 border border-gray-300 rounded-[2.5rem] text-indigo-800 font-medium text-sm hover:bg-gray-100">
                        {format(selectedMonth, "MMMM yyyy")}
                    </div>
                    <button
                        onClick={() => handleMonthChange("next")}
                        className="text-indigo-500 hover:text-indigo-700"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Dropdown (Admin only) */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                if (isAdmin) setDropdownOpen(!dropdownOpen);
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-[2.5rem] border ${
                                isAdmin
                                    ? "bg-white border-indigo-200 text-indigo-800 shadow-sm hover:bg-indigo-50"
                                    : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                            } transition-colors`}
                            disabled={!isAdmin}
                            title={
                                isAdmin
                                    ? ""
                                    : "Only admins can switch target view"
                            }
                        >
                            {getIconForOption(selectedTarget)}
                            {selectedTarget}
                            <ChevronDown
                                size={16}
                                className={`transition-transform ${
                                    dropdownOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {dropdownOpen && isAdmin && (
                            <div className="absolute mt-1 w-48 bg-white border border-indigo-200 rounded-[2.5rem] shadow-lg z-10 overflow-hidden">
                                {targetOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setSelectedTarget(option);
                                            setDropdownOpen(false);
                                        }}
                                        className={`flex items-center w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors ${
                                            selectedTarget === option
                                                ? "bg-indigo-100"
                                                : "text-indigo-800"
                                        }`}
                                    >
                                        {getIconForOption(option)}
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="mt-4">
                {selectedTarget === "Overall Target" ? (
                    <div className="text-center p-4 bg-indigo-50 rounded-[2.5rem]">
                        <h3 className="text-lg font-semibold text-indigo-900 mb-1">
                            {userType === "admin"
                                ? "All Branches Combined Target"
                                : `${branchName} Target`}
                        </h3>

                        <p className="text-sm text-indigo-700 mb-4">
                            Current progress towards monthly goal
                        </p>
                        <div className="relative pt-1">
                            <div className="flex justify-between text-xs text-indigo-700 mb-1">
                                <span>0%</span>
                                <span>100%</span>
                            </div>
                            <div className="w-full h-3 bg-indigo-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <p className="text-2xl mt-4 font-bold text-indigo-900">
                                Rs. {formatCurrency(totalProgress)} out of Rs.{" "}
                                {formatCurrency(overallTarget)}
                            </p>
                            <div className="mt-2 text-sm font-medium text-purple-600 flex items-center justify-center gap-1">
                                <span>
                                    {progressPercent.toFixed(1)}% completed
                                </span>
                                <span>
                                    {progressPercent >= 100
                                        ? "🎉"
                                        : progressPercent >= 75
                                        ? "🔥"
                                        : progressPercent >= 50
                                        ? "🚀"
                                        : "💪"}
                                </span>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                                <div className="flex flex-col gap-2 items-center justify-center bg-indigo-100 p-2 rounded-lg">
                                    <p className="font-medium text-indigo-900">
                                        Service Target
                                    </p>
                                    <p className="text-purple-600">
                                        Rs. {formatCurrency(serviceTarget)}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 items-center justify-center bg-indigo-100 p-2 rounded-lg">
                                    <p className="font-medium text-indigo-900">
                                        Product Target
                                    </p>
                                    <p className="text-purple-600">
                                        Rs. {formatCurrency(productTarget)}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 items-center justify-center bg-indigo-100 p-2 rounded-lg">
                                    <p className="font-medium text-indigo-900">
                                        Membership Target
                                    </p>
                                    <p className="text-purple-600">
                                        Rs.{" "}
                                        {formatCurrency(membershipCouponTarget)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="grid grid-cols-12 text-xs text-amber-700 font-medium pb-2 border-b border-amber-100">
                            <div className="col-span-6">Branch</div>
                            <div className="col-span-3 text-right">Target</div>
                            <div className="col-span-3 text-right">
                                Achieved
                            </div>
                        </div>
                        {branchTargets.map((branch, index) => {
                            const branchName =
                                branch.vendor_branch__branch_name || "Unnamed";
                            const branchProgress =
                                getBranchProgress(branchName);
                            const branchTarget =
                                branch.total_overall_target || 1;
                            const progressPercentage = Math.min(
                                (branchProgress / branchTarget) * 100,
                                100
                            );

                            return (
                                <div
                                    key={index}
                                    className="grid grid-cols-12 items-center text-indigo-900 text-sm py-2 hover:bg-amber-50 px-2 rounded-[2.5rem] transition-colors"
                                >
                                    <div className="col-span-6 flex items-center">
                                        <ChevronRight
                                            size={16}
                                            className="text-amber-500 mr-2"
                                        />
                                        {branchName}
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <span className="font-medium">
                                            Rs. {formatCurrency(branchTarget)}
                                        </span>
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <span className="font-medium">
                                            Rs. {formatCurrency(branchProgress)}
                                        </span>
                                    </div>
                                    <div className="col-span-12 mt-1">
                                        <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                                                style={{
                                                    width: `${progressPercentage}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
