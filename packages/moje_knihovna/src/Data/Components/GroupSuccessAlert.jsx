import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

/**
 * GroupSuccessAlert component displays success message after group creation
 * @param {Object} props - Component props
 * @param {Object|null} props.createdGroup - The created group object or null
 * @param {Function} props.onCreateNew - Callback function to create a new group
 * @returns {JSX.Element|null} Success alert component or null if no group created
 */
const GroupSuccessAlert = ({ createdGroup, onCreateNew }) => {
  if (!createdGroup) return null;

  return (
    <Alert variant="success" className="mb-4">
      <Alert.Heading>Skupina byla úspěšně vytvořena!</Alert.Heading>
      <div className="mb-3">
        <pre style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', fontSize: '14px' }}>
          {JSON.stringify(createdGroup, null, 2)}
        </pre>
      </div>
      <Button 
        variant="outline-success" 
        size="sm" 
        onClick={onCreateNew}
      >
        Vytvořit další skupinu
      </Button>
    </Alert>
  );
};

export default GroupSuccessAlert;