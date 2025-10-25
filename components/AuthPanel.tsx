
import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { FoodieIcon } from './icons';

const AuthPanel: React.FC = () => {
    const [isSignUpMode, setIsSignUpMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUpMode) {
                if (!name || !email || !password) {
                    throw new Error("Please fill in Name, Email, and Password.");
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const uid = userCredential.user.uid;
                await set(ref(db, `customers/${uid}`), {
                    name,
                    email,
                    phone: phone || 'N/A',
                    address: address || 'N/A',
                    createdAt: new Date().toISOString()
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setIsSignUpMode(!isSignUpMode);
        setError('');
        // Reset fields
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
        setAddress('');
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
                <div className="flex justify-center mb-4">
                    <FoodieIcon className="w-16 h-16 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-red-500 mb-6">
                    {isSignUpMode ? 'Customer Sign Up' : 'Customer Login'}
                </h2>
                
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
                
                <form onSubmit={handleAuth} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                        required
                    />
                    
                    {isSignUpMode && (
                        <>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                required
                            />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Phone (Optional)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                            />
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Address (Optional)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                            />
                        </>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors disabled:bg-red-300"
                    >
                        {loading ? 'Processing...' : (isSignUpMode ? 'Sign Up' : 'Login')}
                    </button>
                </form>
                
                <button
                    onClick={toggleAuthMode}
                    className="w-full bg-gray-200 text-gray-700 py-3 mt-4 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                    {isSignUpMode ? 'Switch to Login' : 'Switch to Sign Up'}
                </button>
            </div>
        </div>
    );
};

export default AuthPanel;
