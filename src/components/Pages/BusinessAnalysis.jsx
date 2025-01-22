import React, { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import Header from "./Header";
import VertNav from "./VertNav";
import config from "../../config";
import { FaCalendar } from "react-icons/fa";
import Calendar from "react-calendar";

function BusinessAnalysis() {
  const token = localStorage.getItem("token");
  const bid = localStorage.getItem("branch_id");
  const [selectedPeriod, setSelectedPeriod] = useState("Weekly");
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [series3, setSeries3] = useState([]);


  const [netRevenue, setNetRevenue] = useState(null);
  const [revenuePeriod, setRevenuePeriod] = useState("Day");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDate1, setSelectedDate1] = useState(new Date());
  const [chartData, setChartData] = useState([]);
  const [chartData2, setChartData2] = useState([]);

  const [salesPerDayData, setSalesPerDayData] = useState({
    series: [],
    options: {},
  });

  const [xAxisCategories3, setXAxisCategories3] = useState([]);
  const [options3, setOptions3] = useState({
    chart: { type: "bar" },
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
  });;

  const [xAxisCategories, setXAxisCategories] = useState([]);
  const [xAxisCategories2, setXAxisCategories2] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [showCalendar2, setShowCalendar2] = useState(false);
  const [selectedDate2, setSelectedDate2] = useState(new Date());

  const [serviceTimePeriod, setServiceTimePeriod] = useState("Weekly");
  const [productTimePeriod, setProductTimePeriod] = useState("monthly");
  const [customerTimePeriod, setCustomerTimePeriod] = useState("Daily");
  const [overallTimePeriod, setOverallTimePeriod] = useState("Weekly");
  const [salesPerDayView, setSalesPerDayView] = useState("perEmployee");

  const currentDate = new Date(selectedDate1);
  const currentWeek = Math.ceil(
    (currentDate.getDate() - currentDate.getDay() + 1) / 7
  );
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = `${config.apiUrl}/api/swalook/business-analysis/service/`;
  
        // Build the URL dynamically based on selected period
        if (selectedPeriod === "Weekly") {
          url += `?branch_name=${bid}&week=${currentWeek}&month=${currentMonth}&year=${currentYear}`;
        } else if (selectedPeriod === "Monthly") {
          url += `?branch_name=${bid}&month=${currentMonth}&year=${currentYear}`;
        } else if (selectedPeriod === "Yearly") {
          url += `?branch_name=${bid}&year=${currentYear}`;
        }
  
        // Fetch the data
        const response = await fetch(url, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        // Parse the response
        const data = await response.json();
  
        // Check if the response structure is valid
        if (data?.data?.services_list) {
          setSalesData(data.data); // Save the response data for later use
        } else {
          console.error("Invalid response structure:", data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [
    token,
    currentWeek,
    currentMonth,
    currentYear,
    selectedPeriod,
    bid,
  ]);
  

  const donutChartData = useMemo(() => {
    if (!salesData?.services_list || Object.keys(salesData.services_list).length === 0) {
      return {
        series: [1], // Fallback series data to render the donut chart with a default value
        options: {
          chart: {
            type: "donut",
            width: "100%",
          },
          labels: ["No Data"], // Fallback label to display when no data is available
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
    }
  
    const salesPerServiceData = salesData.services_list;
    
    // Calculate the total revenue
    const totalRevenue = Object.values(salesPerServiceData).reduce(
      (sum, service) => sum + service.revenue, 0
    );
  
    const otherServices = {
      label: "Other",
      value: 0,
    };
  
    const filteredServices = Object.entries(salesPerServiceData).reduce(
      (acc, [service, { revenue }]) => {
        const percentage = (revenue / totalRevenue) * 100;
        if (percentage < 5) {
          otherServices.value += revenue; // Accumulate the values for "Other"
        } else {
          acc.push({ label: service, value: revenue });
        }
        return acc;
      },
      []
    );
  
    if (otherServices.value > 0) {
      filteredServices.push(otherServices); // Add "Other" if there are services under 5%
    }
  
    // Prepare series and labels
    const series = filteredServices.map((service) => service.value);
    const labels = filteredServices.map((service) => `${service.label}: Rs. ${service.value.toLocaleString()}`);
  
    return {
      series: series, // Actual series data based on revenue
      options: {
        chart: {
          type: "donut",
          width: "100%",
        },
        labels: labels, // Labels corresponding to the services
        plotOptions: {
          pie: {
            donut: {
              size: "70%",
            },
          },
        },
        dataLabels: {
          enabled: true, // Enable data labels
          formatter: function (val, opts) {
            const revenue = opts.w.globals.series[opts.seriesIndex]; // Get the total revenue for the current segment
            return `₹${revenue.toLocaleString()}`; // Display revenue amount in place of percentage
          },
        },
        legend: {
          position: "bottom",
          fontSize: "16px",
          offsetY: -2,
        },
        responsive: [
          {
            breakpoint: 1024,
            options: {
              chart: {
                width: "80%",
              },
              legend: {
                position: "bottom",
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
                position: "bottom",
              },
            },
          },
        ],
      },
    };
  }, [salesData]);



    const fetchChartData = async () => {
    if (!selectedDate) return;

    const currentDate = new Date(selectedDate);
    const currentWeek = Math.ceil(
      (currentDate.getDate() - currentDate.getDay() + 1) / 7
    );
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let apiData;

    switch (overallTimePeriod) {
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

      if (overallTimePeriod === "Weekly" && responseData.data) {
        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let weeklySales = new Array(7).fill(0);

        responseData.data.forEach((item) => {
          const dayIndex = item.day_of_week - 1;
          weeklySales[dayIndex] = item.total_sales || 0;
        });

        months = weekDays;
        monthlyTotals = weeklySales;
      } else if (overallTimePeriod === "Monthly" && responseData.data2) {
        const allWeeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
        let monthSales = new Array(4).fill(0);
        responseData.data2.forEach((item) => {
          const weekIndex = parseInt(item.week) - 1;
          monthSales[weekIndex] = item.weekly_total || 0;
        });

        months = allWeeks;
        monthlyTotals = monthSales;
      } else if (overallTimePeriod === "YTD" && responseData.data) {
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
  }, [overallTimePeriod, selectedDate]);

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

  const fetchCustomerChartData = async () => {
    if (!selectedDate) return; // Early exit if no date is selected
  
    const currentDate = new Date(selectedDate);
    const currentWeek = Math.ceil(
      (currentDate.getDate() - currentDate.getDay() + 1) / 7
    );
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
  
    let apiData;
  
    // Dynamically construct the API URL based on the selected time period
    switch (customerTimePeriod) {
      case "Daily":
        apiData = `${config.apiUrl}/api/swalook/business-analysis/daily-customer/?branch_name=${bid}`;
        break;
      case "Weekly":
        apiData = `${config.apiUrl}/api/swalook/business-analysis/week-customer/?branch_name=${bid}&week=${currentWeek}&month=${currentMonth}&year=${currentYear}`;
        break;
      case "Monthly":
        apiData = `${config.apiUrl}/api/swalook/business-analysis/month-customer/?branch_name=${bid}&month=${currentMonth}&year=${currentYear}`;
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
  
      // Check for empty or null data
      if (!responseData.data || responseData.data.length === 0) {
        setChartData2([]); // Clear chart data
        setXAxisCategories2(["No Data"]); // Display "No Data" on X-axis
        console.warn("No data available for the selected period.");
        return;
      }
  
      // Extract customer names and corresponding totals for the chart
      const customerNames = (responseData.data || []).map(
        (item) => item.customer_name || "Unknown" // Handle missing customer names
      );
  
      // Handle different time periods (Daily, Weekly, Monthly)
    const salesTotals = (responseData.data || []).map((item) => {
  switch (customerTimePeriod) {
    case "Daily":
      return item.daily_total || 0;
    case "Weekly":
      return item.weekly_total || 0;
    case "Monthly":
      return item.monthly_total || 0;
    default:
      return 0;
  }
});
  
      // Update chart data and X-axis categories
      setChartData2(salesTotals);
      setXAxisCategories2(customerNames);
  
    } catch (error) {
      console.error("Error fetching chart data:", error);
      // Optionally show a user-friendly message or alert
      setChartData2([]); // Clear any previous data
      setXAxisCategories2(["Error fetching data"]); // Show error message on X-axis
    }
  };
  

  // Fetch data whenever customerTimePeriod or selectedDate changes
  useEffect(() => {
    fetchCustomerChartData();
  }, [customerTimePeriod, selectedDate]);

  const options2 = {
    chart: {
      type: "line",
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
      categories: xAxisCategories2,
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

  const series2 = [
    {
      name: "Revenue",
      data: chartData2,
    },
  ];

  const fetchRevenueData = async () => {
    const apiData = `${config.apiUrl}/api/swalook/business-analysis/headers/?branch_name=${bid}`;
  
    try {
      setLoading(true);
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
  
      const data = await response.json();
  
      // Validate the response structure
      if (data && data.status && typeof data.analysis === "object") {
        setRevenueData(data.analysis);
      } else {
        console.warn("Unexpected API response format:", data);
        setRevenueData(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRevenueData();
  }, [revenuePeriod]);
  
  const handlePeriodChange = (event) => {
    setRevenuePeriod(event.target.value); // Update the selected period
  };
  
  // Safely check if `revenueData` and necessary fields are available
  const revenueToDisplay =
    revenuePeriod === "Day" && revenueData?.daily_earning != null
      ? revenueData?.daily_earning
      : revenuePeriod === "Month" && revenueData?.monthly_earning != null
      ? revenueData?.monthly_earning
      : null;
  
  const expenseToDisplay =
    revenuePeriod === "Day" && revenueData?.daily_expense != null
      ? revenueData?.daily_expense
      : revenuePeriod === "Month" && revenueData?.monthly_expense != null
      ? revenueData?.monthly_expense
      : null;
  
  const netRevenueToDisplay =
    revenuePeriod === "Day" && revenueData?.daily_revenue != null
      ? revenueData?.daily_revenue
      : revenuePeriod === "Month" && revenueData?.monthly_revenue != null
      ? revenueData?.monthly_revenue
      : null;
  


  
    const fetchSalesPerData = async () => {
      const apiData = `${config.apiUrl}/api/swalook/business-analysis/headers/?branch_name=${bid}`;
      
      try {
        const response = await fetch(apiData, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
          const data = await response.json();
  
        if (data.status) {
          const { sales_by_staff, billing_by_customer } = data.analysis;
  
          // Prepare the sales per employee data
          const employeeNames = sales_by_staff.map(item => item.service_by);
          const employeeSales = sales_by_staff.map(item => item.total_sales);
  
          // Prepare the sales per customer data
          const customerNames = billing_by_customer.map(item => item.customer_name);
          const customerSales = billing_by_customer.map(item => item.total_billing);
  
          // Set the series based on the selected view
          setSeries3([
            {
              name: "Sales Per Day",
              data: salesPerDayView === "perEmployee" ? employeeSales : customerSales,
            },
          ]);
          setOptions3(prevOptions => ({
            ...prevOptions,
            xaxis: {
              categories: salesPerDayView === "perEmployee" ? employeeNames : customerNames,
            },
          }));
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };
  
    useEffect(() => {
      fetchSalesPerData();
    }, [salesPerDayView]);

    const [productData, setProductData] = useState(null);

    // Fetching data
    useEffect(() => {
      const fetchData = async () => {
        const url = `${config.apiUrl}/api/swalook/business-analysis/products/?branch_name=${bid}`;
        try {
          const response = await fetch(url, {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          const data = await response.json();
          
          // Set the correct time period data (either daily or monthly)
          if (data?.daily_product_analysis && productTimePeriod === "daily") {
            setProductData(data.daily_product_analysis);
          } else if (data?.monthly_product_analysis && productTimePeriod === "monthly") {
            setProductData(data.monthly_product_analysis);
          } else {
            console.error("Invalid response structure or no data:", data);
          }
        } catch (error) {
          console.error("Error fetching product data:", error);
        }
      };
  
      fetchData();
    }, []);
  
    // Memoizing the donut chart data based on the product data
    const donutChart2Data = useMemo(() => {
      if (!productData || Object.keys(productData).length === 0) {
        return {
          series: [1], // Fallback series data to render the donut chart with a default value
          options: {
            chart: {
              type: "donut",
              width: "100%",
            },
            labels: ["No Data"], // Fallback label to display when no data is available
            plotOptions: {
              pie: {
                donut: {
                  size: "70%",
                },
              },
            },
            legend: {
              position: "bottom",
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
                    position: "bottom",
                  },
                },
              },
            ],
          },
        };
      }
  
      // Process the product data, ensure no negative quantities and filter based on percentage threshold
      const totalSales = Object.values(productData).reduce(
        (sum, item) => sum + Math.max(0, item.total_quantity), // Prevent negative quantities
        0
      );
  
      // Filter out items that don't meet a certain threshold or create "Other" for small quantities
      const otherProducts = {
        label: "Other",
        value: 0,
      };
  
      const filteredProducts = Object.entries(productData).reduce(
        (acc, [productId, product]) => {
          const positiveQuantity = Math.max(0, product.total_quantity); // Handle negative quantities
          const percentage = (positiveQuantity / totalSales) * 100;
  
          if (percentage < 5) {
            otherProducts.value += positiveQuantity; // Accumulate the values for "Other"
          } else {
            acc.push({ label: productId, value: positiveQuantity });
          }
          return acc;
        },
        []
      );
  
      // Add "Other" category if there are small quantities
      if (otherProducts.value > 0) {
        filteredProducts.push(otherProducts);
      }
  
      const series = filteredProducts.map((product) => product.value);
      const labels = filteredProducts.map((product) => product.label);
  
      return {
        series: series,
        options: {
          chart: {
            type: "donut",
            width: "100%",
          },
          labels: labels,
          plotOptions: {
            pie: {
              donut: {
                size: "70%",
              },
            },
          },
          legend: {
            position: "bottom",
            fontSize: "16px",
            offsetY: -2,
          },
          responsive: [
            {
              breakpoint: 1024,
              options: {
                chart: {
                  width: "80%",
                },
                legend: {
                  position: "bottom",
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
                  position: "bottom",
                },
              },
            },
          ],
        },
      };
    }, [productData]); // Recalculate when productData changes
  
  
  

  return (
    <>
      <div className="bg-gray-100">
        <Header />
        <VertNav />
        <div className="bg-gray-100 flex-grow md:ml-72 p-10">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">
            Business Analysis
          </h1>
          <div className="bg-white shadow-md p-4 rounded-lg mb-4">
            <div className="flex flex-row justify-between">
              <div className="font-bold text-gray-800 text-xl">Net Revenue</div>
              <select
                className="border border-gray-300 text-gray-700 rounded-lg p-1 text-sm"
                value={revenuePeriod}
                onChange={handlePeriodChange}
              >
                <option value="Month">Month</option>
                <option value="Day">Daily</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="font-semibold text-gray-900 text-xl">
                  Total Earnings
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#42a0fc" }}
                >
                  {revenueData ? `Rs. ${revenueToDisplay}/-` : "Loading..."}
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 text-xl">
                  Total Expenses
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#42a0fc" }}
                >
                  {revenueData ? `Rs. ${expenseToDisplay}/-` : "Loading..."}
                  {/* Update this with actual data if needed */}
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 text-xl">
                  Net Revenue
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#42a0fc" }}
                >
                  {revenueData ? `Rs. ${netRevenueToDisplay}/-` : "Loading..."}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* First Row */}
            <div className="bg-white p-6 col-span-1 rounded-lg shadow relative">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold mb-4">
                  Sales Per Service
                </h2>
                <div className="flex items-center space-x-4 relative">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg mb-4"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
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

              <Chart
                options={donutChartData.options}
                series={donutChartData.series}
                type="donut"
                width="100%"
              />
            </div>

            <div className="bg-white p-6 col-span-1 rounded-lg shadow relative">
              <h2 className="text-xl font-semibold mb-4">Sales Per Product</h2>
              <div className="absolute top-4 right-4">
                <select
                  value={productTimePeriod}
                  onChange={(e) => setProductTimePeriod(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg mb-4"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <Chart
                options={donutChart2Data.options}
                series={donutChart2Data.series}
                type="donut"
                width="100%"
              />
            </div>

            <div className="col-span-1 bg-white shadow-md p-4 rounded-lg relative">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold mb-4">Overall Sales</h2>
                <div className="flex items-center space-x-4 relative">
                  <select
                    value={overallTimePeriod}
                    onChange={(e) => setOverallTimePeriod(e.target.value)}
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
                      onClick={() => setShowCalendar2(!showCalendar2)}
                    />
                    {showCalendar && (
                      <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg z-20">
                        <Calendar
                          onChange={(date) => setSelectedDate2(date)}
                          value={selectedDate2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Chart
                options={options}
                series={series}
                type="bar"
                height={350}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            {/* Second Row */}

            <div className="bg-white p-6 rounded-lg shadow relative col-span-2 ">
              <h2 className="text-xl font-semibold mb-4">Sales Per Customer</h2>
              <div className="absolute top-4 right-4">
                <select
                  value={customerTimePeriod}
                  onChange={(e) => setCustomerTimePeriod(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg mb-4"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <Chart
                options={options2}
                series={series2}
                type="line"
                width="100%"
              />
            </div>

            <div
              className="bg-white p-6 col-span-1 rounded-lg shadow relative  lg:h-[28rem]"
              
            >
              <h2 className="text-xl font-semibold mb-4">Sales Per Day</h2>
              <div className="absolute top-4 right-4">
                <select
                  value={salesPerDayView}
                  onChange={(e) => setSalesPerDayView(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg mb-4"
                >
                  <option value="perEmployee">Per Employee</option>
                  <option value="perCustomer">Per Customer</option>
                </select>
              </div>

              <Chart
                options={options3}
                series={series3}
                type="bar"
                width="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BusinessAnalysis;
