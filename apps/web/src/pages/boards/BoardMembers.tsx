import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import {
  getBoardMembers,
  addBoardMember,
  updateBoardMember,
  removeBoardMember,
  BoardMember,
  Role,
} from "../../api/client";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { Loading } from "../../components/Loading";
import "./BoardMembers.css";

interface BoardMembersProps {
  boardId: string;
  isOwner: boolean;
  onClose: () => void;
}

export function BoardMembers({ boardId, isOwner, onClose }: BoardMembersProps) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<Role>("member");
  const [error, setError] = useState("");

  const { data: membersData, isLoading } = useQuery({
    queryKey: ["board-members", boardId],
    queryFn: () => getBoardMembers(token!, boardId),
    enabled: !!token && !!boardId,
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: { email: string; role: Role }) =>
      addBoardMember(token!, boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-members", boardId] });
      setNewMemberEmail("");
      setNewMemberRole("member");
      setShowAddMember(false);
      setError("");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Role }) =>
      updateBoardMember(token!, boardId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-members", boardId] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeBoardMember(token!, boardId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-members", boardId] });
    },
  });

  const handleAddMember = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newMemberEmail.trim()) return;
    addMemberMutation.mutate({ email: newMemberEmail, role: newMemberRole });
  };

  const handleRemoveMember = (member: BoardMember) => {
    const isSelf = member.user_id === user?.id;
    const message = isSelf
      ? "Are you sure you want to leave this board?"
      : `Are you sure you want to remove ${member.user.name} from this board?`;

    if (window.confirm(message)) {
      removeMemberMutation.mutate(member.user_id);
      if (isSelf) {
        onClose();
      }
    }
  };

  const handleRoleChange = (memberId: string, newRole: Role) => {
    updateMemberMutation.mutate({ memberId, role: newRole });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeClass = (role: Role) => {
    switch (role) {
      case "owner":
        return "badge-role-owner";
      case "admin":
        return "badge-role-admin";
      default:
        return "badge-role-member";
    }
  };

  const members = membersData?.members || [];

  return (
    <Modal isOpen onClose={onClose} title="Board Members">
      <div className="board-members-content">
        {isLoading ? (
          <Loading text="Loading members..." />
        ) : (
          <>
            <div className="members-list">
              {members.map((member) => (
                <div key={member.user_id} className="member-item">
                  <div className="member-info">
                    <span className="avatar">{getInitials(member.user.name)}</span>
                    <div className="member-details">
                      <span className="member-name">
                        {member.user.name}
                        {member.user_id === user?.id && " (You)"}
                      </span>
                      <span className="member-email">{member.user.email}</span>
                    </div>
                  </div>
                  <div className="member-actions">
                    {member.role === "owner" ? (
                      <span className={`badge ${getRoleBadgeClass(member.role)}`}>
                        Owner
                      </span>
                    ) : isOwner ? (
                      <>
                        <Select
                          name={`role-${member.user_id}`}
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member.user_id, e.target.value as Role)
                          }
                          options={[
                            { value: "admin", label: "Admin" },
                            { value: "member", label: "Member" },
                          ]}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </Button>
                      </>
                    ) : member.user_id === user?.id ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member)}
                      >
                        Leave
                      </Button>
                    ) : (
                      <span className={`badge ${getRoleBadgeClass(member.role)}`}>
                        {member.role === "admin" ? "Admin" : "Member"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isOwner && (
              <div className="add-member-section">
                {showAddMember ? (
                  <form onSubmit={handleAddMember} className="add-member-form">
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="Enter user's email"
                      required
                    />
                    <Select
                      label="Role"
                      name="role"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as Role)}
                      options={[
                        { value: "member", label: "Member" },
                        { value: "admin", label: "Admin" },
                      ]}
                    />
                    {error && <p className="error-message">{error}</p>}
                    <div className="add-member-actions">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={addMemberMutation.isPending}
                      >
                        Add Member
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setShowAddMember(false);
                          setError("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddMember(true)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Member
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
