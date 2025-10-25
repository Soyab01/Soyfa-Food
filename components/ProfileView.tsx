
import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
// FIX: Import 'signOut' for Firebase v9 syntax.
import { signOut } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import type { CustomerProfile } from '../types';

interface ProfileViewProps {
    profile: CustomerProfile;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile }) => {
    const [name, setName] = useState(profile.name || '');
    const [phone, setPhone] = useState(profile.phone || '');
    const [address, setAddress] = useState(profile.address || '');
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const uid = auth.currentUser?.uid;
        if (!uid) {
            alert('Not logged in.');
            setLoading(false);
            return;
        }

        const updates = {
            name,
            phone,
            address
        };

        try {
            await update(ref(db, `customers/${uid}`), updates);
            alert('Profile updated successfully!');
        } catch (error: any) {
            alert('Profile update failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if(window.confirm('Are you sure you want to logout?')) {
            // FIX: Use Firebase v9 'signOut' function syntax.
            signOut(auth);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            id="profile-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="profile-email"
                            type="email"
                            value={profile.email}
                            disabled
                            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>
                     <div>
                        <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            id="profile-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="profile-address" className="block text-sm font-medium text-gray-700">Delivery Address</label>
                        <input
                            id="profile-address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-bold hover:bg-red-600 transition-colors disabled:bg-red-300"
                    >
                       {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
                 <button
                    onClick={handleLogout}
                    className="w-full bg-gray-200 text-gray-700 py-3 px-4 mt-6 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfileView;