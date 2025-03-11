import React, { useState, useEffect } from 'react';
import '../Styles/Expenses.css';
import Header from './Header';
import VertNav from './VertNav';
import ExpenseModal from './ExpenseModal.jsx';
import config from '../../config.js';

const ExpensesManagement = () => {
    const [expensesData, setExpensesData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const expensesPerPage = 15;
    const bid = localStorage.getItem('branch_id');

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [showModal, setShowModal] = useState(false);

    const years = React.useMemo(() => {
        if (!expensesData.length) {
            const currentYear = new Date().getFullYear();
            return [currentYear - 1, currentYear, currentYear + 1];
        }
        return [...new Set(expensesData.map((expense) => parseInt(expense.year)))].sort((a, b) => a - b);
    }, [expensesData]);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${config.apiUrl}/api/swalook/expense_management/?branch_name=${bid}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                });
                if (!response.ok) throw new Error('Failed to fetch data');
                const result = await response.json();
                if (result.status) {
                    setExpensesData(result.data);
                    setFilteredData(result.data);
                } else {
                    throw new Error('Invalid response');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    useEffect(() => {
        if (!Array.isArray(expensesData)) {
            setFilteredData([]);
            return;
        }

        const filtered = expensesData.filter(
            (expense) =>
                parseInt(expense.month) === selectedMonth &&
                parseInt(expense.year) === selectedYear
        );

        setFilteredData(filtered);
        setCurrentPage(1);
    }, [selectedMonth, selectedYear, expensesData]);

    const indexOfLastExpense = currentPage * expensesPerPage;
    const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
    const currentExpenses = Array.isArray(filteredData)
        ? filteredData.slice(indexOfFirstExpense, indexOfLastExpense)
        : [];

    const totalPages = Math.ceil(filteredData.length / expensesPerPage);
    const pageNumbers = [...Array(totalPages).keys()].map((i) => i + 1);

    const handlePageChange = (pageNum) => {
        setCurrentPage(pageNum);
    };

    return (
        <>
         <VertNav />
         <Header />
        <div className="expenses-container">
            <div className="mains-contents">
                <div className="expenses-management">
                    <div className="expenses-header">
                        <h2 className="section-title">Expenses</h2>
                        <div className="filter-add">
                            <div className="filter">
                                <label htmlFor="month-filter" id="filter-label">Filter:</label>
                                <select
                                    id="month-filter"
                                    className="filter-select"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    id="year-filter"
                                    className="filter-select"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button className="new-expense-btn mt-8" onClick={() => setShowModal(true)}>
                                + New Expense
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div>Error: {error}</div>
                    ) : (
                        <div className="table-container">
                            <table className="expenses-table border border-gray-300">
                                <thead>
                                    <tr className='border border-gray-300'>
                                        <th className='border border-gray-300'>S. No.</th>
                                        <th className='border border-gray-300'>Date</th>
                                        <th className='border border-gray-300'>Expense Category</th>
                                        <th className='border border-gray-300'>Expense Account</th>
                                        <th className='border border-gray-300'>Total Amount</th>
                                        <th className='border border-gray-300'>Amount Paid</th>
                                        <th className='border border-gray-300'>Due Amount</th>
                                        <th className='border border-gray-300'>Due Date</th>
                                        <th className='border border-gray-300'>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentExpenses.map((expense, index) => (
                                        <tr className='border border-gray-300' key={expense.id}>
                                            <td className='border border-gray-300'>{indexOfFirstExpense + index + 1}</td>
                                            <td className='border border-gray-300'>{expense.date.split('-').reverse().join('-')}</td>
                                            <td className='border border-gray-300'>
                                                {expense.expense_category && expense.expense_category.length > 0
                                                    ? expense.expense_category
                                                        .map((cat) => JSON.parse(cat.vendor_expense_type.replace(/'/g, '"')).join(", "))
                                                        .join(", ")
                                                    : "N/A"}
                                            </td>

                                            <td className='border border-gray-300'>{expense.expense_account}</td>
                                            <td className='border border-gray-300'>
                                            {expense.expense_amount}
                                            </td>
                                            <td className='border border-gray-300'>{expense.amount_paid ||  "-"}</td>
                                            <td className='border border-gray-300'>{expense.due_amount ||  "-"}</td>
                                            <td className='border border-gray-300'>{expense.due_date || "-"}</td>
                                            <td className='border border-gray-300'>{expense.comment || "-"}</td>
                                           
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div id="pagination">
                        <span id="pagination-info">
                            Showing data {indexOfFirstExpense + 1} to {Math.min(indexOfLastExpense, filteredData.length)} of {filteredData.length} entries
                        </span>
                        <div id="pagination-controls">
                            {pageNumbers.map((number) => (
                                <button
                                    key={number}
                                    id="page-btn"
                                    className={number === currentPage ? 'active' : ''}
                                    onClick={() => handlePageChange(number)}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {showModal && <ExpenseModal onClose={() => setShowModal(false)} />}
        </div>
        </>
    );
};

export default ExpensesManagement;


