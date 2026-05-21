import { useEffect, useState } from "react";
import { UserService } from "../services/user.service";
import api from "../services/api";

interface UserEntry {
  id: string;
  username: string;
  role: string;
}

export default function Permissions() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    UserService.getAll(1, 100).then((res) => {
      const mapped = res.data.map((u: any) => ({
        id: u.userId,
        username: u.fullName,
        role: u.role
      }));

      setUsers(mapped);
      setLoading(false);
    });
  }, []);

  const updateRole = async (userId: string, newRole: string) => {
    await api.patch(`/api/user/role?userId=${userId}&role=${newRole}`);

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  return (
    <>
      <h1>Permissions</h1>
      <p>Manage user roles.</p>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="table-scroll">
        <table className="table m-0">
          <thead>
            <tr>
              <th>User ID</th>
              <th>User Name</th>
              <th>Current Role</th>
              <th>Change Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>

                <td>
                  <select
                    defaultValue={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                  >
                    <option value="User">User</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </>
  );
}
