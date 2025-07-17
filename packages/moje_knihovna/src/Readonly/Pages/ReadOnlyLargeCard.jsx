/**
 * ReadOnlyLargeCard.jsx - Main component for displaying group information in a large card format
 */
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import { LeftColumn, MiddleColumn } from "@hrbolek/uoisfrontend-shared";
import { GroupCardCapsule } from "C:/Users/mates/frontendui/packages/moje_knihovna/src/Group/Components/GroupCardCapsule";
import { GroupMediumCard } from "C:/Users/mates/frontendui/packages/moje_knihovna/src/Group/Components/GroupMediumCard";

/**
 * ReadOnlyLargeCard component displays detailed information about a group
 * including its members in a table format within a large card layout.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.group - Group object containing group information
 * @param {string} props.group.name - Name of the group
 * @param {Array} props.group.memberships - Array of membership objects
 * @param {Object} props.group.memberships[].user - User object within membership
 * @param {string} props.group.memberships[].user.id - User ID
 * @param {string} props.group.memberships[].user.name - User first name
 * @param {string} props.group.memberships[].user.surname - User surname
 * @param {string} props.group.memberships[].user.email - User email address
 * @param {React.ReactNode} props.children - Optional child components to render
 * 
 * @returns {JSX.Element} Rendered ReadOnlyLargeCard component or error message
 */
export const ReadOnlyLargeCard = ({ group, children }) => {
  // Early return if group is not provided
  if (!group) return <div>Skupina nebyla nalezena.</div>;

  return (
    <GroupCardCapsule group={group}>
      <Row>
        {/* Left column containing the medium-sized group card */}
        <LeftColumn>
          <GroupMediumCard group={group} />
        </LeftColumn>
        
        {/* Middle column containing group details and members table */}
        <MiddleColumn>
          <h2>{group.name}</h2>
          <h5>Seznam členů skupiny</h5>
          
          {/* Conditional rendering of members table or empty state message */}
          {group.memberships && group.memberships.length > 0 ? (
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Jméno</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {/* Map through memberships to display each member */}
                {group.memberships.map((membership) => (
                  <tr key={membership.id}>
                    <td>{membership.user.id}</td>
                    <td>{`${membership.user.name} ${membership.user.surname}`}</td>
                    <td>{membership.user.email}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>Tato skupina nemá žádné členy.</p>
          )}
          
          {/* Development mode: Display raw group data for debugging */}
          {process.env.NODE_ENV === "development" && (
            <pre>{JSON.stringify(group, null, 2)}</pre>
          )}
          
          {/* Render any additional child components */}
          {children}
        </MiddleColumn>
      </Row>
    </GroupCardCapsule>
  );
};