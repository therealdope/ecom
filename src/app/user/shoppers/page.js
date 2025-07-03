'use client'
import { useState, useEffect, useRef } from 'react'
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout'
import { format } from 'date-fns'
import { StarIcon as StarOutline, XMarkIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useToast } from '@/context/ToastContext';
import Loader from '@/components/shared/Loader';

export default function UserVendorsPage() {
  const [vendors, setVendors] = useState([])
  const [reviewing, setReviewing] = useState(null)
  const [reviewRating, setReviewRating] = useState(0);
  const [comment, setComment] = useState('')
  const modalRef = useRef(null)
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    fetch('/api/user/shoppers')
      .then(r => r.json())
      .then(d => {
        setVendors(d.vendors || [])
        setLoading(false)
      })
  }, [])

  if (loading) return <Loader />

  function openReview(vid) {
    setReviewing(vid)
    setReviewRating(5)
    setComment('')
  }

  function closeReview(e) {
    if (!e || modalRef.current?.contains(e.target)) return
    setReviewing(null)
  }

  async function submitReview() {
    const res = await fetch('/api/user/shoppers/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId: reviewing, rating: reviewRating, comment }),
    })
    
    const data = await res.json();
    if(data.success){
      const { vendorId } = data;
      await fetch('/api/user/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          type: 'NEW_REVIEW',
          content: `New review for you added for ${vendorId}`,
        }),
      });
      showToast({
        title: 'Success',
        description: 'Review submitted successfully',
      })
      setReviewing(null)
    }
  }

  return (
    <UserDashboardLayout>
      <div className="p-6 mt-4  md:mt-0">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Your Vendors</h2>
        <div className="overflow-auto rounded-xl shadow bg-indigo-100/30 backdrop-blur-md">
          <table className="min-w-full text-left divide-y divide-indigo-200">
            <thead className="bg-indigo-200/40 text-indigo-800">
              <tr>
                {['Vendor', 'Orders', 'Spent', 'Joined', 'Review'].map(h => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {vendors.map(v => (
                <tr key={v.vendorId} className="hover:bg-indigo-100/40">
                  <td className="px-4 py-3">{v.name}</td>
                  <td className="px-4 py-3">{v.orderCount}</td>
                  <td className="px-4 py-3">₹{v.totalSpent.toFixed(2)}</td>
                  <td className="px-4 py-3">{format(new Date(v.joined), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3">
                    <button
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                      onClick={() => openReview(v.vendorId)}
                    >
                      <StarOutline className="w-5 h-5" /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reviewing && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center px-4" onClick={closeReview}>
            <div ref={modalRef} className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-indigo-700">Write a Review</h3>
                <button onClick={() => setReviewing(null)}>
                  <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-red-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-gray-700">Rating</label>
<div className="flex items-center gap-1 mb-4">
  {[1, 2, 3, 4, 5].map((n) => (
    <button
      key={n}
      type="button"
      onClick={() => setReviewRating(n)}
      className="w-8 h-8 flex items-center justify-center"
    >
      {reviewRating >= n ? (
        <StarSolid className="h-6 w-6 text-indigo-500" />
      ) : (
        <StarOutline className="h-6 w-6 text-gray-400" />
      )}
    </button>
  ))}
</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Comment:</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>
                <button
                  onClick={submitReview}
                  className="bg-indigo-600 px-4 py-2 text-white rounded hover:bg-indigo-700"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  )
}
