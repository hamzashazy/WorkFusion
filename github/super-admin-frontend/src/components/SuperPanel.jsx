import React from 'react';
import { Link } from 'react-router-dom';

const SuperPanel = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/admin-management" className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
                    <h2 className="text-xl font-semibold">Admin Management</h2>
                    <p className="text-gray-600">Manage admin users and their permissions.</p>
                </Link>
                <Link to="/campus-management" className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
                    <h2 className="text-xl font-semibold">Campus Management</h2>
                    <p className="text-gray-600">Create and manage campuses.</p>
                </Link>
                <Link to="/group-management" className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
                    <h2 className="text-xl font-semibold">Group Management</h2>
                    <p className="text-gray-600">Manage groups and their members.</p>
                </Link>
                <Link to="/program-management" className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
                    <h2 className="text-xl font-semibold">Program Management</h2>
                    <p className="text-gray-600">Create and manage educational programs.</p>
                </Link>
                <Link to="/student-management" className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
                    <h2 className="text-xl font-semibold">Student Management</h2>
                    <p className="text-gray-600">Manage student records and information.</p>
                </Link>
                <Link to="/login" className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
                    <h2 className="text-xl font-semibold">Logout</h2>
                    <p className="text-gray-600">Logout from the admin panel.</p>
                </Link>
            </div>
        </div>
    );
};

export default SuperPanel;