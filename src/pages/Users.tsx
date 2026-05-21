import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserService } from "../services/user.service";
import type { UserDto } from "../Types/global-types";
import { httpErrorMessage } from "../utils/httpErrorMessage";
import Avatar from "../components/profile/Avatar";

const PAGE_SIZE = 50;

export default function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setLoadError(null);
    UserService.getAll(1, PAGE_SIZE)
      .then((res) => {
        setUsers(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setUsers([]);
        setLoadError(httpErrorMessage(err, "Unable to load users."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="app-page users-page">
      <div className="users-page__header">
        <header className="app-page__header">
          <p className="app-page__kicker">Admin</p>
          <h1 className="app-page__title">Users</h1>
          <p className="app-page__subtitle">
            Manage accounts and view profile photos when available.
          </p>
        </header>
        <Link to="/dashboard/users/new" className="btn btn-primary">
          Add user
        </Link>
      </div>

      {loadError && (
        <p className="app-status app-status--err" role="alert">
          {loadError}
        </p>
      )}

      <section className="app-panel food-page__table-panel" aria-label="User list">
        <div className="food-page__table-bar">
          <h2 className="food-page__table-title">Accounts</h2>
          <p
            className={`food-page__table-meta${loading ? " food-page__table-meta--loading" : ""}`}
            aria-live="polite"
          >
            {loading ? "Loading…" : `${users.length} user${users.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="table-scroll">
          <table className="table m-0">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="food-table__empty">
                    No users to display.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.userId}>
                    <td>
                      <div className="users-table__user-cell">
                        <Avatar
                          fullName={u.fullName}
                          src={u.profileUrl}
                          size={44}
                          className="users-table__avatar"
                        />
                        <span className="users-table__name">{u.fullName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="users-table__email">{u.email}</span>
                    </td>
                    <td>
                      <span className="users-table__role">{u.role}</span>
                    </td>
                    <td>
                      <div className="users-table__actions">
                        <Link to={`/dashboard/users/${u.userId}/edit`} className="btn btn-sm btn-secondary">
                          Edit
                        </Link>
                        <Link to={`/dashboard/users/${u.userId}/delete`} className="btn btn-sm btn-danger">
                          Delete
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
