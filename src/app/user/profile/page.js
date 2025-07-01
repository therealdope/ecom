'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import UserLayout from '@/components/user/layout/UserDashboardLayout';
import {
  PencilSquareIcon,
  UserIcon,
  MapPinIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/context/ToastContext';
import Loader from '@/components/shared/Loader';

export default function UserProfilePage() {
  const { showToast } = useToast();
  const [selectedSection, setSelectedSection] = useState('personal');
  const [user, setUser] = useState(null);
  const fileInputRef = useRef();
  const sections = {
    personal: { icon: <UserIcon className="w-5 h-5" />, label: 'Personal Details' },
    address: { icon: <MapPinIcon className="w-5 h-5" />, label: 'Address Details' },
    account: { icon: <Cog6ToothIcon className="w-5 h-5" />, label: 'Account Details' },
  };

  const [avatarFile, setAvatarFile] = useState(null);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({ name: '', phone: '' });

  const [editingAddrId, setEditingAddrId] = useState(null);
  const [newAddrMode, setNewAddrMode] = useState(false);
  const [addrForm, setAddrForm] = useState({ street: '', city: '', state: '', country: '', zipCode: '', isDefault: false });

  const [editingAccount, setEditingAccount] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setPersonalForm({ name: data.name, phone: data.profile?.phoneNumber || '' });
      });
  }, []);

  const handleAvatarChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { // 500KB in bytes
      showToast({ title: 'Image Size Error',
        description: 'Image size exceeds 500KB. Please choose a smaller image.', });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarFile(reader.result);
    reader.readAsDataURL(file);
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;

    if (avatarFile.size > 500 * 1024) { // 500KB in bytes
      showToast({ title: 'Image Size Error',
        description: 'Image size exceeds 500KB. Please choose a smaller image.', });
      return;
    }
    await fetch('/api/user/avatar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: avatarFile }),
    });
    window.location.reload();
  };

  const savePersonal = async () => {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: personalForm.name, phoneNumber: personalForm.phone }),
    });
    const updated = await res.json();
    setUser(updated);
    setEditingPersonal(false);
  };

  const startEditAddr = (addr = null) => {
    if (!addr) {
      setNewAddrMode(true);
      setEditingAddrId(null);
      setAddrForm({ street: '', city: '', state: '', country: '', zipCode: '', isDefault: false });
    } else {
      setEditingAddrId(addr.id);
      setNewAddrMode(false);
      setAddrForm({
        street: addr.street,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        zipCode: addr.zipCode,
        isDefault: addr.isDefault,
      });
    }
  };

  const cancelEditAddr = () => {
    setEditingAddrId(null);
    setNewAddrMode(false);
    setAddrForm({ street: '', city: '', state: '', country: '', zipCode: '', isDefault: false });
  };

  const saveAddr = async () => {
    await fetch('/api/user/address', {
      method: editingAddrId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingAddrId ? { id: editingAddrId, ...addrForm } : addrForm),
    });
    const updated = await fetch('/api/user/profile').then(res => res.json());
    setUser(updated);
    cancelEditAddr();
  };

  const deleteAddr = async id => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    await fetch(`/api/user/address?id=${id}`, { method: 'DELETE' });
    if (editingAddrId === id) cancelEditAddr();
    const updated = await fetch('/api/user/profile').then(res => res.json());
    setUser(updated);
  };

  const changePass = async () => {
    if (passForm.new !== passForm.confirm) {
      return showToast({
        title: 'Passwords do not match',
        description: 'Please make sure the new password and confirm password fields match.',
      });
    }
    if (passForm.new.length < 6) {
      return showToast({
        title: 'Password too short',
        description: 'Please make sure the new password is at least 6 characters long.',
      });
    }
    const res = await fetch('/api/user/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.new }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      return showToast({
        title: 'Error',
        description: error,
      });
    }
    showToast({
      title: 'Success',
      description: 'Password changed successfully',
    });
    setEditingAccount(false);
    setPassForm({ current: '', new: '', confirm: '' });
  };

  if (!user) return <Loader/>;

  const profile = user.profile || {};
  const addresses = profile.addresses || [];

  return (
    <UserLayout>
      <div className="flex flex-col md:flex-row gap-6 px-4 py-8 max-w-6xl mx-auto">
        {/* Left Sidebar */}
        <aside className="md:w-1/4 w-full bg-indigo-200/30 backdrop-blur-md p-6 rounded-2xl shadow-md space-y-6">
          <div className="flex flex-col items-center">
  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
    {avatarFile ? (
      <img
        src={avatarFile}
        width={96}
        height={96}
        className="w-full h-full object-cover"
        alt="Avatar Preview"
      />
    ) : profile.avatar ? (
      <Image
        src={profile.avatar}
        width={96}
        height={96}
        className="w-full h-full object-cover"
        alt="Avatar"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-indigo-300">
        <UserIcon className="w-10 h-10 text-indigo-700" />
      </div>
    )}
  </div>

  <input
    type="file"
    className="hidden"
    ref={fileInputRef}
    onChange={handleAvatarChange}
    accept="image/*"
  />

  <div className="mt-2 flex items-center gap-2">
    <button
      onClick={() => fileInputRef.current.click()}
      className="text-sm text-indigo-700 hover:underline flex items-center gap-1"
    >
      <PencilSquareIcon className="w-4 h-4" />
      {avatarFile ? 'Change' : 'Edit Avatar'}
    </button>

    {avatarFile && (
      <button
        onClick={() => setAvatarFile(null)}
        className="text-sm text-gray-600 hover:underline"
      >
        Cancel
      </button>
    )}
  </div>

  {avatarFile && (
    <button
      onClick={saveAvatar}
      className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded"
    >
      Upload Avatar
    </button>
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

        {/* Right Content */}
        <section className="w-full md:w-3/4 space-y-6">
          {/* Personal Section */}
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
                  <div className='bg-white/70 p-4 rounded-xl shadow-sm'><p className="text-sm text-gray-500 ">Full Name</p><p className='text-black'>{user.name}</p></div>
                  <div className='bg-white/70 p-4 rounded-xl shadow-sm'><p className="text-sm text-gray-500">Phone</p><p className='text-black'>{profile.phoneNumber || 'N/A'}</p></div>
                </div>
              )}
            </div>
          )}

          {/* Address Section */}
          {selectedSection === 'address' && (
            <div className="bg-indigo-100/30 backdrop-blur-md rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">Addresses</h3>
                <button onClick={() => startEditAddr(null)} className="text-indigo-700 flex items-center gap-1 text-sm hover:underline">
                  <PlusIcon className="w-4 h-4" /> Add Address
                </button>
              </div>

              {addresses.length === 0 && <p>No addresses listed.</p>}

              {addresses.map(a => (
                <div key={a.id} className={`bg-white/70 p-4 rounded-xl shadow-sm flex justify-between ${a.isDefault ? 'border-2 border-indigo-600' : ''}`}>
                  <div>
                    <p>{`${a.street}, ${a.city}, ${a.state}, ${a.country}, ${a.zipCode}`}</p>
                    {a.isDefault && <p className="text-indigo-600 mt-1 font-semibold">Default</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditAddr(a)} className="text-indigo-700 text-sm">Edit</button>
                    <button onClick={() => deleteAddr(a.id)} className="text-red-600 text-sm"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}

              {(editingAddrId !== null || newAddrMode) && (
                <div className="bg-white/70 p-4 rounded-xl shadow-sm space-y-3">
                  {['street', 'city', 'state', 'country', 'zipCode'].map(f => (
                    <div key={f}>
                      <label className="text-sm capitalize">{f}</label>
                      <input value={addrForm[f]} onChange={e => setAddrForm(a => ({ ...a, [f]: e.target.value }))} className="mt-1 w-full p-2 rounded-md bg-indigo-50" />
                    </div>
                  ))}
                  <div className="flex items-center">
                    <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(a => ({ ...a, isDefault: e.target.checked }))}/>
                    <label className="ml-2">Set as default</label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveAddr} className="bg-indigo-600 text-white px-4 py-2 rounded-xl mt-2">Save Address</button>
                    <button onClick={cancelEditAddr} className="bg-gray-400 text-white px-4 py-2 rounded-xl mt-2">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account Section */}
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
                  <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
                </div>
                <div className="bg-white/70 p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500">Role</p>
                  <p>{user.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/70 p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">Email</p><p>{user.email}</p>
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
    </UserLayout>
  );
}
