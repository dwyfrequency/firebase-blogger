import AuthCheck from "../../components/AuthCheck";

export default function AdminPostEdit({}) {
  return (
    <main>
      <AuthCheck>
        AdminPostEdit
        <div>test</div>
      </AuthCheck>
    </main>
  );
}
