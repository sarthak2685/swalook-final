import React, { useState } from 'react';
import axios from 'axios';
import '../Styles/BusinessAnalysis.css';
import Header from './Header';
import { Helmet } from 'react-helmet';
import VertNav from './VertNav';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const generateRandomColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        colors.push(`rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`);
    }
    return colors;
};

function BusinessAnalysis() {
    const [selectedCard, setSelectedCard] = useState('Monthly Analysis');
    const [chartData, setChartData] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedWeek, setSelectedWeek] = useState('');
    const [jsonData, setJsonData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!selectedMonth || !selectedYear || !selectedWeek) {
            setError('Please select month, year, and week.');
            return;
        }

        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`https://api.crm.swalook.in/api/swalook/business-analysis/week-customer/?month=${selectedMonth}&year=${selectedYear}&week=${selectedWeek}`, {
                headers: { Authorization: `Token ${token}` }
            });

            if (response.status === 200) {
                const { dates, values } = response.data;
                if (Array.isArray(dates) && Array.isArray(values)) {
                    const colors = generateRandomColors(values.length);
                    setChartData({
                        labels: dates,
                        datasets: [{
                            label: 'Business Analysis',
                            data: values,
                            backgroundColor: colors,
                            borderColor: colors.map(color => color.replace('0.7', '1')),
                            borderWidth: 1
                        }]
                    });
                    setJsonData(response.data);
                } else {
                    setError('Unexpected data structure received from the API.');
                }
            }
        } catch (error) {
            setError('Error fetching data. Please try again later.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='business_main'>
            <Header />
            <Helmet>
                <title>Business Analysis</title>
            </Helmet>
            <div className='ba_horizontal'>
                <div className='ba_h1'>
                    <div className='ba_ver_nav'>
                        <VertNav />
                    </div>
                </div>
                <div className='ba_h2'>
                    <h1 className='ba_heading'>Business Analysis</h1>
                    <div className='ba_cards'>
                        <div className='ba_card' onClick={() => setSelectedCard('Monthly Analysis')}>
                            <BarChartOutlinedIcon className='ba_card_img' sx={{ color: "white", fontSize: "48px" }} />
                            <p className='ba_card_text'>Monthly Analysis</p>
                        </div>
                    </div>
                    <hr className='ba_horizontal_line' />
                    <div className='ba_select_analysis'>
                        <div className='ba-1'>
                            <ShowChartIcon className='ba_month_icon' sx={{ color: "#091A44" }} />
                            <h2 className='ba_select_heading'>{selectedCard}</h2>
                        </div>
                        
                    </div>
                    <div className='ba_content'>
                        {loading ? (
                            <p className='ba_p'>Loading...</p>
                        ) : error ? (
                            <p className='ba_error'>{error}</p>
                        ) : chartData ? (
                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'top' },
                                        title: { display: true, text: 'Monthly Analysis Chart' },
                                    },
                                    scales: {
                                        x: { title: { display: true, text: 'Date' } },
                                        y: { title: { display: true, text: 'Amount' } },
                                    },
                                    animation: {
                                        duration: 1000,
                                        easing: 'easeInOutQuad',
                                    }
                                }}
                                className='ba_analysis_img'
                                style={{ width: '80%', height: 'auto', margin: 'auto' }}
                            />
                        ) : (
                            <p className='ba_p'>No data to display</p>
                        )}
                    </div>
                    <div className='ba_json_data'>
                        {jsonData && Object.entries(jsonData).slice(0, 10).map(([key, value]) => (
                            <div key={key} className='ba_json_item'>
                                <strong>{key}:</strong> {JSON.stringify(value)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BusinessAnalysis;
