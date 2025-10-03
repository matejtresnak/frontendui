// GroupNameForm.jsx - Component for changing group name
import { useState } from "react";
import Button from "react-bootstrap/Button";
import { Input, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared";
import { GroupUpdateAsyncAction } from "C:/Users/mates/frontendui/packages/moje_knihovna/src/Group/Queries/GroupUpdateAsyncAction";

/**
 * GroupNameForm component for updating group name
 * @param {Object} props - Component props
 * @param {Object} props.group - Group object containing id, name, and lastchange
 * @returns {JSX.Element} GroupNameForm component
 */
export const GroupNameForm = ({ group }) => {
  const [newGroupName, setNewGroupName] = useState("");

  /**
   * Async action for updating group
   */
  const {
    error: updateError,
    loading: updateLoading,
    fetch: updateGroup,
  } = useAsyncAction(GroupUpdateAsyncAction, {}, { deferred: true });

  /**
   * Handles group name change submission
   * Validates input and updates group name
   */
  const handleGroupNameChange = async () => {
    if (!newGroupName) {
      alert("Zadejte nový název skupiny.");
      return;
    }

    try {
      const params = {
        id: group.id,
        lastchange: group.lastchange,
        name: newGroupName,
      };

      const result = await updateGroup(params);

      if (result && !result.failed) {
        alert("Název skupiny byl úspěšně změněn.");
        setNewGroupName("");
        window.location.reload();
      } else {
        alert(`Chyba: ${result?.msg || "Nepodařilo se změnit název skupiny."}`);
      }
    } catch (err) {
      console.error("Chyba při změně názvu skupiny:", err);
      alert("Došlo k chybě při změně názvu skupiny.");
    }
  };

  return (
    <div className="mt-6 space-y-2">
      <h4 className="text-lg font-semibold">Změnit název studijní skupiny</h4>

      {updateError && <ErrorHandler errors={updateError} />}
      {updateLoading && <LoadingSpinner text="Aktualizuji název skupiny..." />}

      <Input
        placeholder="Nový název skupiny"
        value={newGroupName}
        className="form-control"
        onChange={(e) => setNewGroupName(e.target.value)}
      />

      <Button onClick={handleGroupNameChange} disabled={updateLoading}>
        Změnit název skupiny
      </Button>
    </div>
  );
};