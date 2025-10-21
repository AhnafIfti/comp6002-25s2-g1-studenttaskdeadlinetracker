/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Group } from '../../services/groupService';
import { getGroups } from '../../services/groupService';
import '../../components/group/Groups.css';


const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getGroups() as any;
        setGroups(data.groups ?? data); // depending on backend response shape
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading groups...</p>;
  if (!groups.length) return (
    <div className="groups-page">
      <h2>Groups</h2>
      <p>No groups yet.</p>
      <button onClick={() => navigate('/groups/new')}>Create Group</button>
    </div>
  );

  return (
    <div className="groups-page">
      <h2>Groups</h2>
      <button onClick={() => navigate('/groups/new')}>Create Group</button>
      <ul className="group-list">
        {groups.map(g => (
          <li key={g._id} className="group-card">
            <div className="group-card-body">
              <h3>{g.name}</h3>
              <p className="muted">{g.members?.length ?? 0} members</p>
              <Link to={`/groups/${g._id}`}>Open</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;