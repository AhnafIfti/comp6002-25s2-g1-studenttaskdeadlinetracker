/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createGroup, getGroup, updateGroup } from '../../services/groupService';
import '../../components/group/Groups.css';

const GroupForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);
  const [name, setName] = useState('');
  const [memberEmails, setMemberEmails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!editing) return;
    (async () => {
      try {
        const res = await getGroup(id!);
        const g = res.group;
        setName(g.name);
        setMemberEmails(
          g.members && g.members.length
            ? g.members.map((m: any) => m.email).join(", ")
            : ""
        );
      } catch (err: any) {
        setError(err?.message || 'Failed to load group');
      }
    })();
  }, [editing, id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emails = memberEmails.split(',').map(s => s.trim()).filter(Boolean);
    try {
      if (editing) {
        await updateGroup(id!, { name, addMemberEmails: emails });
      } else {
        await createGroup(name, emails);
      }
      navigate('/groups');
    } catch (err: any) {
      setError(err?.message || 'Failed');
    }
  };

  return (
    <div className="groups-page">
      <h2>{editing ? 'Edit Group' : 'Create Group'}</h2>
      {error && <div className="error">{error}</div>}
      <form className="group-form" onSubmit={onSubmit}>
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Member emails (comma separated)
          <input value={memberEmails} onChange={e => setMemberEmails(e.target.value)} placeholder="alice@example.com, bob@..." />
        </label>
        <div className="form-actions">
          <button type="submit">{editing ? 'Save' : 'Create'}</button>
          <button type="button" onClick={() => navigate('/groups')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default GroupForm;