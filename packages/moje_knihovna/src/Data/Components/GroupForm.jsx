import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { LoadingSpinner } from "@hrbolek/uoisfrontend-shared";

/**
 * GroupForm component for creating new groups
 * @param {Object} props - Component props
 * @param {Array} props.groupTypes - Array of available group types
 * @param {Function} props.onSubmit - Callback function called when form is submitted
 * @param {boolean} props.loading - Loading state for form submission
 * @param {boolean} props.loadingGroupTypes - Loading state for group types
 * @param {boolean} props.usingFallback - Whether fallback data is being used
 * @returns {JSX.Element} GroupForm component
 */
const GroupForm = ({ 
  groupTypes, 
  onSubmit, 
  loading, 
  loadingGroupTypes,
  usingFallback 
}) => {
  const [name, setName] = useState("");
  const [groupTypeId, setGroupTypeId] = useState("");

  /**
   * Effect to set default group type when group types are loaded
   */
  useEffect(() => {
    if (groupTypes.length > 0 && !groupTypeId) {
      setGroupTypeId(groupTypes[0].id);
    }
  }, [groupTypes, groupTypeId]);

  /**
   * Handles form submission
   * Validates input and calls onSubmit callback
   */
  const handleSubmit = () => {
    if (!name || !groupTypeId) {
      alert("Zadejte název skupiny a vyberte typ.");
      return;
    }
    
    onSubmit({ name, groupTypeId });
    setName("");
  };

  return (
    <>
      <div className="mb-3">
        <small>Typy skupin: {usingFallback ? "používám fallback data" : "načteno z backendu"}</small>
      </div>

      {(loading || loadingGroupTypes) && (
        <LoadingSpinner text={loading ? "Vytvářím skupinu..." : "Načítám typy skupin..."} />
      )}

      <Form.Group className="mb-3">
        <Form.Label>Název skupiny</Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Zadejte název..."
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Typ skupiny</Form.Label>
        <Form.Control
          as="select"
          value={groupTypeId}
          onChange={(e) => setGroupTypeId(e.target.value)}
        >
          {groupTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Button onClick={handleSubmit} disabled={loading || loadingGroupTypes}>
        Vytvořit skupinu
      </Button>
    </>
  );
};

export default GroupForm;