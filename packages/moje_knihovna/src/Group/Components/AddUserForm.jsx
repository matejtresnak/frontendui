// AddUserForm.jsx - Component for adding user to group
import { useState, useRef } from "react";
import Button from "react-bootstrap/Button";
import { ErrorHandler, LoadingSpinner, CreateDelayer } from "@hrbolek/uoisfrontend-shared";
import { useAsyncAction, createAsyncGraphQLAction } from "@hrbolek/uoisfrontend-gql-shared";
import { GroupMembershipInsertAsyncAction } from "C:/Users/mates/frontendui/packages/moje_knihovna/src/Group/Queries/GroupMembershipInsertAsyncAction";

/**
 * GraphQL query for searching users by pattern
 * @type {Function}
 */
const QueryUserAsyncAction = createAsyncGraphQLAction(`query QueryUser($pattern: String!) {
  userPage(where: {name: {_ilike: $pattern}}) {
    __typename
    id
    name
    surname
    fullname
  }
}`);

/**
 * LocalUser component for displaying a single user in search results
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with id, name, surname, and fullname
 * @param {Function} props.onSelect - Callback function when user is selected
 * @returns {JSX.Element} LocalUser component
 */
const LocalUser = ({ user, onSelect }) => {
  /**
   * Handles click event on user selection
   * @param {Event} e - Click event
   */
  const onClick = (e) => {
    e.preventDefault();
    console.log("LocalUser.onClick", user.id, user.name);
    onSelect(user);
  };
  
  return (
    <div>
      <a onClick={onClick} href="#">{user.fullname} [{user.id}]</a>
    </div>
  );
};

/**
 * AddUserForm component for adding existing users to a group
 * @param {Object} props - Component props
 * @param {Object} props.group - Group object to add users to
 * @returns {JSX.Element} AddUserForm component
 */
export const AddUserForm = ({ group }) => {
  const inputRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [delayer, setDelayer] = useState(() => CreateDelayer(500));

  /**
   * Async action for searching users
   */
  const {
    loading: searchLoading,
    error: searchError,
    fetch: searchUsers
  } = useAsyncAction(
    QueryUserAsyncAction,
    {},
    { deferred: true }
  );

  /**
   * Async action for adding user to group
   */
  const {
    error: insertError,
    loading: insertLoading,
    fetch: insertUser,
  } = useAsyncAction(
    GroupMembershipInsertAsyncAction,
    {},
    { deferred: true }
  );

  /**
   * Handles user selection from search results
   * @param {Object} user - Selected user object
   */
  const onSelect = async (user) => {
    try {
      const params = {
        groupId: group.id,
        userId: user.id,
      };

      const result = await insertUser(params);

      if (result && !result.failed) {
        alert("Uživatel byl úspěšně přidán do skupiny");
        setUsers([]);
        window.location.reload();
      } else if (result && result.failed) {
        alert(`Chyba: ${result.msg || "Nepodařilo se přidat uživatele do skupiny"}`);
      }
    } catch (error) {
      console.error("Chyba při přidávání uživatele:", error);
      alert("Došlo k chybě při přidávání uživatele do skupiny");
    }
  };

  /**
   * Handles input change for user search
   * @param {Event} e - Input change event
   */
  const onChange = (e) => {
    const data = e.target.value;
    if (data.length > 2) {
      delayer(() => searchUsers({ pattern: `%${data}%` }).then(
        json => {
          const users = json?.data?.userPage || [];
          setUsers(users);
          return json;
        }
      ));
    } else {
      setUsers([]);
    }
  };

  return (
    <div className="mt-6 space-y-2">
      <h4 className="text-lg font-semibold">Přidat existujícího uživatele do skupiny</h4>

      {insertError && <ErrorHandler errors={insertError} />}
      {insertLoading && <LoadingSpinner text="Přidávám uživatele do skupiny..." />}
      {searchError && <ErrorHandler errors={searchError} />}

      <div ref={inputRef}
        style={{
          backgroundColor: "white",
          zIndex: 1000,
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          width: "100%",
        }}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Zadejte jméno uživatele"
          onChange={onChange}
        />
        
        {searchLoading && <LoadingSpinner text="Hledám uživatele..." />}
        
        {users && users.length > 0 && (
          <div className="search-results p-2 border-t">
            {users.map((user) => (
              <LocalUser key={user.id} user={user} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};