import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { announcementAPI } from '../api/services';

const MainLayout = () => {
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(() => {
    announcementAPI.getAll()
      .then((res) => setUnread((Array.isArray(res.data) ? res.data : []).filter((a) => !a.isRead).length))
      .catch(() => {});
  }, []);

  useEffect(() => { refreshUnread(); }, [refreshUnread]);

  return (
    <div className="layout-wrapper">
      <Sidebar unread={unread} />
      <main className="main-content">
        <Outlet context={{ refreshUnread }} />
      </main>
    </div>
  );
};

export default MainLayout;
