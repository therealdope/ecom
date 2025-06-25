import UserDashboardLayout from "@/components/user/layout/UserDashboardLayout";

export default function TermsPage() {
  return (
    <UserDashboardLayout>
    <div className="max-w-4xl mx-auto py-10 px-4 min-h-[calc(100vh-410px)]">
      <h1 className="text-3xl font-bold text-indigo-600 mb-4">Terms & Conditions</h1>
      <p className="text-gray-700 leading-7">
        By accessing and using Ecom, you agree to the following terms and conditions. Use of the site is subject to applicable laws. 
        Content, products, and services provided are for personal use only. Any misuse or fraudulent behavior may result in account suspension.
      </p>
    </div>
    </UserDashboardLayout>
  );
}
