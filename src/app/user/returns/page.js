import UserDashboardLayout from "@/components/user/layout/UserDashboardLayout";

export default function ReturnPolicyPage() {
  return (
    <UserDashboardLayout>
    <div className="max-w-4xl mx-auto py-10 px-4 min-h-[calc(100vh-410px)]">
      <h1 className="text-3xl font-bold text-indigo-600 mb-4">Return Policy</h1>
      <p className="text-gray-700 leading-7">
        You may request a return within 7 days of delivery. Items must be unused, in original packaging. Refunds are processed within 5-7 business days after we receive the returned product.
        For damaged or defective items, contact our support immediately.
      </p>
    </div>
    </UserDashboardLayout>
  );
}
