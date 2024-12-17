import React, { useState, useEffect, useMemo } from "react";
import Header from "./Header";
import VertNav from "./VertNav";
import { FaCalendar } from "react-icons/fa";
import { BiBarChartSquare } from "react-icons/bi";
import ApexCharts from "react-apexcharts";
import config from "../../config";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const AdminDashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [xAxisCategories, setXAxisCategories] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDate1, setSelectedDate1] = useState(new Date());

  const [selectedPeriod, setSelectedPeriod] = useState("Weekly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const token = localStorage.getItem("token");
  const bid = localStorage.getItem("branch_id");
  const sname = localStorage.getItem("s-name");
  const type = localStorage.getItem("type");

  // console.log("hii",token,bid,sname,type);


  const sname = localStorage.getItem("s-name");
  const type = localStorage.getItem("type");
  // console.log("hii",token,bid,sname,type);

  const fetchChartData = async () => {
    if (!selectedDate) return;

    const currentDate = new Date(selectedDate);
    const currentWeek = Math.ceil(
      (currentDate.getDate() - currentDate.getDay() + 1) / 7
    );
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let apiData;

    switch (selectedPeriod) {
      case "Weekly":
        apiData = `${config.apiUrl}/api/swalook/business-analysis/week/?branch_name=${bid}&week=${currentWeek}&month=${currentMonth}&year=${currentYear}`;
        break;
      case "Monthly":
        apiData = `${config.apiUrl}/api/swalook/business-analysis/month/?branch_name=${bid}&month=${currentMonth}&year=${currentYear}`;
        break;
      case "YTD":
        apiData = `${config.apiUrl}/api/swalook/business-analysis/year/?branch_name=${bid}&year=${currentYear}`;
        break;
      default:
        console.error("Invalid period selected");
        return;
    }

    try {
      const response = await fetch(apiData, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const responseData = await response.json();
      let months = [];
      let monthlyTotals = [];

      if (selectedPeriod === "Weekly" && responseData.data) {
        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let weeklySales = new Array(7).fill(0);

        responseData.data.forEach((item) => {
          const dayIndex = item.day_of_week - 1;
          weeklySales[dayIndex] = item.total_sales || 0;
        });

        months = weekDays;
        monthlyTotals = weeklySales;
      } else if (selectedPeriod === "Monthly" && responseData.data2) {
        const allWeeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
        let monthSales = new Array(4).fill(0);
        responseData.data2.forEach((item) => {
          const weekIndex = parseInt(item.week) - 1;
          monthSales[weekIndex] = item.weekly_total || 0;
        });

        months = allWeeks;
        monthlyTotals = monthSales;
      } else if (selectedPeriod === "YTD" && responseData.data) {
        const allMonths = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        let yearSales = new Array(12).fill(0);
        responseData.data.forEach((item) => {
          const monthIndex = parseInt(item.month) - 1;
          yearSales[monthIndex] = item.monthly_total || 0;
        });

        months = allMonths;
        monthlyTotals = yearSales;
      }

      setChartData(monthlyTotals);
      setXAxisCategories(months);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [selectedPeriod, selectedDate]);

  const options = {
    chart: {
      type: "bar",
      height: 350,
    },
    colors: ["#42a0fc"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 5,
      },
    },
    stroke: {
      show: true,
      width: 5,
      colors: ["#328cd2"],
    },
    xaxis: {
      categories: xAxisCategories,
    },
    yaxis: {
      title: {
        text: "Revenue (Rs.)",
        style: {
          fontSize: "14px",
          color: "#374151",
        },
        offsetX: 9,
      },
      labels: {
        style: {
          fontSize: "14px",
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `Rs. ${val}`,
      },
    },
  };

  const series = [
    {
      name: "Revenue",
      data: chartData,
    },
  ];

  const currentDate = new Date(selectedDate1);
  const currentWeek = Math.ceil(
    (currentDate.getDate() - currentDate.getDay() + 1) / 7
  );
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [topServices, setTopServices] = useState([]);
  const [period, setPeriod] = useState("Month");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${config.apiUrl}/api/swalook/business-analysis/service/?branch_name=${bid}&week=${currentWeek}&month=${currentMonth}&year=${currentYear}`,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();


        if (data?.data?.services_list) {
          const servicesList = data.data.services_list;
          const averagePerService = data.data.average_per_service;

          const servicesWithRevenue = Object.entries(servicesList).map(
            ([name, count]) => ({
              name,
              revenue: count * averagePerService,
            })
          );

          const sortedServices = servicesWithRevenue
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

          setTopServices(sortedServices);
        } else {
          console.error("Invalid response structure:", data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token, config.apiUrl, currentWeek, currentMonth, currentYear]);

  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${config.apiUrl}/api/swalook/business-analysis/month-customer/?branch_name=${bid}&month=${currentMonth}&year=${currentYear}`,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();


        if (Array.isArray(data.data)) {
          const sortedCustomers = data.data
            .sort((a, b) => b.weekly_total - a.weekly_total)
            .slice(0, 5);

          const formattedCustomers = sortedCustomers.map((customer, index) => ({
            name: customer.vendor_customers_profile__mobile_no || "Unknown",
            revenue: customer.weekly_total,
          }));

          setTopCustomers(formattedCustomers);
        } else {
          console.error("Invalid response structure:", data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token, config.apiUrl]);

  const [todayRevenue, setTodayRevenue] = useState(0);
  const [yesterdayRevenue, setYesterdayRevenue] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);

  const [staffperiod, setStaffPeriod] = useState("Week");
  const [staffData, setStaffData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const response = await fetch(
          `${config.apiUrl}/api/swalook/staff-header-mode-of-payment/?branch_name=${bid}`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Set state for staff data
        setDailyData(data.staff_data || []);
        setMonthlyData(data.staff_data_1 || []);
        setYearlyData(data.staff_data_2 || []);
        setStaffData(data.staff_data || []);

        // Set state for mode of payment
        setModeOfPaymentData(data.mode_of_payment || []);

        // Extract required values
        setTodayRevenue(data.today_revenue || 0);
        setYesterdayRevenue(data.previous_day_rev || 0);
        setAppointmentsToday(data.today_no_of_app || 0);
      } catch (error) {
        console.error("Error fetching header data:", error);
      }
    };

    fetchHeaderData();
  }, []);

  useEffect(() => {
    if (staffperiod === "Week") {
      setStaffData(dailyData);
    } else if (staffperiod === "Month") {
      setStaffData(monthlyData);
    } else if (staffperiod === "Year") {
      setStaffData(yearlyData);
    }
  }, [staffperiod, dailyData, monthlyData, yearlyData]);

  const [modeOfPaymentData, setModeOfPaymentData] = useState([]);

  const donutChartData = useMemo(() => {
    const filteredData = modeOfPaymentData.filter(
      (item) => Number(item.month) === selectedMonth
    );

    const series = filteredData.map((item) => item.total_revenue);
    const labels = filteredData.map((item) => item.mode_of_payment);

    return {
      series: series.length > 0 ? series : [1],
      options: {
        chart: {
          type: "donut",
          width: "100%",
        },
        labels: labels.length > 0 ? labels : ["No Data"],
        colors:
          series.length > 0
            ? [
                "#328cd2",
                "#01e296",
                "#ffb01a",
                ...Array(series.length > 3 ? series.length - 3 : 0)
                  .fill()
                  .map(
                    () =>
                      `#${Math.floor(Math.random() * 16777215).toString(16)}`
                  ),
              ]
            : ["#d1d5db"],
        plotOptions: {
          pie: {
            donut: {
              size: "70%",
            },
          },
        },

        legend: {
          position: "top",
          fontSize: "14px",
        },
        responsive: [
          {
            breakpoint: 1024,
            options: {
              chart: {
                width: "80%",
              },
              legend: {
                position: "right",
              },
            },
          },
          {
            breakpoint: 768,
            options: {
              chart: {
                width: "100%",
              },
              legend: {
                position: "top",
              },
            },
          },
        ],
      },
    };
  }, [modeOfPaymentData, selectedMonth]);

  return (
    <>
      <Header />
      <VertNav />
      <div className="bg-gray-100 flex-grow  md:ml-72 p-10">
        <div className="bg-white shadow-md p-4 rounded-lg mb-10">
          <BiBarChartSquare className="text-4xl text-gray-500 bg-[#FFCC9129] mb-4 mr-10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Today's Revenue */}
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-xl">
                Today's Revenue
              </div>
              <div className="text-2xl font-bold" style={{ color: "#42a0fc" }}>
                Rs. {todayRevenue.toLocaleString("en-IN")}/-
              </div>
            </div>

            {/* Previous Day's Revenue */}
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-xl">
                Previous Day's Revenue
              </div>
              <div className="text-2xl font-bold" style={{ color: "#42a0fc" }}>
                Rs. {yesterdayRevenue.toLocaleString("en-IN")}/-
              </div>
            </div>

            {/* Appointments Today */}
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-xl">
                No. of Appointments Today
              </div>
              <div className="text-2xl font-bold" style={{ color: "#42a0fc" }}>
                {appointmentsToday}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Sales Bar Chart */}
          <div className="col-span-2 bg-white shadow-md p-6 rounded-lg relative">
            <div className="flex justify-between mb-4">
              <div className="text-lg font-semibold text-gray-700">
                Total Sales
              </div>
              <div className="flex items-center space-x-4 relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border px-3 py-1 rounded-md"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="YTD">Year-To-Date</option>
                </select>

                {/* Calendar Component */}
                <div className="relative">
                  <FaCalendar
                    className="cursor-pointer text-gray-600"
                    onClick={() => setShowCalendar(!showCalendar)}
                  />
                  {showCalendar && (
                    <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg z-20">
                      <Calendar
                        onChange={(date) => setSelectedDate(date)}
                        value={selectedDate}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ApexChart Component */}
            <div className="rounded-lg">
              <ApexCharts
                options={options}
                series={series}
                type="bar"
                height={350}
              />
            </div>
          </div>

          {/* Mode of Payment Donut Chart */}
          <div className="col-span-1 bg-white shadow-md p-6 rounded-lg">
            <div className="flex justify-between mb-4">
              <div className="text-lg font-semibold text-gray-700">
                Mode of Payment
              </div>
              <div className="flex items-center space-x-4">
                <select
                  className="border mb-4 px-3 py-1 rounded-md"
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  value={selectedMonth}
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
            </div>
            <div className="rounded-lg ">
              <ApexCharts
                options={donutChartData.options}
                series={donutChartData.series}
                type="donut"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Sales by Staff, Top 5 Customers, Top 5 Services */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* Sales by Staff */}
          <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Sales by Staff
              </h3>
              <select
                value={staffperiod}
                onChange={(e) => setStaffPeriod(e.target.value)}
                className="border border-gray-300 text-gray-700 rounded-lg p-1 text-sm"
              >
                <option value="Week">Weekly</option>
                <option value="Month">Monthly</option>
                <option value="Year">Year-to-date</option>
              </select>
            </div>
            <div className="space-y-4">
              {staffData.length > 0 ? (
                staffData
                  .sort((a, b) => b.total_revenue - a.total_revenue)
                  .slice(0, 5)
                  .map((staff, index) => {
                    let revenueThreshold = 0;
                    if (staffperiod === "Year") {
                      revenueThreshold = 500000;
                    } else if (staffperiod === "Month") {
                      revenueThreshold = 50000;
                    } else if (staffperiod === "Week") {
                      revenueThreshold = 25000;
                    }

                    const progressBarWidth = Math.min(
                      (staff.total_revenue / revenueThreshold) * 100,
                      100
                    );

                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{staff.service_by}</span>
                          <span className="text-gray-500 text-sm mr-4">
                            Invoices: {staff.total_invoices}
                          </span>
                          <span>Rs.{staff.total_revenue}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-lg mt-1">
                          <div
                            className="h-full bg-[#42a0fc] border rounded-lg"
                            style={{
                              width: `${progressBarWidth}%`,
                              borderColor: "#328cd2",
                              borderWidth: "3px",
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div>
                  {/* Red warning message */}
                  <p className="text-red-600 font-light  mb-2">
                    *No data available for the selected period.
                  </p>

                  {/* Placeholder rows */}
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm text-gray-400 italic">
                        <span>{index + 1}. Staff</span>
                        <span className="text-gray-400 text-sm mr-4">
                          Invoices: _
                        </span>
                        <span>Rs. __</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-lg mt-1">
                        <div
                          className="h-full bg-gray-300 border rounded-lg"
                          style={{
                            width: "0%",
                            borderColor: "#d1d5db",
                            borderWidth: "3px",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Top 5 Customers */}
          <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Top 5 Customers
              </h3>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-gray-300 text-gray-700 rounded-lg p-1 text-sm"
              >
                <option value="Month">Month-to-date</option>
              </select>
            </div>
            {topCustomers.length > 0 ? (
              <ul>
                {topCustomers.map((customer, index) => (
                  <li
                    key={index}
                    className="flex justify-between py-2 text-gray-700 border-b last:border-b-0"
                  >
                    <span>
                      {index + 1}. {customer.name}
                    </span>
                    <span>Rs.{customer.revenue.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                {/* Red warning message */}
                <p className="text-red-600 font-light mb-2">
                  *No data available for the selected period.
                </p>
                {/* Placeholder rows */}
                <ul>
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <li
                      key={index}
                      className="flex justify-between py-2 text-gray-400 border-b last:border-b-0 italic"
                    >
                      <span>{index + 1}. Customer</span>
                      <span>Rs.__</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Top 5 Services */}
          <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Top 5 Services
              </h3>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-gray-300 text-gray-700 rounded-lg p-1 text-sm"
              >
                <option value="Month">Month-to-date</option>
              </select>
            </div>
            {topServices.length > 0 ? (
              <ul>
                {topServices.map((service, index) => (
                  <li
                    key={index}
                    className="flex justify-between py-2 text-gray-700 border-b last:border-b-0"
                  >
                    <span>
                      {index + 1}. {service.name}
                    </span>
                    <span>Rs.{service.revenue.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                {/* Red warning message */}
                <p className="text-red-600 font-light mb-2">
                  *No data available for the selected period.
                </p>
                {/* Placeholder rows */}
                <ul>
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <li
                      key={index}
                      className="flex justify-between py-2 text-gray-400 border-b last:border-b-0 italic"
                    >
                      <span>{index + 1}. Service</span>
                      <span>Rs.__</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
