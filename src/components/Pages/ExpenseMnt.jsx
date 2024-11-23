import React, { useState } from 'react';
import '../Styles/Expenses.css'; // Custom CSS
import Header from './Header';
import VertNav from './VertNav';
import ExpenseModal from "./ExpenseModal.jsx";


const ExpensesManagement = () => {
    const expensesData = [
        { id: 1, date: '31/11/24', category: 'Utilities', account: 'Debashish', amount: 'Rs. 500', notes: 'Bills' },
        { id: 2, date: '30/11/24', category: 'Miscellaneous Expenses', account: 'Sarthak', amount: 'Rs. 500', notes: 'Electricity' },
        { id: 3, date: '29/11/24', category: 'Products', account: 'Sai', amount: 'Rs. 500', notes: 'Purchase' },
        { id: 4, date: '28/11/24', category: 'Salon Space', account: 'Hritik', amount: 'Rs. 500', notes: 'Rent' },
        { id: 5, date: '27/11/24', category: 'Software', account: 'Bijit', amount: 'Rs. 500', notes: 'CRM Software' },
        { id: 6, date: '24/11/24', category: 'Purchase Invoice', account: 'Company Account', amount: 'Rs. 500', notes: 'Purchase' },
        { id: 7, date: '22/11/24', category: 'Training', account: 'Archishman', amount: 'Rs. 500', notes: 'Cutting training' },
        { id: 8, date: '20/11/24', category: 'Marketing', account: 'Rohini', amount: 'Rs. 500', notes: 'Google Ads' },
        { id: 9, date: '19/11/24', category: 'Utilities', account: 'Deepak', amount: 'Rs. 500', notes: 'Bills' },
        { id: 10, date: '18/11/24', category: 'Miscellaneous Expenses', account: 'Suresh', amount: 'Rs. 500', notes: 'Electricity' },
        { id: 11, date: '17/11/24', category: 'Products', account: 'Ram', amount: 'Rs. 500', notes: 'Purchase' },
        { id: 12, date: '16/11/24', category: 'Salon Space', account: 'Krish', amount: 'Rs. 500', notes: 'Rent' },
        { id: 13, date: '15/11/24', category: 'Software', account: 'Arpit', amount: 'Rs. 500', notes: 'CRM Software' },
        { id: 14, date: '14/11/24', category: 'Purchase Invoice', account: 'Company Account', amount: 'Rs. 500', notes: 'Purchase' },
        { id: 15, date: '13/11/24', category: 'Training', account: 'Shyam', amount: 'Rs. 500', notes: 'Cutting training' },
        { id: 16, date: '12/11/24', category: 'Marketing', account: 'Meera', amount: 'Rs. 500', notes: 'Google Ads' },
        { id: 17, date: '11/11/24', category: 'Utilities', account: 'Ravi', amount: 'Rs. 500', notes: 'Bills' },
        { id: 18, date: '10/11/24', category: 'Miscellaneous Expenses', account: 'Gita', amount: 'Rs. 500', notes: 'Electricity' },
        { id: 19, date: '09/11/24', category: 'Products', account: 'Nikita', amount: 'Rs. 500', notes: 'Purchase' },
        { id: 20, date: '08/11/24', category: 'Salon Space', account: 'Priya', amount: 'Rs. 500', notes: 'Rent' },
    ];

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const expensesPerPage = 15;

    // Logic to slice data based on the current page
    const indexOfLastExpense = currentPage * expensesPerPage;
    const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
    const currentExpenses = expensesData.slice(indexOfFirstExpense, indexOfLastExpense);
    const [showModal, setShowModal] = useState(false);

    // Logic for page numbers
    const totalPages = Math.ceil(expensesData.length / expensesPerPage);
    const pageNumbers = [...Array(totalPages).keys()].map(i => i + 1);

    // Handle page change
    const handlePageChange = (pageNum) => {
        setCurrentPage(pageNum);
    };
    const toggleModal = () => {
        setShowModal(!showModal);
    };

    return (
        <div className="expenses-container">
            <VertNav />
            <Header />
            <div className="mains-contents">
                <div className="expenses-management">
                    <div className="expenses-header">
                        <h2 className="section-title">Expenses</h2>
                        <div className="filter-add">
                            <div className="filter">
                                <labels htmlFor="month-filter" id="filter-label">Filter:</labels>
                                <select id="month-filter" className="filter-select">
                                    <option value="november">November '24</option>
                                    <option value="november">October '24</option>

                                    {/* Add other months */}
                                </select>
                            </div>
                            <button className="new-expense-btn" onClick={toggleModal}>
                                + New Expense
                            </button>                       
                    </div>
                    </div>

                    <div className="table-container">
                        <table className="expenses-table">
                            <thead>
                                <tr>
                                    <th>S. No.</th>
                                    <th>Date</th>
                                    <th>Expense Category</th>
                                    <th>Expense Account</th>
                                    <th>Expense Amount</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentExpenses.map((expense) => (
                                    <tr key={expense.id}>
                                        <td>{expense.id}</td>
                                        <td>{expense.date}</td>
                                        <td>{expense.category}</td>
                                        <td>{expense.account}</td>
                                        <td>{expense.amount}</td>
                                        <td>{expense.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div id="pagination">
                        <span id="pagination-info">Showing data {indexOfFirstExpense + 1} to {indexOfLastExpense} of {expensesData.length} entries</span>
                        <div id="pagination-controls">
                            {pageNumbers.map((number) => (
                                <buttons
                                    key={number}
                                    id="page-btn"
                                    className={number === currentPage ? 'active' : ''}
                                    onClick={() => handlePageChange(number)}
                                >
                                    {number}
                                </buttons>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {showModal && <ExpenseModal onClose={toggleModal} />}
        </div>
    );
};

export default ExpensesManagement;
