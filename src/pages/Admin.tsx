export default function Admin() {
  return (
    <>
      <h1>Administration</h1>
      <p>Administrators registered in NutriGuide.</p>

      <div className="table-scroll">
      <table className="table m-0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Last activity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Alexis Mwila</td>
            <td>alexis.admin@example.com</td>
            <td>Super admin</td>
            <td>12 minutes ago</td>
          </tr>

          <tr>
            <td>Laura Smith</td>
            <td>laura.smith@example.com</td>
            <td>Admin</td>
            <td>1 hour ago</td>
          </tr>

          <tr>
            <td>John Carter</td>
            <td>john.carter@example.com</td>
            <td>Admin</td>
            <td>3 hours ago</td>
          </tr>

          <tr>
            <td>Maria Lopez</td>
            <td>maria.lopez@example.com</td>
            <td>Moderator</td>
            <td>Yesterday</td>
          </tr>
        </tbody>
      </table>
      </div>

      <div className="cards" style={{ marginTop: "40px" }}>
        <div className="card">
          <h3>Total administrators</h3>
          <p>4</p>
        </div>

        <div className="card">
          <h3>Super admins</h3>
          <p>1</p>
        </div>

        <div className="card">
          <h3>Active admins</h3>
          <p>3</p>
        </div>

        <div className="card">
          <h3>Moderators</h3>
          <p>1</p>
        </div>
      </div>
    </>
  );
}
