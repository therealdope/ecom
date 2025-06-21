'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import VendorLayout from '@/components/vendor/layout/VendorLayout';
import {
  UserIcon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  StarIcon,
  Cog6ToothIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function VendorProfilePage() {
  const [selectedSection, setSelectedSection] = useState('personal');
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({ name: '', phone: '' });
  const [vendor, setVendor] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef();
  const [editingAccount, setEditingAccount] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });

  const [editingStore, setEditingStore] = useState(false);
  const [storeForm, setStoreForm] = useState({ storeName: '', description: '', businessAddress: '', bankDetails: '' });

  const [shops, setShops] = useState([]);
  const [newShop, setNewShop] = useState({ name: '', description: '', address: '', phone: '' });
  const [editingShopId, setEditingShopId] = useState(null);

  const sections = {
    personal: { icon: <UserIcon className="w-5 h-5" />, label: 'Personal Details' },
    shop: { icon: <BuildingStorefrontIcon className="w-5 h-5" />, label: 'Shop Details' },
    bank: { icon: <BanknotesIcon className="w-5 h-5" />, label: 'Bank Details' },
    reviews: { icon: <StarIcon className="w-5 h-5" />, label: 'Reviews' },
    account: { icon: <Cog6ToothIcon className="w-5 h-5" />, label: 'Account Details' }
  };

  useEffect(() => {
    fetch('/api/vendor/profile')
      .then(res => res.json())
      .then(data => {
        setVendor(data);
        setStoreForm({
          storeName: data.profile?.storeName || '',
          description: data.profile?.description || '',
          businessAddress: data.profile?.businessAddress || '',
          bankDetails: data.profile?.bankDetails || ''
        });
        setPersonalForm({ name: data.name, phone: data.profile?.phoneNumber || '' });
      });

    fetch('/api/vendor/shops')
      .then(res => res.json())
      .then(setShops);
  }, []);

  const handleLogoChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoFile(reader.result);
    reader.readAsDataURL(file);
  };

  const savePersonal = async () => {
    const res = await fetch('/api/vendor/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: personalForm.name, phoneNumber: personalForm.phone }),
    });
    const updated = await res.json();
    setVendor(updated);
    setEditingPersonal(false);
  };

  const saveLogo = async () => {
    if (!logoFile) return;
    await fetch('/api/vendor/avatar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logo: logoFile }),
    });
    window.location.reload();
  };

  const saveStoreInfo = async () => {
    await fetch('/api/vendor/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeForm),
    });
    setEditingStore(false);
    const updated = await fetch('/api/vendor/profile').then(res => res.json());
    setVendor(updated);
  };

  const changePass = async () => {
    if (passForm.new !== passForm.confirm) {
      return alert('Passwords do not match');
    }
    await fetch('/api/vendor/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.new }),
    });
    alert('Password changed');
    setEditingAccount(false);
    setPassForm({ current: '', new: '', confirm: '' });
  };

  const handleAddShop = async () => {
    const res = await fetch('/api/vendor/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShop),
    });
    const added = await res.json();
    setShops(prev => [...prev, added]);
    setNewShop({ name: '', description: '', address: '', phone: '' });
  };

  const handleUpdateShop = async (id) => {
    await fetch(`/api/vendor/shops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShop),
    });
    const updated = await fetch('/api/vendor/shops').then(res => res.json());
    setShops(updated);
    setNewShop({ name: '', description: '', address: '', phone: '' });
    setEditingShopId(null);
  };

  const handleEditShop = (shop) => {
    setEditingShopId(shop.id);
    setNewShop({
      name: shop.name,
      description: shop.description,
      address: shop.address,
      phone: shop.phone
    });
  };

  const handleDeleteShop = async (id) => {
  if (!confirm('Are you sure you want to delete this shop?')) return;
  try {
    const response = await fetch(`/api/vendor/shops/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('Failed to delete shop');
    }
    setShops(prev => prev.filter(s => s.id !== id));
  } catch (error) {
    console.error('Error deleting shop:', error.message);
    // Handle error state or notify the user
  }
};


  if (!vendor) return <VendorLayout><div className="p-8">Loading...</div></VendorLayout>;

  const profile = vendor.profile || {};

  return (
    <VendorLayout>
      <div className="flex flex-col md:flex-row gap-6 px-4 py-8 max-w-6xl mx-auto">
        <aside className="md:w-1/4 w-full bg-indigo-200/30 backdrop-blur-md p-6 rounded-2xl shadow-md space-y-6">
          <div className="flex flex-col items-center">
            {logoFile ? (
              <img src={logoFile} className="rounded-full w-24 h-24 object-cover" alt="Logo Preview" />
            ) : profile.logo ? (
              <Image src={profile.logo} width={100} height={100} className="rounded-full" alt="Store Image" />
            ) : (
              <div className="w-24 h-24 bg-indigo-300 rounded-full flex items-center justify-center">
                <BuildingStorefrontIcon className="w-10 h-10 text-indigo-700" />
              </div>
            )}
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" />
            <button onClick={() => fileInputRef.current.click()} className="mt-2 text-sm text-indigo-700 hover:underline flex items-center gap-1">
              <PencilSquareIcon className="w-4 h-4" /> {logoFile ? 'Preview Logo' : 'Edit Image'}
            </button>
            {logoFile && (
              <button onClick={saveLogo} className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded">Upload Logo</button>
            )}
          </div>
          {Object.entries(sections).map(([key, { icon, label }]) => (
            <button key={key} onClick={() => setSelectedSection(key)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl ${
                selectedSection === key ? 'bg-indigo-100 text-black font-semibold' : 'hover:bg-indigo-100 text-black'
              }`}>
              {icon}{label}
            </button>
          ))}
        </aside>
        <section className="w-full md:w-3/4 space-y-6">
          {selectedSection === 'personal' && (
            <div className="bg-indigo-100/30 p-6 rounded-2xl shadow-md">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-semibold">Personal Details</h3>
                <button onClick={() => setEditingPersonal(!editingPersonal)} className="text-sm text-indigo-700 hover:underline flex items-center gap-1">
                  <PencilSquareIcon className="w-4 h-4" /> {editingPersonal ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {editingPersonal ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input value={personalForm.name} onChange={e => setPersonalForm(f => ({ ...f, name: e.target.value }))} className="p-2 rounded-md bg-indigo-100" placeholder="Full Name" />
                  <input value={personalForm.phone} onChange={e => setPersonalForm(f => ({ ...f, phone: e.target.value }))} className="p-2 rounded-md bg-indigo-100" placeholder="Phone Number" />
                  <div className="col-span-full flex justify-end mt-2">
                    <button onClick={savePersonal} className="bg-indigo-600 text-white px-4 py-2 rounded-xl">Save</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                  <div className='bg-white/70 p-4 rounded-xl shadow-sm'><p className="text-sm text-gray-500 ">Full Name</p><p className='text-black'>{vendor.name}</p></div>
                  <div className='bg-white/70 p-4 rounded-xl shadow-sm'><p className="text-sm text-gray-500">Phone</p><p className='text-black'>{profile.phoneNumber || 'N/A'}</p></div>
                </div>
              )}
            </div>
          )}

          {selectedSection === 'shop' && (
  <div className="bg-indigo-100/30 p-6 rounded-2xl shadow-md space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-semibold">Manage Shops</h3>
      <button
        onClick={() => window.location.href = '/vendor/shops/new'}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl"
      >
        <PlusIcon className="w-4 h-4" /> Add New Shop
      </button>
    </div>

    {shops.map(shop => (
      <div key={shop.id} className="bg-white/70 p-4 rounded-xl shadow-sm space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{shop.name}</p>
            <p className="text-sm">{shop.description}</p>
            <p className="text-sm text-gray-600">📍 {shop.address} | 📞 {shop.phone}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => handleEditShop(shop)} className="text-indigo-600 text-sm flex items-center gap-1">
              <PencilSquareIcon className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => handleDeleteShop(shop.id)} className="text-red-600 text-sm flex items-center gap-1">
              <TrashIcon className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        {editingShopId === shop.id && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-indigo-50 p-4 rounded-xl">
            <input value={newShop.name} onChange={e => setNewShop(s => ({ ...s, name: e.target.value }))} placeholder="Shop Name" className="p-2 rounded bg-indigo-100" />
            <input value={newShop.phone} onChange={e => setNewShop(s => ({ ...s, phone: e.target.value }))} placeholder="Phone Number" className="p-2 rounded bg-indigo-100" />
            <input value={newShop.address} onChange={e => setNewShop(s => ({ ...s, address: e.target.value }))} placeholder="Address" className="p-2 rounded bg-indigo-100 col-span-full" />
            <textarea value={newShop.description} onChange={e => setNewShop(s => ({ ...s, description: e.target.value }))} placeholder="Description" className="p-2 rounded bg-indigo-100 col-span-full" />

            <div className="col-span-full flex justify-end gap-4">
              <button onClick={() => setEditingShopId(null)} className="bg-gray-400 text-white px-4 py-2 rounded-xl">Cancel</button>
              <button onClick={() => handleUpdateShop(shop.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl">Save</button>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
)}


          {selectedSection === 'bank' && (
            <div className="bg-indigo-100/30 p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Bank Account Details</h3>
              <div className="bg-white/70 p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">Bank Details</p><p>{profile.bankDetails || 'N/A'}</p>
              </div>
            </div>
          )}

          {selectedSection === 'reviews' && (
            <div className="bg-indigo-100/30 p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Reviews</h3>
              {profile.reviews && profile.reviews.length > 0 ? profile.reviews.map((r, i) => (
                <div key={i} className="bg-white/70 p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500">Rating: {r.rating}</p>
                  <p>{r.comment}</p>
                </div>
              )) : <p>No reviews yet.</p>}
            </div>
          )}

          {selectedSection === 'account' && (
            <div className="bg-indigo-100/30 p-6 rounded-2xl shadow-md space-y-4">
              <div className="flex justify-between">
                <h3 className="text-xl font-semibold">Account Details</h3>
                <button onClick={() => setEditingAccount(!editingAccount)} className="text-indigo-700 text-sm flex gap-1 items-center">
                  <PencilSquareIcon className="w-4 h-4" /> {editingAccount ? 'Cancel' : 'Change'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/70 p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500">Joined</p>
                  <p>{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '—'}</p>
                </div>
                <div className="bg-white/70 p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500">Role</p>
                  <p>VENDOR</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/70 p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">Email</p><p>{vendor.email}</p>
              </div>
              {!editingAccount ? (
                <div className="bg-white/70 p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500">Password</p>
                  <p>••••••••</p>
                </div>
              ) : (
                <div className="space-y-3 max-w-md">
                  <input type="password" placeholder="Current Password" value={passForm.current} onChange={e => setPassForm(p => ({ ...p, current: e.target.value }))} className="p-2 w-full rounded bg-indigo-100" />
                  <input type="password" placeholder="New Password" value={passForm.new} onChange={e => setPassForm(p => ({ ...p, new: e.target.value }))} className="p-2 w-full rounded bg-indigo-100" />
                  <input type="password" placeholder="Confirm New Password" value={passForm.confirm} onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))} className="p-2 w-full rounded bg-indigo-100" />
                  <button onClick={changePass} className="bg-indigo-600 text-white px-4 py-2 rounded-xl mt-2">Update Password</button>
                </div>
              )}
            </div>
            </div>
          )}
        </section>
      </div>
    </VendorLayout>
  );
}
