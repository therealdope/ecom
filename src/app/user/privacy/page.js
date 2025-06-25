import UserDashboardLayout from "@/components/user/layout/UserDashboardLayout";

export default function PrivacyPage() {
  return (
    <UserDashboardLayout>
    <div className="max-w-4xl mx-auto py-10 px-4 min-h-[calc(100vh-410px)]">
      <h1 className="text-3xl font-bold text-indigo-600 mb-4">Privacy Policy</h1>
      <p className="text-gray-700 leading-7">
        We respect your privacy. Your personal data such as name, email, and address is securely stored and only used to provide and improve our services.
        We do not sell or share your data with third parties without consent, except as required by law.
      </p>
    </div>
    </UserDashboardLayout>
  );
}
