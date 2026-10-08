import CreateUserForm from "../../components/auth/CreateUserForm";

function AdminUsers() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            User Management
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Create a user and choose which pages they can access.
          </p>
        </div>

        <div className="px-8 py-8">
          <CreateUserForm />
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;