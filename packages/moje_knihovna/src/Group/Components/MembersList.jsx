// MembersList.jsx - Component for displaying group members list
import { useState } from "react";
import Button from "react-bootstrap/Button";
import { ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared";
import { GroupMembershipDeleteAsyncAction } from "C:/Users/mates/frontendui/packages/moje_knihovna/src/Group/Queries/GroupMembershipDeleteAsyncAction";

/**
 * MembersList component for displaying and managing group members
 * @param {Object} props - Component props
 * @param {Object} props.group - Group object containing memberships array
 * @returns {JSX.Element} MembersList component
 */
export const MembersList = ({ group }) => {
  /**
   * Async action for deleting group membership
   */
  const {
    error: deleteError,
    loading: deleteLoading,
    fetch: deleteMembership,
  } = useAsyncAction(GroupMembershipDeleteAsyncAction, {}, { deferred: true });

  /**
   * Handles removing a user from the group
   * @param {string} membershipId - ID of the membership to delete
   * @param {string} membershipLastchange - Lastchange timestamp of the membership
   * @param {string} userName - Name of the user to be removed
   */
  const handleRemoveUserFromGroup = async (membershipId, membershipLastchange, userName) => {
    if (!membershipId) {
      alert("Nebyl vybrán žádný uživatel k odebrání.");
      return;
    }
    
    if (!window.confirm(`Opravdu chcete odebrat uživatele ${userName} ze skupiny?`)) {
      return;
    }
    
    try {
      const params = {
        id: membershipId,
        lastchange: membershipLastchange
      };
      
      const result = await deleteMembership(params);
      
      // Simplified response check - null means success
      if (result && result.data && result.data.membershipDelete === null) {
        alert("Uživatel byl úspěšně odebrán ze skupiny.");
        window.location.reload();
      } else {
        console.warn("Neočekávaná odpověď:", result);
        alert("Nepodařilo se odebrat uživatele ze skupiny. Zkontrolujte konzoli pro více informací.");
      }
    } catch (error) {
      console.error("Chyba při odebírání uživatele ze skupiny:", error);
      alert("Došlo k chybě při odebírání uživatele ze skupiny.");
    }
  };

  return (
    <div>
      <h3>Seznam členů skupiny</h3>
      {deleteError && <ErrorHandler errors={deleteError} />}
      {deleteLoading && <LoadingSpinner text="Odebírám uživatele ze skupiny..." />}
      
      {group.memberships && group.memberships.length > 0 ? (
        <div className="member-list">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Jméno</th>
                <th>Email</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {group.memberships.map((membership) => (
                <tr key={membership.id}>
                  <td>{membership.user.id}</td>
                  <td>{`${membership.user.name} ${membership.user.surname}`}</td>
                  <td>{membership.user.email}</td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleRemoveUserFromGroup(
                        membership.id, 
                        membership.lastchange, 
                        `${membership.user.name} ${membership.user.surname}`
                      )}
                      disabled={deleteLoading}
                    >
                      Odebrat
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Tato skupina nemá žádné členy.</p>
      )}
    </div>
  );
};