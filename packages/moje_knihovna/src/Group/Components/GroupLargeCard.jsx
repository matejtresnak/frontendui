// GroupLargeCard.jsx - Main component
import Row from "react-bootstrap/Row";
import { LeftColumn, MiddleColumn } from "@hrbolek/uoisfrontend-shared";
import { GroupCardCapsule } from "./GroupCardCapsule";
import { GroupMediumCard } from "./GroupMediumCard";
import { MembersList } from "./MembersList";
import { AddUserForm } from "./AddUserForm";
import { RemoveUserForm } from "./RemoveUserForm";
import { GroupNameForm } from "./GroupNameForm";

/**
 * GroupLargeCard component - Main component for displaying detailed group information
 * Renders a comprehensive view of a group with member management capabilities
 * @param {Object} props - Component props
 * @param {Object} props.group - Group object containing all group data
 * @param {React.ReactNode} props.children - Additional content to render
 * @returns {JSX.Element} GroupLargeCard component
 */
export const GroupLargeCard = ({ group, children }) => {
  return (
    <GroupCardCapsule group={group}>
      <Row>
        <LeftColumn>
          <GroupMediumCard group={group} />
        </LeftColumn>
        <MiddleColumn>
          {/* Member list */}
          <MembersList group={group} />
          
          {/* Remove user form */}
          <RemoveUserForm group={group} />

          {/* Add user form */}
          <AddUserForm group={group} />

          {/* Group name form */}
          <GroupNameForm group={group} />

          {/* Additional content */}
          <pre>{JSON.stringify(group, null, 2)}</pre>
          {children}
        </MiddleColumn>
      </Row>
    </GroupCardCapsule>
  );
};