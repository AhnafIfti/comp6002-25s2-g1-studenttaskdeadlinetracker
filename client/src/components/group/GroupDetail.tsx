/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroup, updateGroup, deleteGroup } from '../../services/groupService';
import type { Group } from '../../services/groupService';
import '../../components/group/Groups.css';

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailsToAdd, setEmailsToAdd] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await getGroup(id!);
        setGroup(res.group);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!group) return <p>Group not found</p>;

  const onAddMembers = async () => {
    const emails = emailsToAdd.split(',').map(s => s.trim()).filter(Boolean);
    if (!emails.length) return;
    try {
      const res = await updateGroup(group._id, { addMemberEmails: emails });
      setGroup(res.group ?? res);
      setEmailsToAdd('');
    } catch (err: any) {
      alert(err?.message || 'Failed to add members');
    }
  };

  const onRemoveMember = async (memberId: string) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await updateGroup(group._id, { removeMemberIds: [memberId] });
      setGroup(res.group ?? res);
    } catch (err: any) {
      alert(err?.message || 'Failed to remove member');
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await deleteGroup(group._id);
      navigate('/groups');
    } catch (err: any) {
      alert(err?.message || 'Failed to delete');
    }
  };

  return (
    <div className="groups-page">
      <div className="group-header">
        <h2>{group.name}</h2>
        <div className="group-actions">
          <button onClick={() => navigate(`/groups/${group._id}/edit`)}>Edit</button>
          <button onClick={onDelete}>Delete</button>
          <button onClick={() => navigate('/groups')}>Back</button>
        </div>
      </div>

      <section className="members-section">
        <h3>Members ({group.members?.length ?? 0})</h3>
        <ul className="member-list">
          {group.members?.map(m => (
            <li key={m._id} className="member-item">
              <div>
                <strong>{m.firstName} {m.lastName}</strong>
                <div className="muted">{m.email}</div>
              </div>
              <div>
                <button onClick={() => onRemoveMember(m._id)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>

        <div className="add-members">
          <label>Add members by email (comma separated)</label>
          <input value={emailsToAdd} onChange={e => setEmailsToAdd(e.target.value)} placeholder="joe@..., jane@..." />
          <button onClick={onAddMembers}>Add</button>
        </div>
      </section>
    </div>
  );
};

export default GroupDetail;